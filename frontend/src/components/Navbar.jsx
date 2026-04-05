import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import "../styles/Navbar.css";
import { API } from "../api/constants";
import {
  Home,
  Utensils,
  Menu,
  ShoppingCart,
  ClipboardList,
  Receipt,
  LogIn,
  LogOut,
} from "lucide-react";


export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Hide navbar completely for Chef
  const chef = JSON.parse(localStorage.getItem("chef"));
  if (chef) return ; // or return <ChefNavbar /> later

  const [unpaidCount, setUnpaidCount] = useState(0);
  const [animateBadge, setAnimateBadge] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** ───────────────────────────────
   * 🔄 Fetch Unpaid Bills
   * ───────────────────────────────
   */
  useEffect(() => {
    if (!user) return;

    // Fetch initial unpaid count
    fetchUnpaid();

    // Listen for real-time updates
    socket.on("unpaid_update", (data) => {
        if (data.user_id === user) {
            setUnpaidCount(data.count);
        }
    });

    socket.on("order_created", (data) => {
        if (data.user_id === user) {
            setUnpaidCount((prev) => prev + 1);
        }
    });

    socket.on("order_paid", (data) => {
        if (data.user_id === user) {
            setUnpaidCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
    });

    // Cleanup
    return () => {
        socket.off("unpaid_update");
        socket.off("order_created");
        socket.off("order_paid");
    };
}, [user]);

  const fetchUnpaid = async () => {
    const tableNo = Number(localStorage.getItem("table_session"));
    if (!tableNo) return;

    try {
      const res = await fetch(
        `${API}/orders/unpaid/${tableNo}`
      );

      if (!res.ok) throw new Error("Failed to fetch unpaid");

      const data = await res.json();

      if (Array.isArray(data)) {
        setUnpaidCount(data.length);
      }
    } catch (err) {
      console.error("Error fetching unpaid bills:", err);
    }
  };

  /** ───────────────────────────────
   * 🔔 Socket Events
   * ───────────────────────────────
   */
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Initial fetch
    fetchUnpaid();

    // Subscribe user to personal room
    socket.emit("subscribe_user", { user_id: user.id });

    // Global bill update
    const handleBillUpdate = () => fetchUnpaid();

    // Real-time individual updates
    const handleUnpaidUpdate = (payload) => {
      if (payload.user_id !== user.id) return;

      const newCount = payload.unpaid_count;

      setUnpaidCount((prev) => {
        if (newCount > prev) {
          setAnimateBadge(true);
          setTimeout(() => setAnimateBadge(false), 500);
        }
        return newCount;
      });
    };

    socket.on("bill_update", handleBillUpdate);
    socket.on("unpaid_bill_update", handleUnpaidUpdate);

    return () => {
      socket.off("bill_update", handleBillUpdate);
      socket.off("unpaid_bill_update", handleUnpaidUpdate);
    };
  }, [isLoggedIn, user]);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <Utensils size={18}/> <span>Eatrova</span>
        </Link>
      </div>

      <div className="nav-right">
        <Link to="/"><Home size={18} /> <span>Home</span></Link>
        <Link to="/menu"><Menu size={18} /> <span>Menu</span></Link>
        <Link to="/cart"><ShoppingCart size={18} /> <span>Cart</span></Link>
        <Link to="/orders"><ClipboardList size={18} /> <span>Orders</span></Link>

        {isLoggedIn && (
          <Link to="/bills" className="bill-icon">
            <Receipt size={20} />
            <span className="bill-text">Bill</span>

            {unpaidCount > 0 && (
              <span className={`bill-badge ${animateBadge ? "bounce" : ""}`}>
                {unpaidCount}
              </span>
            )}
          </Link>
        )}

        {isLoggedIn ? (
          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <Link to="/login" className="login-btn">
            <LogIn size={16} /> Login
          </Link>
        )}
      </div>
    </nav>

  );
}
