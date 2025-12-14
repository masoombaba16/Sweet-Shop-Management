// frontend/src/components/AdminSidebar.jsx
import React from "react";

export default function AdminSidebar({ active, onChange }) {
  const items = [
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "customers", label: "Customers" },
  ];
  return (
    <aside className="admin-sidebar">
      <div className="brand">Sweet Shop Admin</div>
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
