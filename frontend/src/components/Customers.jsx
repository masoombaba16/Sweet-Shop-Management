import React, { useEffect, useState } from "react";
import "../styles/Customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/customers`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch customers");
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <p>Loading customers...</p>;

  return (
    <div className="customers-admin">
      <div className="customers-header">
        <h2>Customers</h2>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
