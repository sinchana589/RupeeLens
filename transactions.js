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
    id: Date.now().toString() +
      Math.random().toString(36).slice(2),
    name: description,
    description,
    type,
    amount: value,
    category,
    date: date || new Date().toLocaleDateString("en-CA"),
    recurring
  });

  saveTransactions();
  return true;
}
