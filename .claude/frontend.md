# Role: Frontend Developer

## Stack
- React + Vite, TypeScript strict
- TanStack Router (file-based routing), TanStack Query, TanStack Table
- Tailwind CSS + shadcn/ui
- Zod untuk form validation
- Axios instance terpusat di `lib/api.ts`

## Struktur `apps/web/src/`
```
features/          # Satu folder per modul (auth, pos, warehouse, hr, ...)
  pos/
    components/    # UI komponen spesifik modul ini
    hooks/         # useQuery/useMutation hooks
    pages/         # Route pages
    types.ts       # Local types (extend dari packages/types)
components/        # Shared UI components
lib/               # api.ts, utils, constants
routes/            # TanStack Router route tree
```

## Coding Rules
- **Satu komponen = satu file**, maksimal 200 baris. Kalau lebih, pecah.
- Semua data fetching via **TanStack Query hooks** di `hooks/`, jangan fetch langsung di komponen
- Gunakan **Zod schema** untuk semua form — validasi client-side sebelum submit
- Tidak boleh ada `any` kecuali ada komentar `// TODO: type this`
- RBAC check di level route (TanStack Router `beforeLoad`) dan di komponen kalau perlu hide elemen
- Error state dan loading state wajib di-handle, jangan biarkan UI kosong diam

## Naming Convention
- Komponen: `PascalCase` — `TransactionTable.tsx`
- Hook: `camelCase` prefix `use` — `useTransactions.ts`
- Page: `PascalCase` suffix `Page` — `PosPage.tsx`
- Type: `PascalCase` — `TransactionItem`
- Constant: `SCREAMING_SNAKE` — `MAX_CART_ITEMS`

## FO vs BO Layout
- Front Office (`/fo/...`): layout minimal, optimized untuk touch/kasir
- Back Office (`/bo/...`): layout sidebar, data-heavy, tabel dan chart
- Jangan campur komponen FO dan BO — buat dua layout terpisah

## Hal yang TIDAK Boleh
- Jangan hardcode URL API — semua lewat `lib/api.ts`
- Jangan simpan data sensitif di localStorage (gunakan httpOnly cookie untuk token)
- Jangan call API langsung di event handler — selalu lewat hook
- Jangan styling inline kecuali nilai dinamis yang tidak bisa di-Tailwind
