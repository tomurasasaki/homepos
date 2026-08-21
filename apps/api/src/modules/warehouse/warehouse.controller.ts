import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { StockOpnameDto } from './dto/stock-opname.dto';
import { CreateStockTransferDto } from './dto/stock-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@pos/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get('stocks')
  async getStocks(
    @Tenant() tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.warehouseService.getStocks(tenantId, branchId);
  }

  @Post('opname')
  @Roles(Role.STAFF, Role.MANAGER)
  async performOpname(
    @Tenant() tenantId: string,
    @Body() dto: StockOpnameDto,
  ) {
    return this.warehouseService.performOpname(tenantId, dto);
  }

  @Post('transfer')
  @Roles(Role.STAFF, Role.MANAGER)
  async createTransfer(
    @Tenant() tenantId: string,
    @Body() dto: CreateStockTransferDto,
  ) {
    return this.warehouseService.createTransfer(tenantId, dto);
  }

  @Get('transfers')
  async getTransfers(@Tenant() tenantId: string) {
    return this.warehouseService.getTransfers(tenantId);
  }
}
