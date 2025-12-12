import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import Home from "./components/Home";
import AdminPage from "./pages/Admin";
import { getUserFromToken, clearToken } from "./api";

import bakeryBg from "./assets/bakery.jpg";
import "./styles/auth.css";

export default function App() {
  const [user, setUser] = useState(getUserFromToken());

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "token") setUser(getUserFromToken());
    };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  const onLogout = () => {
    clearToken();
    setUser(null);
  };

  const isAdminRoute = window.location.pathname === "/admin";

  return (
    <div className="page-shell">

        {!user && (
          <>
            <div
              className="jsx-bg"
              style={{ backgroundImage: `url(${bakeryBg})` }}
            ></div>
            <div className="jsx-overlay"></div>
          </>
        )}


      {/* Overlay */}
      <div className="jsx-overlay"></div>

      <header className="topbar">
        <h1>Sweet Shop</h1>
        <div className="top-actions">
          {user ? (
            <>
              <span>{user.name}</span>
              <button onClick={onLogout} id="logout">Logout</button>
            </>
          ) : (
            <span>Not logged in</span>
          )}
        </div>
      </header>

      <main className="main-area">
        {isAdminRoute ? (
          user && user.role === "ADMIN" ? (
            <AdminPage />
          ) : (
            <AuthForm adminLogin onLogin={setUser} />
          )
        ) : !user ? (
          <AuthForm onLogin={setUser} />
        ) : (
          <Home />
        )}
      </main>
    </div>
  );
}
