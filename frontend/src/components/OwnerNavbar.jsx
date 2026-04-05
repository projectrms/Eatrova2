import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/OwnerNavbar.css";
import { API } from "../api/constants";
export default function OwnerNavbar({
  restaurantOpen,
  toggleRestaurant,
  exportDailyCSV,
  printReport
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const exportExcel = () => {
    const link = document.createElement("a");
    link.href = `${API}/owner/report/export`;
    link.setAttribute("download", "restaurant_reports.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
  window.open(`${API}/owner/export/pdf`);
};

  return (
    <nav className="owner-navbar">

      {/* LEFT SIDE */}
      <h2>👑 Owner Panel</h2>

      {/* RIGHT SIDE */}
      <div className="owner-info">

        <span>{user?.name}</span>

        {/* <button
          className={`pill ${restaurantOpen ? "open" : "closed"}`}
          onClick={toggleRestaurant}
        >
          {restaurantOpen ? "OPEN" : "CLOSED"}
        </button>

        <button className="pill export" onClick={exportDailyCSV}>
          Export CSV
        </button> */}


          {/* <button
 className="pill export"
 onClick={()=>window.open("/owner/report")}
>
Generate Report
</button> */}
          <button className="pill export" onClick={exportPDF}>
Export PDF
</button> 
        <button className="pill export" onClick={exportExcel}>
        Report
        </button>

        <button className="pill logout" onClick={handleLogout}>
          Logout
        </button>

      </div>

    </nav>
  );
}
