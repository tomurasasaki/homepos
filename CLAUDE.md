# POS System — Claude Project Config

## Project Overview
Modular POS system dengan Front Office (Kasir) dan Back Office (Manager/Admin).
Hybrid deployment: SaaS multi-tenant + self-hosted via Docker Compose.

## Tech Stack
- **Backend**: NestJS (TypeScript), PostgreSQL, Prisma ORM, Redis
- **Frontend**: React + Vite, TanStack Router/Query/Table, Tailwind CSS
- **Infra**: Docker Compose (self-hosted), Railway/Fly.io (SaaS)
- **Storage**: MinIO (self-hosted) / S3-compatible (SaaS)

## Core Modules
| Module | Scope |
|---|---|
| Auth & RBAC | User, Role, Permission, Session |
| Store Config | Store, Branch, Contact, Social Media |
| POS Core | Product, Category, Cart, Transaction, Receipt |
| Warehouse | Stock, Transfer, Opname, Restock |
| HR | Employee, Attendance, Leave, Payroll |
| Membership | Member, Point, Tier, Voucher |
| Cash Report | Shift, CashDrawer, Journal |
| Audit Log | AuditEvent (cross-cutting, append-only) |

## RBAC Levels
```
SuperAdmin → Manager/Owner → Staff/Gudang → Kasir
```
- **SuperAdmin**: full system access, tenant management
- **Manager/Owner**: semua modul kecuali tenant config
- **Staff/Gudang**: operasional + warehouse, tanpa laporan keuangan
- **Kasir**: POS Core only (transaksi, produk)

## Claude Teams
Tiap role punya sub-instruction file masing-masing:
- Planner/Arsitek → `.claude/planner.md`
- Frontend Dev    → `.claude/frontend.md`
- Backend Dev     → `.claude/backend.md`

## Multi-tenancy
- Strategy: **row-level isolation** via `tenant_id` di setiap tabel
- Self-hosted: satu instance = satu toko (`TENANT_ID` dari env)
- SaaS: tenant resolver di API Gateway middleware

## Folder Structure (Monorepo)
```
/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # React frontend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
├── infra/
│   ├── docker/
│   └── nginx/
├── .claude/          # Claude team configs
└── CLAUDE.md         # This file
```

## Development Rules
- Design sebelum build — ERD dan API contract dulu
- Surgical patch, bukan rewrite
- Setiap modul standalone, komunikasi via service injection atau event
- Audit log wajib untuk semua operasi write
