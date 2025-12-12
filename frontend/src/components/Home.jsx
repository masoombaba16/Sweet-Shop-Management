// frontend/src/components/Home.jsx
import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import { socket } from "../socket";
import SweetCard from "./SweetCard";
import "../styles/customer.css";

function buildApiBase() {
  // VITE_API_BASE is like http://localhost:4000/api
  // we want base without trailing /api for image URLs
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
  const [sort, setSort] = useState("newest"); // newest, price_asc, price_desc, name_asc
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

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
      // build query string
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (category) params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      // visibility: only visible products for customers
      params.append("visible", "true");
      // Sorting and pagination are handled client-side (API simple), we'll fetch all matching up to 500.
      const list = await api.getSweets(params.toString());
      // handle sort
      let sorted = (list || []).slice();
      if (sort === "price_asc") sorted.sort((a,b)=> (a.price||0)-(b.price||0));
      else if (sort === "price_desc") sorted.sort((a,b)=> (b.price||0)-(a.price||0));
      else if (sort === "name_asc") sorted.sort((a,b)=> (a.name||"").localeCompare(b.name||""));
      else sorted.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

      setTotal(sorted.length);
      // pagination
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
    // fetch when filters or page change
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    // socket update handlers
    function onUpdate(payload) {
      // payload: { id, quantity } or { id, visible }
      setSweets(prev => prev.map(s => {
        if (!s) return s;
        if (String(s._id) === String(payload.id)) {
          return { ...s, quantity: payload.quantity ?? s.quantity, visible: payload.visible ?? s.visible };
        }
        return s;
      }));
    }
    function onLow(payload) {
      // simple toast-like console log; you can enhance to UI notifications
      console.info("Low stock alert:", payload);
    }
    socket.on("inventory:update", onUpdate);
    socket.on("inventory:visibility", onUpdate);
    socket.on("inventory:low-stock", onLow);
    socket.on("inventory:out-of-stock", onLow);
    return () => {
      socket.off("inventory:update", onUpdate);
      socket.off("inventory:visibility", onUpdate);
      socket.off("inventory:low-stock", onLow);
      socket.off("inventory:out-of-stock", onLow);
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
      <div className="hero">
        <div className="hero-inner">
          <h1>Sweet Shop</h1>
          <p className="lead">Delicious sweets. Freshly managed. Real-time stock updates.</p>
        </div>
      </div>

      <div className="controls">
        <div className="searchbox">
          <input
            placeholder="Search sweets, e.g. chocolate, barfi..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            onKeyDown={(e) => { if (e.key === "Enter") setPage(1); }}
          />
          <button onClick={() => { setPage(1); fetchSweets(); }}>Search</button>
          <button className="clear" onClick={clearFilters}>Clear</button>
        </div>

        <div className="filters">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <input
            className="price-input"
            placeholder="Min price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
          />
          <input
            className="price-input"
            placeholder="Max price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
          />

          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name_asc">Name A → Z</option>
          </select>
        </div>
      </div>

      <div className="catalog">
        <div className="catalog-header">
          <div>{loading ? "Loading..." : `Showing ${sweets.length} of ${total} sweets`}</div>
          <div className="pagination-controls">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span>Page {page} </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * perPage >= total}>Next</button>
          </div>
        </div>

        <div className="grid">
          {sweets.length === 0 && !loading ? (
            <div className="empty">No sweets found — try clearing filters.</div>
          ) : (
            sweets.map(s => (
              <SweetCard key={s._id} sweet={s} apiBase={API_BASE_NO_API} onBought={() => { /* could refresh */ }} />
            ))
          )}
        </div>

      </div>

      <footer className="catalog-footer">
        <div>Showing page {page}. </div>
      </footer>
    </div>
  );
}
