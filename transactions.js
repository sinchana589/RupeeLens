function calculateSummary(transactions) {
  let income = 0;
  let expenses = 0;

  transactions.forEach(function (item) {
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

const sampleTransactions = [
  { name: "Salary", type: "income", amount: 20000 },
  { name: "Food", type: "expense", amount: 2000 },
  { name: "Shopping", type: "expense", amount: 1500 },
  { name: "Recharge", type: "expense", amount: 300 }
];

console.log(calculateSummary(sampleTransactions));
