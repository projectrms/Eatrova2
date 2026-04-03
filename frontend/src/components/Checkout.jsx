// Checkout.jsx
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { items, placeOrder } = useCart();
  const [status, setStatus] = useState(null);

  const handlePlace = async () => {
    try {
      setStatus('Placing order...');
      const res = await placeOrder();
      setStatus('Order placed! ID: ' + res.order_id);
    } catch (e) {
      setStatus('Error: ' + (e.error || e.message));
    }
  };

  return (
    <div>
      <div>Total: ₹{items.reduce((s,i)=> s + i.price * i.quantity, 0)}</div>
      <button onClick={handlePlace}>Place Order</button>
      {status && <div>{status}</div>}
    </div>
  );
}
