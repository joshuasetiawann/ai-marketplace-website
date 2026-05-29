import { test, expect } from "@playwright/test";

test("home shows trending catalog from the database", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Model Trending" })).toBeVisible();
  // A seeded house-catalog product should render on the landing page.
  await expect(page.getByText("Nexus Vision Pro").first()).toBeVisible();
});

test("explore lists products and search narrows results", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByText("Nexus Vision Pro").first()).toBeVisible();
  await expect(page.getByText("CodeWeaver X").first()).toBeVisible();

  await page.fill('input[placeholder*="Cari nama"]', "codeweaver");
  await expect(page.getByText("CodeWeaver X").first()).toBeVisible();
  await expect(page.getByText("Nexus Vision Pro")).toHaveCount(0);
});

test("category link from home filters explore", async ({ page }) => {
  await page.goto("/explore?cat=code");
  await expect(page.getByText("CodeWeaver X").first()).toBeVisible();
});
