// lib/api.ts — Full API service (Production Ready)

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ───────────────────────────────
   CORE REQUEST WRAPPER
─────────────────────────────── */
export const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return Promise.reject(data);
  }

  return data;
};

/* ───────────────────────────────
   AUTH
─────────────────────────────── */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "buyer" | "artist" = "buyer"
) => {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const loginUser = async (email: string, password: string) => {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export const getMyProfile = async () => request("/api/auth/me");

/* ───────────────────────────────
   ARTWORKS
─────────────────────────────── */
export interface ArtworkFilters {
  category?: string;
  subcategory?: string;
  medium?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const getArtworks = async (filters: ArtworkFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "")
      params.append(k, String(v));
  });

  return request(`/api/artworks?${params.toString()}`);
};

export const getArtwork = async (id: string) =>
  request(`/api/artworks/${id}`);

export const toggleLike = async (id: string) =>
  request(`/api/artworks/${id}/like`, { method: "POST" });

export const deleteArtwork = async (id: string) =>
  request(`/api/artworks/${id}`, { method: "DELETE" });

export const createArtwork = async (formData: FormData) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(`${API_URL}/api/artworks`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Upload failed");
  }

  return data;
};

/* ───────────────────────────────
   CART
─────────────────────────────── */
export const getCart = async () => {
  return request("/api/cart");
};

export const addToCart = async (artworkId: string) => {
  return request(`/api/cart/${artworkId}`, {
    method: "POST",
  });
};

export const removeCartItem = async (artworkId: string) => {
  return request(`/api/cart/${artworkId}`, {
    method: "DELETE",
  });
};

// ✅ Quantity update
export const updateCartQuantity = async (artworkId: string, quantity: number) => {
  return request(`/api/cart/${artworkId}/quantity`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
};

/* ───────────────────────────────
   ORDERS
─────────────────────────────── */
export interface OrderPayload {
  address: string;
  paymentMethod: "cod" | "jazzcash" | "easypaisa" | "bank";
  paymentDetails?: {
    senderNumber?: string;
    transactionId?: string;
    accountName?: string;
  };
}

export const placeOrder = async (payload: OrderPayload) =>
  request("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMyOrders = async () => request("/api/orders");

export const getOrder = async (id: string) =>
  request(`/api/orders/${id}`);

/* ───────────────────────────────
   ARTISTS
─────────────────────────────── */
export const getArtists = async () => request("/api/artists");

export const getArtist = async (id: string) =>
  request(`/api/artists/${id}`);

export const getArtistDashboard = async () =>
  request("/api/artists/dashboard");

/* ───────────────────────────────
   PROFILE
─────────────────────────────── */
export interface ProfilePayload {
  name?: string;
  bio?: string;
  phone?: string;
  location?: string;
  photoURL?: string;
}

export const getUserProfile = async () =>
  request("/api/users/profile");

export const updateProfile = async (data: FormData) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "Update failed");
  return result;
};
