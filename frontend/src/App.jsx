import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import Home from "./components/Home";
import AdminPage from "./pages/Admin";
import { getUserFromToken, clearToken } from "./api";
import ProfileModal from "./components/ProfileModal";
import bakeryBg from "./assets/bakery.jpg";
import "./styles/auth.css";
import edit from "./assets/edit.png";

export default function App() {
  const [user, setUser] = useState(getUserFromToken());
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "token") setUser(getUserFromToken());
    };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  /* 🔐 ROLE BASED REDIRECT */
  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN" && window.location.pathname !== "/admin") {
      window.location.replace("/admin");
    }

    if (user.role === "USER" && window.location.pathname === "/admin") {
      window.location.replace("/");
    }
  }, [user]);

  const onLogout = () => {
    clearToken();
    setUser(null);
    window.location.replace("/");
  };

  const isAdminRoute = window.location.pathname === "/admin";

  return (
    <div className="page-shell">

      {!user && (
        <>
          <div
            className="jsx-bg"
            style={{ backgroundImage: `url(${bakeryBg})` }}
          />
          <div className="jsx-overlay"></div>
        </>
      )}

      <header className="topbar">
        <div className="main-he">
          <h1>Sweet Shop..</h1>
          <p className="lead">
            <i>Delicious sweets. Freshly managed. Real-time stock updates.</i>
          </p>
        </div>

        <div className="top-actions">
          {user ? (
            <div className="sect1">
              <div className="sect">
                <i>
                  <strong>{user.name} ({user.role})</strong>
                </i>
              </div>

              <span onClick={() => setShowProfile(true)}>
                <div className="profile-edits">
                  <img src={edit} alt="" />
                  <p>Edit</p>
                </div>
              </span>

              <button onClick={onLogout} id="logout">Logout</button>
            </div>
          ) : (
            <span>Not logged in</span>
          )}
        </div>
      </header>

      <main className="main-area">
        {!user ? (
          <AuthForm onLogin={setUser} />
        ) : isAdminRoute ? (
          user.role === "ADMIN" ? <AdminPage /> : <Home />
        ) : (
          user.role === "USER" ? <Home /> : null
        )}
      </main>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={(u) => {
            setUser({ ...user, ...u });
            setShowProfile(false);
          }}
        />
      )}
    </div>
  );
}
