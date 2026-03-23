-- Add schedule fields to sessions table
ALTER TABLE sessions
  ADD COLUMN name VARCHAR(255) DEFAULT 'Sinh hoạt nội bộ',
  ADD COLUMN start_time TIME DEFAULT '19:30',
  ADD COLUMN end_time TIME DEFAULT '21:30';
