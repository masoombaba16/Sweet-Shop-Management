// frontend/src/components/SweetCard.jsx
import React, { useState, useMemo } from "react";
import { api } from "../api";
import "../styles/customer.css";
import "../styles/SweetCard.css";

export default function SweetCard({ sweet, apiBase, onAddToCart }) {
  const MIN_GRAMS = 200;

  const [unit, setUnit] = useState("g"); // g | kg
  const [input, setInput] = useState("200");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false); // 👈 NEW

  const imgSrc = sweet.imageUrl ? `${apiBase}${sweet.imageUrl}` : null;

  // 🔢 Convert input → grams
  const grams = useMemo(() => {
    const val = Number(input);
    if (Number.isNaN(val)) return 0;
    return unit === "kg" ? Math.round(val * 1000) : Math.round(val);
  }, [input, unit]);

  const maxGrams = sweet.quantity * 1000;
  const maxDisplayQty =
    unit === "kg"
      ? (maxGrams / 1000).toFixed(2)
      : maxGrams;

  const isOutOfStock = sweet.quantity <= 0;
  const belowMin = grams < MIN_GRAMS;
  const exceedsStock = grams > maxGrams;

  const canBuy =
    !isOutOfStock &&
    grams >= MIN_GRAMS &&
    grams <= maxGrams;

  const totalPrice = useMemo(() => {
    return ((grams / 1000) * (sweet.price ?? 0)).toFixed(2);
  }, [grams, sweet.price]);
async function addToCart() {
  if (!canBuy) {
    if (grams < MIN_GRAMS) {
      alert("Minimum order is 200 grams!");
    }
    return;
  }

  setLoading(true);

  try {
    // 🔥 TRUST BACKEND FOR FINAL STOCK CHECK
    await onAddToCart({
      sweetId: sweet.sweetId,
      grams,
      pricePerKg: sweet.price
    });
    alert(`${sweet.name} added to cart!`);
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    alert(
      err?.data?.message ||
      "Failed to add to cart"
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <article className="card">
      {/* IMAGE */}
      <div className="card-media">
        {imgSrc ? (
          <img src={imgSrc} alt={sweet.name} />
        ) : (
          <div className="placeholder">No image</div>
        )}
      </div>

      <div className="card-body">
        {/* TITLE */}
        <div className="card-top">
          <h3 className="card-title">{sweet.name}</h3>
          <span className="card-id">#{sweet.sweetId}</span>
        </div>

        {/* CATEGORY & DESCRIPTION */}
        <p className="card-category">{sweet.category}</p>
        <p className="card-desc">{sweet.description}</p>

        {/* PRICE + STOCK */}
        <div className="card-meta">
          <div className="price">
            ₹ {(sweet.price ?? 0).toFixed(2)} / kg
          </div>
          <div className={`stock ${isOutOfStock ? "out" : "in"}`}>
            {isOutOfStock ? "Out of stock" : "In stock"}
          </div>
        </div>

        {/* TAGS */}
        <div className="card-tags">
          {(sweet.tags || []).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>

        {/* QUANTITY SELECT */}
        <div className="card-actions">
          <select
            value={unit}
            id="selecting-grams"
            onChange={(e) => {
              setTouched(true);
              setUnit(e.target.value);
              setInput(e.target.value === "kg" ? "0.2" : "200");
            }}
          >
            <option value="g">grams</option>
            <option value="kg">kg</option>
          </select>

        <input
          type="number"
          id="selecting-quantity"
          min={unit === "kg" ? 0.2 : 200}
          max={unit === "kg" ? maxGrams / 1000 : maxGrams}
          step={unit === "kg" ? 0.1 : 50}
          value={input}
          onChange={(e) => {
            setTouched(true);
            setInput(e.target.value);
          }}
/>


          <span>{unit === "kg" ? "kg" : "gr"}</span>

          <button
            className="buy"
            disabled={!canBuy || loading}
            onClick={addToCart}
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>

        </div>

        {/* ❌ ERRORS — ONLY AFTER USER TOUCHES */}
        {touched && !canBuy && (
          <div style={{ color: "red", fontSize: 12, marginTop: 6 }}>
            {belowMin && "Minimum order is 200 grams.."}
            {exceedsStock && (
              <>Maximum available quantity is {maxDisplayQty} {unit === "kg" ? "kg" : "grams"}..</>
            )}
            {isOutOfStock && "Item is out of stock.."}
          </div>
        )}

        {/* ✅ TOTAL */}
        {canBuy && (
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            Total: ₹ {totalPrice}
          </div>
        )}
      </div>
    </article>
  );
}
