// RegisterForm.jsx
import React, { useState } from "react";
import { registerUser } from "../services/authService";
import "../styles/AuthPages.css";

export default function RegisterForm() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerUser(form);

      setSuccess("Account created successfully!");
      setError(null);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: ""
      });

    } catch (err) {
      setError(err.error || err.message || "Registration failed");
      setSuccess(null);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-overlay">

        <form className="auth-form" onSubmit={submit}>

          <h2>Create Account</h2>
          <p className="auth-subtitle">Join Eatrova Restaurant</p>

          <div className="input-group">
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Create Account
          </button>

          {error && <p style={{ color: "#ff6b6b", marginTop: "10px" }}>{error}</p>}
          {success && <p style={{ color: "#4ade80", marginTop: "10px" }}>{success}</p>}

        </form>

      </div>

    </div>
  );
}

 <section className="grid stats-grid">
         

          {/* Pending Orders */}
          <div className="stat yellow">
            <small>Pending Orders</small>
            <h2>{analytics.pending_orders}</h2>
          </div>

          {/* Cancelled Orders */}
          <div className="stat red">
            <small>Cancelled Orders</small>
            <h2>{analytics.cancelled_orders}</h2>
          </div>

          {/* existing stats kept */}
          {/* <div className="stat blue">
            <small>Top Customer</small>
            <h2>{topCustomer?.name || "N/A"}</h2>
          </div> */}

          <div className="stat purple">
            <small>Best Category</small>
            <h2>{topCategory?.category || "N/A"}</h2>
          </div>

          {/* <div className="stat orange">
            <small>Busiest Table</small>
            <h2>{topTable?.table ?? "N/A"}</h2>
            <p>{topTable?.orders ?? 0} Orders</p>
          </div> */}

          <div className="stat teal">
            <small>Peak Hour</small>
            <h2>{peakHour?.hour ? `${peakHour.hour}:00` : "N/A"}</h2>
            <p>{peakHour?.orders ?? 0} orders</p>
          </div>

          {/*<div className="stat green">
            <small>Estimated Profit</small>
            <h2>₹ {Number(profit?.profit || 0).toFixed(2)}</h2>
          </div>*/}

          <div className="stat gray">
            <small>Total Orders</small>
            <h2>{totalOrders}</h2>
          </div>

          <div className="stat sapphire">
            <small>Revenue</small>
            <h2>₹ {totalRevenue.toFixed(2)}</h2>
          </div>

          <div className="stat violet">
            <small>Avg Order</small>
            <h2>₹ {avgOrder.toFixed(2)}</h2>
          </div>

          <div className="stat mint">
            <small>Menu Items</small>
            <h2>{liveMenu.length}</h2>
          </div>

          {/*<div className="stat blue">
            <small>Total Managers</small>
            <h2>{staffData.managers}</h2>
          </div>

          <div className="stat purple">
            <small>Total Chefs</small>
            <h2>{staffData.chefs}</h2>
          </div>

          <div className="stat orange">
            <small>Total Waiters</small>
            <h2>{staffData.waiters}</h2>
          </div>

          <div className="stat teal">
            <small>Total Owners</small>
            <h2>{staffData.owners}</h2>
          </div>

          <div className="stat green">
            <small>Active Staff</small>
            <h2>{staffData.active}</h2>
          </div>

          <div className="stat red">
            <small>Inactive Staff</small>
            <h2>{staffData.inactive}</h2>
          </div>

          <div className="stat blue">
            <small>Most Frequent Customer</small>
            <h2>{mostFrequent?.customer_name || "N/A"}</h2>
            <p>{mostFrequent?.visits || 0} visits</p>
          </div>

          <div className="stat purple">
            <small>Highest Paying Customer</small>
            <h2>{highestPaying?.customer_name || "N/A"}</h2>
            <p>₹ {highestPaying?.spent || 0}</p>
          </div>

          <div className="stat orange">
            <small>Visited Today</small>
            <h2>{customersToday.length}</h2>
          </div>

          <div className="stat red">
            <small>Unpaid Bills</small>
            <h2>{unpaidCustomers.length}</h2>
          </div>
          // Notifications 
          <div className="notify-container">
            {notifications.map(n => (
              <div key={n.id} className={`notify ${n.type}`}>
                {n.text}
              </div>
            ))}
          </div>*/}

         {/* <OrderFilters onFilterChange={applyFilters} /><br />*/}
         {/* <CustomerPurchaseChart data={purchaseHistory} />
          <div style={{
            marginTop: "24px",
            padding: "16px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
              Purchase History
            </h2>

            {loading && <p>Loading…</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {purchaseHistory.map((p, index) => (
            <li
              key={p.id ?? `purchase-${index}`}   // fallback key to avoid warnings
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#f9f9f9",
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
          >*/}
                  {/* Item + Qty */}
                 {/* <div>
                    <span style={{ fontWeight: "600", fontSize: "16px" }}>{p.item_name}</span>
                    <span style={{ fontSize: "13px", color: "#666" }}> (Qty: {p.qty})</span>
                  </div>

                  // Price 
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>
                    ₹{p.price}
                  </div>

                  //Status + Paid 
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    
                    //Status Badge
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "500",
                        background:
                          p.status === "completed"
                            ? "#d4f8d4"
                            : p.status === "preparing"
                            ? "#fff3c4"
                            : p.status === "ready"
                            ? "#d6e8ff"
                            : "#e5e5e5",
                        color:
                          p.status === "completed"
                            ? "#087f23"
                            : p.status === "preparing"
                            ? "#a47b00"
                            : p.status === "ready"
                            ? "#0b4ea2"
                            : "#555"
                      }}
                    >
                      {p.status || "unknown"}
                    </span>

                    // Paid / Unpaid Badge 
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "500",
                        background: p.paid ? "#c8f7c5" : "#ffd2d2",
                        color: p.paid ? "#046c1c" : "#b30000"
                      }}
                    >
                      {p.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  // Date 
                  <div style={{ fontSize: "13px", color: "#777" }}>
                    {new Date(p.bought_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>*/}
          
         {/* <ActivityFeed />*/}

          {/* inventory */}
         {/*} <section className="inventory-wrapper">
            <div className="inventory-header">
              <h2 className="section-title">Inventory</h2>
              <button className="inv-add-btn" onClick={openAddModal}>+ Add Item</button>
            </div>

            <div className="inventory-grid">
              {inventory.map(item => (
                <div className="inv-card" key={item.id}>
                  <h3>{item.item_name}</h3>
                  <p>SKU: {item.sku || "—"}</p>
                  <p>Quantity: <strong>{item.quantity} {item.unit}</strong></p>
                  <p className="low">Low Threshold: {item.low_threshold}</p>
                  <small>Updated: {item.updated_at}</small>

                  <div className="inv-actions">
                    <button className="inv-edit" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="inv-delete" onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {editItem && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Edit Inventory</h2>
                  <label>Quantity:</label>
                  <input type="number" value={editItem.quantity} onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })} />
                  <label>Note:</label>
                  <textarea value={editItem.note || ""} onChange={(e) => setEditItem({ ...editItem, note: e.target.value })}></textarea>
                  <div className="modal-buttons">
                    <button className="save-btn" onClick={updateItem}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditItem(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {newItem && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Add Inventory Item</h2>
                  <label>Name:</label>
                  <input value={newItem.item_name} onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })} />
                  <label>SKU:</label>
                  <input value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} />
                  <label>Quantity:</label>
                  <input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                  <label>Unit:</label>
                  <input value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
                  <label>Low Threshold:</label>
                  <input type="number" value={newItem.low_threshold} onChange={(e) => setNewItem({ ...newItem, low_threshold: e.target.value })} />
                  <label>Note:</label>
                  <textarea value={newItem.note} onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}></textarea>
                  <div className="modal-buttons">
                    <button className="save-btn" onClick={addItem}>Add</button>
                    <button className="cancel-btn" onClick={() => setNewItem(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <h3 className="section-title mt-8">Low Stock Alerts</h3>
            <ul className="low-list">
              {lowStock.map(item => <li key={item.id}>⚠ {item.item_name} — {item.quantity} {item.unit}</li>)}
              {lowStock.length === 0 && <li className="muted">No low stock items</li>}
            </ul>
          </section>
            
            <section className="expense-wrapper">
              <h2 className="section-title">Expense Manager</h2>

              <button className="exp-add-btn" onClick={() => setNewExpense({
                title: "",
                category: "",
                amount: "",
                note: ""
              })}>+ Add Expense</button>

              <div className="expense-summary">
                <div className="exp-box green">
                  <small>Today Expense</small>
                  <h2>₹ {summary.today_expense}</h2>
                </div>
                <div className="exp-box red">
                  <small>Monthly Expense</small>
                  <h2>₹ {summary.monthly_expense}</h2>
                </div>
              </div>

              <table className="exp-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Note</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.title}</td>
                      <td>{exp.category}</td>
                      <td>₹ {exp.amount}</td>
                      <td>{exp.note || "—"}</td>
                      <td>{exp.created_at}</td>
                      <td>
                        <button className="exp-del" onClick={() => deleteExpense(exp.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {newExpense && (
                <div className="modal">
                  <div className="modal-content">
                    <h2>Add Expense</h2>

                    <label>Title</label>
                    <input value={newExpense.title}
                      onChange={(e) => setNewExpense({...newExpense, title: e.target.value})} />

                    <label>Category</label>
                    <input value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} />

                    <label>Amount</label>
                    <input type="number" value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} />

                    <label>Note</label>
                    <textarea value={newExpense.note}
                      onChange={(e) => setNewExpense({...newExpense, note: e.target.value})} />

                    <button onClick={addExpense}>Add</button>
                    <button onClick={() => setNewExpense(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </section>

          <div className="card">
            <h3>Table Status</h3>
            <div className="table-grid">
              {tableStatus.length === 0 && <p className="muted">No active tables</p>}
              {tableStatus.map(t => (
                <div key={t.table_no} className={`table-tile ${t.active_orders > 0 ? 'occupied' : 'free'}`}>
                  <div>Table {t.table_no}</div>
                  <div>{t.active_orders} orders</div>
                </div>
              ))}
            </div>
          </div>*/}

         {/* <section className="table-map">
            <h2 className="map-title">Table Occupancy</h2>
            <div className="table-grid">
              {tables.map((t) => (
                <div key={t.table_no} className={`table-box ${t.status}`}>
                  <h3>Table {t.table_no}</h3>
                  <p>
                    {t.status === "free" && "🟢 Free"}
                    {t.status === "occupied" && `🔴 Occupied (Order #${t.order_id})`}
                    {t.status === "waiting_for_bill" && `🟡 Waiting for bill (Order #${t.order_id})`}
                  </p>
                </div>
              ))}
            </div>
          </section>*/}

         {/* <section className="staff-workload">
            <h2 className="section-title">Staff Workload Monitor</h2>
            <div className="attendance-grid">
              <div className="attendance-card chef">
                <h3>Chefs</h3>
                <p>Present: <strong>{attendance.chefs.present}</strong></p>
                <p>Absent: <strong>{attendance.chefs.absent}</strong></p>
              </div>
              <div className="attendance-card waiter">
                <h3>Waiters</h3>
                <p>Present: <strong>{attendance.waiters.present}</strong></p>
                <p>Absent: <strong>{attendance.waiters.absent}</strong></p>
              </div>
              <div className="attendance-card manager">
                <h3>Managers</h3>
                <p>Present: <strong>{attendance.managers.present}</strong></p>
                <p>Absent: <strong>{attendance.managers.absent}</strong></p>
              </div>
            </div>

            <div className="workload-grid">
              <div className="workload-card chef">
                <h3>Chef Workload</h3>
                <p>{workload.chef_workload} Active Orders</p>
              </div>
              <div className="workload-card waiter">
                <h3>Waiter Workload</h3>
                <p>{workload.waiter_workload} Pending Deliveries</p>
              </div>
            </div>
          </section>*/}

          {/*<section className="weekly-heatmap">
            <h2 className="section-title">Weekly Sales Heatmap</h2>
            <div className="heatmap-grid">
              {weekly.map((day) => (
                <div key={day.day} className="heatbox">
                  <h4>{day.day}</h4>
                  <p>{day.orders} orders</p>
                </div>
              ))}
              {weekly.length === 0 && <p className="muted">No weekly data</p>}
            </div>
          </section>*/}

        </section>
      {/* <div className="metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={`$${summary.totalRevenue}`}
          subtitle="+12% from last period"
          icon={<DollarSign />}
          color="green"
        />

        <MetricCard
          title="Total Orders"
          value={summary.totalOrders}
          subtitle="+8.5% this week"
          icon={<ShoppingBag />}
          color="blue"
        />

        <MetricCard
          title="Avg Order Value"
          value={`$${summary.avgOrderValue}`}
          subtitle="Optimal range"
          icon={<TrendingUp />}
          color="purple"
        />

        <MetricCard
          title="Active Staff"
          value={summary.activeStaff}
          subtitle={`${summary.totalStaff} total`}
          icon={<Users />}
          color="orange"
        />
      </div> */}