import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";

afterEach(() => vi.unstubAllGlobals());

describe("commerce API client", () => {
  it("returns the server-generated order number after checkout succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "order-1",
            orderNumber: "SHN-ABC12345",
            total: 84.95,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const order = await api.createOrder({
      customerName: "Ada Lovelace",
      email: "ada@example.com",
      shippingAddress: { address: "1 Analytical Way" },
      items: [],
    });
    expect(order.orderNumber).toBe("SHN-ABC12345");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/orders"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("uses the admin CRUD endpoints for product mutations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "p1", name: "New product" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "p1", name: "Updated product" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const input = {
      sku: "SKU-1",
      name: "New product",
      description: "A sufficiently detailed product description",
      price: 10,
      categoryId: "00000000-0000-0000-0000-000000000001",
      subcategory: "General",
      images: [],
      tags: [],
      variants: [],
      stock: 5,
      featured: false,
      bestseller: false,
      active: true,
    };
    await api.createProduct(input);
    await api.updateProduct("p1", { name: "Updated product" });
    await api.deleteProduct("p1");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/products"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/products/p1"),
      expect.objectContaining({ method: "PUT" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/products/p1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("uses order-management mutation endpoints for cancellation and status updates", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "o1",
            orderNumber: "SHN-1",
            status: "cancelled",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: "o1", orderNumber: "SHN-1", status: "shipped" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    await api.cancelOrder("o1");
    await api.updateOrderStatus("o1", "shipped");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/orders/o1/cancel"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/orders/o1/status"),
      expect.objectContaining({ method: "PATCH", credentials: "include" }),
    );
  });

  it("surfaces an API error instead of pretending checkout succeeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: "Insufficient stock" }), {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    );
    await expect(api.createOrder({})).rejects.toThrow("Insufficient stock");
  });
});
