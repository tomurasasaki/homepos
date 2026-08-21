import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@pos/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pos')
export class PosController {
  constructor(private posService: PosService) {}

  @Get('products')
  async getProducts(
    @Tenant() tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.posService.getProducts(tenantId, branchId);
  }

  @Post('products')
  @Roles(Role.MANAGER)
  async createProduct(
    @Tenant() tenantId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.posService.createProduct(tenantId, dto);
  }

  @Post('checkout')
  @Roles(Role.KASIR, Role.STAFF, Role.MANAGER)
  async checkout(
    @Tenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CheckoutDto,
  ) {
    return this.posService.checkout(tenantId, userId, dto);
  }

  @Get('transactions')
  async getTransactions(
    @Tenant() tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.posService.getTransactions(tenantId, branchId);
  }
}
