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
  const selector = document.getElementById("chartRange");
  const chartTotal = document.getElementById("chartTotal");

  if (!chart || typeof getTransactions !== "function") return;

  const range = selector?.value || "week";
  const transactions = getTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const money = value =>
    "₹" + value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  let startDate;
  let endDate;
  let labels;

  if (range === "week") {
    startDate = new Date(today);
    startDate.setDate(
      today.getDate() - ((today.getDay() + 6) % 7)
    );

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  } else if (range === "month") {
    startDate = new Date(
      today.getFullYear(), today.getMonth(), 1
    );
    endDate = new Date(
      today.getFullYear(), today.getMonth() + 1, 1
    );

    const days = new Date(
      today.getFullYear(), today.getMonth() + 1, 0
    ).getDate();

    labels = Array.from({ length: days }, (_, i) => String(i + 1));
  } else {
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = new Date(today.getFullYear() + 1, 0, 1);

    labels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
  }

  const groups = labels.map(label => ({
    label,
    income: 0,
    expenses: 0
  }));

  transactions.forEach(item => {
    if (
      !item.date ||
      !["income", "expense"].includes(item.type)
    ) return;

    const date = new Date(item.date + "T00:00:00");
    const amount = Number(item.amount);

    if (
      Number.isNaN(date.getTime()) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      date < startDate ||
      date >= endDate
    ) return;

    let index;

    if (range === "week") {
      index = Math.floor(
        (date.getTime() - startDate.getTime()) / 86400000
      );
    } else if (range === "month") {
      index = date.getDate() - 1;
    } else {
      index = date.getMonth();
    }

    if (!groups[index]) return;

    if (item.type === "income") {
      groups[index].income += amount;
    } else {
      groups[index].expenses += amount;
    }
  });

  const maxValue = Math.max(
    1,
    ...groups.flatMap(group => [
      group.income,
      group.expenses
    ])
  );

  const totalExpenses = groups.reduce(
    (sum, group) => sum + group.expenses,
    0
  );

  if (chartTotal) {
    chartTotal.textContent = money(totalExpenses);
  }

  chart.innerHTML = `
    <div class="chart-grid-lines"></div>
    <div class="spending-bars"
      style="grid-template-columns:repeat(${groups.length},minmax(24px,1fr));
      min-width:${Math.max(350, groups.length * 30)}px">
      ${groups.map(group => {
        const incomeHeight = group.income
          ? Math.max(3, group.income / maxValue * 100)
          : 0;

        const expenseHeight = group.expenses
          ? Math.max(3, group.expenses / maxValue * 100)
          : 0;

        return `
          <div class="chart-column">
            <div class="bar-pair">
              <div class="chart-bar income-bar"
                style="height:${incomeHeight}%"
                title="Income: ${money(group.income)}"></div>
              <div class="chart-bar expense-bar"
                style="height:${expenseHeight}%"
                title="Expenses: ${money(group.expenses)}"></div>
            </div>
            <small>${group.label}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;

  chart.classList.add("chart-active");
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("chartRange")?.addEventListener(
    "change",
    renderSpendingChart
  );

  renderSpendingChart();

  if (typeof renderBudgetPlanner === "function") {
    renderBudgetPlanner();
  }
});

