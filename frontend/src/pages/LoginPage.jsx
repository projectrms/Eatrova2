import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/AuthPages.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const finalUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.user_type,   // ✅ comes from backend
        };

        login(finalUser);

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${finalUser.name}!`,
          timer: 1200,
          showConfirmButton: false,
        });

        setTimeout(() => {

          // ✅ REDIRECT ACCORDING TO ROLE
          if (finalUser.role === "chef") {
            navigate("/chef");
          } 
          else if (finalUser.role === "waiter") {
            navigate("/waiter");
          }
          else if (finalUser.role === "manager") {
            navigate("/manager");
          }
          else if (data.user.user_type === "owner") {
            navigate("/owner");
          }
          else {
            navigate("/");
          }

        }, 1200);

      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.error || "Invalid email or password.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to connect to the server.",
      });
    }
  };

  return (
  <div className="auth-page">

    <div className="auth-overlay">
        <button
        className="back-home-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>
      <form className="auth-form" onSubmit={handleLogin}>

        <h2>Eatrova Login</h2>
        <p className="auth-subtitle">Welcome back to your table</p>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-btn">
          Login
        </button>

        <p className="auth-switch">
          Don't have an account?
          <span onClick={() => navigate("/register")}> Register</span>
        </p>

      </form>

    </div>

  </div>
);
}