function calculateFinances(income, expenses) {
const totalExpenses = expenses.reduce(
(total, expense) => total + Number(expense),
0
);

const balance = Number(income) - totalExpenses;

return {
    income: Number(income),
    totalExpenses: totalExpenses,
    balance: balance
};

}

// Example test
const result = calculateFinances(20000, [3000, 2000, 1000]);

console.log("Income: ₹" + result.income);
console.log("Total Expenses: ₹" + result.totalExpenses);
console.log("Remaining Balance: ₹" + result.balance);
