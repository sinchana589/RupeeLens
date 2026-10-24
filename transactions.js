const transactions = [
  { name: "Salary", type: "income", amount: 20000 },
  { name: "Food", type: "expense", amount: 2000 },
  { name: "Shopping", type: "expense", amount: 500 },
  { name: "Recharge", type: "expense", amount: 300 }
];

function calculateSummary(items) {
  let income = 0;
  let expenses = 0;

  items.forEach(function (item) {
    if (item.type === "income") {
      income += item.amount;
    } else if (item.type === "expense") {
      expenses += item.amount;
    }
  });

  return {
    income: income,
    expenses: expenses,
    balance: income - expenses
  };
}

function addTransaction(name, type, amount) {
  if (!name.trim() ||
      !["income", "expense"].includes(type) ||
      !Number.isFinite(amount) ||
      amount <= 0) {
    return false;
  }

  transactions.push({
    name: name.trim(),
    type: type,
    amount: amount
  });

  return true;
}

function getTransactions() {
  return transactions;
}

console.log(calculateSummary(transactions));
function addTransaction(transactions, name, type, amount) {
  if (!name.trim() || amount <= 0 || !Number.isFinite(amount)) {
    return false;
  }

  if (type !== "income" && type !== "expense") {
    return false;
  }

  transactions.push({
    name: name.trim(),
    type: type,
    amount: amount
  });

  return true;
}
function displaySummary(transactions) {
  const summary = calculateSummary(transactions);

  console.log("Total Income: ₹" + summary.income);
  console.log("Total Expenses: ₹" + summary.expenses);
  console.log("Balance: ₹" + summary.balance);

  return summary;
}

displaySummary(sampleTransactions);
