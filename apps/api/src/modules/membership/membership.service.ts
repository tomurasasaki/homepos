import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async getMembers(tenantId: string) {
    return this.prisma.member.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createMember(tenantId: string, dto: CreateMemberDto) {
    const existing = await this.prisma.member.findUnique({
      where: {
        tenant_id_phone: {
          tenant_id: tenantId,
          phone: dto.phone,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Member with this phone number already exists');
    }

    return this.prisma.member.create({
      data: {
        tenant_id: tenantId,
        name: dto.name,
        phone: dto.phone,
        points: 0,
        tier: 'Bronze',
      },
    });
  }

  async getVouchers(tenantId: string) {
    return this.prisma.voucher.findMany({
      where: { tenant_id: tenantId, is_used: false },
      orderBy: { created_at: 'desc' },
    });
  }

  async createVoucher(tenantId: string, dto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({
      where: {
        tenant_id_code: {
          tenant_id: tenantId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Voucher code already exists');
    }

    return this.prisma.voucher.create({
      data: {
        tenant_id: tenantId,
        code: dto.code,
        discount_amount: dto.discount_amount,
      },
    });
  }

  async validateVoucher(tenantId: string, code: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: {
        tenant_id_code: {
          tenant_id: tenantId,
          code,
        },
      },
    });

    if (!voucher || voucher.is_used) {
      throw new NotFoundException('Invalid or expired voucher');
    }

    return voucher;
  }
}
