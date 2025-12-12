// frontend/src/components/Customers.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Customers(){
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  async function load(){ setCustomers(await api.listCustomers(q)); }

  useEffect(()=>{ load(); },[]);

  async function deactivate(id){ await api.deactivateCustomer(id); load(); }
  async function ban(id){ await api.banCustomer(id); load(); }

  return (
    <div>
      <h2>Customers</h2>
      <div>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Search</button>
      </div>
      <table className="product-table">
        <thead><tr><th>Email</th><th>Name</th><th>Active</th><th>Banned</th><th>Actions</th></tr></thead>
        <tbody>
          {customers.map(c => (
            <tr key={c._id}>
              <td>{c.email}</td>
              <td>{c.name}</td>
              <td>{c.active ? "Yes" : "No"}</td>
              <td>{c.banned ? "Yes" : "No"}</td>
              <td>
                <button onClick={()=>deactivate(c._id)}>Deactivate</button>
                <button onClick={()=>ban(c._id)} style={{marginLeft:6}}>Ban</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
