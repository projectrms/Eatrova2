// src/context/BillContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const BillContext = createContext();

export function BillProvider({ children }) {
  const { isLoggedIn, user } = useAuth();
  const [pendingBills, setPendingBills] = useState([]);

  // 🔄 Fetch unpaid bills
  const fetchPendingBills = async () => {
    if (!isLoggedIn || !user) {
      setPendingBills([]);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/orders/${user.id}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const unpaid = data.filter((order) => order.paid === 0);
        setPendingBills(unpaid);
      }
    } catch (err) {
      console.error("Error fetching unpaid bills:", err);
      setPendingBills([]);
    }
  };

  // 🔁 Fetch initially and then every 10s
  useEffect(() => {
    fetchPendingBills();
    const interval = setInterval(fetchPendingBills, 10000); // every 10s
    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  return (
    <BillContext.Provider value={{ pendingBills, refreshBills: fetchPendingBills }}>
      {children}
    </BillContext.Provider>
  );
}

export function useBills() {
  return useContext(BillContext);
}
