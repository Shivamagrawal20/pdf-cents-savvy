(function () {
  const STORAGE_KEY = "moneysaver_data";
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

  function getStoredData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed reading localStorage", e);
    }
    return { monthlyLimit: 50000, expenses: [] };
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed saving localStorage", e);
    }
  }

  function autoCategorizePlatform(platform) {
    const p = String(platform || "").toLowerCase();
    for (const key in CATEGORY_KEYWORDS) {
      if (p.includes(key)) return CATEGORY_KEYWORDS[key];
    }
    return "Other";
  }

  // Elements
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
  };

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

  // Render
  function render() {
    const data = getStoredData();
    const total = data.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const remaining = data.monthlyLimit - total;
    const percent = data.monthlyLimit > 0 ? Math.min(100, (total / data.monthlyLimit) * 100) : 0;

    el.budget.textContent = money(data.monthlyLimit);
    el.spent.textContent = money(total);
    el.percent.textContent = `${percent.toFixed(1)}% of budget`;
    el.remaining.textContent = money(Math.max(0, remaining));
    el.txCount.textContent = String(data.expenses.length);
    el.progressBar.style.width = `${percent}%`;

    // Categories
    const byCat = {};
    data.expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0); });
    el.categoryList.innerHTML = "";
    Object.keys(byCat).sort().forEach((c) => {
      const li = document.createElement("li");
      const name = document.createElement("div");
      const val = document.createElement("div");
      name.textContent = c;
      val.textContent = money(byCat[c]);
      li.appendChild(name); li.appendChild(val);
      el.categoryList.appendChild(li);
    });

    // Expenses table
    el.expenseList.innerHTML = "";
    data.expenses
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

  // Mutations
  function addExpense(payload) {
    const data = getStoredData();
    data.expenses.push({ id: String(Date.now()), ...payload });
    saveData(data);
    render();
  }

  function deleteExpense(id) {
    const data = getStoredData();
    data.expenses = data.expenses.filter((x) => x.id !== id);
    saveData(data);
    render();
  }

  function updateMonthlyLimit(limit) {
    const data = getStoredData();
    data.monthlyLimit = limit;
    saveData(data);
    render();
  }

  // Events
  el.setLimitBtn.addEventListener("click", () => {
    const data = getStoredData();
    const val = prompt("Set monthly limit (₹)", String(data.monthlyLimit));
    if (val === null) return;
    const num = Number(val);
    if (!isFinite(num) || num < 0) { alert("Please enter a valid positive amount."); return; }
    updateMonthlyLimit(Math.round(num * 100) / 100);
  });

  el.platform.addEventListener("input", () => {
    // Auto-categorize when platform changes if category is empty or Other
    const guess = autoCategorizePlatform(el.platform.value);
    if (el.category.value === "" || el.category.value === "Other") {
      el.category.value = guess;
    }
  });

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const platform = el.platform.value.trim();
    const amount = Number(el.amount.value);
    const date = el.date.value;
    let category = el.category.value || autoCategorizePlatform(platform);

    if (!platform) { alert("Platform is required."); return; }
    if (!isFinite(amount) || amount <= 0) { alert("Enter a valid amount greater than 0."); return; }
    if (!date) { alert("Select a date."); return; }

    addExpense({ platform, category, amount, date });
    el.form.reset();
    // Re-seed date to today for convenience
    el.date.valueAsDate = new Date();
  });

  // Init
  function init() {
    populateCategories();
    el.category.value = "Other";
    el.date.valueAsDate = new Date();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();


