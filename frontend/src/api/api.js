// src/api/api.js
import axios from "axios";

// Base URL for backend (local or production)
const API = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

// ----------------------
// Axios helpers
// ----------------------
export const apiGet = async (endpoint) => {
  const response = await axios.get(`${API}${endpoint}`);
  return response.data;
};

export const apiPost = async (endpoint, data) => {
  const response = await axios.post(`${API}${endpoint}`, data);
  return response.data;
};

export const apiDelete = async (endpoint) => {
  const response = await axios.delete(`${API}${endpoint}`);
  return response.data;
};

// ----------------------
// Fetch-based helpers with error handling
// ----------------------
export async function fetchJSON(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Parse JSON safely
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data?.error || "Server error"}`);
  }

  return data;
}

// ----------------------
// Auth helpers
// ----------------------
export async function registerUser(userData) {
  return fetchJSON("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(userData) {
  return fetchJSON("/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// ----------------------
// Example usage for testing
// ----------------------
// fetchJSON("/login")
//   .then(console.log)
//   .catch(console.error);