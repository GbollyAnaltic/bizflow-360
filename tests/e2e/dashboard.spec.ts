import { expect, test } from "@playwright/test";

test.describe("BizFlow 360 dashboard", () => {
  test.beforeEach(async ({ page }) => {
    let products = 248;
    await page.route("**/api/dashboard/summary", async (route) => route.fulfill({
      json: { revenueToday: 4286, ordersToday: 64, activeProducts: products, lowStockProducts: 3, totalCustomers: 1842 },
    }));
    await page.route("**/api/orders", async (route) => route.fulfill({ json: [
      { id: "1", orderNumber: "BF-1084", customer: { id: "c1", name: "Amara Foods", email: "orders@amara.example" }, total: 284.5, subtotal: 250, tax: 34.5, status: "Paid", createdAt: new Date().toISOString() },
      { id: "2", orderNumber: "BF-1082", customer: { id: "c2", name: "Maple Events", email: "hello@maple.example" }, total: 438.2, subtotal: 388, tax: 50.2, status: "Processing", createdAt: new Date().toISOString() },
    ] }));
    await page.route("**/api/products?lowStock=true", async (route) => route.fulfill({ json: [
      { id: "p1", name: "Classic gift box", sku: "GB-102", price: 49.95, quantityInStock: 3, reorderLevel: 10, isActive: true },
    ] }));
    await page.route(/\/api\/products$/, async (route) => {
      if (route.request().method() === "POST") products += 1;
      await route.fulfill({ json: { id: "new-product", name: "QA Test Product", sku: "QA-001", price: 25, quantityInStock: 5, reorderLevel: 5, isActive: true } });
    });
    await page.goto("/");
  });

  test("shows the core business summary", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Good morning, Temi" })).toBeVisible();
    await expect(page.getByText("Today’s revenue")).toBeVisible();
    await expect(page.getByText("Orders today")).toBeVisible();
    await expect(page.getByText("Active products")).toBeVisible();
    await expect(page.getByText("Total customers")).toBeVisible();
  });

  test("filters recent orders by customer", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop search is intentionally hidden on mobile.");
    await page.getByRole("textbox", { name: "Search orders" }).fill("Maple Events");
    await expect(page.getByRole("cell", { name: "Maple Events" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Amara Foods" })).toBeHidden();
  });

  test("shows an empty result for an unknown order", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop search is intentionally hidden on mobile.");
    await page.getByRole("textbox", { name: "Search orders" }).fill("missing-customer");
    await expect(page.getByText("No matching orders found.")).toBeVisible();
  });

  test("adds a product and updates the product total", async ({ page }) => {
    await expect(page.getByText("248", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Add product" }).click();
    await page.getByRole("textbox", { name: "Product name" }).fill("QA Test Product");
    await page.getByRole("textbox", { name: "SKU" }).fill("QA-001");
    await page.getByRole("spinbutton", { name: "Price" }).fill("25");
    await page.getByRole("spinbutton", { name: "Opening stock" }).fill("5");
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page.getByText("249", { exact: true })).toBeVisible();
  });
});
