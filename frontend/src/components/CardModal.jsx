import React from "react";
import "../styles/cart.css";

export default function CartModal({ cart, onClose }) {
  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🛒 My Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <div>
                  <strong>{item.name}</strong>
                  <div>{item.grams} g</div>
                </div>
                <div>₹ {item.totalPrice.toFixed(2)}</div>
              </div>
            ))}

            <hr />
            <h3>Total: ₹ {total.toFixed(2)}</h3>

            <button className="checkout-btn">Checkout</button>
          </>
        )}

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
