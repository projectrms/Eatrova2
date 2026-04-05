import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./CartPage.css";
import { API } from "../api/constants";
export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/cart`)
      .then((res) => res.json())
      .then(setCart)
      .catch((err) => console.error(err));
  }, []);

  const removeItem = (id) => {
    fetch(`${API}/api/cart/${id}`, { method: "DELETE" })
      .then(() => setCart((prev) => prev.filter((i) => i.id !== id)));
  };

  const placeOrder = async () => {
    await fetch(`${API}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    alert("Order placed!");
    setCart([]);
  };

  return (
    <motion.div
      className="cart-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                {item.name} - ₹{item.price} × {item.qty}
                <button onClick={() => removeItem(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button className="place-order" onClick={placeOrder}>
            Place Order
          </button>
        </>
      )}
    </motion.div>
  );
}
