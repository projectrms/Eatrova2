// src/api/api.js
import axios from "axios";

// Base URL for Flask backend
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

// ----------------------
// Axios-based API helpers
// ----------------------

// Generic GET
export const apiGet = async (endpoint) => {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`);
    return response.data;
  } catch (err) {
    console.error("apiGet error:", err.response?.data || err.message);
    throw err;
  }
};

// Generic POST
export const apiPost = async (endpoint, data) => {
  try {
    const response = await axios.post(`${API_BASE}${endpoint}`, data);
    return response.data;
  } catch (err) {
    console.error("apiPost error:", err.response?.data || err.message);
    throw err;
  }
};

// Generic DELETE
export const apiDelete = async (endpoint) => {
  try {
    const response = await axios.delete(`${API_BASE}${endpoint}`);
    return response.data;
  } catch (err) {
    console.error("apiDelete error:", err.response?.data || err.message);
    throw err;
  }
};

// ----------------------
// Fetch-based helpers
// ----------------------

// Generic JSON fetch with error handling
export async function fetchJSON(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const data = await res.json().catch(() => null); // prevent crash on invalid JSON

    if (!res.ok) {
      const errorMessage = data?.error || res.statusText || "Unknown error";
      throw new Error(`HTTP ${res.status}: ${errorMessage}`);
    }

    return data;
  } catch (err) {
    console.error("fetchJSON error:", err);
    throw err;
  }
}

// Register user
export async function registerUser(userData) {
  return fetchJSON("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Login user
export async function loginUser(userData) {
  return fetchJSON("/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}
