// frontend/src/pages/Admin.jsx
import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import ProductList from "../components/ProductList";
import ProductForm from "../components/ProductForm";
import CategoryManager from "../components/CategoryManager";
import Orders from "../components/Orders";
import Customers from "../components/Customers";
import Discounts from "../components/Discounts";
import MediaManager from "../components/MediaManager";
import "../styles/admin.css";

export default function AdminPage() {
  const [tab, setTab] = useState("products");
  return (
    <div className="admin-wrap">
      <AdminSidebar active={tab} onChange={setTab} />
      <main className="admin-main">
        {tab === "products" && (
          <>
            <h2>Products</h2>
            <div className="grid">
              <div className="col">
                <ProductForm onCreated={() => window.dispatchEvent(new Event("refresh-products"))} />
              </div>
              <div className="col">
                <ProductList />
              </div>
            </div>
          </>
        )}
        {tab === "categories" && <CategoryManager />}
        {tab === "orders" && <Orders />}
        {tab === "customers" && <Customers />}
        {tab === "discounts" && <Discounts />}
        {tab === "media" && <MediaManager />}
      </main>
    </div>
  );
}
