import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/MenuPage.css";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { 
  Search,
  X,
  Utensils,
  LayoutGrid,
  Pizza,
  Soup,
  Sandwich,
  Martini,
  Coffee,
  IceCream,
  Plus
} from "lucide-react";

export default function MenuPage() {

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [foodType, setFoodType] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const { cart, addToCart, increaseQty, decreaseQty, removeItem, totalPrice } = useCart();
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();

  const categoryIcons = {
    all: <LayoutGrid size={20} />,
    pizza: <Pizza size={20} />,
    starter: <Soup size={20} />,
    main: <Utensils size={20} />,
    drinks: <Martini size={20} />,
    dessert: <IceCream size={20} />
  };

  const getCategoryIcon = (cat) => {
    if (!cat) return null;

    const key = cat.trim().toLowerCase();
    return categoryIcons[key] || null;
  };
 // ---------------- FETCH MENU ----------------
useEffect(() => {
  const fetchMenu = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/menu");

      if (!res.ok) throw new Error("Failed to fetch menu");

      const data = await res.json();
      const menuArray = Array.isArray(data) ? data : [];

      setMenu(menuArray);

      const cats = [
        "All",
        ...new Set(menuArray.map((i) => i.category || "main"))
      ];

      setCategories(cats);

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unable to load menu", "error");
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  fetchMenu();
}, []);


// ---------------- ESC KEY CLOSE MODAL ----------------
useEffect(() => {

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setSelectedItem(null);
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };

}, []);

if (loading) return <div className="menu-loading">🍕 Loading menu...</div>;

  // ---------------- ADD TO CART ----------------

  const handleAdd = (item) => {

    if (!isLoggedIn) {

      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add items to cart",
      }).then(() => navigate("/login"));

      return;
    }

    addToCart(item);
  };

  const getQuantity = (id) => {
    const item = cart.find((c) => c.id === id);
    return item ? item.qty : 0;
  };

  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  // ---------------- FILTER MENU ----------------

  const filteredMenu = menu.filter((item) => {

    const matchSearch =
      item.name?.toLowerCase().includes(search.toLowerCase());

    const matchCat =
      activeCategory === "All" || item.category === activeCategory;

    const matchType =
      foodType === "All" || item.type === foodType;

    return matchSearch && matchCat && matchType;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const modalImage =
    selectedItem?.image?.startsWith("http")
      ? selectedItem.image
      : selectedItem?.image
      ? `http://127.0.0.1:5000${selectedItem.image}`
      : "/no-image.png";

  return (
    <>
      <Navbar />

      <motion.div
        className="menu-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        {/* HERO SECTION */}

        <div className="menu-hero">
          <h1>Eatrova Menu</h1>
          <p>Discover delicious dishes crafted by our chefs</p>
        </div>


        {/* SEARCH + FILTER BAR */}

        <div className="menu-controls">

          <div className="search-wrapper">

            <div className="search-box">

              <Search size={18} className="search-icon" />

              <input
                className="menu-search"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <X
                  size={16}
                  className="clear-search"
                  onClick={() => setSearch("")}
                />
              )}

            </div>

          </div>

        </div>


        {/* CATEGORY BAR */}
    
        <div className="category-tabs">

          {categories.map((cat) => (

            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-tab ${activeCategory === cat ? "active" : ""}`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>

          ))}

          </div>

        {/* MENU GRID */}

        <div className="menu-grid">

          {filteredMenu.length === 0 && (
            <div className="no-items">
              No dishes found
            </div>
          )}

          {filteredMenu.map((item) => {

            if (!item) return null;

            const qty = getQuantity(item.id);

            const imageSrc =
              item.image?.startsWith("http")
                ? item.image
                : item.image
                ? `http://127.0.0.1:5000${item.image}`
                : "/no-image.png";

            const shortDesc =
              item.description?.length > 28
                ? item.description.slice(0, 28) + "..."
                : item.description;

            return (

              <motion.div
                key={item.id}
                className="menu-card"
                whileHover={{ scale: 1.03 }}
              >

                <div className="menu-img-box">

                  <img
                    src={imageSrc}
                    alt={item.name}
                    className="menu-image"
                    onError={(e) => (e.target.src = "/no-image.png")}
                  />

                  <span className="price-tag">
                    ₹{item.price}
                  </span>

                </div>

                <div className="menu-info">

                  <h3>{item.name}</h3>

                  <p>
                    {shortDesc}
                    {item.description?.length > 60 && (
                      <span
                        className="read-more"
                        onClick={() => openModal(item)}
                      >
                        More
                      </span>
                    )}
                  </p>

                  {qty === 0 ? (

                  <button
                    className="add-btn"
                    onClick={() => handleAdd(item)}
                  >
                    <Plus size={16} className="add-plus"/> Add to Cart
                  </button>

                  ) : (

                    <div className="qty-container">

                      <button onClick={() => decreaseQty(item.id)}>
                        -
                      </button>

                      <span>{qty}</span>

                      <button onClick={() => increaseQty(item.id)}>
                        +
                      </button>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>

                    </div>

                  )}

                </div>

              </motion.div>

            );
          })}
        </div>

          {selectedItem && (
            <div className="item-modal-overlay" onClick={closeModal}>
              <div className="item-modal" onClick={(e) => e.stopPropagation()}>

                <div className="modal-img-box">
                  <img src={modalImage} alt={selectedItem.name} />

                  {/* Price overlay on bottom-right of image */}
                  <span className="modal-price-tag">₹{selectedItem.price}</span>
                </div>

                <h2>{selectedItem.name}</h2>

                <p className="modal-description">
                  {selectedItem.description}
                </p>

                <button className="modal-close" onClick={closeModal}>
                  Close
                </button>

              </div>
            </div>
          )}

        {/* BOTTOM CART BAR */}

        {cart.length > 0 && (

          <div className="bottom-cart-bar">

            <div>
              <strong>{totalItems} items</strong>
              <span> Total: ₹{totalPrice.toFixed(2)}</span>
            </div>

            <button onClick={() => navigate("/cart")}>
              View Cart & Checkout
            </button>

          </div>

        )}
      </motion.div>
      <ScrollToTopButton />
      </>
  );
}