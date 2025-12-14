import React, { useState } from "react";

export default function ProductForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    description: "",
    tags: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Image is required");
      return;
    }

    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("image", imageFile);

    try {
      const res = await fetch("http://localhost:4000/api/sweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: fd
      });

      if (!res.ok) throw new Error("Create failed");

      alert("Sweet added successfully");
      onCreated?.();

      // reset
      setForm({
        name: "",
        price: "",
        quantity: "",
        category: "",
        description: "",
        tags: ""
      });
      setImageFile(null);
      setPreview(null);

    } catch (err) {
      console.error(err);
      alert("Failed to add sweet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="sweet-form" onSubmit={handleSubmit}>
      {/* IMAGE PREVIEW */}
      <div className="image-upload">
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="image-placeholder">
            Select Image
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
      </div>

      <div className="form-grid">
        <input
          placeholder="Sweet Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Price per kg"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Quantity (kg)"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
          required
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          rows="3"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Sweet"}
      </button>
    </form>
  );
}
