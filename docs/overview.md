# The Kinetic Court — Badminton Team Management

## Overview

Web app quản lý team cầu lông nội bộ. Hỗ trợ leader quản lý lịch sinh hoạt, chi phí từng buổi, và tổng kết tháng. Members xem chi phí cá nhân/team và thống kê luỹ kế.

## Actors

| Actor | Quyền |
|-------|-------|
| **Leader** | CRUD sessions, quản lý members, nhập chi phí, tổng kết tháng. Login bằng access code (không password) |
| **Member** | Xem chi phí cá nhân/team (read-only), xem lịch, xem bản đồ sân, xem My Page (thống kê luỹ kế) |

## Core Features

### Leader

1. **Lên lịch sinh hoạt**
   - Tạo trước danh sách sessions trong tháng (ngày + sân)
   - Edit/xoá session

2. **Quản lý members**
   - Thêm/sửa/disable member
   - Mỗi member có avatar, tên, giới tính (nam/nữ dùng để chia phí)

3. **Nhập chi phí session** — 2 cách:
   - **Auto split**: chọn members present → nhập tiền cầu (số lượng × đơn giá) + tiền sân + phát sinh → set male_fee / female_fee → Calculate Split
   - **Manual edit**: sửa trực tiếp trên bảng ledger của tháng (per member per session)

4. **Điểm danh**
   - Dashboard hiển thị tất cả members
   - Toggle on/off (bôi xám) member cho từng session

5. **Khách vãng lai**
   - Ghi chép tự do từng buổi, không quản lý trong hệ thống member
   - Khách có thể gắn với 1 member → fee tính vào member đó (hiển thị rõ ràng)
   - Khách độc lập → ghi chép riêng

6. **Tổng kết tháng**
   - Tổng chi phí tất cả sessions
   - Custom fees ngoài lề (mua cầu dự trữ, áo team, nước uống...)
   - Export tháng

### Member

1. **Xem chi phí**
   - Chi phí từng buổi, từng tháng
   - Xem riêng mình hoặc cả team (giao diện giống Leader nhưng read-only)

2. **Xem lịch sinh hoạt**
   - Danh sách sessions sắp tới

3. **Xem bản đồ sân**
   - Tên sân, địa chỉ, hướng dẫn di chuyển

4. **My Page**
   - Thống kê chi phí đã nộp theo tháng
   - Luỹ kế đến thời điểm hiện tại

## Business Rules

### Chi phí session
- Tổng chi phí buổi = tiền cầu + tiền sân + tiền phát sinh
- Tiền cầu = số lượng cầu × đơn giá
- Chia phí: nam nhiều hơn nữ (leader quyết định mức chia)
- Đơn vị tiền: VND (không có xu, luôn là số nguyên)

### Khách vãng lai
- Khách gắn member: fee cộng vào member, hiển thị tách biệt (phí cá nhân + phí khách)
- Khách độc lập: ghi chép riêng, không ảnh hưởng member nào

### Thống kê
- Khi data session thay đổi → recalculate stats cache
- Luỹ kế = tổng grand_total từ tháng đầu tiên đến tháng hiện tại

### Authentication
- Chỉ leader cần login
- Login bằng access code đơn giản (app nội bộ, không cần bảo mật cao)
- Members không cần login, chọn profile để xem

## UI/UX Requirements

- Giao diện hiện đại, tối giản, tập trung hiển thị thông tin
- Mobile-first cho My Page (members xem trên điện thoại)
- Dashboard responsive cho desktop (leader nhập liệu)
- Dialog nhập chi phí session với Calculate Split
- Bảng ledger tháng: columns = members, rows = sessions

## Screens

1. **Home / Member Selection** (mobile) — chọn profile, Leader Access button
2. **Dashboard** (desktop) — monthly overview + session financial ledger
3. **Session Details Dialog** — nhập chi phí, điểm danh, chia phí
4. **Schedule** — lịch sinh hoạt tháng
5. **Members Management** — CRUD members (leader only)
6. **My Page** — thống kê cá nhân, chi phí luỹ kế
7. **Court Info** — thông tin sân, bản đồ, hướng dẫn
