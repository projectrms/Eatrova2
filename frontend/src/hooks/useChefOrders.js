// src/hooks/useChefOrders.js
import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

/**
 * useChefOrders - manages fetching, polling, and socket updates for chef orders.
 * - endpoint used: /chef/orders (GET)
 * - emits chef_update after local status change (UI can also call updateOrderStatus)
 *
 * Returns: { orders, loading, refresh, updateOrderStatusLocal }
 */
export default function useChefOrders({ pollInterval = 5000 } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const normalize = (o) => ({
    id: o.order_id ?? o.id,
    order_id: o.order_id ?? o.id,
    user_id: o.user_id ?? null,
    created_at: o.created_at,
    total: o.total ?? 0,
    status: o.status ?? "pending",
    paid: o.paid ?? 0,
    tableNumber: o.tableNumber ?? o.table_number ?? o.table ?? "—",
    items:
      o.items?.map((it, idx) => ({
        id: it.id ?? `i-${idx}`,
        name: it.name,
        quantity: it.quantity,
        price: it.price,
        category: it.category ?? "Item",
      })) || [],
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/chef/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data.map(normalize) : []);
      setLoading(false);
    } catch (err) {
      console.error("fetchOrders error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, pollInterval);
    socket.emit("join", { room: "kitchen" });

    return () => {
      clearInterval(pollRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // sockets
  useEffect(() => {
    const onCreated = (payload) => {
      const newOrder = normalize(payload);
      setOrders((prev) => (prev.some((o) => o.order_id === newOrder.order_id) ? prev : [newOrder, ...prev]));
    };

    const onUpdated = (p) => {
      setOrders((prev) => prev.map((o) => (o.order_id === p.order_id ? { ...o, status: p.status } : o)));
    };

    socket.on("order_created", onCreated);
    socket.on("order_updated", onUpdated);
    socket.on("chef_update", onUpdated);

    return () => {
      socket.off("order_created", onCreated);
      socket.off("order_updated", onUpdated);
      socket.off("chef_update", onUpdated);
    };
  }, []);

  // update status via API + optimistic UI
  const updateOrderStatusLocal = async (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o)));
    try {
      await fetch(`${API}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("updateOrderStatusLocal error:", err);
    }
    socket.emit("chef_update", { order_id: orderId, status: newStatus });
  };

  const refresh = () => fetchOrders();

  return { orders, loading, refresh, updateOrderStatusLocal };
}
