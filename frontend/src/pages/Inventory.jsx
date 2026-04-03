import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  CheckCircle
} from "lucide-react";
import "../styles/Inventory.css";
import Modal from "../components/Modal";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState({ low: [], out: [] });
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    name: "",
    current_stock: "",
    min_stock: "",
    unit: "kg"
  });

  const resetForm = () => {
    setForm({
      name: "",
      current_stock: 0,
      min_stock: 0,
      unit: ""
    });
  };

  const handleDisabledClick = (e) => {
  e.currentTarget.classList.add("shake");
  setTimeout(() => {
    e.currentTarget.classList.remove("shake");
  }, 300);
};

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = async () => {
    const res = await fetch("http://127.0.0.1:5000/inventory");
    const data = await res.json();
    setItems(data.items);
    setAlerts(data.alerts);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* ================= UPDATE STOCK ================= */
  const updateStock = async (id, change) => {
    await fetch(`http://127.0.0.1:5000/inventory/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change })
    });
    fetchInventory();
  };

  /* ================= STATS ================= */
  const totalItems = items.length;
  const lowStock = alerts.low.length;
  const outOfStock = alerts.out.length;
  const wellStocked = totalItems - lowStock - outOfStock;
  const MAX_STOCK = 1000;

  const computedItems = items.map(item => {
    let status = "well";

    if (item.current_stock === 0) {
      status = "out";
    } else if (item.current_stock <= item.min_stock) {
      status = "low";
    }

    return { ...item, status };
  });

  return (
    <div className="inventory-page">

      {/* ================= HEADER ================= */}
      <div className="inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track and manage restaurant inventory</p>
        </div>

        <div className="inventory-actions">
          <button className="primary-btn" 
            onClick={() => {
                resetForm();          
                setShowAddModal(true);
              }}
              >
            <Plus size={16} /> Add Item
          </button>
          <button
            className="secondary-btn"
            onClick={() => navigate("/manager")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="inventory-stats">
        <StatCard title="Total Items" value={totalItems} icon={<Package />} />
        <StatCard title="Low Stock" value={lowStock} icon={<TrendingDown />} />
        <StatCard title="Out of Stock" value={outOfStock} icon={<AlertTriangle />} />
        <StatCard title="Well Stocked" value={wellStocked} icon={<TrendingUp />} />
      </div>

      {/* ================= ALERTS ================= */}
      {(alerts.out.length > 0 || alerts.low.length > 0) && (
        <div className="stock-alerts">
          <h3><AlertTriangle size={16} /> Stock Alerts</h3>
          <br/>
          {alerts.out.map(name => (
            <span key={name} className="badge red">{name}</span>
          ))}

          {alerts.low.map(name => (
            <span key={name} className="badge orange">{name}</span>
          ))}
        </div>
      )}

      {/* ================= INVENTORY LIST ================= */}
      <div className="inventory-list">
        <h3>Inventory Items</h3>

        {computedItems.map(item => (
          <div key={item.id} className="inventory-card">
            <div>
              <div className="item-title">
                {item.name}
                <span className={`status ${item.status === "well" ? "in" : item.status}`}>
                  {item.status === "out"
                    ? "Out of Stock"
                    : item.status === "low"
                    ? "Low Stock"
                    : "In Stock"}
                </span>
              </div>

              <p>
                Current Stock: <b>{item.current_stock} {item.unit}</b>
              </p>
              <p>
                Minimum Level: {item.min_stock} {item.unit}</p>
            </div>

            <div className="card-right">
            <div className="stock-controls">
              <button
                disabled={item.current_stock < 10}
                className={`stock-btn ${
                  item.current_stock < 10 ? "disabled" : ""
                }`}
                title={item.current_stock < 10 ? "Not enough stock" : ""}
                onClick={
                  item.current_stock < 10
                    ? handleDisabledClick
                    : () => updateStock(item.id, -10)
                }
              >
                <Minus size={14} /> 10
              </button>
              <button
                disabled={item.current_stock >= MAX_STOCK}
                className={`stock-btn ${
                  item.current_stock >= MAX_STOCK ? "disabled" : ""
                }`}
                title={
                  item.current_stock >= MAX_STOCK
                    ? "Maximum stock reached"
                    : ""
                }
                onClick={() => updateStock(item.id, 10)}
              >
                <Plus size={14} /> 10
              </button>
            </div>

            <div className="card-actions">
              <button
                className="secondary-btn"
                onClick={() => {
                  setSelectedItem(item);
                  setForm({
                    name: item.name,
                    current_stock: item.current_stock,
                    min_stock: item.min_stock,
                    unit: item.unit
                  });
                  setShowEditModal(true);
                }}
              >
                Edit
              </button>

              <button
                className="danger-btn"
                onClick={() => {
                  setSelectedItem(item);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </button>
            </div>
          </div>
          </div>
        ))}
      </div>

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <Modal
          title="Add Inventory Item"
          description="Add a new item to track in inventory"
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          footer={
            <>
              <button
                className="secondary-btn"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={async () => {
                  await fetch("http://127.0.0.1:5000/inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...form,
                      current_stock: Number(form.current_stock),
                      min_stock: Number(form.min_stock)
                    })
                  });
                  setShowAddModal(false);
                  resetForm();
                  fetchInventory();
                }}
              >
                Add Item
              </button>
            </>
          }
        >
          <label>Item Name *</label>
          <input
            placeholder="e.g., Tomatoes, Bread"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <div className="row">
            <div>
              <label>Current Stock *</label>
              <input
                type="number"
                value={form.current_stock}
                onChange={e =>
                  setForm({ ...form, current_stock: e.target.value })
                }
              />
            </div>

            <div>
              <label>Unit *</label>
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
              >
                <option value="">Select</option>
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          <label>Minimum Stock Level</label>
          <input
            type="number"
            value={form.min_stock}
            onChange={e =>
              setForm({ ...form, min_stock: e.target.value })
            }
          />
        </Modal>
      )}
      {/* ================= EDIT MODAL ================= */}
      {showEditModal && selectedItem && (
        <Modal
          title="Edit Inventory Item"
          description="Update inventory item details"
          onClose={() => setShowEditModal(false)}
          footer={
            <>
              <button
                className="secondary-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={async () => {
                  await fetch(
                    `http://127.0.0.1:5000/inventory/${selectedItem.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: form.name,
                        min_stock: Number(form.min_stock),
                        unit: form.unit
                      })
                    }
                  );
                  setShowEditModal(false);
                  fetchInventory();
                }}
              >
                Update Item
              </button>
            </>
          }
        >
          <label>Item Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <label>Minimum Stock Level</label>
          <input
            type="number"
            value={form.min_stock}
            onChange={e =>
              setForm({ ...form, min_stock: e.target.value })
            }
          />

          <label>Unit</label>
          <select
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
          >
            <option value="kg">kg</option>
            <option value="ltr">ltr</option>
            <option value="pcs">pcs</option>
          </select>
        </Modal>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && selectedItem && (
        <Modal
          title="Delete Inventory Item"
          description="This action cannot be undone"
          onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <button
                className="secondary-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="danger-btn"
                onClick={async () => {
                  await fetch(
                    `http://127.0.0.1:5000/inventory/${selectedItem.id}`,
                    { method: "DELETE" }
                  );
                  setShowDeleteModal(false);
                  fetchInventory();
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete{" "}
            <b>{selectedItem.name}</b>?
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon }) => (
  <div className="stat-card">
    <div>
      <p className="stat-title">{title}</p>
      <h2>{value}</h2>
    </div>
    <div className="stat-icon">{icon}</div>
  </div>
);
