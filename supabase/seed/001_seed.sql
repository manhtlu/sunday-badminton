-- Reset existing data
truncate members, courts, sessions, session_attendances, session_guests, monthly_extra_fees, member_monthly_stats restart identity cascade;

-- Seed: members
insert into members (name, avatar_url, gender, role, access_code) values
  ('Mạnh',     'https://i.pravatar.cc/300?u=manh',     'male',   'leader',  '1234'),
  ('Tuấn',     'https://i.pravatar.cc/300?u=tuan',     'male',   'member',  null),
  ('Thế Anh',  'https://i.pravatar.cc/300?u=theanh',   'male',   'member',  null),
  ('Sơn',      'https://i.pravatar.cc/300?u=son',       'male',   'member',  null),
  ('Thái',     'https://i.pravatar.cc/300?u=thai',      'male',   'member',  null),
  ('Ánh',      'https://i.pravatar.cc/300?u=anh',       'female', 'member',  null),
  ('Vy',       'https://i.pravatar.cc/300?u=vy',        'female', 'member',  null),
  ('Toán',     'https://i.pravatar.cc/300?u=toan',      'male',   'member',  null),
  ('Nhi',      'https://i.pravatar.cc/300?u=nhi',       'female', 'member',  null),
  ('Tùng',     'https://i.pravatar.cc/300?u=tung',      'male',   'member',  null),
  ('Huy',      'https://i.pravatar.cc/300?u=huy',       'male',   'member',  null);

-- Seed: courts
insert into courts (name, address, directions) values
  ('Sân A', '123 Đường ABC, Quận 1, TP.HCM', 'Đi thẳng 500m từ ngã tư, rẽ trái'),
  ('Sân B', '456 Đường DEF, Quận 7, TP.HCM', 'Cạnh siêu thị, rẽ phải vào hẻm 2');

-- Seed: sessions (tháng 3/2026, 4 buổi)
insert into sessions (court_id, session_date, status, shuttlecock_quantity, shuttlecock_price_per_unit, court_fee, misc_fee, misc_fee_note, male_split_fee, female_split_fee, total_fee, attendee_count) values
  (1, '2026-03-05', 'completed', 9, 24583, 280000, 0,      null,              65000, 45000, 501250,  8),
  (1, '2026-03-12', 'completed', 7, 24583, 280000, 0,      null,              65000, 45000, 452083, 10),
  (2, '2026-03-15', 'completed', 8, 24583, 220000, 0,      null,              65000, 45000, 416667,  7),
  (1, '2026-03-19', 'completed', 8, 24583, 280000, 0,      null,              70000, 50000, 476667,  8),
  (1, '2026-03-26', 'planned',   0, 0,     280000, 0,      null,              0,     0,     0,       0);

-- Seed: session_attendances
-- Session 1 (5/3): Mạnh, Tuấn, Thế Anh, Sơn, Thái, Ánh, Vy, Huy
insert into session_attendances (session_id, member_id, is_present, fee_amount, guest_fee) values
  (1, 1,  true, 65000, 0),
  (1, 2,  true, 65000, 0),
  (1, 3,  true, 0,     0),
  (1, 4,  true, 0,     0),
  (1, 5,  true, 0,     0),
  (1, 6,  true, 45000, 0),
  (1, 7,  true, 65000, 0),
  (1, 11, true, 0,     0);

-- Session 2 (12/3): Mạnh, Tuấn, Sơn, Thái, Ánh, Vy, Toán, Nhi, Tùng, Huy
insert into session_attendances (session_id, member_id, is_present, fee_amount, guest_fee) values
  (2, 1,  true, 130000, 0),
  (2, 2,  true, 0,      0),
  (2, 4,  true, 65000,  0),
  (2, 5,  true, 0,      0),
  (2, 6,  true, 45000,  0),
  (2, 7,  true, 45000,  0),
  (2, 8,  true, 0,      0),
  (2, 9,  true, 0,      0),
  (2, 10, true, 0,      0),
  (2, 11, true, 0,      0);

-- Session 3 (15/3): Mạnh, Tuấn, Thế Anh, Sơn, Thái, Ánh, Vy
insert into session_attendances (session_id, member_id, is_present, fee_amount, guest_fee) values
  (3, 1,  true, 65000, 0),
  (3, 2,  true, 0,     0),
  (3, 3,  true, 0,     0),
  (3, 4,  true, 65000, 0),
  (3, 5,  true, 65000, 0),
  (3, 6,  true, 45000, 0),
  (3, 7,  true, 45000, 0);

-- Session 4 (19/3): Mạnh, Tuấn, Thế Anh, Sơn, Ánh, Toán, Tùng, Huy
insert into session_attendances (session_id, member_id, is_present, fee_amount, guest_fee) values
  (4, 1,  true, 70000,  0),
  (4, 2,  true, 70000,  0),
  (4, 3,  true, 70000,  0),
  (4, 4,  true, 0,      0),
  (4, 6,  true, 50000,  0),
  (4, 8,  true, 0,      0),
  (4, 10, true, 120000, 0),
  (4, 11, true, 0,      0);

-- Seed: session_guests
-- Session 1: 2 khách (220.000đ tổng)
insert into session_guests (session_id, member_id, guest_name, fee_amount, note) values
  (1, null, 'Khách A', 120000, null),
  (1, null, 'Khách B', 100000, null);

-- Session 2: 1 khách gắn với Mạnh (110.000đ)
insert into session_guests (session_id, member_id, guest_name, fee_amount, note) values
  (2, 1, 'Bạn Mạnh', 110000, 'Khách của Mạnh');

-- Session 3: 1 khách (45.000đ)
insert into session_guests (session_id, member_id, guest_name, fee_amount, note) values
  (3, null, 'Khách C', 45000, null);
