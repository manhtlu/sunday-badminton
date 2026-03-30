# The Kinetic Court — Evidence / Trạng thái triển khai

## Screens Implemented

| # | Screen | Route | Role | Status |
|---|--------|-------|------|--------|
| 1 | Member Selection | `/` | Public | Done |
| 2 | Leader Login | `/login` | Public | Done |
| 3 | Leader Dashboard | `/dashboard` | Leader | Done |
| 4 | Leader Session Add Dialog | `/dashboard` (modal) | Leader | Done |
| 5 | Member Dashboard | `/my/[id]/dashboard` | Member | Done |
| 6 | Member My Page | `/my/[id]` | Member | Done |
| 7 | Leader Member Management | `/dashboard/members` | Leader | Done |
| 8 | Leader Schedule | `/dashboard/schedule` | Leader | Done |
| 9 | Leader Court Management | `/dashboard/courts` | Leader | Done |

## Screens To Do

| # | Screen | Route | Role | Status |
|---|--------|-------|------|--------|
| 10 | Monthly Summary / Export | `/dashboard/summary` | Leader | Planned |

## Components Implemented

| Component | Description |
|-----------|-------------|
| `SessionDialog.vue` | Modal tạo/sửa buổi tập, điểm danh, chia phí |
| `LedgerTable.vue` | Bảng sổ cái tháng (editable, leader) |
| `LedgerTableReadonly.vue` | Bảng sổ cái tháng (read-only, member) |
| `GlobalLoading.vue` | Overlay loading cho mọi API call |

## Database Tables

All 7 tables migrated (12 migration files):

`members` · `courts` · `sessions` · `session_attendances` · `session_guests` · `monthly_extra_fees` · `member_monthly_stats`

## Recent Changes (this session)

- SessionDialog: guest fee logic fixed (no double-counting), per-person fee override, guest display grouped with assigned member
- LedgerTable: delete session button, guest details per member, Thu column fix
- LedgerTableReadonly: synced fixes from LedgerTable (guest details, Thu calculation)
- Member dashboard: highlight current user column, guest_note fix, totalCollected fix
- Courts: added `court_fee` column, auto-fill on court selection in SessionDialog
- Members: avatar upload base64 (max 200KB), `avatar_url` column changed to `text`
- MyPage: avatar upload with toast notifications
- Schedule: v-calendar integration, Vietnamese weekday headers
- Global: `<UNotifications />` added to app.vue
- PWA: `@vite-pwa/nuxt` setup, manifest, service worker, icon 512x512
- Global loading: auto intercept Supabase fetch → overlay spinner
- LedgerTable + LedgerTableReadonly: sticky cột Ngày khi scroll ngang
- Browser title: "Sunday Badminton — Quản lý đội cầu lông"
- Navigation: bỏ menu Lịch tập cho member, fix link Tổng quan → member dashboard
