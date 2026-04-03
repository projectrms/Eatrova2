import React from "react";
import ReactDOM from "react-dom/client";  // ✅ FIXED
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { BillProvider } from "./context/BillContext";
import { RestaurantProvider } from "./context/RestaurantContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <BillProvider>  
      <RestaurantProvider apiBase={import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000"} socketUrl={"http://127.0.0.1:5000"}>
        <App />
      </RestaurantProvider>
      </BillProvider>
    </CartProvider>
  </AuthProvider>
);
