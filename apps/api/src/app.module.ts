import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StoreConfigModule } from './modules/store-config/store-config.module';
import { PosModule } from './modules/pos/pos.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { HrModule } from './modules/hr/hr.module';
import { MembershipModule } from './modules/membership/membership.module';
import { CashReportModule } from './modules/cash-report/cash-report.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { SetupModule } from './modules/setup/setup.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StoreConfigModule,
    PosModule,
    WarehouseModule,
    HrModule,
    MembershipModule,
    CashReportModule,
    AuditLogModule,
    SetupModule,
  ],
})
export class AppModule {}
