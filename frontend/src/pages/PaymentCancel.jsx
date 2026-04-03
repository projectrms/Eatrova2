// src/pages/PaymentCancel.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PaymentStatus.css";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="payment-container cancel">
      <div className="payment-card">
        <div className="icon-circle cancel-icon">✖</div>

        <h1>Payment Cancelled</h1>

        <p>
          Your transaction was not completed.  
          No amount has been deducted.
        </p>

        <div className="btn-group">
          <button
            className="primary-btn"
            onClick={() => navigate("/bills")}
          >
            Try Again
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/home")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}