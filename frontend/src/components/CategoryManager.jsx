// frontend/src/components/CategoryManager.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function CategoryManager(){
  const [cats, setCats] = useState([]);
  const [name, setName] = useState("");

  async function load(){ setCats(await api.listCategories()); }

  useEffect(()=>{ load(); },[]);

  async function add(e){ e.preventDefault(); await api.createCategory({ name }); setName(""); load(); }
  async function del(id){ if(!confirm("Delete?")) return; await api.deleteCategory(id); load(); }

  return (
    <div>
      <h2>Categories</h2>
      <form onSubmit={add}>
        <input placeholder="Category name" value={name} onChange={e=>setName(e.target.value)} required />
        <button>Add</button>
      </form>
      <ul>
        {cats.map(c => <li key={c._id}>{c.name} <button onClick={()=>del(c._id)}>Delete</button></li>)}
      </ul>
    </div>
  );
}
