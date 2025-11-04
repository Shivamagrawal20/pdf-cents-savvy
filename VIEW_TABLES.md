# How to View Table Contents in MySQL Workbench

## Method 1: Using MySQL Workbench (GUI - Easiest)

### Step 1: Connect to MySQL
1. Open **MySQL Workbench**
2. Connect to your MySQL server (usually a connection named "Local instance" or similar)

### Step 2: Select the Database
1. In the left sidebar (SCHEMAS), find and expand **`moneysaver`** database
2. You should see two tables:
   - `monthly_limits`
   - `expenses`

### Step 3: View Table Data
1. Right-click on the table name (e.g., `expenses`)
2. Select **"Select Rows - Limit 1000"** or **"Select Rows"**
3. The table data will appear in the results panel below

### Step 4: Refresh Data
- Click the **refresh button** (circular arrow icon) in the toolbar to see latest updates
- Or press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)

## Method 2: Using SQL Queries

### View All Expenses
```sql
USE moneysaver;

SELECT * FROM expenses ORDER BY date DESC;
```

### View Monthly Limits
```sql
SELECT * FROM monthly_limits ORDER BY created_at DESC;
```

### View Latest Expenses
```sql
SELECT * FROM expenses ORDER BY created_at DESC LIMIT 10;
```

### View Expenses by Category
```sql
SELECT category, SUM(amount) as total 
FROM expenses 
GROUP BY category 
ORDER BY total DESC;
```

### View Total Spent
```sql
SELECT SUM(amount) as total_spent FROM expenses;
```

### View Current Monthly Limit
```sql
SELECT monthly_limit 
FROM monthly_limits 
ORDER BY created_at DESC 
LIMIT 1;
```

## Method 3: Auto-Refresh (Real-time)

To see updates in real-time:

1. Open the table view (Method 1, Step 3)
2. Click the **"Auto-refresh"** button (clock icon with circular arrow)
3. Set refresh interval (e.g., every 5 seconds)
4. Now the table will automatically update when you add data from the app!

## Quick Tip: Testing the Connection

Run this query to verify your data:
```sql
USE moneysaver;

-- Check if tables exist
SHOW TABLES;

-- View table structure
DESCRIBE expenses;
DESCRIBE monthly_limits;

-- View all data
SELECT * FROM expenses;
SELECT * FROM monthly_limits;
```

