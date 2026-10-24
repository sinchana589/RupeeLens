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
