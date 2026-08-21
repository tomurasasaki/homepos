# Role: Backend Developer

## Stack
- NestJS (TypeScript strict), Prisma ORM, PostgreSQL
- Redis (BullMQ untuk queue, ioredis untuk cache)
- Passport.js + JWT (access token 15m, refresh token 7d)
- Class-validator + Class-transformer untuk DTO validation

## Struktur `apps/api/src/`
```
modules/           # Satu folder per modul bisnis
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/           # Request/response DTOs
    guards/        # JwtGuard, RolesGuard
  pos/
  warehouse/
  hr/
  membership/
  cash-report/
  store-config/
common/
  decorators/      # @CurrentUser(), @Tenant(), @Roles()
  guards/          # Global guards
  interceptors/    # AuditLogInterceptor, TransformInterceptor
  filters/         # GlobalExceptionFilter
  prisma/          # PrismaService, PrismaModule
```

## Coding Rules
- **Satu module = satu domain** — service A tidak boleh import PrismaService langsung dari module B
- Komunikasi antar module: inject service yang di-export, atau emit event via EventEmitter2
- Semua operasi write otomatis dicatat oleh `AuditLogInterceptor` (cross-cutting)
- `tenant_id` selalu inject dari JWT payload via `@Tenant()` decorator — jangan terima dari request body
- Semua endpoint wajib pakai `@Roles()` decorator — tidak ada endpoint tanpa RBAC
- Gunakan **Prisma transaction** untuk operasi multi-tabel (transfer stok, payroll, dll)

## Naming Convention
- Module/Controller/Service: `PascalCase` dengan suffix jelas
- DTO: `PascalCase` + suffix `Dto` — `CreateTransactionDto`
- Enum: `PascalCase` — `TransactionStatus`
- Prisma model: `PascalCase` singular — `Transaction`
- Database table: `snake_case` plural — `transactions`
- Column: `snake_case` — `created_at`, `tenant_id`

## Response Shape (standar semua endpoint)
```typescript
// Success
{ data: T, meta?: PaginationMeta }

// Error (via GlobalExceptionFilter)
{ error: string, message: string, statusCode: number }
```

## Multi-tenancy Pattern
```typescript
// Di setiap query Prisma, SELALU include tenant_id
const items = await this.prisma.product.findMany({
  where: { tenant_id: tenantId, ...filter }
})
```

## Queue Jobs (BullMQ)
- Gunakan queue untuk: payroll calculation, laporan besar, notifikasi bulk
- Setiap job punya retry policy: max 3x, backoff exponential
- Job failure wajib tercatat di audit log

## Hal yang TIDAK Boleh
- Jangan return Prisma entity langsung — selalu map ke DTO response
- Jangan simpan password plain text — bcrypt dengan cost 12
- Jangan skip validasi DTO — `ValidationPipe` global, `whitelist: true`
- Jangan tulis raw SQL kecuali untuk reporting query yang kompleks (pakai `$queryRaw` + type-safe)
- Jangan expose stack trace di production response
