import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@pos/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr')
export class HrController {
  constructor(private hrService: HrService) {}

  @Get('employees')
  async getEmployees(@Tenant() tenantId: string) {
    return this.hrService.getEmployees(tenantId);
  }

  @Post('employees')
  @Roles(Role.MANAGER)
  async createEmployee(
    @Tenant() tenantId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.hrService.createEmployee(tenantId, dto);
  }

  @Post('attendance/clock-in/:employeeId')
  async clockIn(
    @Tenant() tenantId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.hrService.clockIn(tenantId, employeeId);
  }

  @Post('attendance/clock-out/:employeeId')
  async clockOut(
    @Tenant() tenantId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.hrService.clockOut(tenantId, employeeId);
  }

  @Post('payroll/process')
  @Roles(Role.MANAGER)
  async processPayroll(@Tenant() tenantId: string) {
    return this.hrService.processPayroll(tenantId);
  }
}
