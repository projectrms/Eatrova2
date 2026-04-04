// src/api/api.js
import axios from "axios";

// Base URL for Flask backend
// src/api/api.js
const API = "https://eatrova2.onrender.com";

// GET
export const apiGet = async (endpoint) => {
  const response = await axios.get(`${API}${endpoint}`);
  return response.data;
};

// POST
export const apiPost = async (endpoint, data) => {
  const response = await axios.post(`${API}${endpoint}`, data);
  return response.data;
};

// DELETE
export const apiDelete = async (endpoint) => {
  const response = await axios.delete(`${API}${endpoint}`);
  return response.data;
};

// ----------------------
// Fetch-based helpers
// ----------------------

// Generic JSON fetch with error handling
export async function fetchJSON(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data?.error}`);
  }

  return data;
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
