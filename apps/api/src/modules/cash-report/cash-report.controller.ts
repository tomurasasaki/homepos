import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CashReportService } from './cash-report.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash-report')
export class CashReportController {
  constructor(private cashReportService: CashReportService) {}

  @Get('shift/active')
  async getActiveShift(
    @Tenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cashReportService.getActiveShift(tenantId, userId);
  }

  @Post('shift/open')
  async openShift(
    @Tenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: OpenShiftDto,
  ) {
    return this.cashReportService.openShift(tenantId, userId, dto);
  }

  @Post('shift/close/:shiftId')
  async closeShift(
    @Tenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: CloseShiftDto,
  ) {
    return this.cashReportService.closeShift(tenantId, userId, shiftId, dto);
  }

  @Get('journals')
  async getJournals(@Tenant() tenantId: string) {
    return this.cashReportService.getJournals(tenantId);
  }
}
