import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import "../styles/OrdersPage.css";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { API } from "../api/constants";
const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [filter, setFilter] = useState("all");

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `${API}/orders/user/${user.id}`
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      const formatted = data.map((o) => ({
        order_id: o.order_id,
        chef_status: o.status,
        payment_status: o.paid ? "paid" : "unpaid",
        customer_name: user.name,
        table_no: o.table || o.table_no || "Not Assigned",
        order_time: o.created_at,
        total_price: o.total,
        items: o.items.map((i) => ({
          item_name: i.name,
          quantity: i.quantity,
        })),
      }));

      setOrders(formatted);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!user) return;

    socket.emit("join_customer", { user_id: user.id });

    socket.on("order_updated", (payload) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === payload.order_id
            ? { ...order, chef_status: payload.status }
            : order
        )
      );
    });

    return () => {
      socket.off("order_updated");
    };
  }, [user]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  /* ================= SAFE RENDER ================= */
  if (!user) return null; // ✅ AFTER hooks → SAFE

  // -----------------------------
  // Status Colors
  // -----------------------------
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9800";
      case "preparing":
        return "#03a9f4";
      case "ready":
        return "#4caf50";
      case "completed":
        return "#9e9e9e";
      case "cancelled":
        return "#e53935";
      default:
        return "#757575";
    }
  };

  const getPaymentColor = (payment) => {
    return payment === "paid" ? "#4caf50" : "#f44336";
  };

  // -----------------------------
  // Filters
  // -----------------------------
  const filteredOrders = orders.filter((o) => {
    const matchId = o.order_id.toString().includes(searchId);

    if (filter === "completed") {
      return matchId && o.chef_status === "completed";
    }

    if (filter === "active") {
      return (
        matchId && o.chef_status !== "completed" && o.chef_status !== "cancelled"
      );
    }

    return matchId;
  });

  return (
    <>
      <Navbar />
      <div className="orders-page">

      <div className="orders-container">
        <h1 className="orders-title">Your Orders</h1>

        {/* SEARCH + FILTER */}
        <div className="order-controls">
          <input
            className="order-search"
            type="text"
            placeholder="Search by Order ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />

          <select
            className="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="loader"></div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-box">
            <img src="/empty-orders.png" className="empty-img" alt="empty" />
            <p>No matching orders found</p>
          </div>
        ) : (
          <div className="orders-list">

            {filteredOrders.map((order, index) => (
              <div key={index} className="order-card">

                <div className="order-header">
                  <span className="order-id">
                    Order #{order.order_id}
                  </span>

                  <span
                    className="status-badge"
                    style={{ background: getStatusColor(order.chef_status) }}
                  >
                    {order.chef_status.toUpperCase()}
                  </span>
                </div>

                <div className="order-body">
                  <div className="order-details">
                    <p><strong>Customer:</strong> {order.customer_name}</p>
                    <p>
                      <strong>Table:</strong> 
                      <span className="table-badge">
                        {order.table_no}
                      </span>
                    </p>
                    <p><strong>Placed At:</strong> {order.order_time}</p>
                  </div>

                  <div className="items-box">
                    <h4>Items</h4>
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.item_name}</span>
                          <span>x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="order-footer">
                  <p className="total-text">
                    Total: <span>₹ {order.total_price}</span>
                  </p>
                  <p
                    className="payment-status"
                    style={{ color: getPaymentColor(order.payment_status) }}
                  >
                    {order.payment_status.toUpperCase()}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      <ScrollToTopButton />
      </div>
    </>
  );
};

export default OrdersPage;
