import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(tenantId: string) {
    return this.prisma.auditEvent.findMany({
      where: { tenant_id: tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }
}
