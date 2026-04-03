import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
