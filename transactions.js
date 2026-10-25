const STORAGE_KEY = "rupeelens_transactions";
let transactionErrorMessage="";

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

function syncTransactions() {
  transactions = loadTransactions();
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function calculateSummary(items = transactions) {
  let income = 0;
  let expenses = 0;

  items.forEach(item => {
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

function addTransaction(
  name,
  type,
  amount,
  category = "Other",
  date = ""
) {
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

transactionErrorMessage = "";

if (type === "expense") {
  const summary = calculateSummary();

  if (value > summary.balance) {
    transactionErrorMessage =
      `Insufficient balance! Available balance: ₹${
        summary.balance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }.`;
    return false;
  }
}

  transactions.unshift({
    id: Date.now().toString() +
      Math.random().toString(36).slice(2),
    name: description,
    description,
    type,
    amount: value,
   category,
date: date || new Date().toLocaleDateString("en-CA"),
recurring: document.getElementById("recurring")?.checked || false
  });

  saveTransactions();
  return true;
}

function getTransactions() {
  return transactions;
}
function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
  renderTransactions();

  if (typeof updateExpenseIntelligence === "function") {
    updateExpenseIntelligence();
  }

  if (typeof renderSpendingChart === "function") {
    renderSpendingChart();
  }
}

function displaySummary(items = transactions) {
  syncTransactions();
  const summary = calculateSummary(items);

  const balanceEl = document.getElementById("balance");
  const incomeEl = document.getElementById("income");
  const expensesEl = document.getElementById("expenses");

  const money = value =>
    "₹" + value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  if (balanceEl) balanceEl.textContent = money(summary.balance);
  if (incomeEl) incomeEl.textContent = money(summary.income);
  if (expensesEl) expensesEl.textContent = money(summary.expenses);

  return summary;
}

function refreshDashboard() {
  displaySummary();

  if (typeof renderSpendingChart === "function") {
    renderSpendingChart();
  }

  if (typeof updateExpenseIntelligence === "function") {
    updateExpenseIntelligence();
  }
}

function renderTransactions() {
  const list = document.getElementById("transactionList");
  const count = document.getElementById("transactionCount");

  if (count) {
    count.textContent = `${transactions.length} RECORDS`;
  }

  if (!list) {
    refreshDashboard();
    return;
  }

  if (transactions.length === 0) {
    list.innerHTML = `
      <div class="empty-transactions">
        <strong>No transactions yet</strong>
        <span>Your records will appear here after you add them.</span>
      </div>`;

    refreshDashboard();
    return;
  }

  list.innerHTML = "";

  transactions.slice(0, 10).forEach(item => {
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
      `${item.type === "income" ? "+" : "−"}₹${
        Number(item.amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }`;

    const deleteBtn = document.createElement("button");
deleteBtn.textContent = "🗑 Delete";
deleteBtn.className = "delete-btn";

deleteBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    deleteTransaction(item.id);
  }
});

row.append(details, amount, deleteBtn);
list.appendChild(row);
  });

  refreshDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const type = document.getElementById("type")?.value;
      const amount = document.getElementById("amount")?.value;
      const description =
        document.getElementById("description")?.value;
      const category =
        document.getElementById("category")?.value || "Other";
      const date = document.getElementById("date")?.value || "";

      
      if (!addTransaction(
  description,
  type,
  amount,
  category,
  date
)) {
  alert(
    transactionErrorMessage ||
    "Please enter a description and a valid amount."
  );
  return;
}

      renderTransactions();
      form.reset();

      const dateInput = document.getElementById("date");
      if (dateInput) {
        dateInput.value = new Date().toLocaleDateString("en-CA");
      }
    });
  }

  const refreshButton = document.getElementById("refreshButton");

  if (refreshButton) {
    refreshButton.addEventListener("click", renderTransactions);
  }

  renderTransactions();
});
