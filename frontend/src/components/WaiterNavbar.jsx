import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/WaiterNavbar.css";

export default function WaiterNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="waiter-navbar">
      <h2>🍽 Waiter Panel</h2>

      <div>
        <span>{user?.name}</span>
        <button className="waiter-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
