import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "../styles/WaiterDashboard.css";
import WaiterNavbar from "../components/WaiterNavbar";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { API } from "../api/constants";
export default function WaiterDashboard() {

  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const socketRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [searchId, setSearchId] = useState("");
  

  /* scroll button */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 250);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* auth + socket */
  useEffect(() => {

    if (!isLoggedIn || !user || user.role !== "waiter") {
      navigate("/login");
      return;
    }

    fetchOrders();

    if (!socketRef.current) {
    const SOCKET_URL = socketUrl || import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }

    socketRef.current.emit("join", { room: "waiter" });

    socketRef.current.on("order_created", fetchOrders);
    socketRef.current.on("order_updated", fetchOrders);
    socketRef.current.on("order_cancelled", fetchOrders);

    return () => socketRef.current.disconnect();

  }, [isLoggedIn, user, navigate]);

  /* fetch */
  const fetchOrders = async () => {
    try {

      const res = await fetch(`${API}/waiter/orders`);
      const data = await res.json();

      const cleaned = data.map(o => ({
        ...o,
        cancel_reason: o.cancel_reason || "No reason provided"
      }));

      setOrders(cleaned);

    } catch (err) {
      console.error(err);
    }
  };

  /* serve order */
  const serveOrder = async (id) => {

    try {

      const res = await fetch(`${API}/order/${id}/serve`, {
        method: "PUT"
      });

      if (res.ok) {
        Swal.fire("Served!", "Order marked as served", "success");
      }

    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!user) return null;

  return (
    <>
      <WaiterNavbar />

      <div className="waiter-dashboard">

        <div className="waiter-header">
          <h1>Orders Overview</h1>
          <p className="muted">Live serving updates from kitchen</p>
        </div>

        {/* search */}
        <div className="waiter-search-box">
          <input
            type="text"
            placeholder="Search Order ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="waiter-search-input"
          />
        </div>

        <h2 className="section-title">All Orders</h2>

        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Table</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {orders
                .filter(o =>
                  searchId
                    ? o.order_id.toString().includes(searchId)
                    : true
                )
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map(order => (

                  <tr
                    key={order.order_id}
                    className={order.status === "ready" ? "ready-row" : ""}
                  >

                    <td>#{order.order_id}</td>

                    <td>
                      {order.items?.map((item, i) => (
                        <div key={i}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </td>

                    <td>₹{order.total}</td>

                    <td>{order.table_no || "N/A"}</td>

                    <td>{formatDate(order.created_at)}</td>

                    <td>
                      <span className={`status-pill ${order.status}`}>
                        {order.status === "ready" ? "🔔 READY" : order.status}
                      </span>
                    </td>

                    <td>

                      <div className="action-buttons">

                        {order.status === "ready" && (
                          <button
                            className="primary-btn"
                            onClick={() => serveOrder(order.order_id)}
                          >
                            Serve
                          </button>
                        )}

                        {order.status === "completed" && (
                          <span className="served-label">
                            Served
                          </span>
                        )}

                        {order.status === "cancelled" && (
                          <span className="cancelled-label">
                            {order.cancel_reason}
                          </span>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>
      <ScrollToTopButton />
    </>
  );
}