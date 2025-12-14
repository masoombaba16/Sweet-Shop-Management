import React, { useState } from "react";

export default function ProductCard({ sweet, onUpdateStock }) {
  const [qty, setQty] = useState("");

  // 🔽 NEW STATE (ADDED)
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    name: sweet.name,
    price: sweet.price,
    quantity: sweet.quantity,
    description: sweet.description,
    category: sweet.category,
    tags: sweet.tags.join(", ")
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(
    `http://localhost:4000${sweet.imageUrl}`
  );

  /* ================= INVENTORY UPDATE (UNCHANGED) ================= */

  const handleUpdate = async () => {
    if (qty === "" || isNaN(qty)) {
      alert("Please enter a valid quantity in KG");
      return;
    }

    const delta = Number(qty);

    try {
      const res = await onUpdateStock(sweet._id, delta);

      if (!res || !res.ok) {
        throw new Error("Update failed");
      }

      alert(
        `Inventory Updated Successfully!\n\n` +
        `Sweet: ${sweet.name}\n` +
        `Change: ${delta > 0 ? "+" : ""}${delta} kg`
      );

      setQty("");
    } catch (err) {
      alert("❌ Failed to update inventory. Please try again.");
      console.error(err);
    }
  };

  /* ================= EDIT SWEET (NEW) ================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };
const handleEditSave = async () => {
  if (
    !form.name ||
    !form.price ||
    !form.quantity ||
    !form.description ||
    !preview
  ) {
    alert("All fields and image are required");
    return;
  }

  const token = localStorage.getItem("token"); // 🔥 REQUIRED

  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("price", form.price);
  fd.append("quantity", form.quantity);
  fd.append("description", form.description);
  fd.append("category", form.category);
  fd.append("tags", form.tags);

  if (imageFile) {
    fd.append("image", imageFile);
  }

  try {
    const res = await fetch(
  `http://localhost:4000/api/sweets/product/${sweet._id}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: fd
  }
);


    if (!res.ok) {
      if (res.status === 401) {
        alert("Session expired. Please login again.");
      }
      throw new Error("Edit failed");
    }

    alert("Sweet details updated successfully");
    setShowEdit(false);
  } catch (err) {
    console.error(err);
    alert("❌ Failed to update sweet");
  }
};

  return (
    <>
      {/* ================= EXISTING CARD (UNCHANGED) ================= */}
      <div className="sweet-card">
        <img
  className="sweet-img"
  src={`http://localhost:4000${sweet.imageUrl}?t=${Date.now()}`}
  alt={sweet.name}
  onError={(e) => (e.target.src = "/placeholder.png")}
/>


        <div className="sweet-body">
          <h3>{sweet.name} (#{sweet.sweetId})</h3>

          <p className="price">₹ {sweet.price} / kg</p>

          <p className="stock">
            Available: <b>{sweet.quantity} kg</b>
          </p>

          {sweet.quantity <= sweet.lowStockThreshold && (
            <span className="low-stock">Low Stock</span>
          )}

          <span className="tag">{sweet.category}</span>
          <p className="desc">{sweet.description}</p>

          <div className="tags">
            {sweet.tags.map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>

          <div className="inventory-box">
            <input
              type="number"
              step="0.5"
              placeholder="Update (kg)"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button onClick={handleUpdate}>
              Update
            </button>
          </div>

          {/* 🔽 EXISTING BUTTON — NOW OPENS MODAL */}
          <button className="edit-btn" onClick={() => setShowEdit(true)}>
            ✏️ Edit Sweet
          </button>
        </div>
      </div>

      {/* ================= EDIT MODAL (NEW) ================= */}
{showEdit && (
  <div
    className="modal-backdrop"
    onClick={() => setShowEdit(false)}
  >
    <div
      className="modal modal-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="modal-title">Edit Sweet</h2>

      {/* Image Preview */}
      <div className="image-preview">
        <img src={preview} alt="Preview" />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Change Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="form-group">
          <label>Sweet Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Price per KG (₹)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Quantity (kg)</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div className="form-group full">
          <label>Description</label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div className="form-group full">
          <label>Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={() => setShowEdit(false)}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleEditSave}>
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
