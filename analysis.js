/* RupeeLens: Hidden Expense Detection */

function detectRecurringExpenses(transactions) {
  const groups = {};

  // Only analyze actual expenses.
  transactions
    .filter(t => t.type === "expense")
    .forEach(transaction => {
      const description = String(
        transaction.description ||
        transaction.name ||
        transaction.category ||
        "Unknown"
      ).trim();

      const amount = Number(transaction.amount);

      if (!description || !Number.isFinite(amount) || amount <= 0) {
        return;
      }

      const key =
        `${description.toLowerCase()}_${amount}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(transaction);
    });

  const recurringExpenses = [];

  Object.entries(groups).forEach(([key, items]) => {
    if (items.length < 2) return;

    const datedItems = items
      .map(item => ({
        item,
        date: new Date(item.date + "T00:00:00")
      }))
      .filter(entry => !Number.isNaN(entry.date.getTime()))
      .sort((a, b) => a.date - b.date);

    const likelyMonthly = datedItems.some((entry, index) => {
      if (index === 0) return false;

      const previous = datedItems[index - 1].date;
      const current = entry.date;

      const daysApart =
        (current - previous) / (1000 * 60 * 60 * 24);

      return daysApart >= 25 && daysApart <= 35;
    });

    recurringExpenses.push({
      key,
      description:
        items[0].description ||
        items[0].name ||
        items[0].category ||
        "Unknown expense",
      amount: Number(items[0].amount),
      occurrences: items.length,
      totalSpent: items.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      ),
      likelyMonthly
    });
  });

  return recurringExpenses;
}

function generateSavingSuggestions(recurringExpenses) {
  if (recurringExpenses.length === 0) {
    return [
      "No repeated expenses detected yet. Add more transactions to analyze your spending."
    ];
  }

  return recurringExpenses.map(expense =>
    expense.likelyMonthly
      ? `Review ${expense.description}: ₹${expense.amount} may be a monthly recurring payment.`
      : `Check ${expense.description}: this payment appears more than once.`
  );
}

function updateExpenseIntelligence() {
  if (typeof getTransactions !== "function") return;

  const items = getTransactions() || [];

  const expenses = items.filter(
    item => item.type === "expense"
  );

  const recurring = detectRecurringExpenses(expenses);

  // Count only expenses that match a monthly pattern.
  // Add the total value of all repeated transactions.
const monthlyTotal = recurring.reduce(
  (sum, item) =>
    sum + (Number(item.amount) * Number(item.occurrences)),
  0
);
  const recurringEl =
    document.getElementById("recurringTotal");

  if (recurringEl) {
    recurringEl.textContent =
      "₹" + monthlyTotal.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
  }

  const title = document.getElementById("discoveryTitle");
  const message = document.getElementById("discoveryMessage");

  if (recurring.length > 0) {
    if (title) {
      title.textContent = "Repeated expenses detected";
    }

    if (message) {
      message.textContent = recurring.map(item =>
        `${item.description}: ₹${item.amount} repeated ${item.occurrences} times` +
        (item.likelyMonthly
          ? " — likely monthly."
          : " — monthly pattern not confirmed.")
      ).join(" ");
    }
  } else {
    if (title) {
      title.textContent =
        "Your money deserves a closer look.";
    }

    if (message) {
      message.textContent =
        "Add matching expenses on different dates to discover recurring payments.";
    }
  }
}

// Run when the page has loaded and transactions are available.
function initializeExpenseIntelligence() {
  if (typeof getTransactions === "function") {
    updateExpenseIntelligence();
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeExpenseIntelligence
  );
} else {
  initializeExpenseIntelligence();
}
