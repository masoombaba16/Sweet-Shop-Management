import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ProductCard from "./ProductCard";
import "../styles/productCard.css";

const socket = io(
  import.meta.env.VITE_SOCKET_URL
);

export default function ProductList() {
  const [sweets, setSweets] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    socket.emit("get-sweets");
    socket.on("sweets-update", setSweets);

    return () => socket.off("sweets-update");
  }, []);

  const updateStock = async (id, deltaKg) => {
    return fetch(
      `${import.meta.env.VITE_API_BASE}/sweets/${id}/stock`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: deltaKg }),
      }
    );
  };

  const filtered = sweets.filter((s) => {
    const q = search.toLowerCase();

    return (
      s.sweetId?.toString().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="search-bar">
        <input
          placeholder="Search sweets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="product-grid">
        {filtered.map((s) => (
          <ProductCard
            key={s._id}
            sweet={s}
            onUpdateStock={updateStock}
          />
        ))}
      </div>
    </>
  );
}
