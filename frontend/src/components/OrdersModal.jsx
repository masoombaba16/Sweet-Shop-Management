import "../styles/cart.css";

export default function OrdersModal({ orders, onClose }) {
  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div
        className="cart-modal"
        onClick={e => e.stopPropagation()}
        style={{ width: 800 }}
      >
        <h2>📦 My Orders</h2>

        <div
          style={{
            maxHeight: "420px",
            overflowY: "auto",
            paddingRight: 6
          }}
        >
          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            orders
              .slice()
              .reverse()
              .map((order, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    border: "1px solid #000",
                    marginBottom: 24
                  }}
                >
                  <div
                    style={{
                      width: 160,
                      borderRight: "1px solid #000",
                      padding: 8,
                      fontSize: 13
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>
                      <strong>Ordered On:</strong>
                      <div>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <strong>Address:</strong>
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {order.address}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <table
                      border="1"
                      cellPadding="6"
                      cellSpacing="0"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 14
                      }}
                    >
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Cost / Kg</th>
                          <th>Quantity (grams)</th>
                          <th>Price</th>
                        </tr>
                      </thead>

                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td>{item.name}</td>
                            <td>₹ {item.pricePerKg}</td>
                            <td>{item.grams}</td>
                            <td>₹ {item.totalPrice}</td>
                          </tr>
                        ))}

                        <tr>
                          <td colSpan="3" style={{ textAlign: "right" }}>
                            <strong>Total :</strong>
                          </td>
                          <td>
                            <strong>₹ {order.subtotal} /-</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
          )}
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
