# The Kinetic Court — Sunday Badminton Team

Ứng dụng quản lý đội cầu lông: điểm danh, chia phí, theo dõi tài chính hàng tháng.

## Tech Stack

- **Frontend**: Nuxt 4 + Vue 3 + TypeScript
- **UI**: Nuxt UI + Tailwind CSS
- **Database**: Neon (PostgreSQL), truy cập qua API Nitro (`server/api/`)
- **Calendar**: v-calendar
- **Deploy**: Vercel

## Setup local

```bash
# 1. Clone repo
git clone https://github.com/<your-username>/sunday-badminton-team.git
cd sunday-badminton-team

# 2. Install dependencies
npm install

# 3. Copy env file and add Neon connection string
cp .env.example .env
# Set DATABASE_URL from Neon Dashboard (Connection details)

# 4. Create schema on Neon
# Neon Dashboard → SQL Editor → paste & run database/neon-schema.sql
# (Hoặc dùng psql: psql "$DATABASE_URL" -f database/neon-schema.sql)
# Nếu migrate từ Supabase: export dữ liệu (pg_dump) rồi import vào Neon — schema đã tương thích.

# 5. Start dev server
npm run dev
```

## Deploy lên Vercel

### Bước 1: Push code lên GitHub

```bash
git init
git add -A
git commit -m "feat: initial commit"
gh repo create sunday-badminton-team --public --source=. --push
```

### Bước 2: Connect Vercel

1. Vào [vercel.com](https://vercel.com) → đăng nhập bằng GitHub
2. Click **"Add New Project"**
3. Import repo `sunday-badminton-team`
4. Vercel tự detect Nuxt → giữ nguyên settings mặc định
5. Thêm **Environment Variables**:
   - `DATABASE_URL` = connection string Neon (khuyến nghị dùng pooled + `sslmode=require`)
6. Click **Deploy**

### Bước 3: Done

Sau khi deploy xong, app sẽ có URL dạng:
```
https://sunday-badminton-team.vercel.app
```

Mỗi lần push code lên `main`, Vercel sẽ tự động build và deploy.

## Cấu trúc thư mục chính

```
app/
├── pages/              # Các trang
│   ├── index.vue       # Chọn thành viên
│   ├── login.vue       # Đăng nhập leader
│   ├── dashboard/      # Leader pages
│   │   ├── index.vue   # Bảng điều khiển
│   │   ├── members.vue # Quản lý thành viên
│   │   ├── courts.vue  # Quản lý sân
│   │   └── schedule.vue # Lịch chơi
│   └── my/[id]/        # Member pages
│       ├── index.vue   # Trang cá nhân
│       └── dashboard.vue # Bảng tổng quan
├── components/         # Components
│   ├── SessionDialog.vue
│   ├── LedgerTable.vue
│   └── LedgerTableReadonly.vue
├── layouts/            # Layouts
├── middleware/          # Auth middleware
└── plugins/            # Plugins (v-calendar)
database/
└── neon-schema.sql     # Schema để chạy trên Neon (thay cho RLS Supabase)
server/
└── api/                # REST API → PostgreSQL qua @neondatabase/serverless
supabase/
└── migrations/         # Lịch sử migration (tham chiếu; schema tổng hợp ở database/neon-schema.sql)
```

## Neon

1. Tạo project tại [neon.tech](https://neon.tech), copy **connection string**.
2. Chạy `database/neon-schema.sql` trong SQL Editor (database mới).
3. Đặt `DATABASE_URL` trong `.env` và trên Vercel.
4. (Tùy chọn) Cài [Neon CLI](https://neon.tech/docs/reference/neon-cli) để quản lý branch/project từ terminal.