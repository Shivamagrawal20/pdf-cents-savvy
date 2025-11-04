-- MoneySaver Database Schema
-- Run this script in MySQL Workbench to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS moneysaver CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE moneysaver;

-- Table for storing monthly budget limits
CREATE TABLE IF NOT EXISTS monthly_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monthly_limit DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing expenses/records
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_platform (platform),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default monthly limit (optional)
-- INSERT INTO monthly_limits (monthly_limit) VALUES (50000.00);

-- Sample data (optional - uncomment to insert test data)
/*
INSERT INTO expenses (platform, category, amount, date) VALUES
('Amazon', 'Shopping', 1299.00, '2024-01-15'),
('Uber', 'Transport', 250.00, '2024-01-16'),
('Netflix', 'Entertainment', 649.00, '2024-01-17'),
('Zomato', 'Food', 450.00, '2024-01-18');
*/

