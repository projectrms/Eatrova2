import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import "../styles/OrderTracking.css";

export default function OrderTracking() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("pending");

  // -------------------------------
  // FETCH ORDER DETAILS
  // -------------------------------
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
          setItems(data.items);
          setStatus(data.order.status);
        }
      })
      .catch(console.error);
  }, [orderId]);

  // -------------------------------
  // SOCKET STATUS UPDATE
  // -------------------------------
  useEffect(() => {
    socket.on("order_status_update", (data) => {
      if (data.order_id === Number(orderId)) {
        setStatus(data.status);
      }
    });

    return () => socket.off("order_status_update");
  }, [orderId]);

  const statusIndex = {
    pending: 0,
    preparing: 1,
    ready: 2,
    served: 3,
  };

  const currentStep = statusIndex[status] ?? 0;

  if (!order) return <p className="loading">Loading order...</p>;

  return (
    <>
      <Navbar />

      <div className="tracking-wrapper">
        <Link to="/menu" className="back-btn">← Back to Menu</Link>

        <div className="tracking-card">
          <div className="tracking-header">
            <div>
              <h3>Current Order - ORD-{order.id}</h3>
              <p>Table {order.table_no} • Just now</p>
            </div>

            <span className="badge">
              {status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* STATUS STEPS */}
          <div className="steps">
            {["Order Received", "Being Prepared", "Ready to Serve", "Served"].map(
              (label, idx) => (
                <div
                  key={label}
                  className={`step ${idx <= currentStep ? "active" : ""}`}
                >
                  <div className="circle">{idx + 1}</div>
                  <span>{label}</span>
                </div>
              )
            )}
          </div>

          {/* ITEMS */}
          <h4 className="items-title">Order Items</h4>

          {items.map((item, idx) => (
            <div key={idx} className="item-row">
              <div>
                <p className="item-name">{item.name}</p>
                <p className="item-qty">Qty: {item.quantity}</p>
              </div>
              <span className="item-price">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="total-row">
            <span>Total Amount</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
