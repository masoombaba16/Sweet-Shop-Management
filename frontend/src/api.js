// frontend/src/api.js

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

/* -----------------------------
   TOKEN HELPERS
------------------------------ */
function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function getUserFromToken() {
  const t = localStorage.getItem("token");
  if (!t) return null;
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
}

/* -----------------------------
   CORE FETCHER
------------------------------ */
async function fetcher(path, opts = {}) {
  const init = { ...opts };
  init.headers = init.headers || {};

  const body = init.body;
  const isFormData = body instanceof FormData;

  if (!isFormData && body !== undefined && body !== null) {
    init.headers["Content-Type"] =
      init.headers["Content-Type"] || "application/json";
  }

  const token = getToken();
  if (token) {
    init.headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data;
}

/* -----------------------------
   API METHODS
------------------------------ */
export const api = {
  /* -------- AUTH -------- */
  register: (body) =>
    fetcher("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    fetcher("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  forgotPassword: (email) =>
    fetcher("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data) =>
    fetcher("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProfile: (b) =>
    fetcher("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(b),
    }),

  /* -------- SWEETS / PRODUCTS -------- */
  getSweets: (q = "") =>
    fetcher(`/sweets${q ? "?" + q : ""}`),

  getSweet: (id) =>
    fetcher(`/sweets/${id}`),

  // 🔥 IMPORTANT: FETCH BY business sweetId (NUMBER)
getSweetBySweetId: (sweetId) =>
  fetcher(`/sweets/by-sweet-id/${sweetId}`),


  createSweet: (body) =>
    fetcher("/sweets", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateSweet: (id, body) =>
    fetcher(`/sweets/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteSweet: (id) =>
    fetcher(`/sweets/${id}`, {
      method: "DELETE",
    }),

  restock: (id, qty) =>
    fetcher(`/sweets/${id}/restock`, {
      method: "POST",
      body: JSON.stringify({ quantity: qty }),
    }),

  toggleVisible: (id) =>
    fetcher(`/sweets/${id}/toggle-visible`, {
      method: "POST",
    }),

  uploadImage: (formData) =>
    fetcher(`/sweets/upload-image`, {
      method: "POST",
      body: formData,
    }),

  /* -------- CART -------- */
  getCart: () => fetcher("/cart"),

  addToCart: (body) =>
    fetcher("/cart/add", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateCartItem: (body) =>
    fetcher("/cart/update", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  removeCartItem: (sweetId) =>
    fetcher(`/cart/remove/${sweetId}`, {
      method: "DELETE",
    }),

  getSweetBySweetId: (sweetId) =>
    fetcher(`/sweets/by-sweet-id/${sweetId}`),
  
  clearCart: () =>
    fetcher("/cart/clear", { method: "DELETE" }),

  /* -------- CATEGORIES -------- */
  listCategories: () =>
    fetcher("/categories"),

  createCategory: (body) =>
    fetcher("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateCategory: (id, body) =>
    fetcher(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteCategory: (id) =>
    fetcher(`/categories/${id}`, {
      method: "DELETE",
    }),

  /* -------- ORDERS -------- */
  listOrders: () =>
    fetcher("/orders"),

  getOrder: (id) =>
    fetcher(`/orders/${id}`),

  updateOrderStatus: (id, status) =>
    fetcher(`/orders/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  /* -------- CUSTOMERS -------- */
  listCustomers: (q = "") =>
    fetcher(`/customers${q ? "?q=" + encodeURIComponent(q) : ""}`),

  updateCustomer: (id, body) =>
    fetcher(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deactivateCustomer: (id) =>
    fetcher(`/customers/${id}/deactivate`, {
      method: "POST",
    }),

  banCustomer: (id) =>
    fetcher(`/customers/${id}/ban`, {
      method: "POST",
    }),
};
