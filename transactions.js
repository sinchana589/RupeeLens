const STORAGE_KEY = "rupeelens_transactions";

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not load transactions:", error);
    return [];
  }
}

let transactions = loadTransactions();

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function calculateSummary(items = transactions) {
  let income = 0;
  let expenses = 0;

  items.forEach((item) => {
    const amount = Number(item.amount);
    if (!Number.isFinite(amount)) return;

    if (item.type === "income") income += amount;
    if (item.type === "expense") expenses += amount;
  });

  return {
    income,
    expenses,
    balance: income - expenses
  };
}

function addTransaction(name, type, amount, category = "Other", date = "") {
  const description = String(name || "").trim();
  const value = Number(amount);

  if (
    !description ||
    !["income", "expense"].includes(type) ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return false;
  }

  transactions.unshift({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name: description,
    description,
    type,
    amount: value,
    category,
    date: date || new Date().toLocaleDateString("en-CA")
  });

  saveTransactions();
  return true;
}

function getTransactions() {
  return transactions;
}

function displaySummary(items = transactions) {
  const summary = calculateSummary(items);

  const balanceEl = document.getElementById("balance");
  const incomeEl = document.getElementById("income");
  const expensesEl = document.getElementById("expenses");

  const money = (value) =>
    "₹" + value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  if (balanceEl) balanceEl.textContent = money(summary.balance);
  if (incomeEl) incomeEl.textContent = money(summary.income);
  if (expensesEl) expensesEl.textContent = money(summary.expenses);

  return summary;
}

function renderTransactions() {
  const list = document.getElementById("transactionList");
  const count = document.getElementById("transactionCount");

  if (!list) return;

  if (count) {
    count.textContent = `${transactions.length} RECORDS`;
  }

  if (transactions.length === 0) {
    list.innerHTML = `
      <div class="empty-transactions">
        <strong>No transactions yet</strong>
        <span>Your records will appear here after you add them.</span>
      </div>`;
    displaySummary();
    return;
  }

  list.innerHTML = "";

  transactions.slice(0, 10).forEach((item) => {
    const row = document.createElement("div");
    row.className = "transaction-item";

    const details = document.createElement("div");
    details.className = "transaction-details";

    const title = document.createElement("strong");
    title.textContent = item.description || item.name;

    const subtitle = document.createElement("span");
    subtitle.textContent =
      `${item.category || "Other"} · ${item.date || ""}`;

    details.append(title, subtitle);

    const amount = document.createElement("strong");
    amount.className =
      item.type === "income" ? "income-amount" : "expense-amount";
    amount.textContent =
      `${item.type === "income" ? "+" : "−"}₹${Number(item.amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    row.append(details, amount);
    list.appendChild(row);
  });

  displaySummary();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const type = document.getElementById("type").value;
      const amount = document.getElementById("amount").value;
      const description = document.getElementById("description").value;
      const category = document.getElementById("category").value;
      const date = document.getElementById("date").value;

      if (!addTransaction(description, type, amount, category, date)) {
        alert("Please enter a description and a valid amount.");
        return;
      }

      renderTransactions();
      form.reset();
      document.getElementById("date").value =
        new Date().toLocaleDateString("en-CA");
    });
  }

  const refreshButton = document.getElementById("refreshButton");
  if (refreshButton) {
    refreshButton.addEventListener("click", renderTransactions);
  }

  renderTransactions();
updateExpenseIntelligence();
});
