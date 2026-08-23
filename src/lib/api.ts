export type ProductInput = {
  sku: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  subcategory: string;
  images: string[];
  tags: string[];
  variants: Record<string, string>[];
  stock: number;
  featured: boolean;
  bestseller: boolean;
  active: boolean;
};
export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  category: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  stock: number;
  variants: { type: string; options: string[] }[];
  tags: string[];
  featured: boolean;
  bestseller: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};
export type CartItem = {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
};
export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
};
export type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingMethod: "standard" | "express";
  paymentMethod: "card" | "mobile" | "cod";
  customer: string;
  email: string;
  items: { productName: string; quantity: number; price: number }[];
};

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<{ user: AuthUser | null }>("/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (fullName: string, email: string, password: string) =>
    request<{ user: AuthUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  products: (params: URLSearchParams = new URLSearchParams()) =>
    request<Product[]>(`/products${params.size ? `?${params}` : ""}`),
  product: (id: string) =>
    request<Product & { reviews: Review[] }>(`/products/${id}`),
  createReview: (
    productId: string,
    payload: { rating: number; title: string; content: string },
  ) =>
    request<Review>(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createProduct: (payload: ProductInput) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProduct: (id: string, payload: Partial<ProductInput>) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  categories: () =>
    request<
      { id: string; name: string; slug: string; icon: string; count: number }[]
    >("/categories"),
  orders: () => request<Order[]>("/orders"),
  order: (id: string) => request<Order>(`/orders/${id}`),
  createOrder: (payload: unknown) =>
    request<{ id: string; orderNumber: string; total: number }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  cancelOrder: (id: string) =>
    request<{ id: string; orderNumber: string; status: Order["status"] }>(
      `/orders/${id}/cancel`,
      { method: "POST" },
    ),
  updateOrderStatus: (id: string, status: Order["status"]) =>
    request<{ id: string; orderNumber: string; status: Order["status"] }>(
      `/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    ),
  adminMetrics: () =>
    request<{
      summary: {
        orders: number;
        revenue: number;
        customers: number;
        products: number;
      };
      sales: { month: string; revenue: number; orders: number }[];
      topProducts: { name: string; sales: number; revenue: number }[];
    }>("/admin/metrics"),
};
