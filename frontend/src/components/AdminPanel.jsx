import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [sweets, setSweets] = useState([]);

  async function load() {
    const data = await api.getSweets();
    setSweets(data);
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await api.createSweet({ name, category, price: Number(price), quantity: 0 });
      setName(""); setCategory(""); setPrice(0);
      await load();
    } catch (err) {
      alert(err?.data?.message || "Error");
    }
  }

  async function del(id) {
    if (!confirm("Delete?")) return;
    await api.deleteSweet(id);
    await load();
  }

  async function restock(id) {
    const q = Number(prompt("Restock amount", "10") || 0);
    if (q <= 0) return;
    await api.restock(id, q);
    await load();
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Admin Panel</h2>
      <form onSubmit={add} style={{ marginBottom: 12 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        <button type="submit">Add Sweet</button>
      </form>

      <h3>Existing sweets</h3>
      <ul>
        {sweets.map(s => (
          <li key={s._id} style={{ marginBottom: 6 }}>
            {s.name} - {s.quantity}
            <button onClick={() => restock(s._id)} style={{ marginLeft: 8 }}>Restock</button>
            <button onClick={() => del(s._id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
