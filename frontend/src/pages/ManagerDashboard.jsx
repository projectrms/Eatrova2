import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Swal from "sweetalert2";
import ScrollToTopButton from "../components/ScrollToTopButton";
import {
  Calendar,
  Tag,
  AlertCircle,
  BarChart3,
  DollarSign,
  LayoutGrid,
  Package,
  Truck,
  MessageSquare,
  Users,
  Gift,
  LineChart,
  Edit,
  Trash2,
  Utensils,
  ClipboardList,
  Table,
  Plus,
  RefreshCw
} from "lucide-react";


import ManagerNavbar from "../components/ManagerNavbar";
import Modal from "../components/Modal";
import "../styles/ManagerDashboard.css"; // your css
import { API } from "../api/constants";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

// Create the socket
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true
});

export default function ManagerDashboard({ onLogout }) {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const ordersRef = useRef(null);
  const menuRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "starters",
    imageFile: null
  });
  const navigate = useNavigate();

  // ---------------- LOAD DATA ----------------

  const loadMenu = async () => {
    const res = await fetch(`${API}/manager/menu`);
    const data = await res.json();
    setMenuItems(data);
  };

  const loadOrders = async () => {
    const res = await fetch(`${API}/manager/orders`);
    const data = await res.json();
    setOrders(data);
  };

  const loadDeletedItems = async () => {
    const res = await fetch(
      `${API}/manager/menu/deleted`
    );
    const data = await res.json();
    setDeletedItems(data);
  };
  
  useEffect(() => {
    loadMenu();
    loadDeletedItems();
    loadOrders();

    socket.on("menu_changed", () => {
      loadMenu();
      loadDeletedItems();
    });

    socket.on("order_created", loadOrders);
    socket.on("order_updated", loadOrders);
    socket.on("order_cancelled", loadOrders);

    return () => {
      socket.off("menu_changed");
      socket.off("order_created", loadOrders);
      socket.off("order_updated", loadOrders);
      socket.off("order_cancelled", loadOrders);
    };
  }, []);

  // ---------------- CALCULATIONS ----------------

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const avgOrderValue =
    orders.length > 0 ? totalRevenue / orders.length : 0;

  const filteredMenuItems = useMemo(() => {
    let items = menuItems;

    if (!showDeleted) {
      items = items.filter(item => item.is_deleted === 0);
    }

    if (selectedCategory === "all") return items;

    return items.filter(
      item => (item.category || "").toLowerCase() === selectedCategory
    );
  }, [menuItems, selectedCategory, showDeleted]);

  // ---------------- FORM SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("category", formData.category);
    if (formData.imageFile) {
      fd.append("image", formData.imageFile);
    }

    const url = editingItem
      ? `${API}/manager/menu/${editingItem.id}`
      : `${API}/manager/menu`;

    const method = editingItem ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: fd,
    });

    Swal.fire("Success", editingItem ? "Item updated" : "Item added", "success");

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "starters",
      imageFile: null
    });

    setEditingItem(null);
    setShowAddForm(false);
    loadDeletedItems();
    loadMenu();
  };

  // ---------------- DELETE ----------------

  const deleteItem = async (id) => {
    await fetch(
      `${API}/manager/menu/${id}/delete`,
      { method: "POST" }
    );

    setMenuItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, is_deleted: 1, is_available: 0 }
          : item
      )
    );

    loadDeletedItems();

  };

  const toggleAvailability = async (id) => {
  const res = await fetch(
    `${API}/manager/menu/${id}/toggle`,
    { method: "POST" }
  );

  const data = await res.json();

  setMenuItems(prev =>
    prev.map(item =>
      item.id === id
        ? { ...item, is_available: item.is_available ? 0 : 1 }
        : item
    )
  );
};

  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "starters",
      imageFile: null
    });
    setImagePreview(null);   // ✅ THIS IS CRITICAL
    setEditingItem(null);
    setShowAddForm(true);
  };

  // ---------------- EDIT ----------------

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageFile: null
    });
    setImagePreview(
    item.image ? `${API}${item.image}` : null
  );
    setShowAddForm(true);
  };

  const restoreItem = async (id) => {
    await fetch(`${API}/manager/menu/${id}/restore`, {
      method: "PATCH",
    });

    Swal.fire("Restored", "Item is back in menu", "success");
    loadMenu();
    loadDeletedItems();
  };

  const visibleMenuItems = filteredMenuItems;
  const visibleOrders = orders;

  // ---------------- RENDER ----------------

  return (
  <>
    {/* NAVBAR (Same style as Waiter) */}
    <ManagerNavbar />

    <div className="manager-dashboard">

      {/* HEADER (Same structure as Waiter) */}
      <div className="manager-header">
        <h1>Manager Overview</h1>
        <p className="muted">Control menu & monitor restaurant performance</p>
      </div>


      {/* ================== STATS ================== */}
      <div className="manager-stats-container">

        <div className="stat-card blue">
          <h3>Total Orders</h3>
          <h2>{orders.length}</h2>
        </div>

        <div className="stat-card green">
          <h3>Total Revenue</h3>
          <h2>₹ {totalRevenue.toFixed(2)}</h2>
        </div>

        <div className="stat-card orange">
          <h3>Avg Order</h3>
          <h2>₹ {avgOrderValue.toFixed(2)}</h2>
        </div>

        <div className="stat-card purple">
          <h3>Menu Items</h3>
          <h2>{menuItems.filter(i => i.is_deleted === 0).length}</h2>
        </div>

      </div>

{/* ================= QUICK ACCESS ================= */}
{/* <div className="quick-access-container">

  <h2 className="quick-access-title">Quick Access</h2>

  <div className="quick-access-grid">
    {[
      { icon: <Calendar />, label: "Shift Management", path: "/manager/shifts", color: "qa-purple" },
      { icon: <Tag />, label: "Promotions", path: "/manager/promotions", color: "qa-pink" },
      { icon: <AlertCircle />, label: "Allergen Info", path: "/manager/allergens", color: "qa-orange" },
      { icon: <BarChart3 />, label: "Performance", path: "/manager/performance", color: "qa-blue" },

      { icon: <DollarSign />, label: "Tip Management", path: "/manager/tips", color: "qa-green" },
      { icon: <LayoutGrid />, label: "Floor Plan", path: "/manager/floor-plan", color: "qa-indigo" },
      { icon: <Package />, label: "Inventory", path: "/manager/inventory", color: "qa-cyan" },
      { icon: <Truck />, label: "Delivery", path: "/manager/delivery", color: "qa-teal" },

      { icon: <MessageSquare />, label: "Feedback", path: "/manager/feedback", color: "qa-blue" },
      { icon: <Users />, label: "Catering", path: "/manager/catering", color: "qa-orange" },
      { icon: <Gift />, label: "Gift Cards", path: "/manager/gift-cards", color: "qa-pink" },
      { icon: <LineChart />, label: "Analytics", path: "/manager/analytics", color: "qa-purple" }
    ].map((item, i) => (
      <div
        key={i}
        className="quick-access-item"
        onClick={() => navigate(item.path)}
      >
        <div className={`quick-access-icon ${item.color}`}>
          {item.icon}
        </div>
        <div className="quick-access-label">
          {item.label}
        </div>
      </div>
    ))}
  </div>

</div> */}

<br></br>
      {/* ================== ADD ITEM BUTTON ================== */}
      <div className="manager-toolbar">

  <button
    className="action-btn primary"
    onClick={openAddModal}
  >
    + Add Item
  </button>

  <button
    className="action-btn secondary"
    onClick={() => setShowDeleted(!showDeleted)}
  >
    {showDeleted ? "Hide Deleted Items" : "Show Deleted Items"}
  </button>

  <div className="toolbar-break"></div>

  {["all", "starters", "main", "desserts", "drinks"].map((c) => (
    <button
      key={c}
      className={`category-btn ${selectedCategory === c ? "active" : ""}`}
      onClick={() => setSelectedCategory(c)}
    >
      {c.toUpperCase()}
    </button>
  ))}

</div>


      {/* ================== FORM ================== */}
      {showAddForm && (
        <Modal
          title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
            setImagePreview(null); 
          }}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <input
              required
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) {
                  setImagePreview(null);   // 👈 important
                  return;
                }

                setFormData({ ...formData, imageFile: file });
                setImagePreview(URL.createObjectURL(file));
              }}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginTop: "10px",
                  border: "1px solid #e5e7eb"
                }}
              />
            )}

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="starters">Starters</option>
              <option value="main">Main</option>
              <option value="desserts">Desserts</option>
              <option value="drinks">Drinks</option>
            </select>

            <button className="action-btn view full">
              {editingItem ? "Update Item" : "Add Item"}
            </button>
          </form>
        </Modal>
      )}


      {/* ================== MENU ITEMS TABLE ================== */}
      <h2 className="section-title">Menu Items</h2>

        <div className="table-container menu-container">
          <div 
          ref={menuRef}
          className={`menu-inner ${showAll ? "expanded" : ""}`}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleMenuItems.map((item) => (
                <tr key={item.id}>
                  
                  {/* IMAGE */}
                  <td>
                    <img
                      src={
                        item.image
                          ? `${API}${item.image}`
                          : "/no-image.png"
                      }
                      className="menu-img"
                    />
                  </td>

                  {/* NAME */}
                  <td style={{ fontWeight: "600" }}>
                    {item.name}
                    {item.is_deleted === 1 && (
                      <span className="deleted-badge">Deleted</span>
                    )}
                  </td>

                  {/* CATEGORY */}
                  <td>
                    <span className="category-badge">
                      {item.category?.toUpperCase()}
                    </span>
                  </td>

                  {/* PRICE */}
                  <td>₹ {item.price}</td>

                  {/* STATUS */}
                  <td>
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      disabled={item.is_deleted === 1}
                      className={
                        item.is_deleted === 1
                          ? "disabled"
                          : item.is_available
                          ? "on"
                          : "off"
                      }
                    >
                      {item.is_deleted === 1
                        ? "Deleted"
                        : item.is_available
                        ? "Available"
                        : "Unavailable"}
                    </button>
                  </td>
                  
                  {/* ACTIONS */}
                  <td>
                    <div className="action-group">
                    {/* EDIT BUTTON */}
                    <button
                      className="action-btn view"
                      disabled={item.is_deleted === 1}
                      onClick={() => handleEdit(item)}
                    >
                      <Edit size={16} />  Edit
                      
                    </button>

                    {/* DELETE / RESTORE */}
                    {item.is_deleted === 1 ? (
                      <button
                        className="action-btn restore"
                        onClick={() => restoreItem(item.id)}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        className="action-btn delete"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 size={16} />  Delete
                       
                      </button>
                    )}
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
          </div><br></br>
          {filteredMenuItems.length > 4 && (
            <div className="see-more-container">
              <button
                className="see-more-btn"
                onClick={() => {
                  if (showAll && menuRef.current) {
                    menuRef.current.scrollTop = 0;     // 👈 RESET SCROLL
                  }
                  setShowAll(!showAll);
                }}
              >
                <span>
                  {showAll ? "Show Less Items" : "See More Menu Items"}
                </span>
                <i className="arrow"></i>
              </button>
            </div>
          )}
        </div>
          {deleteTarget && (
            <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
              <p style={{ fontSize: "14px", marginBottom: "14px" }}>
                Are you sure you want to delete <b>{deleteTarget.name}</b>?
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  className="action-btn"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>

                <button
                  className="action-btn delete"
                  onClick={() => {
                    deleteItem(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </Modal>
          )}

          <br></br><br></br>
      {/* ================== RECENT ORDERS ================== */}
      <h2 className="section-title">Recent Orders</h2>

      <div 
      ref={ordersRef}
      className={`orders-inner ${showAllOrders ? "expanded" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Table</th>
              <th>Items</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {visibleOrders.map(order => (
              <tr key={order.id}>
                
                {/* ORDER ID */}
                <td><b>#{order.id}</b></td>

                {/* CUSTOMER NAME */}
                <td>{order.customer_name || "Guest"}</td>

                {/* TABLE NUMBER */}
                <td>Table {order.tableNumber}</td>

                {/* ITEMS COUNT */}
                <td style={{ textAlign: "left" }}>
                  {order.items?.map((item, index) => (
                    <div key={index} style={{ fontSize: "13px" }}>
                      • {item.item_name ?? "Deleted Item"} × {item.quantity}
                    </div>
                  ))}
                </td>

                {/* TOTAL */}
                <td>₹ {order.totalAmount}</td>

                {/* PAID / UNPAID */}
                <td>
                  {order.paid ? (
                    <span className="paid-badge">Paid</span>
                  ) : (
                    <span className="unpaid-badge">Unpaid</span>
                  )}
                </td>

                {/* STATUS */}
                <td>
                  <button className={`status-btn ${order.status}`} disabled>
                    {order.status === "pending" && "⏳ "}
                    {order.status === "preparing" && "👨‍🍳 "}
                    {order.status === "ready" && "✅ "}
                    {order.status === "completed" && "✔ "}
                    {order.status === "cancelled" && "❌ "}
                    {order.status}
                  </button>
                </td>
                
                {/* CANCEL REASON */}
                <td style={{ maxWidth: "180px", fontSize: "12px" }}>
                  {order.status === "cancelled"
                    ? (order.cancelReason || "No reason provided")
                    : "--"
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
          <div className="see-more-container right">
            <button
              className={`see-more-btn ${showAllOrders ? "open" : ""}`}
              onClick={() => {
                if (showAllOrders && ordersRef.current) {
                  ordersRef.current.scrollTop = 0;   // 👈 RESET SCROLL
                }
                setShowAllOrders(!showAllOrders);
              }}
           >
          <span>
            {showAllOrders ? "Show Less Orders" : "Show All Orders"}
          </span>
          <i className="arrow"></i>
        </button>
      </div>
      
    </div>

  </>
);
}

