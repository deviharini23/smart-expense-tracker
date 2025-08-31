import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";

export default function DashboardWrapper() {
  const { loggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      navigate("/login");
    }
  }, [loggedIn, navigate]);

  if (!loggedIn) return null;

  return <Dashboard logout={logout} />;
}

function Dashboard({ logout }) {
  const [transactions, setTransactions] = useState(() => {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  });

  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "income",
  });

  const incomeExpenseChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);

  const incomeExpenseChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);
  const trendChartInstance = useRef(null);

  const totalIncome = transactions.reduce(
    (acc, t) => (t.type === "income" ? acc + t.amount : acc),
    0
  );
  const totalExpense = transactions.reduce(
    (acc, t) => (t.type === "expense" ? acc + t.amount : acc),
    0
  );
  const balance = totalIncome - totalExpense;

  useEffect(() => {
    // Chart data aggregation
    const categoryData = {};
    const monthlyData = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
      }
      const month = t.date ? t.date.slice(0, 7) : "";
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += t.type === "income" ? t.amount : -t.amount;
    });

    if (incomeExpenseChartInstance.current)
      incomeExpenseChartInstance.current.destroy();
    incomeExpenseChartInstance.current = new Chart(
      incomeExpenseChartRef.current,
      {
        type: "pie",
        data: {
          labels: ["Income", "Expense"],
          datasets: [
            {
              data: [totalIncome, totalExpense],
              backgroundColor: ["#4CAF50", "#ff4b4b"],
            },
          ],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      }
    );

    const icons = {
      Food: "🍔",
      Transport: "🚗",
      Shopping: "🛍️",
      Bills: "📄",
      Other: "🔧",
    };
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4CAF50",
      "#9966FF",
    ];

    const catLabels = Object.keys(categoryData).map(
      (cat) => `${icons[cat] || ""} ${cat}`
    );
    const catAmounts = Object.values(categoryData);

    if (categoryChartInstance.current)
      categoryChartInstance.current.destroy();
    categoryChartInstance.current = new Chart(categoryChartRef.current, {
      type: "pie",
      data: {
        labels: catLabels,
        datasets: [{ data: catAmounts, backgroundColor: colors.slice(0, catLabels.length) }],
      },
      options: { plugins: { legend: { position: "bottom" } } },
    });

    const months = Object.keys(monthlyData).sort();
    const monthAmounts = months.map((m) => monthlyData[m]);

    if (trendChartInstance.current) trendChartInstance.current.destroy();
    trendChartInstance.current = new Chart(trendChartRef.current, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Net Amount",
            data: monthAmounts,
            backgroundColor: monthAmounts.map((val) =>
              val >= 0 ? "#4CAF50" : "#ff4b4b"
            ),
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });

    return () => {
      incomeExpenseChartInstance.current?.destroy();
      categoryChartInstance.current?.destroy();
      trendChartInstance.current?.destroy();
    };
  }, [transactions, totalIncome, totalExpense]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.date ||
      !form.description ||
      !form.category ||
      !form.amount ||
      !form.type
    )
      return;

    const newTransaction = {
      date: form.date,
      description: form.description,
      category: form.category,
      amount: form.amount,
      type: form.type,
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    setForm({
      date: "",
      description: "",
      category: "",
      amount: "",
      type: "income",
    });
  };

  const deleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
  };

  return (
    <>
      <style>{`
        /* Paste your CSS styles here or import from a css file */
        body { background: #f6f8fa; color: #333; font-family: "Segoe UI", Arial, sans-serif; }
        .dashboard-header {
          background: #4CAF50; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;
        }
        .dashboard-header h1 { font-size: 1.5rem; }
        .dashboard-header .user-info { display: flex; gap: 15px; align-items: center; }
        .dashboard-header button { background: #ff4b4b; border: none; padding: 8px 15px; border-radius: 5px; color: white; cursor: pointer; transition: 0.3s; }
        .dashboard-header button:hover { background: #d93b3b; }
        .summary-cards {
          display: flex; justify-content: space-around; margin: 20px; gap: 15px; flex-wrap: wrap;
        }
        .card {
          flex: 1; min-width: 200px; border-radius: 10px; padding: 20px; text-align: center; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.2s ease-in-out;
        }
        .card:hover { transform: translateY(-4px); }
        #total-income { background: linear-gradient(135deg, #4CAF50, #81C784); }
        #total-expense { background: linear-gradient(135deg, #e53935, #ef5350); }
        #balance { background: linear-gradient(135deg, #2196F3, #64B5F6); }
        .card h3 { font-size: 1.2rem; margin-bottom: 10px; display: flex; justify-content: center; align-items: center; gap: 8px; }
        #total-income h3::before { content: "💵"; font-size: 1.4rem; }
        #total-expense h3::before { content: "💸"; font-size: 1.4rem; }
        #balance h3::before { content: "🏦"; font-size: 1.4rem; }
        .card p { font-size: 1.8rem; font-weight: bold; }
        .add-transaction {
          background: white; padding: 20px; margin: 20px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .add-transaction h2 { margin-bottom: 15px; color: #4CAF50; }
        #transaction-form {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        #transaction-form input,
        #transaction-form select,
        #transaction-form button {
          padding: 8px; border: 1px solid #ccc; border-radius: 5px;
        }
        #transaction-form button {
          background: #4CAF50; color: white; border: none; cursor: pointer;
        }
        #transaction-form button:hover { background: #3a9440; }
        .transaction-history {
          background: white; padding: 20px; margin: 20px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .transaction-history h2 { margin-bottom: 10px; color: #4CAF50; }
        table { width: 100%; border-collapse: collapse; }
        thead { background-color: #4CAF50; color: white; }
        th, td { padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
        #transaction-list tr {
          color: white !important; background-color: #5b5b72; animation: fadeIn 0.5s;
        }
        #transaction-list tr:hover { background-color: #42425a; }
        #transaction-list tr td:first-child {
          position: relative; padding-left: 20px;
        }
        #transaction-list tr.income td:first-child::before {
          content: "●"; color: #19d34c; font-size: 16px; position: absolute; left: 2px; top: 50%; transform: translateY(-50%);
        }
        #transaction-list tr.expense td:first-child::before {
          content: "●"; color: #ff4b4b; font-size: 16px; position: absolute; left: 2px; top: 50%; transform: translateY(-50%);
        }
        .transaction-history button {
          background: #ff4b4b; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;
        }
        .transaction-history button:hover { background: #d93b3b; }
        .charts-section {
          display: flex; flex-wrap: wrap; gap: 20px; padding: 20px;
        }
        .chart-container {
          background: white; padding: 15px; border-radius: 10px; flex: 1; min-width: 300px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media(max-width: 768px) {
          .summary-cards { flex-direction: column; align-items: center; }
          #transaction-form { flex-direction: column; }
          .charts-section { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <header className="dashboard-header">
        <h1>Smart Expense Tracker</h1>
        <div className="user-info">
          <span id="welcome-msg">Welcome, User</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="summary-cards">
        <div className="card" id="total-income">
          <h3>Total Income</h3>
          <p>₹{totalIncome}</p>
        </div>
        <div className="card" id="total-expense">
          <h3>Total Expense</h3>
          <p>₹{totalExpense}</p>
        </div>
        <div className="card" id="balance">
          <h3>Balance</h3>
          <p>₹{balance}</p>
        </div>
      </section>

      <section className="add-transaction">
        <h2>Add Transaction</h2>
        <form id="transaction-form" onSubmit={handleSubmit}>
          <input
            type="date"
            id="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            id="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <select
            id="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            id="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <select id="type" value={form.type} onChange={handleChange} required>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="transaction-history">
        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Type</th><th>Action</th>
            </tr>
          </thead>
          <tbody id="transaction-list">
            {transactions.map((t, idx) => (
              <tr key={idx} className={t.type}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td>{t.category}</td>
                <td>₹{t.amount}</td>
                <td>{t.type}</td>
                <td>
                  <button onClick={() => deleteTransaction(idx)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="charts-section">
        <div className="chart-container">
          <h3>Income vs Expense</h3>
          <canvas ref={incomeExpenseChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Expense by Category</h3>
          <canvas ref={categoryChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Monthly Net Balance Trend</h3>
          <canvas ref={trendChartRef}></canvas>
        </div>
      </section>
    </>
  );
}
