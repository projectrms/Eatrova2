import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ChefNavbar.css";

export default function ChefNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="chef-navbar">
      <div className="chef-left">
        <h2>👨‍🍳 Chef Panel</h2>
        <p className="chef-subtitle">Kitchen Management</p>
      </div>

      <div className="chef-right">
        <span className="chef-name">{user?.name}</span>
        <button className="chef-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
