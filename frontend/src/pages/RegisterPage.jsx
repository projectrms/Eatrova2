import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../styles/AuthPages.css";

export default function RegisterPage() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Phone validation
    if (formData.phone.length !== 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // Password validation
    if (!/^\d+$/.test(formData.password)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must contain digits only.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {

        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Welcome to Eatrova 🍴",
          timer: 1500,
          showConfirmButton: false,
        });

        login();

        setTimeout(() => {
          navigate("/");
        }, 1500);

      } else {

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data.message || "Something went wrong!",
          confirmButtonColor: "#f59e0b",
        });

      }

    } catch (error) {

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
        <form className="auth-form" onSubmit={handleRegister}>

          <h2>Create Account</h2>
          <p className="auth-subtitle">Join Eatrova Restaurant</p>

          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter digits only"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Register
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>
              Login here
            </span>
          </p>

        </form>

      </div>

    </div>
  );
}