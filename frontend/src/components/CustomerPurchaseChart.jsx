import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import "../styles/CustomerPurchaseChart.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CustomerPurchaseChart({ data }) {
  // If empty or no data
  if (!data || data.length === 0) {
    return (
      <div className="chart-section empty">
        <h2 className="chart-title">Customer Purchase History</h2>
        <p className="empty-text">No purchase records available.</p>
      </div>
    );
  }

  const labels = data.map((item) => item.customer_name || "Guest Customer");
  const values = data.map((item) => Number(item.total_spent) || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Spent (₹)",
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        backgroundColor: "#111",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#333" },
      },
      x: {
        ticks: { color: "#333" },
      },
    },
  };

  return (
    <div className="chart-section">
      <h2 className="chart-title">Customer Purchase History</h2>

      <div className="chart-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
