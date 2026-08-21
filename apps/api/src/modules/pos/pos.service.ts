import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { TransactionStatus } from '@pos/types';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  async getProducts(tenantId: string, branchId?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true,
      },
      include: {
        category: true,
        stocks: branchId ? { where: { branch_id: branchId } } : true,
      },
      orderBy: { name: 'asc' },
    });

    return products.map((p: any) => {
      const stockVal = p.stocks.reduce((acc: number, s: any) => acc + s.quantity, 0);
      return {
        ...p,
        price: Number(p.price),
        cost_price: Number(p.cost_price),
        stock: stockVal,
      };
    });
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    let categoryId: string | undefined = undefined;

    if (dto.category_name) {
      let category = await this.prisma.category.findFirst({
        where: { tenant_id: tenantId, name: dto.category_name },
      });
      if (!category) {
        category = await this.prisma.category.create({
          data: { tenant_id: tenantId, name: dto.category_name },
        });
      }
      categoryId = category.id;
    }

    return this.prisma.product.create({
      data: {
        tenant_id: tenantId,
        category_id: categoryId,
        sku: dto.sku,
        name: dto.name,
        price: dto.price,
        cost_price: dto.cost_price,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async checkout(tenantId: string, userId: string, dto: CheckoutDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify shift exists & active
    const shift = await this.prisma.shift.findFirst({
      where: { id: dto.shift_id, tenant_id: tenantId, end_time: null },
    });
    if (!shift) {
      throw new BadRequestException('Active shift not found. Please open shift first.');
    }

    return this.prisma.$transaction(async (tx: any) => {
      let subtotal = 0;
      const itemsToCreate = [];

      for (const item of dto.items) {
        const product = await tx.product.findFirst({
          where: { id: item.product_id, tenant_id: tenantId, is_active: true },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.product_id} not found`);
        }

        // Deduct stock safely
        const stockRecord = await tx.stock.findUnique({
          where: {
            branch_id_product_id: {
              branch_id: dto.branch_id,
              product_id: product.id,
            },
          },
        });

        const currentQty = stockRecord ? stockRecord.quantity : 0;
        if (currentQty < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
        }

        await tx.stock.update({
          where: {
            branch_id_product_id: {
              branch_id: dto.branch_id,
              product_id: product.id,
            },
          },
          data: {
            quantity: currentQty - item.quantity,
          },
        });

        const itemPrice = Number(product.price);
        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;

        itemsToCreate.push({
          tenant_id: tenantId,
          product_id: product.id,
          quantity: item.quantity,
          price: itemPrice,
          subtotal: itemSubtotal,
        });
      }

      const discount = dto.discount_amount || 0;
      const taxableAmount = Math.max(0, subtotal - discount);
      const tax = Math.round(taxableAmount * 0.11);
      const total = taxableAmount + tax;

      if (dto.paid_amount < total) {
        throw new BadRequestException(`Paid amount IDR ${dto.paid_amount} is less than total IDR ${total}`);
      }

      const change = dto.paid_amount - total;

      const transaction = await tx.transaction.create({
        data: {
          tenant_id: tenantId,
          branch_id: dto.branch_id,
          user_id: userId,
          shift_id: dto.shift_id,
          member_id: dto.member_id || null,
          subtotal,
          tax,
          discount,
          total,
          paid_amount: dto.paid_amount,
          change,
          payment_method: dto.payment_method,
          status: TransactionStatus.PAID,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Add loyalty points if member present (1 point per 10,000 IDR)
      if (dto.member_id) {
        const pointsEarned = Math.floor(total / 10000);
        if (pointsEarned > 0) {
          await tx.member.update({
            where: { id: dto.member_id },
            data: { points: { increment: pointsEarned } },
          });
        }
      }

      return transaction;
    });
  }

  async getTransactions(tenantId: string, branchId?: string) {
    return this.prisma.transaction.findMany({
      where: {
        tenant_id: tenantId,
        ...(branchId ? { branch_id: branchId } : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        member: true,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }
}
