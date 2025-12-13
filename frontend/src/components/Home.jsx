import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import { socket } from "../socket";
import SweetCard from "./SweetCard";
import CartModal from "./CardModal";
import "../styles/customer.css";
import "../styles/Home.css";
import OrdersModal from "./OrdersModal";
function buildApiBase() {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
  return apiBase.replace(/\/api\/?$/, "");
}

export default function Home() {
  const API_BASE_NO_API = useMemo(buildApiBase, []);
  const [sweets, setSweets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  /* ===============================
     🔐 LOAD CART FROM BACKEND
     =============================== */
  async function loadCart() {
    try {
      const res = await api.getCart();

// handle all possible backend shapes safely
      const items =
        res?.items ||
        res?.cart?.items ||
        [];

      setCart(items);
    } catch {
      setCart([]);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);
    async function loadOrders() {
      try {
        const res = await api.getMyOrders();
        setOrders(res || []);
      } catch {
        setOrders([]);
      }
    }

 async function handleAddToCart(item) {
  try {
    // 🛑 HARD GUARDS
    if (
      !item ||
      !Number.isFinite(item.sweetId) ||
      !Number.isFinite(item.grams) ||
      !Number.isFinite(item.pricePerKg)
    ) {
      console.error("INVALID ADD TO CART PAYLOAD:", item);
      alert("Invalid item data");
      return;
    }

    // 🔥 REAL-TIME STOCK CHECK (BACKEND)
    const sweet = await api.getSweetBySweetId(item.sweetId);
    const maxGrams = sweet.quantity * 1000;

    if (item.grams > maxGrams) {
      alert(`Only ${maxGrams} grams available`);
      return;
    }

    // ✅ SAVE TO MONGO
    await api.addToCart({
      sweetId: item.sweetId,
      grams: item.grams,
      pricePerKg: item.pricePerKg
    });

    // 🔄 REFRESH CART
    await loadCart();

  } catch (err) {
    console.error("ADD TO CART FAILED:", err);
    alert(
      err?.data?.message ||
      "Failed to add to cart. Please try again."
    );
  }
}


  async function loadCategories() {
    try {
      const cats = await api.listCategories();
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }

  async function fetchSweets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (category) params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("visible", "true");

      const list = await api.getSweets(params.toString());

      let sorted = [...list];
      if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
      else if (sort === "name_asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
      else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTotal(sorted.length);
      const start = (page - 1) * perPage;
      setSweets(sorted.slice(start, start + perPage));
    } catch {
      setSweets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchSweets();
  }, [q, category, minPrice, maxPrice, sort, page]);

  /* ===============================
     🔥 REAL-TIME SOCKET
     =============================== */
  useEffect(() => {
    socket.on("sweet_updated", (u) =>
      setSweets((p) => p.map((s) => (s._id === u._id ? u : s)))
    );
    socket.on("sweet_created", (n) => {
      setSweets((p) => [n, ...p]);
      setTotal((t) => t + 1);
    });
    socket.on("sweet_deleted", (id) => {
      setSweets((p) => p.filter((s) => s._id !== id));
      setTotal((t) => t - 1);
    });

    return () => {
      socket.off("sweet_updated");
      socket.off("sweet_created");
      socket.off("sweet_deleted");
    };
  }, []);
  async function handleUpdateCartItem(sweetId, grams) {
    // 🛑 HARD GUARD (THIS FIXES EMPTY BODY)
    if (!Number.isFinite(sweetId) || !Number.isFinite(grams)) {
      console.warn("SKIPPING INVALID UPDATE:", sweetId, grams);
      return;
    }

    await api.updateCartItem({
      sweetId: Number(sweetId),
      grams: Number(grams)
    });

    await loadCart();
  }

  async function handleDeleteCartItem(sweetId) {
    await api.removeCartItem(sweetId);
    await loadCart();
  }

  function clearFilters() {
    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  }

  return (
    <div className="customer-wrap">
      <div className="controls controls-with-cart">
        <div className="searchbox">
          <input
            placeholder="Search sweets, e.g. chocolate, barfi..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <button onClick={fetchSweets}>Search</button>
          <button className="clear" onClick={clearFilters}>Clear</button>
        </div>

        <div className="filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <input
            className="price-input"
            placeholder="Min price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            className="price-input"
            placeholder="Max price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name_asc">Name A → Z</option>
          </select>
        </div>

        <button className="view-cart-btn" onClick={() => setShowCart(true)}>
          🛒 View Cart ({cart.length})
        </button>
        <button
        className="view-cart-btn"
        onClick={async () => {
          await loadOrders();
          setShowOrders(true);
        }}
      >
        📦 My Orders
      </button>

      </div>

      <div className="grid">
        {sweets.map((s) => (
          <SweetCard
            key={s._id}
            sweet={s}
            apiBase={API_BASE_NO_API}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateItem={loadCart} 
          onDeleteItem={handleDeleteCartItem}
        />

      )}
      {showOrders && (
        <OrdersModal
          orders={orders}
          onClose={() => setShowOrders(false)}
        />
      )}


      <div className="catalog">
        <div className="catalog-header">
          <div>{loading ? "Loading..." : `Showing ${sweets.length} of ${total} sweets`}</div>
          <div className="pagination-controls">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * perPage >= total}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
