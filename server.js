const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (index.html, styles.css, app.js)

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moneysaver',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('Please ensure MySQL is running and the database is created.');
  }
}

// ==================== API Routes ====================

// Get monthly limit
app.get('/api/limit', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT monthly_limit FROM monthly_limits ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      // Default limit if none exists
      return res.json({ monthlyLimit: 50000 });
    }
    
    res.json({ monthlyLimit: rows[0].monthly_limit });
  } catch (error) {
    console.error('Error fetching limit:', error);
    res.status(500).json({ error: 'Failed to fetch monthly limit' });
  }
});

// Set monthly limit
app.post('/api/limit', async (req, res) => {
  try {
    const { monthlyLimit } = req.body;
    
    if (typeof monthlyLimit !== 'number' || monthlyLimit < 0) {
      return res.status(400).json({ error: 'Invalid monthly limit' });
    }
    
    await pool.execute(
      'INSERT INTO monthly_limits (monthly_limit) VALUES (?)',
      [monthlyLimit]
    );
    
    res.json({ success: true, monthlyLimit });
  } catch (error) {
    console.error('Error setting limit:', error);
    res.status(500).json({ error: 'Failed to set monthly limit' });
  }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, platform, category, amount, date FROM expenses ORDER BY date DESC, created_at DESC'
    );
    
    res.json({ expenses: rows });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expenses by month/year (optional filter)
app.get('/api/expenses/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, platform, category, amount, date FROM expenses WHERE YEAR(date) = ? AND MONTH(date) = ? ORDER BY date DESC, created_at DESC',
      [year, month]
    );
    
    res.json({ expenses: rows });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { platform, category, amount, date } = req.body;
    
    if (!platform || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO expenses (platform, category, amount, date) VALUES (?, ?, ?, ?)',
      [platform, category, amount, date]
    );
    
    const [newExpense] = await pool.execute(
      'SELECT id, platform, category, amount, date FROM expenses WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ expense: newExpense[0] });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM expenses WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, category, amount, date } = req.body;
    
    if (!platform || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await pool.execute(
      'UPDATE expenses SET platform = ?, category = ?, amount = ?, date = ? WHERE id = ?',
      [platform, category, amount, date, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    const [updated] = await pool.execute(
      'SELECT id, platform, category, amount, date FROM expenses WHERE id = ?',
      [id]
    );
    
    res.json({ expense: updated[0] });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    // Get current monthly limit
    const [limitRows] = await pool.execute(
      'SELECT monthly_limit FROM monthly_limits ORDER BY created_at DESC LIMIT 1'
    );
    const monthlyLimit = limitRows.length > 0 ? limitRows[0].monthly_limit : 50000;
    
    // Get total spent (all expenses)
    const [totalRows] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
    );
    const totalSpent = parseFloat(totalRows[0].total);
    
    // Get expenses count
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM expenses'
    );
    const transactionCount = countRows[0].count;
    
    // Get category breakdown
    const [categoryRows] = await pool.execute(
      'SELECT category, SUM(amount) as total FROM expenses GROUP BY category'
    );
    const categoryBreakdown = categoryRows.reduce((acc, row) => {
      acc[row.category] = parseFloat(row.total);
      return acc;
    }, {});
    
    const remaining = Math.max(0, monthlyLimit - totalSpent);
    const percent = monthlyLimit > 0 ? Math.min(100, (totalSpent / monthlyLimit) * 100) : 0;
    
    res.json({
      monthlyLimit,
      totalSpent,
      remaining,
      percent: parseFloat(percent.toFixed(1)),
      transactionCount,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Handle client-side routing - serve index.html for all non-API routes
// This must be AFTER all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  testConnection();
});

