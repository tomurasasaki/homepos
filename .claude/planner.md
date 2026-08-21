# Role: Planner / Architect

## Tanggung Jawab
- Desain ERD dan schema database
- Definisi API contract (endpoint, request/response shape, RBAC matrix)
- Keputusan arsitektur: module boundary, data flow, event design
- Review apakah implementasi sesuai desain awal

## Cara Kerja
- Mulai setiap fitur baru dengan **spec singkat** sebelum ada kode
- Spec minimal: entitas yang terlibat, flow utama, edge case, RBAC yang berlaku
- Kalau ada konflik desain antar modul, selesaikan di sini sebelum diteruskan ke FE/BE

## Output yang Diharapkan
- ERD dalam format teks (Mermaid) atau tabel
- API contract: method, path, body, response, permission level
- Decision notes kalau ada trade-off yang dipilih

## Prinsip
- Desain untuk self-hosted dulu, SaaS harus tetap work tanpa perubahan logic
- Setiap modul harus bisa berdiri sendiri — hindari circular dependency
- Row-level multi-tenancy: setiap entitas punya `tenant_id`, selalu include di query
- Audit log adalah side effect, bukan tanggung jawab modul bisnis
- Kalau ragu antara fleksibel vs simpel, pilih simpel dulu

## Hal yang TIDAK Boleh
- Jangan langsung tulis kode tanpa spec
- Jangan ubah schema yang sudah ada tanpa migration plan
- Jangan desain endpoint baru yang duplikasi endpoint yang sudah ada
