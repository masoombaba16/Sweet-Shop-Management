// frontend/src/components/ProductList.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function ProductList() {
  const [sweets, setSweets] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  async function load() {
    const data = await api.getSweets();
    setSweets(data);
  }

  useEffect(() => {
    load();
    function onRefresh(){ setRefreshKey(k=>k+1); load(); }
    window.addEventListener("refresh-products", onRefresh);
    return () => window.removeEventListener("refresh-products", onRefresh);
  }, []);

  async function del(id) {
    if (!confirm("Delete?")) return;
    await api.deleteSweet(id);
    await load();
  }
  async function restock(id) {
    const q = Number(prompt("Restock qty", "10") || 0);
    if (!q) return;
    await api.restock(id, q);
    await load();
  }
  async function toggle(id) {
    await api.toggleVisible(id);
    await load();
  }

  return (
    <div>
      <h3>All sweets</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Tags</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sweets.map(s => (
            <tr key={s._id}>
             <td>{s.sweetId ?? (s._id ? s._id.slice(-6) : "")}</td>
              <td><b>{s.name}</b></td>
              <td>{s.category}</td>
              <td>${(s.price ?? 0).toFixed(2)}</td>
              <td>{s.quantity ?? 0}</td>
              <td>{(s.tags||[]).join(", ")}</td>
              <td>{s.visible ? "Yes" : "No"}</td>
              <td>
                <button onClick={()=>restock(s._id)}>Restock</button>
                <button onClick={()=>toggle(s._id)} style={{marginLeft:6}}>{s.visible ? "Disable" : "Enable"}</button>
                <button onClick={()=>del(s._id)} style={{marginLeft:6}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
