import React, { useState } from "react";
import "../styles/profiles.css";
import { api } from "../api";

export default function ProfileModal({ user, onClose, onUpdate }) {
  const [name, setName] = useState(user.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

async function submit(e) {
  e.preventDefault();
  setMsg("");

  // 🔴 Prevent useless request
  if (
    name.trim() === user.name &&
    password.trim() === ""
  ) {
    setMsg("No changes to update");
    return;
  }

  try {
    setLoading(true);

    const payload = {};
    if (name.trim() !== user.name) payload.name = name.trim();
    if (password.trim()) payload.password = password;

    const updated = await api.updateProfile(payload);

    onUpdate(updated.user);
    setMsg("Profile updated successfully");
    setPassword("");
  } catch (err) {
    setMsg(err?.data?.message || "Update failed");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="profile-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="profile">My Profile</h2>

        <form onSubmit={submit}>
          <label>Name</label>
          <div className="formUpdate">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input value={user.email} disabled />

          <label>New Password (optional)</label>
          <input
            type="password"
            placeholder="Leave blank to keep same"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          </div>
          {msg && <div className="profile-msg">{msg}</div>}

          <div className="profile-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button
                type="submit"
                disabled={
                  loading ||
                  (name.trim() === user.name && password.trim() === "")
                }
              >
                {loading ? "Saving..." : "Save"}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
