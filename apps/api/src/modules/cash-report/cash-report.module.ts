import { Module } from '@nestjs/common';
import { CashReportService } from './cash-report.service';
import { CashReportController } from './cash-report.controller';

@Module({
  controllers: [CashReportController],
  providers: [CashReportService],
  exports: [CashReportService],
})
export class CashReportModule {}
