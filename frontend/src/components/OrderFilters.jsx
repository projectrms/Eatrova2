import React, { useState, useEffect } from "react";
import "../styles/OrderFilters.css";

export default function OrderFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    status: "",
    table: "",
    customer: "",
    date: "",
    orderId: ""
  });

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilterChange(updated); // send filters to parent
  }

  return (
    <div className="filters-container">
      {/* Order ID Search */}
      <input
        type="text"
        name="orderId"
        placeholder="Search Order ID"
        value={filters.orderId}
        onChange={handleChange}
        className="filter-input"
      />

      {/* Status Filter */}
      <select name="status" value={filters.status} onChange={handleChange} className="filter-select">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Table Filter */}
      <input
        type="number"
        name="table"
        placeholder="Table No"
        value={filters.table}
        onChange={handleChange}
        className="filter-input"
      />

      {/* Customer Filter */}
      <input
        type="text"
        name="customer"
        placeholder="Customer Name"
        value={filters.customer}
        onChange={handleChange}
        className="filter-input"
      />

      {/* Date Filter */}
      <select name="date" value={filters.date} onChange={handleChange} className="filter-select">
        <option value="">Any Date</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="7days">Last 7 Days</option>
      </select>
    </div>
  );
}
