import React, { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket"; // your socket file
import "../styles/ActivityFeed.css";

export default function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Load old logs from API
  useEffect(() => {
    fetch("http://127.0.0.1:5000/logs")
      .then(res => res.json())
      .then(data => setLogs(data));
  }, []);

  // Real-time socket events
  useEffect(() => {
    socket.on("activity_event", (data) => {
      setLogs((prev) => [...prev, data]);
    });

    return () => {
      socket.off("activity_event");
    };
  }, []);

  return (
    <div className="activity-feed-card">
      <h2 className="activity-title">Live Activity Feed</h2>

      <div className="activity-list">
        {logs.map((log, index) => (
          <div key={index} className="activity-item">
            <span className="activity-time">{log.time}</span>
            <span className="activity-msg">{log.message}</span>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}
