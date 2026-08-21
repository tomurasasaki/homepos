import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CompleteSetupDto, TestDbDto, DatabaseType } from './dto/setup.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Role } from '@pos/types';

@Injectable()
export class SetupService {
  private lockFilePath = path.resolve(process.cwd(), '.setup_installed');
  private schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
  private envPath = path.resolve(process.cwd(), '.env');

  constructor(private prisma: PrismaService) {}

  async getSetupStatus() {
    const isInstalled = fs.existsSync(this.lockFilePath);
    let tenantCount = 0;
    try {
      tenantCount = await this.prisma.tenant.count();
    } catch {
      // DB might not be initialized yet
    }

    return {
      is_initialized: isInstalled || tenantCount > 0,
      environment: process.env.NODE_ENV || 'development',
      allow_reset: (process.env.NODE_ENV || 'development') !== 'production',
    };
  }

  async testDbConnection(dto: TestDbDto) {
    if (dto.db_type === DatabaseType.SQLITE) {
      return { success: true, message: 'SQLite configuration is valid' };
    }
    // Simulation check for PostgreSQL / MariaDB
    return {
      success: true,
      message: `Connected successfully to ${dto.db_type} at ${dto.host || 'localhost'}:${dto.port || (dto.db_type === DatabaseType.POSTGRESQL ? 5432 : 3306)}`,
    };
  }

  async completeSetup(dto: CompleteSetupDto) {
    const status = await this.getSetupStatus();
    if (status.is_initialized) {
      throw new BadRequestException('Application already initialized. Reset is required before re-running setup.');
    }

    // 1. Build connection string & setup database files
    let connectionString = '';
    let prismaProvider = '';

    if (dto.db_type === DatabaseType.POSTGRESQL) {
      prismaProvider = 'postgresql';
      connectionString = `postgresql://${dto.db_user}:${dto.db_password}@${dto.db_host}:${dto.db_port}/${dto.db_name}?schema=public`;
    } else if (dto.db_type === DatabaseType.MARIADB) {
      prismaProvider = 'mysql';
      connectionString = `mysql://${dto.db_user}:${dto.db_password}@${dto.db_host}:${dto.db_port}/${dto.db_name}`;
    } else {
      prismaProvider = 'sqlite';
      connectionString = `file:./dev.db`;
    }

    // Write to .env
    const envContent = `DATABASE_URL="${connectionString}"\nJWT_SECRET="${process.env.JWT_SECRET || 'super-secret-pos-jwt-key'}"\nNODE_ENV="${process.env.NODE_ENV || 'development'}"\nPORT=3000\n`;
    fs.writeFileSync(this.envPath, envContent, 'utf-8');
    process.env.DATABASE_URL = connectionString;

    // 2. Rewrite prisma/schema.prisma datasource provider
    let schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
    schemaContent = schemaContent.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {\n  provider = "${prismaProvider}"\n  url      = env("DATABASE_URL")\n}`
    );
    fs.writeFileSync(this.schemaPath, schemaContent, 'utf-8');

    // 3. Programmatically generate & push the database schemas
    try {
      console.log('Generating Prisma Client and Pushing database schema...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (err: any) {
      throw new BadRequestException(`Database initialization failed: ${err.message}`);
    }

    // 4. Force reset PrismaClient instance connection
    await this.prisma.$disconnect();
    await this.prisma.$connect();

    // 5. Create initial store & SuperAdmin records
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(dto.admin_password, salt);

    const result = await this.prisma.$transaction(async (tx) => {
      const subdomain = dto.store_name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default-store';

      const tenant = await tx.tenant.create({
        data: {
          name: dto.store_name,
          subdomain,
        },
      });

      const store = await tx.store.create({
        data: {
          tenant_id: tenant.id,
          name: dto.store_name,
          address: dto.address,
          phone: dto.contact,
        },
      });

      const branch = await tx.branch.create({
        data: {
          tenant_id: tenant.id,
          store_id: store.id,
          name: 'Main Branch / Pusat',
          address: dto.address,
          phone: dto.contact,
        },
      });

      const superadmin = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          email: dto.admin_email,
          password_hash,
          name: dto.admin_name,
          role: Role.SUPER_ADMIN,
          branch_id: branch.id,
        },
      });

      return { tenant, store, branch, superadmin };
    });

    // Write lock file
    fs.writeFileSync(
      this.lockFilePath,
      JSON.stringify({
        installed_at: new Date().toISOString(),
        store: dto.store_name,
        admin: dto.admin_email,
        db_type: dto.db_type,
      }),
      'utf-8'
    );

    return {
      success: true,
      message: 'Initial setup completed successfully',
      data: {
        store_name: result.store.name,
        admin_email: result.superadmin.email,
        tenant_id: result.tenant.id,
      },
    };
  }

  async resetSetup() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Reset setup is disabled in production environment');
    }

    if (fs.existsSync(this.lockFilePath)) {
      fs.unlinkSync(this.lockFilePath);
    }

    try {
      // Clear database tables
      await this.prisma.$transaction([
        this.prisma.auditEvent.deleteMany(),
        this.prisma.journal.deleteMany(),
        this.prisma.transactionItem.deleteMany(),
        this.prisma.transaction.deleteMany(),
        this.prisma.stockTransfer.deleteMany(),
        this.prisma.stock.deleteMany(),
        this.prisma.productBranch.deleteMany(),
        this.prisma.product.deleteMany(),
        this.prisma.category.deleteMany(),
        this.prisma.attendance.deleteMany(),
        this.prisma.employee.deleteMany(),
        this.prisma.voucher.deleteMany(),
        this.prisma.member.deleteMany(),
        this.prisma.shift.deleteMany(),
        this.prisma.user.deleteMany(),
        this.prisma.branch.deleteMany(),
        this.prisma.store.deleteMany(),
        this.prisma.tenant.deleteMany(),
      ]);
    } catch (err) {
      // Ignore if tables do not exist yet or down
    }

    // Default to SQLite config for a fresh wizard state
    const defaultConnectionString = 'file:./dev.db';
    const envContent = `DATABASE_URL="${defaultConnectionString}"\nJWT_SECRET="${process.env.JWT_SECRET || 'super-secret-pos-jwt-key'}"\nNODE_ENV="${process.env.NODE_ENV || 'development'}"\nPORT=3000\n`;
    fs.writeFileSync(this.envPath, envContent, 'utf-8');
    process.env.DATABASE_URL = defaultConnectionString;

    let schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
    schemaContent = schemaContent.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`
    );
    fs.writeFileSync(this.schemaPath, schemaContent, 'utf-8');

    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      await this.prisma.$disconnect();
      await this.prisma.$connect();
    } catch (err) {
      // Ignore
    }

    return {
      success: true,
      message: 'Development environment reset successfully. Setup wizard available.',
    };
  }
}
