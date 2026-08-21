import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StoreConfigService } from './store-config.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@pos/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('store-config')
export class StoreConfigController {
  constructor(private storeConfigService: StoreConfigService) {}

  @Get('store')
  async getStoreInfo(@Tenant() tenantId: string) {
    return this.storeConfigService.getStoreInfo(tenantId);
  }

  @Get('branches')
  async getBranches(@Tenant() tenantId: string) {
    return this.storeConfigService.getBranches(tenantId);
  }

  @Post('branches')
  @Roles(Role.MANAGER)
  async createBranch(@Tenant() tenantId: string, @Body() dto: CreateBranchDto) {
    return this.storeConfigService.createBranch(tenantId, dto);
  }
}
