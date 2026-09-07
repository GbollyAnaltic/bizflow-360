export type DashboardSummary = {
  revenueToday: number;
  ordersToday: number;
  activeProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  quantityInStock: number;
  reorderLevel: number;
  isActive: boolean;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: "Pending" | "Paid" | "Processing" | "Ready" | "Completed" | "Cancelled";
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  customer: { id: string; name: string; email: string };
};

export type CreateProduct = {
  name: string;
  sku: string;
  description?: string;
  price: number;
  initialStock: number;
  reorderLevel: number;
};

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.title || problem?.message || `Request failed with status ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  dashboard: () => request<DashboardSummary>("/api/dashboard/summary"),
  orders: (search = "") => request<Order[]>(`/api/orders${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  lowStock: () => request<Product[]>("/api/products?lowStock=true"),
  createProduct: (product: CreateProduct) => request<Product>("/api/products", { method: "POST", body: JSON.stringify(product) }),
};
