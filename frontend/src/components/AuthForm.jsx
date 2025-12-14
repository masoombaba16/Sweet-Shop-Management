import React, { useState } from "react";
import { api, saveToken } from "../api";
import ForgotPassword from "./ForgotPassword";
import "../styles/auth.css";

export default function AuthForm({ onLogin, adminLogin = false }) {
  const [mode, setMode] = useState("login"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!email || !password) {
      setErr("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (!name) {
        setErr("Name is required.");
        return;
      }
      if (password !== confirmPassword) {
        setErr("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      if (mode === "login") {
        const res = await api.login({ email, password });

        if (adminLogin && res.user.role !== "ADMIN") {
          setErr("Admin access only.");
          setLoading(false);
          return;
        }

        saveToken(res.token);
        onLogin?.(res.user);
      } else {
        await api.register({ name, email, password });
        alert("Account created successfully, Confirmation email sent. Please login.");
        setMode("login");
        setName("");
        setConfirmPassword("");
      }
    } catch (ex) {
      setErr(ex?.data?.message || ex.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to Sweet Shop</h2>
        <p className="auth-subtitle">
          {mode === "login" ? "Login to continue" : "Create your account"}
        </p>

        <form className="auth-form" onSubmit={submit}>

          {mode === "register" && (
            <>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "register" && (
            <>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          {err && <div className="error">{err}</div>}

          <div className="auth-actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>

          {mode === "login" && (
            <div
              className="forgot-password"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </div>
          )}

        </form>

        {showForgot && (
          <ForgotPassword onClose={() => setShowForgot(false)} />
        )}

      </div>
    </div>
  );
}
