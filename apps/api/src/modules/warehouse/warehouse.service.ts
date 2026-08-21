import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StockOpnameDto } from './dto/stock-opname.dto';
import { CreateStockTransferDto } from './dto/stock-transfer.dto';
import { StockTransferStatus } from '@pos/types';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async getStocks(tenantId: string, branchId?: string) {
    return this.prisma.stock.findMany({
      where: {
        tenant_id: tenantId,
        ...(branchId ? { branch_id: branchId } : {}),
      },
      include: {
        product: true,
        branch: true,
      },
      orderBy: { product: { name: 'asc' } },
    });
  }

  async performOpname(tenantId: string, dto: StockOpnameDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.product_id, tenant_id: tenantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.stock.upsert({
      where: {
        branch_id_product_id: {
          branch_id: dto.branch_id,
          product_id: dto.product_id,
        },
      },
      update: {
        quantity: dto.actual_quantity,
      },
      create: {
        tenant_id: tenantId,
        branch_id: dto.branch_id,
        product_id: dto.product_id,
        quantity: dto.actual_quantity,
      },
      include: {
        product: true,
        branch: true,
      },
    });
  }

  async createTransfer(tenantId: string, dto: CreateStockTransferDto) {
    if (dto.from_branch_id === dto.to_branch_id) {
      throw new BadRequestException('Source and destination branches cannot be the same');
    }

    const stock = await this.prisma.stock.findUnique({
      where: {
        branch_id_product_id: {
          branch_id: dto.from_branch_id,
          product_id: dto.product_id,
        },
      },
    });

    if (!stock || stock.quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock in origin branch');
    }

    return this.prisma.$transaction(async (tx) => {
      // Deduct from source branch
      await tx.stock.update({
        where: {
          branch_id_product_id: {
            branch_id: dto.from_branch_id,
            product_id: dto.product_id,
          },
        },
        data: { quantity: { decrement: dto.quantity } },
      });

      // Add to destination branch
      await tx.stock.upsert({
        where: {
          branch_id_product_id: {
            branch_id: dto.to_branch_id,
            product_id: dto.product_id,
          },
        },
        update: { quantity: { increment: dto.quantity } },
        create: {
          tenant_id: tenantId,
          branch_id: dto.to_branch_id,
          product_id: dto.product_id,
          quantity: dto.quantity,
        },
      });

      return tx.stockTransfer.create({
        data: {
          tenant_id: tenantId,
          from_branch_id: dto.from_branch_id,
          to_branch_id: dto.to_branch_id,
          product_id: dto.product_id,
          quantity: dto.quantity,
          status: StockTransferStatus.COMPLETED,
          notes: dto.notes,
        },
        include: {
          product: true,
          from_branch: true,
          to_branch: true,
        },
      });
    });
  }

  async getTransfers(tenantId: string) {
    return this.prisma.stockTransfer.findMany({
      where: { tenant_id: tenantId },
      include: {
        product: true,
        from_branch: true,
        to_branch: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
