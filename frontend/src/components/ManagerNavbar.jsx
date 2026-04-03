import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ManagerNavbar.css";

export default function ManagerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="manager-navbar">
      <h2>📊 Manager Panel</h2>

      <div className="manager-info">
        <span>{user?.name}</span>
        <button className="manager-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
