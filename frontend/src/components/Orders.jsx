// frontend/src/components/Orders.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Orders(){
  const [orders, setOrders] = useState([]);
  async function load(){ setOrders(await api.listOrders()); }
  useEffect(()=>{ load(); },[]);

  async function setStatus(id){
    const status = prompt("New status (CONFIRMED,PREPARING,READY,OUT_FOR_DELIVERY,DELIVERED,CANCELLED)", "CONFIRMED");
    if (!status) return;
    await api.updateOrderStatus(id, status);
    load();
  }

  return (
    <div>
      <h2>Orders</h2>
      <table className="product-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{o.customer?.email || "Guest"}</td>
              <td>{o.items.map(i=> `${i.name} x${i.quantity}`).join(", ")}</td>
              <td>${o.total?.toFixed(2)}</td>
              <td>{o.status}</td>
              <td><button onClick={()=>setStatus(o._id)}>Update</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
