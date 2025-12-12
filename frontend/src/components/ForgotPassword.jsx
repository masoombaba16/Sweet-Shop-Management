import { useState } from "react";
import { api } from "../api";
import "../styles/auth.css";

export default function ForgotPassword({ onClose }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function sendOtp() {
    try {
      setLoading(true);
      setErr("");
      await api.forgotPassword(email);
      setStep(2);
    } catch (e) {
      setErr(e?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    try {
      setLoading(true);
      setErr("");
      await api.resetPassword({ email, otp, newPassword: password });
      setMsg("Password changed successfully!");
      setTimeout(onClose, 1500);
    } catch (e) {
      setErr(e?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-overlay">
      <div className="forgot-card">
        <div className="sec1">  
        <h3>Forgot Password</h3>
        <button className="close-btn" onClick={onClose}>X</button>
        </div>
        {step === 1 && (
          <> 
          <div className="sec2">
            <input
              className="input"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <button className="btn primary" onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
            </div>
            <br />
            {err && <div className="error">{err}</div>}
          </>
        )}

        {step === 2 && (
          <>
            <h3>Reset Password</h3>
            <div className="sec3">
            <input
              className="input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              className="input"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            <br />
            {err && <div className="error">{err}</div>}
            <button className="btn primary" onClick={resetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

      </div>
      {msg && <div className="success">{msg}</div>}
    </div>
  );
}
