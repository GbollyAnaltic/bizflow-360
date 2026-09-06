import { expect, test } from "@playwright/test";

test.describe("BizFlow 360 dashboard", () => {
  test.beforeEach(async ({ page }) => {
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
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page.getByText("249", { exact: true })).toBeVisible();
  });
});
