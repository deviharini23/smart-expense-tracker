// Elements
const toggleTheme = document.getElementById("toggleTheme");
const salaryInput = document.getElementById("salary");
const setSalaryBtn = document.getElementById("setSalary");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const addExpenseBtn = document.getElementById("addExpense");
const autoSuggestBtn = document.getElementById("autoSuggest");
const expenseList = document.getElementById("expenseList");
const totalBudgetEl = document.getElementById("totalBudget");
const totalExpensesEl = document.getElementById("totalExpenses");
const savingsEl = document.getElementById("savings");
const savingsPercentEl = document.getElementById("savingsPercent");
const remainingEl = document.getElementById("remaining");
const warningEl = document.getElementById("warning");

let budget = 0;
let expenses = [];
let totalExpenses = 0;

// Dark/Light Toggle
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Set Budget
setSalaryBtn.addEventListener("click", () => {
  budget = parseFloat(salaryInput.value) || 0;
  updateSummary();
});

// Add Expense
addExpenseBtn.addEventListener("click", () => {
  const name = expenseNameInput.value.trim();
  const amount = parseFloat(expenseAmountInput.value);

  if (name && amount > 0) {
    expenses.push({ name, amount });
    renderExpenses();
    updateSummary();
    expenseNameInput.value = "";
    expenseAmountInput.value = "";
  }
});

// Auto-Suggest Expenses
autoSuggestBtn.addEventListener("click", () => {
  if (budget === 0) {
    alert("Please set your salary first!");
    return;
  }

  const suggestions = [
    { name: "Rent/House", amount: budget * 0.30 },
    { name: "Food", amount: budget * 0.20 },
    { name: "Transport", amount: budget * 0.10 },
    { name: "Entertainment", amount: budget * 0.10 },
    { name: "Others", amount: budget * 0.05 }
  ];

  expenses = [...expenses, ...suggestions];
  renderExpenses();
  updateSummary();
});

// Render Expenses
function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.forEach((exp, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${exp.name}: ₹${exp.amount.toFixed(2)}
      <button onclick="removeExpense(${index})">❌</button>`;
    expenseList.appendChild(li);
  });
}

// Remove Expense
function removeExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
  updateSummary();
}

// Update Summary
function updateSummary() {
  totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  let savings = budget - totalExpenses;
  let remaining = budget - totalExpenses;

  if (totalExpenses > budget) {
    warningEl.innerText = "⚠️ Limit exceeded! Extra moved to next month.";
    savings = 0;
    remaining = 0;
  } else {
    warningEl.innerText = "";
  }

  totalBudgetEl.innerText = budget.toFixed(2);
  totalExpensesEl.innerText = totalExpenses.toFixed(2);
  savingsEl.innerText = savings.toFixed(2);
  savingsPercentEl.innerText = ((savings / budget) * 100).toFixed(1);
  remainingEl.innerText = remaining.toFixed(2);
}
