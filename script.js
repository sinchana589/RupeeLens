function calculateFinances(income, expenses) {
  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense || 0),
    0
  );

  return {
    income: Number(income) || 0,
    totalExpenses,
    balance: (Number(income) || 0) - totalExpenses
  };
}

function renderSpendingChart() {
  const chart = document.getElementById("spendingChart");

  if (!chart || typeof getTransactions !== "function") {
    return;
  }

  const transactions = getTransactions();

  const money = value =>
    "₹" + Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  const groups = {};

  days.forEach(day => {
    groups[day] = {
      income: 0,
      expenses: 0
    };
  });

  // Calculate the Monday of the current week.
  const today = new Date();
  const monday = new Date(today);
  const weekday = (today.getDay() + 6) % 7;

  monday.setDate(today.getDate() - weekday);
  monday.setHours(0, 0, 0, 0);

  // Group this week's transactions by weekday.
  transactions.forEach(item => {
    if (!item.date) return;

    const date = new Date(item.date + "T00:00:00");

    if (Number.isNaN(date.getTime())) return;

    date.setHours(0, 0, 0, 0);

    const difference = Math.floor(
      (date.getTime() - monday.getTime()) / 86400000
    );

    if (difference < 0 || difference > 6) return;

    const day = days[difference];
    const amount = Number(item.amount) || 0;

    if (item.type === "income") {
      groups[day].income += amount;
    } else if (item.type === "expense") {
      groups[day].expenses += amount;
    }
  });

  const maxValue = Math.max(
    1,
    ...days.flatMap(day => [
      groups[day].income,
      groups[day].expenses
    ])
  );

  const chartMarkup = days.map(day => {
    const item = groups[day];

    const incomeHeight = item.income > 0
      ? Math.max(3, item.income / maxValue * 100)
      : 0;

    const expenseHeight = item.expenses > 0
      ? Math.max(3, item.expenses / maxValue * 100)
      : 0;

    return `
      <div class="chart-column">
        <div class="bar-pair">
          <div
            class="chart-bar income-bar"
            style="height:${incomeHeight}%"
            title="Income: ${money(item.income)}"
          ></div>

          <div
            class="chart-bar expense-bar"
            style="height:${expenseHeight}%"
            title="Expenses: ${money(item.expenses)}"
          ></div>
        </div>

        <small>${day}</small>
      </div>
    `;
  }).join("");

  chart.innerHTML = `
    <div class="chart-grid-lines"></div>
    <div class="spending-bars">
      ${chartMarkup}
    </div>
  `;

  chart.classList.add("chart-active");

  // Update the optional total displayed above the chart.
  const chartTotal = document.getElementById("chartTotal");

  if (chartTotal) {
    const totalExpenses = transactions
      .filter(item => item.type === "expense")
      .reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );

    chartTotal.textContent = money(totalExpenses);
  }
}

// Refresh the graph after the page and transaction data load.
document.addEventListener("DOMContentLoaded", () => {
  renderSpendingChart();
});
