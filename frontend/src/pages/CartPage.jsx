import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/CartPage.css";
import { motion } from "framer-motion";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeItem, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState("");
  const [summary, setSummary] = useState(null);

  const tableNo = localStorage.getItem("table_session");

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
    if (!tableNo) navigate("/invalid-table");
  }, [isLoggedIn, tableNo, navigate]);

  useEffect(() => {
    if (!cart.length) {
      setSummary(null);
      return;
    }

    const fetchSummary = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/order/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((i) => ({
              price: i.price,
              quantity: i.qty,
            })),
          }),
        });

        const data = await res.json();
        setSummary(data);
      } catch {
        setErrorMsg("Failed to calculate summary");
      }
    };

    fetchSummary();
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!cart.length) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          tableNo,
          items: cart.map((i) => ({
            menu_id: i.id,
            name: i.name,
            image: i.image,
            quantity: i.qty,
            price: i.price,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.warning(data.error || "Unable to place order");
        return;
      }

      toast.success("Order placed successfully 🍽️");
      clearCart();
      navigate(`/order-tracking/${data.orderId}`);
    } catch {
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <motion.div
        className="cart-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="cart-header">
          <Link to="/menu" className="back-btn">
            ← Back to Menu
          </Link>
          <h2>Your Cart</h2>
        </div>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        {cart.length === 0 ? (
          <p className="empty-cart">
            Your cart is empty
            <br />
            <Link to="/menu" className="continue-btn">
              Continue Shopping 🍽️
            </Link>
          </p>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => {
                const imageSrc =
                  item.image?.startsWith("http")
                    ? item.image
                    : item.image
                    ? `http://127.0.0.1:5000${item.image}`
                    : "/no-image.png";

                return (
                  <motion.div
                    key={item.id}
                    className="cart-card"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="cart-img-box">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        onError={(e) => (e.target.src = "/no-image.png")}
                      />
                      <span className="cart-price-tag">₹{item.price}</span>
                    </div>

                    <div className="cart-info">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <div className="qty-controls">
                        <button onClick={() => decreaseQty(item.id)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => increaseQty(item.id)}>+</button>
                      </div>
                    </div>

                    <div className="cart-right">
                      <span>₹{(item.price * item.qty).toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)}>🗑️</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {summary && (
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="row">
                  <span>Subtotal</span>
                  <span>₹{Number(summary.subtotal).toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>GST</span>
                  <span>₹{Number(summary.gst).toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Service Charge</span>
                  <span>₹{Number(summary.service).toFixed(2)}</span>
                </div>
                <div className="row total">
                  <span>Total Payable</span>
                  <span>₹{Number(summary.total).toFixed(2)}</span>
                </div>

                <button className="order-btn" onClick={handlePlaceOrder}>
                  Place Order
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
      <ScrollToTopButton />
    </>
  );
}