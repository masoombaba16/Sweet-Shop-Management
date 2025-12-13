import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api";
import "../styles/cart.css";

const MIN_GRAMS = 200;

export default function CartModal({
  cart,
  onClose,
  onUpdateItem,   // keep prop (used to refresh cart)
  onDeleteItem
}) {
  const [errors, setErrors] = useState({});
  const [draftQty, setDraftQty] = useState({});
  const [loadingStock, setLoadingStock] = useState({});

  /* 🔁 Sync cart → editable values */
  useEffect(() => {
    const map = {};
    cart.forEach(item => {
      map[item.sweetId] = item.grams;
    });
    setDraftQty(map);
  }, [cart]);

  /* 💰 LIVE TOTAL */
  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const grams = Number(draftQty[item.sweetId]);
      if (!grams || grams <= 0) return sum;
      return sum + (grams / 1000) * item.pricePerKg;
    }, 0);
  }, [cart, draftQty]);

  /* ✍️ typing */
  function handleChange(item, value) {
    setDraftQty(prev => ({
      ...prev,
      [item.sweetId]: value
    }));

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[item.sweetId];
      return copy;
    });
  }

  /* 🔥 REAL-TIME VALIDATION + DB UPDATE */
  async function handleBlur(item) {
    const grams = Number(draftQty[item.sweetId]);

    if (!Number.isFinite(item.sweetId)) {
      setErrors(e => ({
        ...e,
        [item.sweetId]: "Invalid item"
      }));
      return;
    }

    if (!grams || grams < MIN_GRAMS) {
      setErrors(e => ({
        ...e,
        [item.sweetId]: "Minimum order is 200 grams"
      }));
      return;
    }

    try {
      setLoadingStock(s => ({ ...s, [item.sweetId]: true }));

      // 🔥 1. REAL-TIME STOCK CHECK
      const sweet = await api.getSweetBySweetId(item.sweetId);
      const maxGrams = sweet.quantity * 1000;

      if (grams > maxGrams) {
        setErrors(e => ({
          ...e,
          [item.sweetId]:
            `Maximum available quantity is ${maxGrams} grams`
        }));
        return;
      }

      // 🔥 2. UPDATE CART IN MONGODB
      await api.updateCartItem({
        sweetId: item.sweetId,
        grams
      });

      // 🔁 3. REFRESH CART FROM BACKEND
      onUpdateItem();

    } catch (err) {
      console.error("STOCK CHECK FAILED:", err);
      setErrors(e => ({
        ...e,
        [item.sweetId]:
          err?.data?.message || "Failed to validate stock. Please try again"
      }));
    } finally {
      setLoadingStock(s => ({ ...s, [item.sweetId]: false }));
    }
  }

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <h2>🛒 My Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cart.map(item => {
              const grams = Number(draftQty[item.sweetId]);
              const itemPrice =
                !grams || grams <= 0
                  ? 0
                  : ((grams / 1000) * item.pricePerKg).toFixed(2);

              return (
                <div key={item.sweetId} className="cart-item">
                  <div style={{ flex: 1 }}>
                    <strong>{item.name || item.sweetName || `Sweet #${item.sweetId}`}</strong>


                    <div style={{ marginTop: 6 }}>
                      <input
                        type="number"
                        value={draftQty[item.sweetId] ?? ""}
                        onFocus={e => e.target.select()}
                        onChange={e =>
                          handleChange(item, e.target.value)
                        }
                        onBlur={() => handleBlur(item)}
                        style={{ width: 90 }}
                      />
                      <span style={{ marginLeft: 6 }}>grams</span>
                    </div>

                    {loadingStock[item.sweetId] && (
                      <div style={{ fontSize: 12 }}>Checking stock…</div>
                    )}

                    {errors[item.sweetId] && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors[item.sweetId]}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div>₹ {Number(itemPrice).toFixed(2)}</div>

                    <button
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "red",
                        background: "none",
                        border: "none",
                        cursor: "pointer"
                      }}
                      onClick={() => onDeleteItem(item.sweetId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <hr />
            <h3>Total: ₹ {total.toFixed(2)}</h3>
            <button className="checkout-btn">Checkout</button>
          </>
        )}

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
