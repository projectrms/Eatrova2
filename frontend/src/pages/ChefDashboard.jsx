// src/pages/ChefDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ChefNavbar from "../components/ChefNavbar";
import socket from "../socket/socket";
import "../styles/ChefDashboard.css";
import Modal from "../components/Modal";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { API } from "../api/constants";
export default function ChefDashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const normalize = (o) => ({
    order_id: o.order_id ?? o.id,
    created_at: o.created_at,
    total: o.total ?? 0,
    status: (o.status ?? "pending").toLowerCase(),
    cancel_reason: o.cancel_reason || "",
    items:
      o.items?.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      })) || [],
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/chef/orders`);
      const data = await res.json();
      setOrders(data.map(normalize));
      setLoading(false);
    } catch (err) {
      console.log("Fetch error:", err);
      setLoading(false);
    }
  };

  const changeOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId ? { ...o, status: newStatus } : o
      )
    );

    try {
      await fetch(`${API}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      fetchOrders();
    }
  };

  const cancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;

    try {
      const res = await fetch(
        `${API}/orders/${selectedOrder.order_id}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel order");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === selectedOrder.order_id
            ? { ...order, status: "cancelled", cancel_reason: cancelReason }
            : order
        )
      );

      setShowCancelModal(false);
      setCancelReason("");
      setSelectedOrder(null);
    } catch (err) {
      alert("Server error while cancelling order");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (!user || user.role !== "chef") {
      navigate("/login");
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);

    socket.emit("join_kitchen");

    return () => clearInterval(interval);
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    const refreshOrders = () => fetchOrders();

    socket.on("order_updated", refreshOrders);
    socket.on("order_cancelled", refreshOrders);

    return () => {
      socket.off("order_updated", refreshOrders);
      socket.off("order_cancelled", refreshOrders);
    };
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };

  return (
    <>
      <ChefNavbar />

      <div className="chef-dashboard">
        <header className="chef-header">
          <h1>Chef Dashboard 👨‍🍳</h1>
          <p className="muted">Live Order Management</p>
        </header>

        {loading && <p>Loading orders...</p>}

        <AllOrdersTable
          orders={orders}
          formatDate={formatDate}
          changeOrderStatus={changeOrderStatus}
          cancelOrder={cancelOrder}
        />
      </div>


      {showCancelModal && (
        <Modal
          onClose={() => {
            setShowCancelModal(false);
            setCancelReason("");
            setSelectedOrder(null);
          }}
        >
          <div className="cancel-modal">
            <div className="cancel-modal-header">
              <h2>Cancel Order #{selectedOrder?.order_id}</h2>
            </div>

            <div className="cancel-modal-body">
              <textarea
                className="cancel-textarea"
                placeholder="Enter cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="cancel-modal-footer">
              <button
                className="modal-btn outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedOrder(null);
                }}
              >
                Close
              </button>

              <button
                className="modal-btn danger"
                onClick={confirmCancelOrder}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function AllOrdersTable({ orders, formatDate, changeOrderStatus, cancelOrder }) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // newest orders first
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const getCookingTime = (created) => {
    const diff = now - new Date(created).getTime();

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return { days, hours, minutes };
  };

  const getRowClass = (order) => {

    if (order.status === "ready" || order.status === "cancelled") {
      return "";
    }

    const diffSec = (now - new Date(order.created_at).getTime()) / 1000;

    // new order highlight
    if (diffSec < 15) return "new-order-row";

    // late order highlight
    if (diffSec > 900) return "late-order-row";

    return "";
  };

  return (
    <div className="orders-section">
      <h2 className="section-title">Kitchen Orders</h2>

      {sortedOrders.length === 0 ? (
        <div className="empty-card">No orders</div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
                <th>Cooking Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedOrders.map((order) => {
                const time = getCookingTime(order.created_at);

                return (
                  <tr key={order.order_id} className={getRowClass(order)}>
                    <td>#{order.order_id}</td>

                    <td>
                      {order.items.map((item, i) => (
                        <div key={i}>{item.name} × {item.quantity}</div>
                      ))}
                    </td>

                    <td>₹{order.total}</td>

                    <td>{formatDate(order.created_at)}</td>

                    <td>
                      {(order.status === "pending" || order.status === "preparing") ? (
                        <span className={(time.days > 0 || time.hours >= 1 || time.minutes > 20) ? "timer-late" : "timer-normal"}>
                          {time.days > 0 && `${time.days}d `}
                          {time.hours}h {time.minutes}m
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>

                    <td>
                      <span className={`status-pill ${order.status}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {order.status === "pending" && (
                          <>
                            <button
                              className="primary-btn"
                              onClick={() => changeOrderStatus(order.order_id, "preparing")}
                            >
                              Start
                            </button>

                            <button
                              className="danger-btn"
                              onClick={() => cancelOrder(order)}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {order.status === "preparing" && (
                          <>
                            <button
                              className="primary-btn"
                              onClick={() => changeOrderStatus(order.order_id, "ready")}
                            >
                              Ready
                            </button>

                            <button
                              className="danger-btn"
                              onClick={() => cancelOrder(order)}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {order.status === "ready" && (
                          <span className="status-pill ready">Ready</span>
                        )}

                        {order.status === "cancelled" && (
                          <span className="cancel-reason">
                            {order.cancel_reason || "No reason"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}
