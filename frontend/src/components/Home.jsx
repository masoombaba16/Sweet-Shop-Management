// frontend/src/components/Home.jsx
import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import { socket } from "../socket";
import SweetCard from "./SweetCard";
import CartModal from "./CardModal";
import "../styles/customer.css";
import "../styles/Home.css";

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

    const [cart, setCart] = useState(() => {
      try {
        const saved = localStorage.getItem("sweetshop_cart");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    });
  const [showCart, setShowCart] = useState(false);

  async function loadCategories() {
    try {
      const cats = await api.listCategories();
      setCategories(cats || []);
    } catch {
      setCategories([]);
    }
  }
  useEffect(() => {
    localStorage.setItem("sweetshop_cart", JSON.stringify(cart));
  }, [cart]);

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

      let sorted = (list || []).slice();
      if (sort === "price_asc") sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      else if (sort === "price_desc") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      else if (sort === "name_asc") sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTotal(sorted.length);
      const start = (page - 1) * perPage;
      setSweets(sorted.slice(start, start + perPage));
    } catch (err) {
      console.error("Failed to load sweets", err);
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

  /* 🔥 REAL-TIME SOCKET */
  useEffect(() => {
    const onSweetUpdated = (updatedSweet) => {
      setSweets((prev) =>
        prev.map((s) => (s._id === updatedSweet._id ? updatedSweet : s))
      );
    };

    const onSweetCreated = (newSweet) => {
      setSweets((prev) => [newSweet, ...prev]);
      setTotal((t) => t + 1);
    };

    const onSweetDeleted = (deletedId) => {
      setSweets((prev) => prev.filter((s) => s._id !== deletedId));
      setTotal((t) => Math.max(0, t - 1));
    };

    socket.on("sweet_updated", onSweetUpdated);
    socket.on("sweet_created", onSweetCreated);
    socket.on("sweet_deleted", onSweetDeleted);

    return () => {
      socket.off("sweet_updated", onSweetUpdated);
      socket.off("sweet_created", onSweetCreated);
      socket.off("sweet_deleted", onSweetDeleted);
    };
  }, []);

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
          <button onClick={() => fetchSweets()}>Search</button>
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
      </div>

      <div className="grid">
        {sweets.map((s) => (
          <SweetCard
            key={s._id}
            sweet={s}
            apiBase={API_BASE_NO_API}
           onAddToCart={(item) =>
              setCart((prev) => {
                const existing = prev.find(
                  (c) => c.sweetId === item.sweetId
                );

                if (!existing) {
                  // new sweet
                  return [...prev, item];
                }

                // merge quantities
                return prev.map((c) =>
                  c.sweetId === item.sweetId
                    ? {
                        ...c,
                        grams: c.grams + item.grams,
                        totalPrice: Number(
                          (
                            ((c.grams + item.grams) / 1000) *
                            c.pricePerKg
                          ).toFixed(2)
                        ),
                      }
                    : c
                );
              })
            }

          />
        ))}
      </div>

      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
}
