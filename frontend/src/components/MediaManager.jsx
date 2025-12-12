// frontend/src/components/MediaManager.jsx
import React, { useState } from "react";
import { api } from "../api";

export default function MediaManager(){
  const [file, setFile] = useState(null);
  async function upload(e){
    e.preventDefault();
    if (!file) return alert("Pick file");
    const fd = new FormData();
    fd.append("image", file);
    const res = await api.uploadImage(fd);
    alert("Uploaded: " + res.imageUrl);
  }
  return (
    <div>
      <h2>Media</h2>
      <form onSubmit={upload}>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        <button>Upload</button>
      </form>
      <p>Uploaded images are served from <code>/uploads</code>.</p>
    </div>
  );
}
