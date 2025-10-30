# MoneySaver - Static HTML/CSS/JS

This is a lightweight, static version of MoneySaver. No build tools, frameworks, or Node are required.

## Run locally

- Open `index.html` in your browser (double-click it or drag into a tab).

## Features

- Set monthly budget
- Add expenses (platform, category, amount, date)
- Auto-categorize platform names (e.g., Uber → Transport, Amazon → Shopping)
- View totals, remaining budget, progress bar, category breakdown
- Delete expenses
- Data persists in `localStorage`

## Files

- `index.html` — app markup
- `styles.css` — styles (dark theme)
- `app.js` — app logic and `localStorage` persistence

## Notes

- All React/Vite/TypeScript and related configs were removed.
- You can deploy by serving these three files from any static host.
