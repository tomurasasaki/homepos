import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@pos/types';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;
    const tenant_id = user?.tenant_id || req.headers['x-tenant-id'] || process.env.TENANT_ID;

    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutatingMethods.includes(method) && tenant_id) {
      return next.handle().pipe(
        tap(async (response) => {
          try {
            const action = this.mapMethodToAction(method);
            const pathParts = url.split('?')[0].split('/').filter(Boolean);
            const entity = pathParts[0] || 'unknown';
            const entity_id = response?.id || response?.data?.id || body?.id || null;

            await this.prisma.auditEvent.create({
              data: {
                tenant_id,
                user_id: user?.id || null,
                action: action as any,
                entity,
                entity_id: entity_id ? String(entity_id) : null,
                payload: body ? JSON.parse(JSON.stringify(body)) : null,
                ip_address: req.ip || req.connection?.remoteAddress || null,
              },
            });
          } catch (err) {
            console.error('AuditLogInterceptor failed to persist log:', err);
          }
        }),
      );
    }

    return next.handle();
  }

  private mapMethodToAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'DELETE':
        return AuditAction.DELETE;
      case 'PUT':
      case 'PATCH':
      default:
        return AuditAction.UPDATE;
    }
  }
}
