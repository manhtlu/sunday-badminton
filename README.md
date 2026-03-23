# The Kinetic Court — Sunday Badminton Team

Ứng dụng quản lý đội cầu lông: điểm danh, chia phí, theo dõi tài chính hàng tháng.

## Tech Stack

- **Frontend**: Nuxt 4 + Vue 3 + TypeScript
- **UI**: Nuxt UI + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Calendar**: v-calendar
- **Deploy**: Vercel

## Setup local

```bash
# 1. Clone repo
git clone https://github.com/<your-username>/sunday-badminton-team.git
cd sunday-badminton-team

# 2. Install dependencies
npm install

# 3. Copy env file and fill in Supabase credentials
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_KEY

# 4. Run migrations on Supabase
# Go to Supabase Dashboard > SQL Editor
# Run each file in supabase/migrations/ in order (001 → 012)

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
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_KEY` = `your-anon-key`
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
supabase/
└── migrations/         # 12 migration files
```
