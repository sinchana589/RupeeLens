// RupeeLens: Hidden Expense Detection

function detectRecurringExpenses(transactions) {
    const groups = {};

    transactions.forEach(transaction => {
        const description = (
            transaction.description ||
            transaction.name ||
            transaction.category ||
            "Unknown"
        ).toLowerCase().trim();

        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount) || amount <= 0) return;

        const key = `${description}_${amount}`;

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(transaction);
    });

    const recurringExpenses = [];

    Object.entries(groups).forEach(([key, items]) => {
        if (items.length < 2) return;

        const dates = items
            .map(item => new Date(item.date))
            .filter(date => !Number.isNaN(date.getTime()))
            .sort((a, b) => a - b);

        const repeatedOverTime = dates.length >= 2 &&
            dates.some((date, index) => {
                if (index === 0) return false;

                const previousDate = dates[index - 1];
                const daysApart =
                    (date - previousDate) / (1000 * 60 * 60 * 24);

                return daysApart >= 25 && daysApart <= 35;
            });

        recurringExpenses.push({
            key,
            description: items[0].description ||
                items[0].name ||
                items[0].category ||
                "Unknown expense",
            amount: Number(items[0].amount),
            occurrences: items.length,
            totalSpent: items.reduce(
                (sum, item) => sum + Number(item.amount),
                0
            ),
            likelyMonthly: repeatedOverTime
        });
    });

    return recurringExpenses;
}

function generateSavingSuggestions(recurringExpenses) {
    const suggestions = [];

    recurringExpenses.forEach(expense => {
        if (expense.likelyMonthly) {
            suggestions.push(
                `Review ${expense.description}: ` +
                `₹${expense.amount} may be a monthly recurring payment.`
            );
        } else {
            suggestions.push(
                `Check ${expense.description}: ` +
                `this payment appears more than once.`
            );
        }
    });

    if (suggestions.length === 0) {
        suggestions.push(
            "No repeated expenses detected yet. " +
            "Add more transactions to analyze your spending."
        );
    }

    return suggestions;
}
