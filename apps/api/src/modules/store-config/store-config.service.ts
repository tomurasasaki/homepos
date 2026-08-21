import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class StoreConfigService {
  constructor(private prisma: PrismaService) {}

  async getStoreInfo(tenantId: string) {
    const store = await this.prisma.store.findFirst({
      where: { tenant_id: tenantId },
    });
    if (!store) {
      throw new NotFoundException('Store settings not found for this tenant');
    }
    return store;
  }

  async getBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    const store = await this.getStoreInfo(tenantId);
    return this.prisma.branch.create({
      data: {
        tenant_id: tenantId,
        store_id: store.id,
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
      },
    });
  }
}
