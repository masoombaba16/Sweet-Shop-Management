import React, { useState } from "react";
import { api } from "../api";
import "../styles/cart.css";

export default function CheckoutModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("ADDRESS");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

  async function sendOtp() {
    setError("");

    if (!address.trim()) {
      setError("Please enter delivery address");
      return;
    }

    setLoading(true);
    try {
      await api.sendOtp();
      setStep("OTP");
    } catch (err) {
      setError(
        err?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

 async function confirmOrder() {
  setError("");

  if (!otp.trim()) {
    setError("Please enter OTP");
    return;
  }

  setLoading(true);
  try {
    await api.verifyOtp({ otp });
    await api.placeOrder({ address });

    alert("✅ Order placed successfully! Confirmation sent to your email.");
    onSuccess();
    window.location.reload();
  } catch (err) {
    setError(
      err?.data?.message || "Order confirmation failed"
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>

        {step === "ADDRESS" && (
          <>
            <h2>📦 Delivery Address</h2>

            <textarea
              placeholder="Enter full delivery address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ width: "100%", height: 80 }}
            />

            {error && (
              <div style={{ color: "red", marginTop: 6 }}>
                {error}
              </div>
            )}

            <button
              className="checkout-btn"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "OTP" && (
          <>
            <h2>🔐 OTP Verification</h2>

            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />

            {error && (
              <div style={{ color: "red", marginTop: 6 }}>
                {error}
              </div>
            )}

            <button
              className="checkout-btn"
              onClick={confirmOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Confirm Order"}
            </button>
          </>
        )}

        <button id="close-btn2" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
