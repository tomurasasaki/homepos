import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@pos/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-log')
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  async getAuditLogs(@Tenant() tenantId: string) {
    return this.auditLogService.getAuditLogs(tenantId);
  }
}
