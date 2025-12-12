// frontend/src/components/AdminSidebar.jsx
import React from "react";

export default function AdminSidebar({ active, onChange }) {
  const items = [
    { id: "products", label: "Products" },
    { id: "categories", label: "Categories" },
    { id: "orders", label: "Orders" },
    { id: "customers", label: "Customers" },
    { id: "discounts", label: "Discounts" },
    { id: "media", label: "Media" }
  ];
  return (
    <aside className="admin-sidebar">
      <div className="brand">🧁 Sweet Admin</div>
      <ul>
        {items.map(it => (
          <li key={it.id} className={active === it.id ? "active" : ""} onClick={() => onChange(it.id)}>
            {it.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
