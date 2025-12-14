import React, { useEffect, useState } from "react";
import '../styles/AllOrders.css';
export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/orders/all-users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>No orders found</p>;

  return (
    <div className="orders-admin">
      <h2 id="allorders">All Orders</h2>

      {orders.map((order, idx) => (
        <div className="order-card" key={idx}>
          <div className="order-header">
            <span><b>{order.orderId}</b></span>
            <span>
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          <p>
            <b>User:</b> {order.userName} ({order.userEmail})
          </p>

          <p>
            <b>Address:</b> {order.address}
          </p>

          <table className="order-items">
            <thead>
              <tr>
                <th>Sweet</th>
                <th>Qty (g)</th>
                <th>Price / Kg</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.grams}</td>
                  <td>₹ {item.pricePerKg}</td>
                  <td>₹ {item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="order-subtotal">
            Subtotal: ₹ {order.subtotal}
          </div>
        </div>
      ))}
    </div>
  );
}
