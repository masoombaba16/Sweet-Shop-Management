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
import AllOrders from "../components/AllOrders";

export default function AdminPage() {
  const [tab, setTab] = useState("products");
  const [showAddSweet, setShowAddSweet] = useState(false);

  return (
    <div className="admin-wrap">
      <AdminSidebar active={tab} onChange={setTab} />

      <main className="admin-main">
        {tab === "products" && (
          <>
            <div className="products-header">
              <h2 id="pp">Products</h2>

              <button
                className="add-sweet-btn"
                onClick={() => setShowAddSweet(true)}
              >
                ➕ Add New Sweet
              </button>
            </div>

            <ProductList />
          </>
        )}

        {tab === "categories" && <CategoryManager />}
        {tab === "orders" && <AllOrders />}
        {tab === "customers" && <Customers />}


        {showAddSweet && (
          <div
            className="modal-backdrop"
            onClick={() => setShowAddSweet(false)}
          >
            <div
              className="modal modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Add New Sweet</h2>

              <ProductForm
                onCreated={() => {
                  setShowAddSweet(false);
                  window.dispatchEvent(new Event("refresh-products"));
                }}
              />

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddSweet(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
