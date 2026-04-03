import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // -------------------------------
  // ADD TO CART
  // -------------------------------
  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);

      if (exists) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  // -------------------------------
  // INCREASE QTY
  // -------------------------------
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, qty: c.qty + 1 } : c
      )
    );
  };

  // -------------------------------
  // DECREASE QTY (AUTO REMOVE)
  // -------------------------------
  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.id === id ? { ...c, qty: c.qty - 1 } : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  // -------------------------------
  // REMOVE ITEM
  // -------------------------------
  const removeItem = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  // -------------------------------
  // CLEAR CART
  // -------------------------------
  const clearCart = () => setCart([]);

  // -------------------------------
  // TOTAL PRICE
  // -------------------------------
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
