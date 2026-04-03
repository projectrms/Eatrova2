import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TableView.css";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const tables = ["A", "B", "C", "D"];

export default function TableView() {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(
    localStorage.getItem("selected_table") || null
  );

  // ✅ IF TABLE ALREADY SELECTED, GO TO MENU
  useEffect(() => {
    if (selectedTable) {
      navigate("/menu");
    }
  }, [selectedTable, navigate]);

  // ✅ HANDLE TABLE CLICK
  const handleTableSelect = (table) => {
    localStorage.setItem("selected_table", table);
    setSelectedTable(table);
  };

  return (
    <>
      <Navbar />

      <div className="table-view-container">
        <h1 className="table-title">🍽️ Select Your Table</h1>

        <div className="table-grid">
          {tables.map((table) => (
            <motion.div
              key={table}
              className="table-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTableSelect(table)}
            >
              <h2>Table {table}</h2>
              <p>Click to select</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
