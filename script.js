function calculateFinances(income, expenses) {
  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense),
    0
  );

  return {
    income: Number(income),
    totalExpenses,
    balance: Number(income) - totalExpenses
  };
}

function renderSpendingChart() {
  const chart = document.getElementById("spendingChart");
  const chartTotal = document.getElementById("chartTotal");

  if (!chart || typeof getTransactions !== "function") return;

  const transactions = getTransactions();
  const expenses = transactions.filter(
    item => item.type === "expense"
  );
  const income = transactions.filter(
    item => item.type === "income"
  );

  const money = value =>
    "₹" + value.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0), 0
  );

  if (chartTotal) chartTotal.textContent = money(totalExpenses);

  if (transactions.length === 0) {
    chart.innerHTML = `
      <div class="chart-grid-lines"></div>
      <div class="chart-empty">
        <span>Your spending story starts here.</span>
        <small>Add transactions to build your chart.</small>
      </div>`;
    return;
  }

  const groups = {};

  transactions.forEach(item => {
    const date = item.date || "Undated";
    if (!groups[date]) groups[date] = { income: 0, expenses: 0 };

    if (item.type === "income") {
      groups[date].income += Number(item.amount || 0);
    } else if (item.type === "expense") {
      groups[date].expenses += Number(item.amount || 0);
    }
  });

  const dates = Object.keys(groups).sort().slice(-7);
  const maxValue = Math.max(
    1,
    ...dates.flatMap(date => [
      groups[date].income,
      groups[date].expenses
    ])
  );

  chart.innerHTML = `
    <div class="chart-grid-lines"></div>
    <div class="spending-bars">
      ${dates.map(date => {
        const item = groups[date];
        const incomeHeight = item.income / maxValue * 100;
        const expenseHeight = item.expenses / maxValue * 100;

        return `
          <div class="chart-column">
            <div class="bar-pair">
              <div class="chart-bar income-bar"
                   style="height:${incomeHeight}%"
                   title="Income: ${money(item.income)}"></div>
              <div class="chart-bar expense-bar"
                   style="height:${expenseHeight}%"
                   title="Expenses: ${money(item.expenses)}"></div>
            </div>
            <small>${date.slice(5)}</small>
          </div>`;
      }).join("")}
    </div>`;

  chart.classList.add("chart-active");
}

document.addEventListener("DOMContentLoaded", () => {
  renderSpendingChart();

  document.addEventListener("click", () => {
    setTimeout(renderSpendingChart, 0);
  });
});
