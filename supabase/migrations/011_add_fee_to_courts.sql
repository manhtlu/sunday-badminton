-- Add default fee to courts table
ALTER TABLE courts
  ADD COLUMN court_fee INTEGER DEFAULT 0;
