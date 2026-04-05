import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

/**
 * RestaurantContext
 * Provides orders, menu, staff, tables, inventory, socket, and helper functions
 */

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children, apiBase = null, socketUrl = null }) {
  // --------------------------
  // Base URLs (API vs Socket)
  // --------------------------
  const API_BASE = apiBase || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
  const SOCKET_URL = socketUrl || import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

  // --------------------------
  // Core state
  // --------------------------
  const [ctxOrders, setCtxOrders] = useState([]);
  const [ctxMenu, setCtxMenu] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tables, setTables] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyticsCache, setAnalyticsCache] = useState({});

  // --------------------------
  // Socket
  // --------------------------
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // --------------------------
  // Helpers
  // --------------------------
  const normalizeOrder = (o = {}) => {
    const id = o.id ?? o.order_id ?? null;
    const items = Array.isArray(o.items) ? o.items : o.order_items ?? [];
    const totalAmount = Number(o.total ?? o.totalAmount ?? o.amount ?? 0);
    const paid = o.paid === true ? 1 : o.paid === false ? 0 : Number(o.paid) || 0;
    const status = (o.status ?? o.order_status ?? "pending").toString();
    return {
      id,
      user_id: o.user_id ?? o.customer_id ?? null,
      customerName: o.customerName ?? o.customer_name ?? o.customer ?? "",
      table_no: o.table_no ?? o.tableNumber ?? o.tableNo ?? null,
      totalAmount,
      paid,
      status,
      items,
      created_at: o.created_at ?? o.createdAt ?? null,
      updated_at: o.updated_at ?? o.updatedAt ?? null,
      cancelReason: o.cancelReason ?? o.cancel_reason ?? null,
      raw: o,
    };
  };

  const normalizeOrdersArray = (arr) => (Array.isArray(arr) ? arr.map(normalizeOrder) : []);
  const normalizeMenuArray = (arr) =>
    Array.isArray(arr)
      ? arr.map((m = {}) => ({
          id: m.id,
          name: m.name,
          description: m.description ?? m.desc ?? "",
          price: Number(m.price ?? m.cost ?? 0),
          image: m.image ?? m.img ?? null,
          category: m.category ?? "main",
          available: m.available === 0 ? 0 : 1,
          raw: m,
        }))
      : [];

  // --------------------------
  // API helpers
  // --------------------------
  const safeFetch = async (path, opts = {}) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...opts,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${txt}`);
      }
      return await res.json().catch(() => null);
    } catch (e) {
      console.error("safeFetch error:", e);
      return null;
    }
  };

  // --------------------------
  // Socket helpers
  // --------------------------
  const connectSocket = (url = SOCKET_URL, opts = {}) => {
    if (!url) return console.warn("No socket URL provided");
    if (socketRef.current && socketRef.current.connected) return;

    const socket = io(url, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
      ...opts,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.info("Socket connected:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.on("order:update", (payload) => {
      const normalized = Array.isArray(payload)
        ? normalizeOrdersArray(payload)
        : [normalizeOrder(payload)];
      setCtxOrders((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        normalized.forEach((n) => byId.set(n.id, n));
        return Array.from(byId.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      });
    });

    socket.on("menu:update", (payload) => setCtxMenu(normalizeMenuArray(payload)));

    socket.on("connect_error", (err) => console.error("Socket connect_error", err));
    socket.on("error", (err) => console.error("Socket error", err));
  };

  const emitSocket = (event, payload) => {
    if (!socketRef.current) return console.warn("Socket not connected");
    socketRef.current.emit(event, payload);
  };

  // --------------------------
  // Local helpers
  // --------------------------
  const pushLocalOrderUpdate = (order) => {
    const n = normalizeOrder(order);
    setCtxOrders((prev) => {
      const exists = prev.some((p) => p.id === n.id);
      if (exists) return prev.map((p) => (p.id === n.id ? { ...p, ...n } : p));
      return [n, ...prev];
    });
  };

  const removeLocalOrder = (orderId) => {
    setCtxOrders((prev) => prev.filter((p) => p.id !== orderId));
  };

  // --------------------------
  // Fetch initial data
  // --------------------------
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoading(true);
      try {
        const [ordersRes, menuRes, staffRes, tablesRes] = await Promise.all([
          safeFetch("/owner/orders/all"),
          safeFetch("/menu"),
          safeFetch("/owner/staff"),
          safeFetch("/owner/table-status"),
        ]);

        if (!mounted) return;

        setCtxOrders(normalizeOrdersArray(ordersRes?.orders ?? ordersRes ?? []));
        setCtxMenu(normalizeMenuArray(menuRes ?? []));
        setStaff(staffRes ?? []);
        setTables(tablesRes ?? []);
      } catch (e) {
        console.error("bootstrap error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  // --------------------------
  // Connect socket on mount
  // --------------------------
  useEffect(() => {
    if (!SOCKET_URL) return;
    connectSocket(SOCKET_URL);

    return () => {
      try {
        socketRef.current?.off();
        socketRef.current?.disconnect();
      } catch {}
    };
  }, [SOCKET_URL]);

  // --------------------------
  // Refresh helper
  // --------------------------
  const refreshFromApi = async () => {
    setLoading(true);
    try {
      const [ordersRes, menuRes, staffRes, tablesRes] = await Promise.all([
        safeFetch("/owner/orders/all"),
        safeFetch("/menu"),
        safeFetch("/owner/staff"),
        safeFetch("/owner/table-status"),
      ]);
      setCtxOrders(normalizeOrdersArray(ordersRes?.orders ?? ordersRes ?? []));
      setCtxMenu(normalizeMenuArray(menuRes ?? []));
      setStaff(staffRes ?? []);
      setTables(tablesRes ?? []);
    } catch (e) {
      console.error("refreshFromApi:", e);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Expose context
  // --------------------------
  const value = useMemo(
    () => ({
      ctxOrders,
      setCtxOrders,
      ctxMenu,
      setCtxMenu,
      staff,
      setStaff,
      tables,
      setTables,
      lowStock,
      setLowStock,
      analyticsCache,
      setAnalyticsCache,
      socketRef,
      socketConnected,
      connectSocket,
      emitSocket,
      pushLocalOrderUpdate,
      removeLocalOrder,
      refreshFromApi,
      API_BASE,
      loading,
    }),
    [ctxOrders, ctxMenu, staff, tables, lowStock, analyticsCache, socketRef, socketConnected, API_BASE, loading]
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

// --------------------------
// Hook
// --------------------------
export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used inside RestaurantProvider");
  return ctx;
};