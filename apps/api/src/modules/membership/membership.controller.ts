import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@pos/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('membership')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get('members')
  async getMembers(@Tenant() tenantId: string) {
    return this.membershipService.getMembers(tenantId);
  }

  @Post('members')
  async createMember(
    @Tenant() tenantId: string,
    @Body() dto: CreateMemberDto,
  ) {
    return this.membershipService.createMember(tenantId, dto);
  }

  @Get('vouchers')
  async getVouchers(@Tenant() tenantId: string) {
    return this.membershipService.getVouchers(tenantId);
  }

  @Post('vouchers')
  @Roles(Role.MANAGER)
  async createVoucher(
    @Tenant() tenantId: string,
    @Body() dto: CreateVoucherDto,
  ) {
    return this.membershipService.createVoucher(tenantId, dto);
  }

  @Get('vouchers/validate/:code')
  async validateVoucher(
    @Tenant() tenantId: string,
    @Param('code') code: string,
  ) {
    return this.membershipService.validateVoucher(tenantId, code);
  }
}
