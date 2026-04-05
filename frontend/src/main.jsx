import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { BillProvider } from "./context/BillContext";
import { RestaurantProvider } from "./context/RestaurantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <BillProvider>  
        <RestaurantProvider apiBase={API_BASE} socketUrl={SOCKET_URL}>
          <App />
        </RestaurantProvider>
      </BillProvider>
    </CartProvider>
  </AuthProvider>
);
