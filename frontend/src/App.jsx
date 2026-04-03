// src/App.jsx
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChefNavbar from "./components/ChefNavbar";
import WaiterNavbar from "./components/WaiterNavbar";
import InvalidTable from "./components/InvalidTable";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import BillPage from "./pages/BillPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";
import ChefDashboard from "./pages/ChefDashboard";
import WaiterDashboard from "./pages/WaiterDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import TableView from "./pages/TableView";
import { RestaurantProvider } from "./context/RestaurantContext";
import DineIn from "./pages/DineIn";   // ✅ IMPORT YOUR PAGE
import OrderTracking from "./pages/OrderTracking";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import OwnerReport from "./pages/OwnerReport";
import TodayReport from "./pages/TodayReport";
import "./styles/theme.css";   // 🔥 GLOBAL THEME
import "./styles/toast.css";

function Layout({ children }) {
  const { user } = useAuth();

  return (
    <>
      {/* Show Customer Navbar only if NOT chef */}
      {(!user || user.role !== "chef") && <Navbar />}

      {/* Show Chef Navbar only for chef */}
      {user && user.role === "chef" && <ChefNavbar />}

      {/* Show waiter Navbar only for waiter */}
      {user && user.role === "waiter" && <WaiterNavbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
      <Router>
        <Routes>
          <Route path="/invalid-table" element={<InvalidTable />} />
          <Route path="/dine-in" element={<DineIn />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/bills" element={<BillPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chef" element={<ChefDashboard />} />
          <Route path="/waiter" element={<WaiterDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} /> 
          <Route path="/manager/inventory" element={<Inventory />} />
          <Route path="/manager/analytics" element={<Analytics />} />   
          <Route path="/owner" element={<OwnerDashboard />} />       
          <Route path="/tables" element={<TableView />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />       
          <Route path="/owner/report" element={<OwnerReport />} />
          <Route path="/owner/today-report" element={<TodayReport />} />
        </Routes>
        {/* 🔔 GLOBAL TOAST */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnHover
        closeOnClick
        draggable
        newestOnTop
        theme="light"
      />
      </Router>
      </RestaurantProvider>
    </AuthProvider>
  );
}
