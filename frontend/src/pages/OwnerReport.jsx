import React, { useEffect, useState } from "react";
import "../styles/OwnerReport.css";

export default function OwnerReport() {
  const [summary, setSummary] = useState({});
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:5000/owner/report/summary").then(res => res.json()),
      fetch("http://127.0.0.1:5000/owner/report/daily").then(res => res.json()),
      fetch("http://127.0.0.1:5000/owner/report/monthly").then(res => res.json()),
      fetch("http://127.0.0.1:5000/owner/report/customers").then(res => res.json()),
      fetch("http://127.0.0.1:5000/owner/report/orders")
  .then(res => res.json())
  .then(data => {
    if (Array.isArray(data)) {
      setOrders(data);
    } else {
      console.error("Invalid data:", data);
      setOrders([]);
    }
  })

    ])
      .then(([summary, daily, monthly, customers, orders]) => {
        setSummary(summary || {});
        setDaily(daily || []);
        setMonthly(monthly || []);
        setCustomers(customers || []);
        setOrders(orders || []);
      })
      .catch(err => {
        console.error("Error loading report:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const exportPDF = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading Report...</div>;
  }

  return (
    <div className="owner-report-page">

      {/* Header */}
      <div className="report-header">
        <div>
          <h1>Eatrova Restaurant Report</h1>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        <button className="export-btn" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      {/* Revenue Summary */}
      <section className="report-section">
        <h2>Revenue Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Orders</h3>
            <p>{summary?.total_orders ?? 0}</p>
          </div>
          <div className="summary-card">
            <h3>Total Revenue</h3>
            <p>₹{Number(summary?.total_revenue ?? 0).toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Daily Revenue */}
      <section className="report-section">
        <h2>Daily Revenue</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {daily?.length > 0 ? daily.map((d, i) => (
              <tr key={i}>
                <td>{d.date}</td>
                <td>{d.orders}</td>
                <td>₹{Number(d.revenue || 0).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="empty">No Data</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Monthly Revenue */}
      <section className="report-section">
        <h2>Monthly Revenue</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {monthly?.length > 0 ? monthly.map((m, i) => (
              <tr key={i}>
                <td>{m.month}</td>
                <td>{m.orders}</td>
                <td>₹{Number(m.revenue || 0).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="empty">No Data</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Customer Details */}
      <section className="report-section">
        <h2>Customer Details</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers?.length > 0 ? customers.map((c, i) => (
              <tr key={c.id || i}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="empty">No Customers</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Order History */}
      <section className="report-section">
        <h2>Order History</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Table</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length > 0 ? orders.map((o, i) => (
              <tr key={o.id || i}>
                <td>{o.id}</td>
                <td>{o.table_no || "-"}</td>
                <td>₹{Number(o.total || 0).toFixed(2)}</td>
                <td>
                  <span className={`badge ${o.paid ? "paid" : "unpaid"}`}>
                    {o.paid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td>{o.payment_method || "N/A"}</td>
                <td>
                  {o.created_at
                    ? new Date(o.created_at).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="empty">No Orders Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

    </div>
  );
}