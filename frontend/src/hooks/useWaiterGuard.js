import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

export default function useWaiterGuard(user, isLoggedIn, setOrders, fetchOrders) {
  const navigate = useNavigate();

  useEffect(() => {
    // LOGOUT ON REFRESH — SAME AS CHEF
    if (!isLoggedIn) {
      setOrders([]);
      navigate("/login");
      return;
    }

    if (!user || user.role !== "waiter") {
      setOrders([]);
      navigate("/login");
      return;
    }

    // FETCH + SOCKET JOIN
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);

    socket.emit("join", { room: "waiter" });

    return () => {
      clearInterval(interval);
      setOrders([]);
      socket.emit("leave", { room: "waiter" });
    };

  }, [isLoggedIn, user]);
}
