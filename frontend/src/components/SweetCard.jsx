// frontend/src/components/SweetCard.jsx
import React, { useState } from "react";
import { api } from "../api";
import "../styles/customer.css";

export default function SweetCard({ sweet, apiBase, onBought }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  // image handling: sweet.imageUrl is like /uploads/<fileId>
  const imgSrc = sweet.imageUrl ? `${apiBase}${sweet.imageUrl}` : null;

  async function buy() {
    if (sweet.quantity <= 0) return alert("Out of stock");
    setLoading(true);
    try {
      await api.purchase(sweet._id, qty);
      if (onBought) onBought();
      alert("Purchase successful");
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="card">
      <div className="card-media">
        {imgSrc ? (
          <img src={imgSrc} alt={sweet.name} onError={(e)=>{ e.target.onerror=null; e.target.src="/placeholder.png"; }} />
        ) : (
          <div className="placeholder">No image</div>
        )}
      </div>

      <div className="card-body">
        <div className="card-top">
          <h3 className="card-title">{sweet.name}</h3>
          <div className="card-id">#{sweet.sweetId ?? (sweet._id ? sweet._id.slice(-6) : "")}</div>
        </div>

        <p className="card-category">{sweet.category}</p>
        <p className="card-desc">{sweet.description}</p>

        <div className="card-meta">
          <div className="price">${(sweet.price ?? 0).toFixed(2)}</div>
          <div className={`stock ${sweet.quantity > 0 ? (sweet.quantity <= (sweet.lowStockThreshold||5) ? "low":"in") : "out"}`}>
            {sweet.quantity > 0 ? `${sweet.quantity} in stock` : "Out of stock"}
          </div>
        </div>

        <div className="card-tags">
          {(sweet.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        <div className="card-actions">
          <div className="qty">
            <input type="number" min="1" value={qty} onChange={(e)=>setQty(Math.max(1, Number(e.target.value||1)))} />
          </div>
          <button className="buy" onClick={buy} disabled={loading || sweet.quantity <= 0}>
            {loading ? "Processing..." : (sweet.quantity <= 0 ? "Sold out" : "Buy")}
          </button>
        </div>
      </div>
    </article>
  );
}
