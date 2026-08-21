import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@Injectable()
export class CashReportService {
  constructor(private prisma: PrismaService) {}

  async getActiveShift(tenantId: string, userId: string) {
    return this.prisma.shift.findFirst({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        end_time: null,
      },
      include: {
        branch: true,
      },
    });
  }

  async openShift(tenantId: string, userId: string, dto: OpenShiftDto) {
    const existing = await this.getActiveShift(tenantId, userId);
    if (existing) {
      throw new BadRequestException('You already have an active shift open');
    }

    return this.prisma.shift.create({
      data: {
        tenant_id: tenantId,
        branch_id: dto.branch_id,
        user_id: userId,
        start_cash: dto.start_cash,
      },
    });
  }

  async closeShift(tenantId: string, userId: string, shiftId: string, dto: CloseShiftDto) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id: shiftId,
        tenant_id: tenantId,
        user_id: userId,
        end_time: null,
      },
      include: {
        txs: true,
      },
    });

    if (!shift) {
      throw new NotFoundException('Active shift not found or already closed');
    }

    const startCash = Number(shift.start_cash);
    const totalTransactions = shift.txs
      .filter((t: any) => t.status === 'PAID')
      .reduce((sum: number, t: any) => sum + Number(t.total), 0);

    const expectedCash = startCash + totalTransactions;
    const difference = dto.actual_cash - expectedCash;

    return this.prisma.$transaction(async (tx: any) => {
      const closedShift = await tx.shift.update({
        where: { id: shift.id },
        data: {
          end_time: new Date(),
          end_cash: expectedCash,
          actual_cash: dto.actual_cash,
          difference,
        },
      });

      // Log income entry in journal
      await tx.journal.create({
        data: {
          tenant_id: tenantId,
          type: 'INCOME',
          reference: `SHIFT-CLOSE-${shift.id.slice(0, 8)}`,
          description: `Closing revenue for branch shift. Expected: ${expectedCash}, Actual: ${dto.actual_cash}. Difference: ${difference}`,
          amount: totalTransactions,
        },
      });

      return closedShift;
    });
  }

  async getJournals(tenantId: string) {
    return this.prisma.journal.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });
  }
}
