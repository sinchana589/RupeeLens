// ===============================
// RupeeLens - transactions.js
// Part 1
// ===============================

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getTransactions() {
  return transactions;
}

function formatMoney(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateSummary() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(item => {
    if (item.type === "income") {
      income += Number(item.amount);
    } else {
      expenses += Number(item.amount);
    }
  });

  const balance = income - expenses;

  document.getElementById("income").textContent = formatMoney(income);
  document.getElementById("expenses").textContent = formatMoney(expenses);
  document.getElementById("balance").textContent = formatMoney(balance);

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
// ===============================
// Part 2
// ===============================

function renderTransactions() {
  const list = document.getElementById("transactionList");
  const count = document.getElementById("transactionCount");

  if (!list) return;

  if (transactions.length === 0) {
    list.innerHTML = `
      <div class="empty-transactions">
        <strong>No transactions yet</strong>
        <span>Your records will appear here after you add them.</span>
      </div>
    `;
    if (count) count.textContent = "0 RECORDS";
    return;
  }

  if (count) {
    count.textContent = `${transactions.length} RECORDS`;
  }

  list.innerHTML = "";

  transactions.forEach(transaction => {
    const div = document.createElement("div");
    div.className = "transaction-item";

    div.innerHTML = `
      <div class="transaction-details">
        <strong>${transaction.description}</strong>
        <span>${transaction.category} • ${transaction.date}</span>
      </div>

      <div class="${transaction.type === "income"
        ? "income-amount"
        : "expense-amount"}">
        ${transaction.type === "income" ? "+" : "-"}
        ${formatMoney(transaction.amount)}
      </div>

      <button class="delete-btn"
        onclick="deleteTransaction('${transaction.id}')">
        Delete
      </button>
    `;

    list.appendChild(div);
  });

  updateSummary();
}
// ===============================
// Part 3
// ===============================

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

  const recurring =
    document.getElementById("recurring")?.checked || false;

  transactions.unshift({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    description,
    name: description,
    type,
    amount: value,
    category,
    date: date || new Date().toLocaleDateString("en-CA"),
    recurring
  });

  saveTransactions();
  renderTransactions();

  return true;
}

function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
  renderTransactions();
}
// ===============================
// Part 4 - Initialization
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const type = document.getElementById("type").value;
      const amount = document.getElementById("amount").value;
      const description = document.getElementById("description").value;
      const category = document.getElementById("category").value;
      const date = document.getElementById("date").value;

      const added = addTransaction(
        description,
        type,
        amount,
        category,
        date
      );

      if (added) {
        form.reset();
        document.getElementById("date").value =
          new Date().toLocaleDateString("en-CA");

        renderTransactions();

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
    });
  }

  renderTransactions();
  updateSummary();

  if (typeof renderSpendingChart === "function") {
    renderSpendingChart();
  }

  if (typeof updateExpenseIntelligence === "function") {
    updateExpenseIntelligence();
  }

  if (typeof renderBudgetPlanner === "function") {
    renderBudgetPlanner();
  }
});
