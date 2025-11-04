(function () {
  const API_BASE = '/api';
  const CATEGORIES = [
    "Entertainment",
    "Food",
    "Shopping",
    "Transport",
    "Bills",
    "Subscriptions",
    "Healthcare",
    "Education",
    "Other",
  ];
  const CATEGORY_KEYWORDS = {
    netflix: "Entertainment",
    spotify: "Entertainment",
    prime: "Entertainment",
    hotstar: "Entertainment",
    youtube: "Entertainment",
    zomato: "Food",
    swiggy: "Food",
    uber: "Transport",
    ola: "Transport",
    amazon: "Shopping",
    flipkart: "Shopping",
    myntra: "Shopping",
    electricity: "Bills",
    water: "Bills",
    internet: "Bills",
    mobile: "Bills",
    gym: "Subscriptions",
    hospital: "Healthcare",
    pharmacy: "Healthcare",
    udemy: "Education",
    coursera: "Education",
  };

  // API helper functions
  async function apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async function getMonthlyLimit() {
    try {
      const data = await apiCall('/limit');
      return data.monthlyLimit || 50000;
    } catch (error) {
      console.error('Failed to fetch monthly limit:', error);
      return 50000; // Default fallback
    }
  }

  async function getExpenses() {
    try {
      const data = await apiCall('/expenses');
      return data.expenses || [];
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return [];
    }
  }

  function autoCategorizePlatform(platform) {
    const p = String(platform || "").toLowerCase();
    for (const key in CATEGORY_KEYWORDS) {
      if (p.includes(key)) return CATEGORY_KEYWORDS[key];
    }
    return "Other";
  }

  // Elements (with null checks)
  const el = {
    budget: document.getElementById("stat-budget"),
    spent: document.getElementById("stat-spent"),
    percent: document.getElementById("stat-percent"),
    remaining: document.getElementById("stat-remaining"),
    txCount: document.getElementById("stat-transactions"),
    categoryList: document.getElementById("category-list"),
    expenseList: document.getElementById("expense-list"),
    progressBar: document.getElementById("progress-bar"),
    form: document.getElementById("expense-form"),
    platform: document.getElementById("platform"),
    category: document.getElementById("category"),
    amount: document.getElementById("amount"),
    date: document.getElementById("date"),
    setLimitBtn: document.getElementById("set-limit-btn"),
    previewTotal: document.getElementById("preview-total"),
    previewTransactions: document.getElementById("preview-transactions"),
    pieChartCanvas: document.getElementById("pie-chart"),
  };

  // Pie chart instance
  let pieChart = null;

  // Populate category options
  function populateCategories() {
    el.category.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      el.category.appendChild(opt);
    });
  }

  // Format helpers
  const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  function money(v) { return fmt.format(Number(v || 0)); }

  // Chart colors palette
  const chartColors = [
    '#5b8cff', // Blue
    '#764ba2', // Purple
    '#f5576c', // Pink
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Fuchsia
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];

  // Render dashboard
  async function render() {
    try {
      const [monthlyLimit, expenses] = await Promise.all([
        getMonthlyLimit(),
        getExpenses()
      ]);
      
      const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
      const remaining = monthlyLimit - total;
      const percent = monthlyLimit > 0 ? Math.min(100, (total / monthlyLimit) * 100) : 0;

      // Update dashboard stats
      if (el.budget) el.budget.textContent = money(monthlyLimit);
      if (el.spent) el.spent.textContent = money(total);
      if (el.percent) el.percent.textContent = `${percent.toFixed(1)}% of budget`;
      if (el.remaining) el.remaining.textContent = money(Math.max(0, remaining));
      if (el.txCount) el.txCount.textContent = String(expenses.length);
      if (el.progressBar) el.progressBar.style.width = `${percent}%`;

      // Update home page preview
      if (el.previewTotal) el.previewTotal.textContent = money(total);
      if (el.previewTransactions) el.previewTransactions.textContent = String(expenses.length);

      // Categories
      const byCat = {};
      expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0); });
      
      // Update category list
      if (el.categoryList) {
        el.categoryList.innerHTML = "";
        Object.keys(byCat).sort().forEach((c, index) => {
          const li = document.createElement("li");
          const name = document.createElement("div");
          const val = document.createElement("div");
          name.textContent = c;
          val.textContent = money(byCat[c]);
          li.appendChild(name); li.appendChild(val);
          el.categoryList.appendChild(li);
        });
      }

      // Update pie chart
      updatePieChart(byCat);

      // Expenses table
      if (el.expenseList) {
        el.expenseList.innerHTML = "";
        expenses
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .forEach((e) => {
            const row = document.createElement("div");
            row.className = "table-row";

            const c1 = document.createElement("div"); c1.textContent = e.platform;
            const c2 = document.createElement("div"); c2.textContent = e.category;
            const c3 = document.createElement("div"); c3.textContent = money(e.amount);
            const c4 = document.createElement("div"); c4.textContent = e.date;
            const c5 = document.createElement("div");

            const del = document.createElement("button");
            del.className = "del-btn";
            del.textContent = "Delete";
            del.addEventListener("click", () => deleteExpense(e.id));
            c5.appendChild(del);

            row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); row.appendChild(c4); row.appendChild(c5);
            el.expenseList.appendChild(row);
          });
      }
    } catch (error) {
      console.error('Error rendering:', error);
      if (el.budget || el.spent) {
        alert('Failed to load data. Please refresh the page.');
      }
    }
  }

  // Mutations
  async function addExpense(payload) {
    try {
      await apiCall('/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await render();
    } catch (error) {
      alert('Failed to add expense: ' + error.message);
    }
  }

  async function deleteExpense(id) {
    try {
      await apiCall(`/expenses/${id}`, {
        method: 'DELETE',
      });
      await render();
    } catch (error) {
      alert('Failed to delete expense: ' + error.message);
    }
  }

  async function updateMonthlyLimit(limit) {
    try {
      await apiCall('/limit', {
        method: 'POST',
        body: JSON.stringify({ monthlyLimit: limit }),
      });
      await render();
    } catch (error) {
      alert('Failed to update monthly limit: ' + error.message);
    }
  }

  // Events
  if (el.setLimitBtn) {
    el.setLimitBtn.addEventListener("click", async () => {
    try {
      const currentLimit = await getMonthlyLimit();
      const val = prompt("Set monthly limit (₹)", String(currentLimit));
      if (val === null) return;
      const num = Number(val);
      if (!isFinite(num) || num < 0) { alert("Please enter a valid positive amount."); return; }
      await updateMonthlyLimit(Math.round(num * 100) / 100);
    } catch (error) {
      alert('Failed to get current limit: ' + error.message);
    }
    });
  }

  if (el.platform && el.category) {
    el.platform.addEventListener("input", () => {
      // Auto-categorize when platform changes if category is empty or Other
      const guess = autoCategorizePlatform(el.platform.value);
      if (el.category.value === "" || el.category.value === "Other") {
        el.category.value = guess;
      }
    });
  }

  if (el.form) {
    el.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const platform = el.platform.value.trim();
    const amount = Number(el.amount.value);
    const date = el.date.value;
    let category = el.category.value || autoCategorizePlatform(platform);

    if (!platform) { alert("Platform is required."); return; }
    if (!isFinite(amount) || amount <= 0) { alert("Enter a valid amount greater than 0."); return; }
    if (!date) { alert("Select a date."); return; }

      await addExpense({ platform, category, amount, date });
      el.form.reset();
      // Re-seed date to today for convenience
      if (el.date) el.date.valueAsDate = new Date();
    });
  }

  // Update pie chart
  function updatePieChart(categoryData) {
    if (!el.pieChartCanvas) return;

    const categories = Object.keys(categoryData).sort();
    const values = categories.map(cat => categoryData[cat]);
    
    const container = el.pieChartCanvas.parentElement;
    
    // Handle empty data
    if (categories.length === 0 || values.every(v => v === 0)) {
      if (pieChart) {
        pieChart.destroy();
        pieChart = null;
      }
      // Show empty state message
      if (container) {
        const emptyMsg = container.querySelector('.chart-empty-msg');
        if (!emptyMsg) {
          const msg = document.createElement('div');
          msg.className = 'chart-empty-msg';
          msg.textContent = 'No expenses yet. Add some to see the distribution!';
          container.appendChild(msg);
        }
      }
      return;
    }

    // Remove empty message if it exists
    if (container) {
      const emptyMsg = container.querySelector('.chart-empty-msg');
      if (emptyMsg) emptyMsg.remove();
    }

    const colors = categories.map((_, index) => chartColors[index % chartColors.length]);

    if (!pieChart) {
      // Create new chart
      const ctx = el.pieChartCanvas.getContext('2d');
      pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            label: 'Expenses by Category',
            data: values,
            backgroundColor: colors,
            borderColor: colors.map(c => c + '80'),
            borderWidth: 2,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#eaf0ff',
                padding: 15,
                font: {
                  size: 12,
                  weight: '500'
                },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(20, 27, 53, 0.95)',
              titleColor: '#eaf0ff',
              bodyColor: '#eaf0ff',
              borderColor: 'rgba(91, 140, 255, 0.3)',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${money(value)} (${percentage}%)`;
                }
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000
          }
        }
      });
    } else {
      // Update existing chart
      pieChart.data.labels = categories;
      pieChart.data.datasets[0].data = values;
      pieChart.data.datasets[0].backgroundColor = colors;
      pieChart.data.datasets[0].borderColor = colors.map(c => c + '80');
      pieChart.update('active');
    }
  }

  // Animate numbers on scroll
  function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'));
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            entry.target.textContent = Math.floor(current).toLocaleString();
          }, 16);
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
  }

  // Init
  async function init() {
    if (el.category) {
      populateCategories();
      el.category.value = "Other";
    }
    if (el.date) el.date.valueAsDate = new Date();
    await render();
    animateNumbers();
    
    // Re-render when route changes to dashboard
    window.addEventListener('hashchange', async () => {
      const hash = window.location.hash.slice(1) || '/';
      if (hash === '/dashboard' || hash === '/') {
        await render();
      }
      if (hash === '/') {
        animateNumbers();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();


