// src/pages/HomePage.jsx

import React from "react";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  Utensils,
  ShoppingCart,
  ChefHat,
  CreditCard,
  Clock,
  Star
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <div className="home-page">

        {/* HERO */}

        <section className="home-hero">

          <div className="hero-bg"></div>
          <div className="hero-overlay"></div>

          <div className="hero-content">

            <h1>
              Welcome to <span>Eatrova</span>
            </h1>

            <p>
              Smart Restaurant Experience — Fast ordering, fresh food,
              seamless service.
            </p>

            <div className="hero-buttons">

              <Link to="/menu" className="btn-primary">
                <Utensils size={18}/> View Menu
              </Link>

              <Link to="/orders" className="btn-secondary">
                <ShoppingCart size={18}/> My Orders
              </Link>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section className="home-features">

          <h2>Why Choose Eatrova?</h2>

          <div className="feature-grid">

            <div className="feature-card">
              <Clock size={34}/>
              <h3>Fast Ordering</h3>
              <p>Order food quickly with our smart ordering system.</p>
            </div>

            <div className="feature-card">
              <ChefHat size={34}/>
              <h3>Freshly Prepared</h3>
              <p>Every meal is prepared fresh by our expert chefs.</p>
            </div>

            <div className="feature-card">
              <CreditCard size={34}/>
              <h3>Easy Payments</h3>
              <p>Secure checkout with seamless payment options.</p>
            </div>

          </div>

        </section>


        {/* STATS */}

        <section className="home-stats">

          <div className="stat">
            <Utensils size={28}/>
            <h3>500+</h3>
            <p>Orders Served</p>
          </div>

          <div className="stat">
            <ChefHat size={28}/>
            <h3>120+</h3>
            <p>Dishes Available</p>
          </div>

          <div className="stat">
            <Clock size={28}/>
            <h3>30+</h3>
            <p>Expert Chefs</p>
          </div>

          <div className="stat">
            <Star size={28}/>
            <h3>4.9</h3>
            <p>Customer Rating</p>
          </div>

        </section>


        {/* FOOTER */}

        <footer className="home-footer">

          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Help</a>
          </div>

          <p>© 2025 <span>Eatrova</span> — Smart Restaurant System</p>

        </footer>

      </div>
    </>
  );
}