-- Change avatar_url from varchar(255) to text to support base64 data
ALTER TABLE members ALTER COLUMN avatar_url TYPE text;
