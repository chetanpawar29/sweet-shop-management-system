-- Sweet Shop Management System
-- SQL Script to Make a User an Admin

-- Replace 'your-email@example.com' with the email address of the user you want to make an admin

UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT email, is_admin
FROM profiles
WHERE email = 'your-email@example.com';
