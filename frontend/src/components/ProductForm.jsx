// frontend/src/components/ProductForm.jsx
import React, { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/product.css";

export default function ProductForm({ onCreated }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(()=>{});
  }, []);

  async function uploadImage() {
    if (!image) return null;
    const fd = new FormData();
    fd.append("image", image);
    const res = await api.uploadImage(fd);
    return res.imageUrl;
  }

  async function submit(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const imageUrl = await uploadImage();
      const payload = {
        name, category, description,
        price: Number(price), cost: Number(cost || 0),
        quantity: Number(quantity), tags: tags.split(",").map(t=>t.trim()).filter(Boolean),
        imageUrl
      };
      await api.createSweet(payload);
      alert("Created");
      setName(""); setCategory(""); setPrice(""); setCost(""); setQuantity(0); setDescription(""); setTags(""); setImage(null);
      if (onCreated) onCreated();
      window.dispatchEvent(new Event("refresh-products"));
    } catch (err) {
      alert(err?.data?.message || "Error");
    } finally { setLoading(false); }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <h3>Add new sweet</h3>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="">-- Category --</option>
        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
      </select>
      <input placeholder="Price" type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required />
      <input placeholder="Cost (optional)" type="number" step="0.01" value={cost} onChange={e=>setCost(e.target.value)} />
      <input placeholder="Quantity" type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} />
      <input placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <div>
        <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Sweet"}</button>
      </div>
    </form>
  );
}
