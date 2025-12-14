-- Initialize Price Checker SEM Database
-- This script runs during MySQL container initialization

-- Ensure UTF-8 support
ALTER DATABASE price_checker CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Grant additional privileges to app user
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON price_checker.* TO 'app_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Log initialization
SELECT 'Price Checker SEM Database Initialized' as message;