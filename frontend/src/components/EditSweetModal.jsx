import React, { useEffect, useState } from "react";

export default function EditSweetModal({ sweet, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    tags: "",
    category: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (sweet) {
      setForm({
        name: sweet.name,
        price: sweet.price,
        quantity: sweet.quantity,
        description: sweet.description,
        tags: sweet.tags.join(", "),
        category: sweet.category
      });

      setPreview(
        `${import.meta.env.VITE_SOCKET_URL}${sweet.imageUrl}`
      );
    }
  }, [sweet]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.quantity || !form.description) {
      alert("Please fill all required fields");
      return;
    }
    if (!preview) {
      alert("Image is required");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    onSave(sweet._id, fd);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit Sweet</h2>

        <img
          src={preview}
          alt="Preview"
          style={{ width: "100%", height: 180, objectFit: "cover" }}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        <input
          placeholder="Sweet Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price per KG"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />

        <input
          type="number"
          placeholder="Quantity (kg)"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save Changes</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
