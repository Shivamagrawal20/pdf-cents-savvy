# MoneySaver - Smart Personal Expense Manager

A full-stack expense tracking application with MySQL backend. Track your expenses, set monthly budgets, and visualize your spending by category.

## Features

- Set monthly budget limits
- Add expenses with platform, category, amount, and date
- Auto-categorize expenses based on platform names (e.g., Uber → Transport, Amazon → Shopping)
- View totals, remaining budget, progress bar, and category breakdown
- Delete expenses
- Data persisted in MySQL database
- RESTful API backend

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (MySQL Workbench or MySQL CLI)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Open MySQL Workbench and connect to your MySQL server
2. Open the `database.sql` file in MySQL Workbench
3. Run the SQL script to create the database and tables:
   - This will create a database named `moneysaver`
   - Creates `monthly_limits` table for storing budget limits
   - Creates `expenses` table for storing expense records

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `mysql2` - MySQL database driver
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 3. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=moneysaver
PORT=3000
```

**Note**: Replace `your_mysql_password` with your actual MySQL root password.

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Monthly Limit
- `GET /api/limit` - Get current monthly limit
- `POST /api/limit` - Set monthly limit
  ```json
  {
    "monthlyLimit": 50000
  }
  ```

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:year/:month` - Get expenses for specific month/year
- `POST /api/expenses` - Add new expense
  ```json
  {
    "platform": "Amazon",
    "category": "Shopping",
    "amount": 1299.00,
    "date": "2024-01-15"
  }
  ```
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Statistics
- `GET /api/statistics` - Get aggregated statistics (total spent, remaining, category breakdown, etc.)

### Health Check
- `GET /api/health` - Check database connection status

## Database Schema

### monthly_limits
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `monthly_limit` (DECIMAL(10,2))
- `created_at` (TIMESTAMP)

### expenses
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `platform` (VARCHAR(100))
- `category` (VARCHAR(50))
- `amount` (DECIMAL(10,2))
- `date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Project Structure

```
pdf-cents-savvy/
├── server.js          # Express server and API routes
├── app.js             # Frontend JavaScript (API client)
├── index.html         # Frontend HTML
├── styles.css         # Frontend styles
├── database.sql       # Database schema script
├── package.json       # Node.js dependencies
├── .env               # Environment variables (create this)
└── .env.example       # Environment variables template
```

## Troubleshooting

### Database Connection Error
- Ensure MySQL server is running
- Verify database credentials in `.env`
- Check that the `moneysaver` database exists
- Run the `database.sql` script if tables don't exist

### Port Already in Use
- Change the `PORT` in `.env` to a different port
- Or stop the process using port 3000

### CORS Issues
- The server is configured with CORS enabled
- If accessing from a different origin, ensure the server allows it

## Development

To modify the application:

1. **Backend**: Edit `server.js` for API routes and database queries
2. **Frontend**: Edit `app.js` for client-side logic, `index.html` for markup, `styles.css` for styling
3. **Database**: Modify `database.sql` and run migrations manually

## License

MIT
