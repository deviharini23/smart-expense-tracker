import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [budget, setBudget] = useState(0);
  const [desiredSavings, setDesiredSavings] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [months, setMonths] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [motivation, setMotivation] = useState("");

  // Budget + Savings
  const handleSetBudget = () => {
    setExpenses([]);
  };

  // Add Expense
  const addExpense = (name, value) => {
    if (!name || !value) return alert("Enter expense details!");
    if (budget === 0) return alert("Set budget first!");

    const totalExpenses =
      expenses.reduce((a, b) => a + b.amount, 0) + parseFloat(value);

    if (totalExpenses > budget - desiredSavings) {
      alert("⚠️ Expense exceeds allowed limit!");
      return;
    }

    setExpenses([...expenses, { name, amount: parseFloat(value) }]);
  };

  // Default Expenses
  const addDefaultExpenses = () => {
    if (budget === 0) return alert("⚠️ Set budget first!");

    const defaults = [
      { name: "Rent", amount: budget * 0.3 },
      { name: "Food", amount: budget * 0.2 },
      { name: "Travel", amount: budget * 0.1 },
      { name: "Utilities", amount: budget * 0.15 },
      { name: "Entertainment", amount: budget * 0.1 },
    ];

    setExpenses([...expenses, ...defaults]);
  };

  // Remove Expense
  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  // Next Month
  const nextMonth = () => {
    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const actualSavings = budget - totalExpenses;

    setMonths([...months, "Month " + currentMonth]);
    setMonthData([...monthData, { used: totalExpenses, saved: actualSavings }]);

    if (actualSavings >= desiredSavings) {
      setMotivation("🎉 Well done! You saved more this month!");
    } else {
      setMotivation("⚠️ Try to save more next month!");
    }

    setCurrentMonth(currentMonth + 1);
    setExpenses([]);
  };

  // Chart Data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Used",
        data: monthData.map((d) => d.used),
        backgroundColor: "tomato",
      },
      {
        label: "Saved",
        data: monthData.map((d) => d.saved),
        backgroundColor: "green",
      },
    ],
  };

  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const remaining = budget - totalExpenses - desiredSavings;

  return (
    <div className={darkMode ? "dark-mode container" : "container"}>
      <h1>💰 Expense Dashboard</h1>
      <button onClick={() => setDarkMode(!darkMode)}>🌙 Toggle Dark/Light</button>

      <h3>Set Budget and Savings</h3>
      <input
        type="number"
        placeholder="Enter Total Salary/ Budget"
        onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
      />
      <input
        type="number"
        placeholder="Enter Desired Savings"
        onChange={(e) => setDesiredSavings(parseFloat(e.target.value) || 0)}
      />
      <button onClick={handleSetBudget}>Set</button>

      <h3>Add Expense</h3>
      <input id="expName" type="text" placeholder="Expense Name" />
      <input id="expValue" type="number" placeholder="Enter Expense Amount" />
      <button
        onClick={() =>
          addExpense(
            document.getElementById("expName").value,
            document.getElementById("expValue").value
          )
        }
      >
        Add Expense
      </button>
      <button onClick={addDefaultExpenses}>+ Suggest Default Expenses</button>

      <div className="expense-list">
        {expenses.map((exp, i) => (
          <div key={i} className="expense-item">
            <span>
              {exp.name}: ₹{exp.amount.toFixed(2)}
            </span>
            <button onClick={() => removeExpense(i)}>❌</button>
          </div>
        ))}
      </div>

      <h3>Summary</h3>
      <p>
        Budget: ₹{budget}, Savings Goal: ₹{desiredSavings}, Used: ₹{totalExpenses}, Remaining: ₹
        {remaining}
      </p>
      <button onClick={nextMonth}>➡️ Next Month</button>

      <div className="charts">
        <Bar data={chartData} />
      </div>

      <p className="motivation">{motivation}</p>
    </div>
  );
}
