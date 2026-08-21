import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role, LoginResponse } from '@pos/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<LoginResponse> {
    // Check if subdomain already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Subdomain already in use');
    }

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(dto.password, salt);

    // Transaction to create Tenant, Store, Branch, and User
    const result = await this.prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenant_name,
          subdomain: dto.subdomain,
        },
      });

      const store = await tx.store.create({
        data: {
          tenant_id: tenant.id,
          name: `${dto.tenant_name} Store`,
        },
      });

      const branch = await tx.branch.create({
        data: {
          tenant_id: tenant.id,
          store_id: store.id,
          name: 'Main Branch',
        },
      });

      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          email: dto.email,
          password_hash,
          name: dto.name,
          role: dto.role || Role.MANAGER,
          branch_id: branch.id,
        },
      });

      return { tenant, user, branch };
    });

    const token = this.generateToken(result.user);
    return {
      access_token: token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role as Role,
        tenant_id: result.user.tenant_id,
        branch_id: result.user.branch_id || undefined,
      },
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        tenant_id: user.tenant_id,
        branch_id: user.branch_id || undefined,
      },
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      branch_id: user.branch_id,
    };
    return this.jwtService.sign(payload);
  }
}
