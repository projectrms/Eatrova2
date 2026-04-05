import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API } from "../api/constants";
/**
 * RestaurantContext - full-featured restaurant app context
 *
 * Exposes:
 *  - ctxOrders, setCtxOrders    (normalized order objects)
 *  - ctxMenu, setCtxMenu
 *  - inventory, setInventory
 *  - staff, setStaff
 *  - tables, setTables
 *  - lowStock, setLowStock
 *  - socketRef (client instance)
 *  - connectSocket(url, opts)
 *  - emitSocket(event, payload)
 *  - pushLocalOrderUpdate(order) - updates local orders array immutably
 *  - refreshFromApi() - optional convenience to re-fetch core datasets
 *
 * Note: The Provider intentionally normalizes incoming data so consumers
 * can rely on `paid` being 0/1, `totalAmount` being Number, `items` array, etc.
 */

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children, apiBase = null, socketUrl = null }) {
  // --------------------------
  // Use env vars or fallback
  // --------------------------
  const API_BASE = apiBase || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
  const SOCKET_URL = socketUrl || import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";
  
  // core live sets
  const [ctxOrders, setCtxOrders] = useState([]);
  const [ctxMenu, setCtxMenu] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tables, setTables] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyticsCache, setAnalyticsCache] = useState({}); // optional store for dashboards

  // socket ref
  const socketRef = useRef(null);
  // connection state
  const [socketConnected, setSocketConnected] = useState(false);

  // Helper: normalize single order shape (so UI code doesn't need to guess)
  function normalizeOrder(o = {}) {
    // defensive normalization - accepts many shapes from backend
    const id = o.id ?? o.order_id ?? null;
    const items = Array.isArray(o.items)
      ? o.items
      : Array.isArray(o.order_items)
      ? o.order_items
      : [];

    // total canonicalization: prefer `total` then `totalAmount` then `amount`
    const totalAmount = Number(o.total ?? o.totalAmount ?? o.total_price ?? o.amount ?? 0);

    // paid normalized to integer 0/1
    const paid = (() => {
      // allow string "1"/"0", boolean true/false, numbers
      if (o.paid === true) return 1;
      if (o.paid === false) return 0;
      const n = Number(o.paid);
      return Number.isNaN(n) ? 0 : (n === 1 ? 1 : 0);
    })();

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
      raw: o, // keep raw original in case consumer needs it
    };
  }

  // Helper: normalize arrays
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

  // -------------------------
  // API utils (simple fetch wrappers)
  // -------------------------
  async function safeFetch(path, opts = {}) {
    try {
      const res = await fetch(`${apiBase}${path}`, {
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
  }

  // -------------------------
  // Socket helpers
  // -------------------------
  function connectSocket(url = socketUrl, opts = {}) {
    if (!url) {
      console.warn("connectSocket: no socketUrl provided");
      return;
    }
    // avoid reconnecting if exists
    if (socketRef.current && socketRef.current.connected) return;

    // Create socket
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

    // generic event: server may emit 'order:update' or 'menu:update' etc.
    socket.on("order:update", (payload) => {
      // payload may be single order or array
      if (Array.isArray(payload)) {
        setCtxOrders((prev) => {
          const normalized = normalizeOrdersArray(payload);
          // replace / merge: prefer server's payload (simple strategy)
          const byId = new Map(normalizeOrdersArray(prev).map((p) => [p.id, p]));
          normalized.forEach((n) => byId.set(n.id, n));
          return Array.from(byId.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        });
      } else {
        // single order patch
        const n = normalizeOrder(payload);
        setCtxOrders((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          byId.set(n.id, n);
          return Array.from(byId.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        });
      }
    });

    socket.on("menu:update", (payload) => {
      setCtxMenu(normalizeMenuArray(payload));
    });

    // add any other server events you expect...
    socket.on("connect_error", (err) => console.error("Socket connect_error", err));
    socket.on("error", (err) => console.error("Socket error", err));
  }

  function emitSocket(event, payload) {
    if (!socketRef.current) {
      console.warn("emitSocket: socket not connected");
      return;
    }
    socketRef.current.emit(event, payload);
  }

  // -------------------------
  // Local helpers to mutate context data immutably (useful for optimistic UI)
  // -------------------------
  function pushLocalOrderUpdate(orderLike) {
    const n = normalizeOrder(orderLike);
    setCtxOrders((prev) => {
      const exists = prev.some((p) => p.id === n.id);
      if (exists) {
        return prev.map((p) => (p.id === n.id ? { ...p, ...n } : p));
      } else {
        return [n, ...prev];
      }
    });
  }

  function removeLocalOrder(orderId) {
    setCtxOrders((prev) => prev.filter((p) => p.id !== orderId));
  }

  // -------------------------
  // Fetch initial data (on mount or when apiBase changes)
  // -------------------------
  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setLoading(true);
      try {
        // fetch concurrently
        const [ordersRes, menuRes, staffRes, tablesRes] = await Promise.all([
          safeFetch("/owner/orders/all"),
          safeFetch("/menu"),
          safeFetch("/owner/staff"),
          safeFetch("/owner/table-status"),
        ]);

        if (!mounted) return;

        if (ordersRes && Array.isArray(ordersRes)) {
          setCtxOrders(normalizeOrdersArray(ordersRes));
        } else if (ordersRes && ordersRes.orders) {
          // support endpoints that wrap in { orders: [...] }
          setCtxOrders(normalizeOrdersArray(ordersRes.orders));
        } else {
          setCtxOrders([]);
        }

        if (menuRes && Array.isArray(menuRes)) setCtxMenu(normalizeMenuArray(menuRes));
        else setCtxMenu([]);

        if (staffRes && Array.isArray(staffRes)) setStaff(staffRes || []);
        else setStaff([]);

        if (tablesRes && Array.isArray(tablesRes)) setTables(tablesRes);
        else setTables([]);
      } catch (e) {
        console.error("bootstrap error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [apiBase]);

  // -------------------------
  // If socketUrl provided, auto-connect on mount, disconnect on unmount
  // -------------------------
  useEffect(() => {
    if (!socketUrl) return;
    connectSocket(socketUrl);

    return () => {
      try {
        socketRef.current?.off();
        socketRef.current?.disconnect();
      } catch (e) {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketUrl]);

  // -------------------------
  // Convenience: refresh core datasets
  // -------------------------
  async function refreshFromApi() {
    setLoading(true);
    try {
      const [ordersRes, menuRes, staffRes, tablesRes] = await Promise.all([
        safeFetch("/owner/orders/all"),
        safeFetch("/menu"),
        safeFetch("/owner/staff"),
        safeFetch("/owner/table-status"),
      ]);
      if (ordersRes && Array.isArray(ordersRes)) setCtxOrders(normalizeOrdersArray(ordersRes));
      else if (ordersRes && ordersRes.orders) setCtxOrders(normalizeOrdersArray(ordersRes.orders));
      if (menuRes && Array.isArray(menuRes)) setCtxMenu(normalizeMenuArray(menuRes));
      if (staffRes && Array.isArray(staffRes)) setStaff(staffRes);
      if (tablesRes && Array.isArray(tablesRes)) setTables(tablesRes);
    } catch (e) {
      console.error("refreshFromApi:", e);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Exposed context value (memoized)
  // -------------------------
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
      apiBase,
      loading,
    }),
    [
      ctxOrders,
      ctxMenu,
      staff,
      tables,
      lowStock,
      analyticsCache,
      socketRef,
      socketConnected,
      apiBase,
      loading,
    ]
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

// Hook
export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used inside RestaurantProvider");
  return ctx;
}
