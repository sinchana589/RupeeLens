/* RupeeLens transaction storage and dashboard */

const TRANSACTIONS_STORAGE_KEY = "rupeelens_transactions";

function getTransactions() {
  try {
    const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const parsed = JSON.parse(saved || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load transactions:", error);
    return [];
  }
}

function saveTransactions(items) {
  try {
    localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify(items)
    );
    return true;
  } catch (error) {
    console.error("Could not save transactions:", error);
    alert("Could not save the transaction. Please try again.");
    return false;
  }
}

function formatRupee(amount) {
  return "₹" + (Number(amount) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function displaySummary() {
  const transactions = getTransactions();

  const income = transactions
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const expenses = transactions
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const balanceElement = document.getElementById("balance");
  const incomeElement = document.getElementById("income");
  const expensesElement = document.getElementById("expenses");

  if (balanceElement) {
    balanceElement.textContent = formatRupee(income - expenses);
  }

  if (incomeElement) {
    incomeElement.textContent = formatRupee(income);
  }

  if (expensesElement) {
    expensesElement.textContent = formatRupee(expenses);
  }
}

function renderRecentTransactions() {
  const list = document.getElementById("transactionList");
  const count = document.getElementById("transactionCount");

  if (!list) return;

  const transactions = getTransactions();

  if (count) {
    count.textContent =
      `${transactions.length} RECORD${transactions.length === 1 ? "" : "S"}`;
  }

  list.replaceChildren();

  if (transactions.length === 0) {
    const message = document.createElement("p");
    message.textContent =
      "No transactions yet. Add a transaction to see it here.";
    list.appendChild(message);
    return;
  }

  transactions.slice(0, 5).forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "transaction-item";

    const details = document.createElement("div");
    details.className = "transaction-details";

    const title = document.createElement("strong");
    title.textContent =
      item.description || item.name || item.category || "Transaction";

    const date = document.createElement("span");
    date.textContent =
      `${item.category || "Other"} · ${item.date || "No date"}`;

    details.append(title, date);

    const amount = document.createElement("strong");
    const isIncome = item.type === "income";

    amount.textContent =
      `${isIncome ? "+" : "−"}${formatRupee(item.amount)}`;

    amount.className = isIncome ? "income-amount" : "expense-amount";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      const current = getTransactions();
      const updated = current.filter((record, i) => {
        if (item.id != null && record.id != null) {
          return String(record.id) !== String(item.id);
        }
        return i !== index;
      });

      if (saveTransactions(updated)) {
        refreshDashboard();
      }
    });

    row.append(details, amount, deleteButton);
    list.appendChild(row);
  });
}

function addTransaction(
  description,
  type,
  amount,
  category = "Other",
  date = ""
) {
  const value = Number(amount);
  const name = String(description || "").trim();

  if (
    !name ||
    !["income", "expense"].includes(type) ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return false;
  }

  const transactions = getTransactions();

  transactions.unshift({
    id: Date.now().toString(),
    name: name,
    description: name,
    type: type,
    amount: value,
    category: category || "Other",
    date: date || new Date().toISOString().slice(0, 10),
    recurring: document.getElementById("recurring")?.checked || false
  });

  if (!saveTransactions(transactions)) return false;

  refreshDashboard();
  return true;
}

function refreshDashboard() {
  displaySummary();
  renderRecentTransactions();

  if (typeof renderSpendingChart === "function") {
    renderSpendingChart();
  }

  if (typeof updateExpenseIntelligence === "function") {
    updateExpenseIntelligence();
  }

  if (typeof renderBudgetPlanner === "function") {
    renderBudgetPlanner();
  }
}

function initializeTransactionForm() {
  const form = document.getElementById("transactionForm");

  if (form && !form.dataset.transactionHandlerAdded) {
    form.dataset.transactionHandlerAdded = "true";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const type =
        document.getElementById("type")?.value || "expense";

      const amount =
        document.getElementById("amount")?.value;

      const description =
        document.getElementById("description")?.value;

      const category =
        document.getElementById("category")?.value || "Other";

      const date =
        document.getElementById("date")?.value || "";

      if (!addTransaction(description, type, amount, category, date)) {
        alert("Please enter a description and an amount greater than ₹0.");
        return;
      }

      document.getElementById("amount").value = "";
      document.getElementById("description").value = "";

      const recurring = document.getElementById("recurring");
      if (recurring) recurring.checked = false;
    });
  }

  const refreshButton = document.getElementById("refreshButton");

  if (refreshButton && !refreshButton.dataset.handlerAdded) {
    refreshButton.dataset.handlerAdded = "true";
    refreshButton.addEventListener("click", refreshDashboard);
  }

  refreshDashboard();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeTransactionForm
  );
} else {
  initializeTransactionForm();
}
