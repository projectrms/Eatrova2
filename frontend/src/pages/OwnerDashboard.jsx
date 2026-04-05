// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useRestaurant } from "../context/RestaurantContext";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { fetchJSON } from "../api/api";
import "../styles/OwnerDashboard.css";
import ActivityFeed from "../components/ActivityFeed";
import OrderFilters from "../components/OrderFilters";
import OwnerNavbar from "../components/OwnerNavbar";
import { useNavigate } from "react-router-dom";
import CustomerPurchaseChart from "../components/CustomerPurchaseChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";


import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";

import axios from "axios";

/**
 * OwnerDashboard
 * - Keeps original features and layout
 * - Improves socket lifecycle, fetch error handling, and defensive checks
 */

// NOTE: socket URL kept as local; if you deploy, change to env variable.
const API = import.meta.env.VITE_SOCKET_URL; // automatically picks local or deployed URL

export default function OwnerDashboard() {
  const { orders: ctxOrders, menuItems: ctxMenu } = useRestaurant();

  // Live/local copies used by owner
  const [liveOrders, setLiveOrders] = useState([]);
  const [liveMenu, setLiveMenu] = useState([]);
  const [staff, setStaff] = useState([]);
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [togglingMenuId, setTogglingMenuId] = useState(null);

  // analytics / misc state
  const [dailyReport, setDailyReport] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [topCustomer, setTopCustomer] = useState(null);
  const [topCategory, setTopCategory] = useState(null);
  const [topTable, setTopTable] = useState(null);
  const [peakHour, setPeakHour] = useState(null);
  const [profit, setProfit] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState({});
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [staffPerf, setStaffPerf] = useState([]);
  const [tableStatus, setTableStatus] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  // Filters state
  const [statusFilter, setStatusFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [orderIdSearch, setOrderIdSearch] = useState("");

  // Inventory
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState(null);


  const [mostFrequent, setMostFrequent] = useState(null);
  const [highestPaying, setHighestPaying] = useState(null);
  const [customersToday, setCustomersToday] = useState([]);
  const [unpaidCustomers, setUnpaidCustomers] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  // --------------------------
// Order Delay Detection
// --------------------------
const [summary, setSummary] = useState({
  totalRevenue: 62.95,
  totalOrders: 1,
  avgOrderValue: 62.95,
  activeStaff: 4,
  totalStaff: 5,
});

const [weeklyRevenue, setWeeklyRevenue] = useState([]);
const [range, setRange] = useState("week"); // day / week / month
const [showGross, setShowGross] = useState(false); // toggle: net vs gross

const fetchRevenue = async (selectedRange = "week") => {
  setRange(selectedRange);
  try {
    const res = await fetch(
      `${API}/owner/analytics/revenue?range=${selectedRange}`
    );
    const data = await res.json();

    // Ensure each item has label/net/gross
    setWeeklyRevenue(
      data.map(d => ({
        label: d.day || d.label,
        net: d.net,
        gross: d.gross
      }))
    );
  } catch (err) {
    console.error("Revenue fetch error:", err);
    setWeeklyRevenue([]);
  }
};

useEffect(() => {
  fetchRevenue(range);
}, []);

const [categoryRevenue, setCategoryRevenue] = useState([
    { name: "Starters", value: 2800 },
    { name: "Main Course", value: 5000 },
    { name: "Desserts", value: 1500 },
  ]);
  const COLORS = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"];
  // --------------------------
  // Notification System
  // --------------------------
 const [notifications, setNotifications] = useState([]);
const [delayedOrders, setDelayedOrders] = useState([]);

function pushNotification(text, type = "info") {
  const id = Date.now();
  setNotifications(prev => [...prev, { id, text, type }]);

  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, 5000);
}

function detectDelayedOrders(orderList) {
  if (!Array.isArray(orderList)) return;

  const now = Date.now();
  const TEN_MIN = 10 * 60 * 1000;

  const delayed = orderList.filter(o => {
    const updated = o.updated_at ?? o.created_at;
    if (!updated) return false;

    const diff = now - new Date(updated).getTime();
    return diff > TEN_MIN && o.status !== "completed" && o.status !== "cancelled";
  });

  // Notify only NEW delayed orders
  delayed.forEach(o => {
    if (!delayedOrders.some(d => d.id === o.id)) {
      pushNotification(`⚠ Order #${o.id} delayed (10+ mins)`, "warning");
    }
  });

  setDelayedOrders(delayed);
}

  const fetchPurchaseHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJSON("/owner/purchase-history");
        setPurchaseHistory(data.history || []);
      } catch (err) {
        console.error("History fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchPurchaseHistory();
    }, []);


  const loadCustomerAnalytics = async () => {
      try {
        const f = await fetch(`${API}/analytics/customer/frequent`);
        const h = await fetch(`${API}/analytics/customer/highest`);
        const t = await fetch(`${API}/analytics/customer/today`);
        const u = await fetch(`${API}/analytics/customer/unpaid`);
        const ph = await fetch(`${API}/analytics/customer/history`);

        const frequent = await f.json();
        const highest = await h.json();
        const today = await t.json();
        const unpaid = await u.json();
        const history = await ph.json();

        setMostFrequent(frequent.data || []);
        setHighestPaying(highest.data || []);
        setCustomersToday(today.data || []);
        setUnpaidCustomers(unpaid.data || []);
        setCustomerHistory(history.history || []);  // history uses key: history

      } catch (err) {
        console.error("Customer analytics failed:", err);
      }
    };


  useEffect(() => {
    loadAnalytics();
    loadCustomerAnalytics(); 
  }, []);


    useEffect(() => {
      fetch("http://127.0.0.1:5000/analytics/customer/full")
        .then((res) => res.json())
        .then((data) => {
          setCustomerHistory(data.purchase_history);
        });
    }, []);

    
  const loadExpenses = async () => {
    const res = await fetch("http://127.0.0.1:5000/expenses");
    const data = await res.json();
    if (data.success) setExpenses(data.expenses);
  };

  const loadExpenseSummary = async () => {
    const res = await fetch("http://127.0.0.1:5000/expenses/summary");
    const data = await res.json();
    if (data.success) setSummary(data);
  };

  useEffect(() => {
    loadExpenses();
    loadExpenseSummary();
  }, []);

  const addExpense = async () => {
    await fetch("http://127.0.0.1:5000/expenses/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense)
    });

    setNewExpense(null);
    loadExpenses();
    loadExpenseSummary();
  };

  const deleteExpense = async (id) => {
    await fetch(`http://127.0.0.1:5000/expenses/delete/${id}`, {
      method: "DELETE"
    });

    loadExpenses();
    loadExpenseSummary();
  };

  const openEditModal = (item) => {
    setEditItem(item ? { ...item } : null);
  };

  // small utility toast
  const toast = (title, icon = "info") =>
    Swal.fire({ toast: true, position: "top-end", icon, title, timer: 1400, showConfirmButton: false });

  // ---------- safe fetch helper ----------
  // mode:'cors' is added to be explicit, but you must enable CORS in backend (Flask).
  const safeFetchJson = async (url, opts = {}) => {
    try {
      const res = await fetch(url, { mode: "cors", ...opts });
      if (!res.ok) {
        // attempt to parse body for error details
        let errBody = null;
        try { errBody = await res.json(); } catch(e) {}
        const msg = (errBody && errBody.error) ? errBody.error : `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }
      // some endpoints return empty body => handle gracefully
      try {
        return await res.json();
      } catch (e) {
        return null;
      }
    } catch (err) {
      console.error("Fetch error:", url, err);
      throw err;
    }
  };

  // ---------- Inventory handlers ----------
  const loadInventory = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/inventory");
      setInventory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("loadInventory:", e);
      // don't crash UI; show empty
      setInventory([]);
    }
  };

  const loadLowStock = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/inventory/low");
      setLowStock(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("loadLowStock:", e);
      setLowStock([]);
    }
  };

  useEffect(() => {
    loadInventory();
    loadLowStock();
  }, []);

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await safeFetchJson(`http://127.0.0.1:5000/inventory/${id}`, { method: "DELETE" });
      await Promise.all([loadInventory(), loadLowStock()]);
      toast("Item deleted", "success");
    } catch (e) {
      Swal.fire("Error", e.message || "Failed to delete", "error");
    }
  };

  const openAddModal = () => {
    setNewItem({
      item_name: "",
      sku: "",
      quantity: 0,
      unit: "pcs",
      low_threshold: 5,
      note: ""
    });
  };

  const addItem = async () => {
    try {
      await safeFetchJson("http://127.0.0.1:5000/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem || {})
      });
      setNewItem(null);
      await Promise.all([loadInventory(), loadLowStock()]);
      toast("Inventory item added", "success");
    } catch (e) {
      Swal.fire("Error", e.message || "Failed to add", "error");
    }
  };

  const updateItem = async () => {
    if (!editItem || !editItem.id) return;
    try {
      await safeFetchJson(`http://127.0.0.1:5000/inventory/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: editItem.quantity, note: editItem.note })
      });
      setEditItem(null);
      await Promise.all([loadInventory(), loadLowStock()]);
      toast("Inventory updated", "success");
    } catch (e) {
      Swal.fire("Error", e.message || "Failed to update", "error");
    }
  };

  // ---------- Staff / tables / workload / attendance ----------
  const [staffData, setStaffData] = useState({
    managers: 0,
    chefs: 0,
    waiters: 0,
    owners: 0,
    active: 0,
    inactive: 0
  });

  const [tables, setTables] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [workload, setWorkload] = useState({ chef_workload: 0, waiter_workload: 0 });
  const [attendance, setAttendance] = useState({
    chefs: { present: 0, absent: 0 },
    waiters: { present: 0, absent: 0 },
    managers: { present: 0, absent: 0 }
  });

  const loadTables = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/analytics/tables");
      setTables(Array.isArray(data) ? data : []);
    } catch (e) {
      setTables([]);
    }
  };

  const loadWeekly = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/analytics/weekly");
      setWeekly(Array.isArray(data) ? data : []);
    } catch (e) {
      setWeekly([]);
    }
  };

  const loadWorkload = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/analytics/workload");
      setWorkload(data || { chef_workload: 0, waiter_workload: 0 });
    } catch (e) {
      setWorkload({ chef_workload: 0, waiter_workload: 0 });
    }
  };

  const loadAttendance = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/analytics/staff_attendance");
      setAttendance(data || attendance);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStaffAnalytics = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/analytics/staff");
      setStaffData(data || staffData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTables();
    loadWeekly();
    loadWorkload();
    loadAttendance();
    loadStaffAnalytics();
  }, []);

  useEffect(() => {
  fetch("http://127.0.0.1:5000/owner/analytics/summary")
    .then(res => res.json())
    .then(setSummary);

  fetch("http://127.0.0.1:5000/owner/analytics/weekly-revenue")
    .then(res => res.json())
    .then(setWeeklyRevenue);

  fetch("http://127.0.0.1:5000/owner/analytics/category-revenue")
    .then(res => res.json())
    .then(setCategoryRevenue);
}, []);

  // ---------- Filters ----------
  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (tableFilter) params.append("table", tableFilter);
      if (customerFilter) params.append("customer", customerFilter);
      if (dateFilter) params.append("date", dateFilter);
      if (orderIdSearch) params.append("order_id", orderIdSearch);
      const data = await safeFetchJson(`http://127.0.0.1:5000/orders/filter?${params.toString()}`);
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      Swal.fire("Error", e.message || "Filter failed", "error");
    }
  };

  // fetch all manager orders
  const fetchAllOrders = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/manager/orders");
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("All orders load error", e);
    }
  };

  useEffect(() => {
    if (showAllOrders) fetchAllOrders();
  }, [showAllOrders]);

  // ---------- Combined owner data fetch ----------
  const fetchAllOwnerData = async () => {
    try {
      const [
        salesRes,
        invRes,
        perfRes,
        tableRes,
        allOrdersRes
      ] = await Promise.allSettled([
        safeFetchJson("http://127.0.0.1:5000/owner/sales?range=daily"),
        safeFetchJson("http://127.0.0.1:5000/owner/inventory"),
        safeFetchJson("http://127.0.0.1:5000/owner/staff/performance"),
        safeFetchJson("http://127.0.0.1:5000/owner/table-status"),
        safeFetchJson("http://127.0.0.1:5000/owner/orders/all")
      ]);

      if (salesRes.status === "fulfilled")
        setDailyReport(Array.isArray(salesRes.value) ? salesRes.value : []);

      if (invRes.status === "fulfilled")
        setInventory(Array.isArray(invRes.value) ? invRes.value : []);

      if (perfRes.status === "fulfilled")
        setStaffPerf(perfRes.value || []);

      if (tableRes.status === "fulfilled")
        setTableStatus(tableRes.value || []);

      // Normalize ALL ORDERS from backend
      if (allOrdersRes.status === "fulfilled") {
        const normalizedAll = (allOrdersRes.value || []).map(o => ({
          id: o.id,
          customerName: o.customerName ?? o.customer_name ?? o.customer ?? "Guest",
          table_no: o.table_no ?? o.tableNumber ?? o.tableNo ?? "-",
          totalAmount: Number(o.totalAmount ?? o.total ?? o.amount ?? 0),
          status: o.status ?? "pending",
          paid: Number(o.paid) === 1 ? 1 : 0,
          items: Array.isArray(o.items)
            ? o.items
            : Array.isArray(o.order_items)
            ? o.order_items
            : []
        }));

        setAllOrders(normalizedAll);
      }

      // Other small fetches
      fetchMenu();
      fetchOrders(); 
      fetchStaff();
      fetchDailyReport();
      fetchMonthlyReport();
      fetchTopCustomer();
      fetchTopCategory();
      fetchTopTable();
      fetchPeakHour();
      fetchProfit();
      loadLowStock();
    } catch (e) {
      console.error("fetchAllOwnerData:", e);
    }
  };


  useEffect(() => {
    fetchAllOwnerData();
    // eslint-disable-next-line
  }, []);

  // ----------------------------------------
  // Auto Detect Delayed Orders (10+ mins)
  // ----------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!Array.isArray(liveOrders)) return;

      const now = Date.now();

      liveOrders.forEach(order => {
        const updatedAt = new Date(order.updated_at || order.created_at).getTime();
        const diffMinutes = (now - updatedAt) / 60000;

        if (diffMinutes >= 10 && order.status !== "completed" && order.status !== "ready") {
          pushNotification(
            `⚠ Order #${order.id} delayed (${Math.round(diffMinutes)} mins)`,
            "warning"
          );
        }
      });
    }, 30000); // check every 30s

  return () => clearInterval(interval);
}, [liveOrders]);

  // hydrate from context changes
  useEffect(() => {
  if (Array.isArray(ctxOrders)) {
    const normalized = ctxOrders.map(o => ({
      id: o.id,
      customerName: o.customerName ?? o.customer_name ?? o.customer ?? "Guest",
      table_no: o.table_no ?? o.tableNumber ?? o.tableNo ?? "-",
      totalAmount: Number(o.totalAmount ?? o.total ?? o.amount ?? 0),
      status: o.status ?? "pending",
      paid: Number(o.paid) === 1 ? 1 : 0,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: Array.isArray(o.items)
        ? o.items
        : Array.isArray(o.order_items)
        ? o.order_items
        : []
    }));

    setLiveOrders(normalized);
    detectDelayedOrders(normalized); // ✅ safe and correct
  }

  setLiveMenu(Array.isArray(ctxMenu) ? ctxMenu : []);
}, [ctxOrders, ctxMenu]);


useEffect(() => {
  console.log("DELAYED ---> ", delayedOrders);
}, [delayedOrders]);


  // ---------- Socket: connect on mount and cleanup ----------
  const socketRef = useRef(null);
  useEffect(() => {
    try {
      socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });
      const socket = socketRef.current;

      socket.on("connect", () => console.log("owner socket connected:", socket.id));
      socket.on("order_created", () => {
        toast("New order received");
        fetchAllOwnerData();
      });
      socket.on("order_updated", () => fetchAllOwnerData());
      socket.on("order_cancelled", () => {
        toast("Order cancelled", "warning");
        fetchAllOwnerData();
      });
      socket.on("menu_changed", () => {
        toast("Menu updated", "success");
        fetchMenu();
      });
      socket.on("menu_deleted", () => fetchMenu());
      socket.on("staff_changed", () => fetchStaff());
      socket.on("restaurant_status", (d) => setRestaurantOpen(Boolean(d.open)));

      return () => {
        if (socketRef.current) {
          socketRef.current.off();
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } catch (err) {
      console.error("Socket init error:", err);
    }
    // only run on mount/unmount
    // eslint-disable-next-line
  }, []);

  // ---------- small helpers + fetchers ----------
  const fetchMenu = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/manager/menu");
      setLiveMenu(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchMenu", e);
    }
  };

  const toggleMenuItem = async (itemId) => {
    if (!itemId) return;
    setTogglingMenuId(itemId);
    try {
      const res = await fetch(`http://127.0.0.1:5000/owner/menu/${itemId}/toggle`, {
        method: "PATCH",
        mode: "cors"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Swal.fire("Error", data.error || "Toggle failed", "error");
        return;
      }
      setLiveMenu((prev) =>
        prev.map((m) =>
          m.id === itemId ? { ...m, available: typeof data.available === "boolean" ? data.available : !m.available } : m
        )
      );

      const nowAvailable = (typeof data.available === "boolean") ? data.available : (liveMenu.find(i => i.id === itemId)?.available ? false : true);
      toast(nowAvailable ? "Item is now available" : "Item is now unavailable", "success");
    } catch (err) {
      console.error("toggleMenuItem error:", err);
      Swal.fire("Error", "Server error", "error");
    } finally {
      setTogglingMenuId(null);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      return await safeFetchJson(`http://127.0.0.1:5000/owner/order-items/${orderId}`) || [];
    } catch (e) {
      return [];
    }
  };

  const loadLiveOrders = async () => {
    try {
      const rawOrders = await safeFetchJson("http://127.0.0.1:5000/owner/live-orders");
      if (!Array.isArray(rawOrders)) {
        setLiveOrders([]);
        return;
      }
      const ordersWithItems = await Promise.all(
        rawOrders.map(async (o) => ({ ...o, items: await fetchOrderItems(o.id) }))
      );
      setLiveOrders(ordersWithItems);
    } catch (e) {
      console.error("loadLiveOrders", e);
      setLiveOrders([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/manager/orders");
      if (!Array.isArray(data)) return;
      const normalized = data.map((o) => ({
        id: o.id,
        customerName: o.customerName || o.customer_name || o.customer || "Guest",
        tableNumber: o.tableNumber ?? o.table_no ?? "-",
        totalAmount: Number(o.totalAmount ?? o.total ?? 0),
        status: o.status || "pending",
        
        // ⭐ FIX 1 — preserve paid status
        paid: Number(o.paid) === 1 ? 1 : 0,

        items: Array.isArray(o.items)
          ? o.items
          : (Array.isArray(o.order_items) ? o.order_items : [])
    }));
      setLiveOrders(normalized);
    } catch (e) {
      console.error("fetchOrders", e);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/owner/staff");
      const normalized = (Array.isArray(data) ? data : []).map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role || "manager",
        active: s.active === 1 || s.active === true || s.active === "1"
      }));
      setStaff(normalized);
    } catch (e) {
      console.error("fetchStaff", e);
      setStaff([]);
    }
  };

  const fetchRestaurantStatus = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/restaurant/status");
      setRestaurantOpen(Boolean(j?.open));
    } catch (e) {
      // ignore
    }
  };

  // smaller report fetchers
  const fetchDailyReport = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/report/daily");
      setDailyReport(Array.isArray(j) ? j.map(r => ({ day: r.day, total: Number(r.total || 0) })) : []);
    } catch (e) {}
  };
  const fetchMonthlyReport = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/report/monthly");
      setMonthlyReport(Array.isArray(j) ? j : []);
    } catch (e) {}
  };
  const fetchTopCustomer = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/top-customer");
      setTopCustomer(j || { name: "N/A", spent: 0 });
    } catch (e) {}
  };
  const fetchTopCategory = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/top-category");
      setTopCategory(j || { category: "N/A", revenue: 0 });
    } catch (e) {}
  };
  const fetchTopTable = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/top-table");
      setTopTable(j || { table: "N/A", orders: 0 });
    } catch (e) {}
  };
  const fetchPeakHour = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/peak-hour");
      setPeakHour(j || { hour: "N/A", orders: 0 });
    } catch (e) {}
  };
  const fetchProfit = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/profit");
      setProfit(j || { revenue: 0, profit: 0 });
    } catch (e) {}
  };

  // owner actions
  const toggleRestaurant = async () => {
    try {
      const j = await safeFetchJson("http://127.0.0.1:5000/owner/restaurant/toggle", { method: "PATCH" });
      setRestaurantOpen(Boolean(j.open));
      toast(j.open ? "Restaurant opened" : "Restaurant closed", "success");
    } catch (e) {
      Swal.fire("Error", "Could not toggle restaurant", "error");
    }
  };

  const toggleStaff = async (role, id) => {
    try {
      const d = await safeFetchJson(`http://127.0.0.1:5000/owner/staff/${role}/${id}/toggle`, { method: "PATCH" });
      toast("Staff updated", "success");
      fetchStaff();
    } catch (e) {
      Swal.fire("Error", e.message || "Server error", "error");
    }
  };

  const [staffForm, setStaffForm] = useState({
    role: "",
    name: "",
    email: "",
    password: ""
  });

  const createStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.role) {
      Swal.fire("Validation", "Please select a role", "warning");
      return;
    }
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      Swal.fire("Validation", "Please fill all fields", "warning");
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:5000/owner/staff/${staffForm.role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staffForm.name,
          email: staffForm.email,
          password: staffForm.password
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        Swal.fire("Error", body.error || "Failed to create");
        return;
      }
      Swal.fire("Created", `${staffForm.role.slice(0, -1)} created`, "success");
      setStaffForm({ role: "", name: "", email: "", password: "" });
      fetchStaff();
    } catch (e) {
      Swal.fire("Error", "Server error", "error");
    }
  };

  const ownerDeleteItem = async (id) => {
    const c = await Swal.fire({ title: "Delete item permanently?", icon: "warning", showCancelButton: true });
    if (!c.isConfirmed) return;
    try {
      await safeFetchJson(`http://127.0.0.1:5000/owner/menu/${id}`, { method: "DELETE" });
      toast("Item deleted", "success");
      setLiveMenu((prev) => prev.filter(i => i.id !== id));
    } catch (e) {
      Swal.fire("Error", e.message || "Failed to delete", "error");
    }
  };

  const ownerBlockOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
      title: "Block order (owner)",
      input: "text",
      inputLabel: "Reason (optional)",
      showCancelButton: true
    });
    if (reason === undefined) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/owner/order/${orderId}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Blocked by owner" })
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        Swal.fire("Error", d.error || "Failed to block");
        return;
      }
      toast("Order blocked", "success");
      fetchOrders();
    } catch (e) {
      Swal.fire("Error", "Server error", "error");
    }
  };

  // export CSV / print
  const exportDailyCSV = () => {
    if (!dailyReport || !dailyReport.length) {
      Swal.fire("No Data", "No daily report available", "info");
      return;
    }
    const rows = [["Day", "Total"]];
    dailyReport.forEach(r => rows.push([r.day, r.total]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  // derived data
  const totalOrders = liveOrders.length;
  const totalRevenue = liveOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const avgOrder = totalOrders ? (totalRevenue / totalOrders) : 0;

  const getTopItems = () => {
    const tally = {};
    (liveOrders || []).forEach(o => {
      (o.items || []).forEach(it => {
        const name = it.name || it.item_name || "Unknown";
        tally[name] = (tally[name] || 0) + (Number(it.quantity) || 0);
      });
    });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  // analytics short card (today)
  const [analytics, setAnalytics] = useState({
    today_revenue: 0,
    today_orders: 0,
    pending_orders: 0,
    cancelled_orders: 0
  });

  const loadAnalytics = async () => {
    try {
      const data = await safeFetchJson("http://127.0.0.1:5000/analytics/orders/today");

      console.log("TODAY ANALYTICS:", data); // <-- ADD THIS

      setAnalytics(data || {
        today_revenue: 0,
        today_orders: 0,
        pending_orders: 0,
        cancelled_orders: 0
      });

    } catch (e) {
      console.error("loadAnalytics", e);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      detectDelayedOrders(liveOrders);
    }, 30000);

    return () => clearInterval(interval);
  }, [liveOrders]);

//   const fetchRevenue = async (range) => {

//   const res = await fetch(
//     `http://localhost:5000/owner/analytics/revenue?range=${range}`
//   )

//   const data = await res.json()

//   setWeeklyRevenue(data)
// }
  const [chartRange, setChartRange] = useState("week");
  // -------------------------
  // Render
  // -------------------------
  const toggleBtnStyle = (active) => ({
  background: active ? "#065f46" : "#1e293b",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
});
  return (
    <>
      <OwnerNavbar
        restaurantOpen={restaurantOpen}
        toggleRestaurant={toggleRestaurant}
        exportDailyCSV={exportDailyCSV}
        printReport={printReport}
      />

      <div className="owner-dashboard">
        <header className="owner-header">
          <div>
            <h1>👑 Owner Dashboard</h1>
            <p className="muted">Full control & analytics</p>
          </div>
        </header>

        <section className="top-cards">

  <div className="card wide revenue" onClick={() => navigate("/owner/report")}>
    <div className="card-left"></div>
    <div className="card-content">
      <span>Total Revenue</span>
      <h2>₹ {totalRevenue.toFixed(2)}</h2>
      <p>Today: ₹ {Number(analytics?.today_revenue ?? 0).toFixed(2)}</p>
    </div>
  </div>

  <div className="card wide orders" onClick={() => navigate("/owner/orders")}>
    <div className="card-left"></div>
    <div className="card-content">
      <span>Total Orders</span>
      <h2>{totalOrders}</h2>
      <p>{analytics?.today_orders ?? 0} today</p>
    </div>
  </div>

  <div className="card wide customers" onClick={() => navigate("/owner/customers")}>
    <div className="card-left"></div>
    <div className="card-content">
      <span>Avg Order Value</span>
      <h2>₹ {avgOrder.toFixed(2)}</h2>
      <p>Customer insights</p>
    </div>
  </div>

  <div className="card wide menu" onClick={() => navigate("/owner/menu")}>
    <div className="card-left"></div>
    <div className="card-content">
      <span>Menu Items</span>
      <h2>{liveMenu.length}</h2>
      <p>Top: {topCategory?.category || "N/A"}</p>
    </div>
  </div>

</section>

 <div className="charts-grid">
  <div className="chart-card revenue-chart">
  <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h3 style={{ color: "#fff" ,fontSize:"20px"}}>Revenue Analytics</h3>

    <div className="chart-toggle" style={{ display: "flex", gap: "8px" }}>
      <button style={toggleBtnStyle(range === "day")} onClick={() => fetchRevenue("day")}>Day</button>
      <button style={toggleBtnStyle(range === "week")} onClick={() => fetchRevenue("week")}>Week</button>
      <button style={toggleBtnStyle(range === "month")} onClick={() => fetchRevenue("month")}>Month</button>
      <button style={toggleBtnStyle(showGross)} onClick={() => setShowGross(!showGross)}>
        {showGross ? "Gross" : "Net"}
      </button>
    </div>
  </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={weeklyRevenue} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          cursor={false}
          formatter={(value) => `₹${Number(value || 0).toFixed(2)}`}
          contentStyle={{
            background: "#0f172a",
            border: "1px solid #334155",
            color: "#fff"
          }}
        />
        <Bar
          dataKey={showGross ? "gross" : "net"}
          radius={[8, 8, 0, 0]}
          fill="url(#colorRevenue)"
        />
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#065f46" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <Legend
          verticalAlign="top"
          wrapperStyle={{ color: "#ffffff" ,transform: "translateY(-30px)" ,paddingBottom:"10px"}}
          formatter={(value) => (value === "net" ? "Net Revenue" : "Gross Revenue")}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div className="chart-card" style={{ background: "#0f172a", borderRadius: "12px", padding: "20px" }}>
      <h3 style={{ color: "#fff", marginBottom: "10px",fontSize:"18px" }}>Category Revenue Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart style={{ background: "#0f172a" }}>
          <Pie
            data={categoryRevenue}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {categoryRevenue.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value, name) => [`₹${value}`, name]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155"
            }}
            itemStyle={{ color: "#ffffff" }}   // <-- change value text color
            labelStyle={{ color: "#ffffff" }}  // <-- change label text color
          />

          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ color: "#fff", backgroundColor: "transparent" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
</div> 

        {/* MAIN: Daily revenue + Top items (same row) */}
        <section className="grid bottom-grid">

          <div className="card">
            <h3>Top Items</h3>
            <div className="list">
              {getTopItems().map(([name, qty], idx) => (
                <div key={idx} className="list-row">
                  <div className="list-left">{idx + 1}. {name}</div>
                  <div className="list-right">{qty}</div>
                </div>
              ))}
              {getTopItems().length === 0 && <p className="muted">No sales yet</p>}
            </div>
          </div>
        
          <div className="card">
            <h3>Staff Management</h3>
            <div className="list">
              {staff.length === 0 && <p className="muted">No staff found</p>}
              {staff.map(s => (
                <div key={s.role + "_" + s.id} className="list-row">
                  <div className="list-left">
                    <b>{s.name}</b>
                    <small className={s.active ? "muted" : "blocked-tag"}>({s.role}) {s.active ? "" : " — BLOCKED"}</small><br />
                    <small className="muted">{s.email}</small>
                  </div>
                  <div className="list-right">
                    <button className={`pill ${s.active ? "open" : "closed"}`} onClick={() => toggleStaff(s.role + "s", s.id)}>
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form className="create-manager create-staff-box" onSubmit={createStaff}>
              <h4>Create Staff</h4>
              <div className="input-group">
                <label>Role</label>
                <select value={staffForm.role || ""} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value, name: "", email: "", password: "" })}>
                  <option value="">Select Role</option>
                  <option value="managers">Manager</option>
                  <option value="chefs">Chef</option>
                  <option value="waiters">Waiter</option>
                </select>
              </div>

              {staffForm.role && (
                <>
                  <div className="input-group">
                    <label>Name</label>
                    <input value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} placeholder="Full name" />
                  </div>

                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} placeholder="Email" />
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <input type="password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} placeholder="Password" />
                  </div>

                  <button className="pill primary btn-submit" type="submit">Create Staff</button>
                </>
              )}
            </form>
          </div>
          
        </section>
          
          {/* -------------------- DELAYED ORDERS FEED -------------------- 
            <div className="card" style={{ marginTop: "20px" }}>
              <h3 className="section-title">⚠ Delayed Orders (10+ mins)</h3>

              {delayedOrders.length === 0 ? (
                <p className="muted">No delayed orders</p>
              ) : (
                delayedOrders.map(order => (
                  <div key={order.id} className="delayed-feed-row">
                    <b>Order #{order.id}</b>
                    <span>• Table {order.table_no ?? "-"}</span>
                    <span>• Status: {order.status}</span>
                  </div>
                ))
              )}
            </div>*/}

        {/* ---------- Recent Orders (fixed) ---------- */}
          {/* <div className="recent-orders-container">
            <div className="card">
             
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="section-title">Recent Orders</h3>
                <button className="pill" onClick={() => setShowAllOrders((s) => !s)}>
                  {showAllOrders ? "Show Recent" : "View All"}
                </button>
              </div>

         
              <div className="orders-list">
                {(() => {
                  const ordersToShow = Array.isArray(liveOrders)
                    ? showAllOrders
                      ? liveOrders
                      : liveOrders.slice(0, 12)
                    : [];

                  if (ordersToShow.length === 0) return <p className="muted">No recent orders</p>;

                  return ordersToShow.map((o) => {
                    // defensive normalization (each order may have slight shape differences)
                    const items = Array.isArray(o.items)
                      ? o.items
                      : Array.isArray(o.order_items)
                      ? o.order_items
                      : [];

                    const tableNo = o.table_no ?? o.tableNumber ?? o.tableNo ?? "-";
                    const customerName = o.customerName ?? o.customer_name ?? o.customer ?? "Guest";
                    const total = Number(o.total ?? o.totalAmount ?? o.total_price ?? o.amount ?? 0).toFixed(2);
                    const isPaid = Number(o.paid) === 1; // normalize here (works for "1", 1, true)

                    return (
                     <div
                      key={o.id}
                      className={`order-row ${delayedOrders.some(d => d.id === o.id) ? "delayed-order" : ""}`}
                      style={{ flexDirection: "column", gap: 8 }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                          
                          <div
                            className="order-left"
                            onClick={() => setExpandedOrder((prev) => ({ ...prev, [o.id]: !prev?.[o.id] }))}
                            style={{ cursor: "pointer", flex: 1 }}
                          >
                            <b>#{o.id}</b>
                            <small className="muted"> • {customerName}</small>
                            <br />
                            <small className="muted">
                              Table {tableNo} •{" "}
                              {items.length > 0
                                ? `${items[0].item_name ?? items[0].name ?? "Item"} × ${items[0].quantity ?? items[0].qty ?? 1}`
                                : "No items"}
                              {items.length > 1 && <span> + {items.length - 1} more</span>}
                            </small>
                          </div>

       
                          <div className="order-right" style={{ marginLeft: 12, textAlign: "right", minWidth: 130 }}>
                            <div>₹ {total}</div>

                            <div style={{ marginTop: 8 }}>
                             
                              <span className={`status ${o.status ?? "pending"}`}>
                                {o.status ?? "pending"}
                              </span>

                      
                              <div style={{ marginTop: 8 }}>
                                <span style={{ marginLeft: 6, fontSize: "16px", color: isPaid ? "green" : "orangered" }}>
                                  {isPaid ? "paid" : "unpaid"}
                                </span>
                              </div>
                            </div>

                            <div style={{ marginTop: 10 }}>
                              {o.status !== "cancelled" ? (
                                <button className="pill delete" onClick={() => ownerBlockOrder(o.id)}>
                                  Block
                                </button>
                              ) : (
                                <div className="muted small" style={{ marginTop: 8 }}>
                                  {o.cancelReason ?? o.cancel_reason ?? "No reason"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      
                        {expandedOrder[o.id] && (
                          <div className="order-items-expand" style={{ width: "100%", padding: "8px 12px", marginTop: 6 }}>
                            {items.length === 0 ? (
                              <p className="muted">No items</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {items.map((it, idx) => {
                                  const name = it.item_name ?? it.name ?? "Item";
                                  const qty = it.quantity ?? it.qty ?? 1;
                                  const price = Number(it.price ?? it.unit_price ?? it.rate ?? 0).toFixed(2);
                                  return (
                                    <div key={it.menu_id ?? it.id ?? idx} className="order-item-line" style={{ display: "flex", justifyContent: "space-between" }}>
                                      <div style={{ flex: 1 }}>{name}</div>
                                      <div style={{ width: 80, textAlign: "center" }}>× {qty}</div>
                                      <div style={{ width: 100, textAlign: "right" }}>₹ {price}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

     
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="muted small">{(Array.isArray(liveOrders) ? liveOrders.length : 0)} total orders</div>
              </div>
            </div>
          </div> */}
          {/* ---------- End Recent Orders ---------- */}
      </div>
    </>
  );
}
const MetricCard = ({ title, value, subtitle, icon, color }) => (
  <div className={`metric-card ${color}`}>
    <div className="metric-header">
      <span>{title}</span>
      <div className="metric-icon">{icon}</div>
    </div>
    <h2>{value}</h2>
    <span className="metric-subtitle">{subtitle}</span>
  </div>
);
