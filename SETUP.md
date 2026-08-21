# Panduan Setup POS System (Development & Production)

Panduan instalasi dan deployment untuk lingkungan **Localhost (Windows/Linux/macOS)** dan **VPS Server**.

---

## 1. Persyaratan Sistem (Prerequisites)

- **Node.js**: Versi 20 LTS atau 22 LTS (Windows, Linux, macOS).
- **Package Manager**: `npm` bawaan Node.js.
- **Database Engine** (Pilih salah satu):
  - **SQLite**: Tidak perlu instalasi tambahan (langsung jalan via file lokal).
  - **PostgreSQL**: Versi 14+ (Lokal, Docker, atau Cloud seperti Supabase/Neon).
  - **MariaDB / MySQL**: Versi 10.5+ / 8.0+.
- **Process Manager** (Khusus Production/VPS): `PM2` (`npm install -g pm2`).

---

## 2. Setup Development (Lokal / Tanpa Docker)

### Langkah 1: Clone & Install Dependencies
Buka terminal (PowerShell di Windows atau Bash di Linux/macOS) di root project:

```bash
# Install seluruh workspace dependencies
npm install
```

### Langkah 2: Build Shared Packages
```bash
# Build shared types dan utilities
npm run build --workspace=@pos/types
npm run build --workspace=@pos/utils
```

### Langkah 3: Inisialisasi Database Default (SQLite)
```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

### Langkah 4: Jalankan Development Server
```bash
# Menjalankan backend (port 3000) dan frontend (port 5173) bersamaan
npm run dev
```

### Langkah 5: Setup Wizard di Browser
1. Buka browser ke: `http://localhost:5173`.
2. Halaman otomatis mengarahkan ke **Setup Wizard**:
   - **Step 1 (Database)**: Pilih **SQLite** (tanpa setup DB server) atau **PostgreSQL / MariaDB** (isi host, user, password, port, dan klik *Test DB Connection*).
   - **Step 2 (Profil Toko & Admin)**: Masukkan Nama Toko, Slogan, Alamat, Kontak, serta Email dan Password untuk SuperAdmin.
   - **Step 3 (Verifikasi)**: Review ringkasan dan klik **Finish & Launch POS**.
3. Sistem akan otomatis login sebagai SuperAdmin ke **Back Office**.

> **Tips Dev Mode**: Jika ingin mengulang proses setup dari awal, klik tombol merah **Dev Reset** di pojok kanan atas Setup Wizard.

---

## 3. Setup Production (VPS Server / Linux)

### Langkah 1: Clone Repository & Setup Environment
```bash
git clone <url-repository> /var/www/pos-system
cd /var/www/pos-system
npm install --production=false
```

### Langkah 2: Konfigurasi Environment Backend
Buat file `apps/api/.env`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=ganti-dengan-kunci-rahasia-yang-sangat-panjang-dan-aman
DATABASE_URL="postgresql://user:password@localhost:5432/pos_prod_db?schema=public"
```
*(Ganti format `DATABASE_URL` sesuai database yang digunakan: PostgreSQL, MariaDB, atau `file:./prod.db` jika SQLite).*

### Langkah 3: Build Seluruh Project
```bash
# Build shared packages
npm run build --workspace=@pos/types
npm run build --workspace=@pos/utils

# Build Backend NestJS
npm run build --workspace=@pos/api

# Build Frontend React (Vite)
npm run build --workspace=@pos/web
```

### Langkah 4: Migrasi Database
```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

### Langkah 5: Jalankan Backend dengan PM2
```bash
# Jalankan NestJS API di background
pm2 start apps/api/dist/main.js --name "pos-api"
pm2 save
pm2 startup
```

### Langkah 6: Konfigurasi Nginx (Reverse Proxy & Frontend Static)
Install Nginx di VPS (`sudo apt install nginx`), lalu buat konfigurasi di `/etc/nginx/sites-available/pos.conf`:

```nginx
server {
    listen 80;
    server_name pos.domain-anda.com; # Ganti dengan domain/IP VPS

    # Frontend React Build
    location / {
        root /var/www/pos-system/apps/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pos.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Fitur Keamanan Setup di Production

- **Lock File**: Setelah setup pertama kali selesai, backend membuat file `.setup_installed`.
- **Reset Guard**: Endpoint `POST /api/setup/reset` otomatis **dinonaktifkan (HTTP 403 Forbidden)** ketika `NODE_ENV=production`.
- **RBAC Enforcement**: Akses ke seluruh modul bisnis dilindungi JWT Token & level hak akses (`SuperAdmin`, `Manager`, `Staff`, `Kasir`).

---

## 5. Ringkasan Port & Endpoint

| Komponen | Development Port | Production Routing |
|---|---|---|
| **Frontend Web** | `http://localhost:5173` | `http://domain-anda.com/` |
| **Backend API** | `http://localhost:3000/api` | `http://domain-anda.com/api/` |
| **Setup Status** | `GET /api/setup/status` | `GET /api/setup/status` |
| **Kasir (FO)** | `http://localhost:5173` (Kasir Role) | `http://domain-anda.com/` |
| **Back Office** | `http://localhost:5173` (Admin Role) | `http://domain-anda.com/` |
