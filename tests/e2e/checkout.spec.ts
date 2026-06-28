import { test, expect } from "@playwright/test";

// Full buy flow: login -> product -> buy now -> cart -> checkout -> pay -> confirmation.
test("a logged-in user can buy a product (simulated payment)", async ({ page }) => {
  // login
  await page.goto("/login");
  await page.fill("input[name=email]", "user@nexora.ai");
  await page.fill("input[name=password]", "Demo1234!");
  await page.click('button:has-text("Masuk")');
  await expect(page.getByText("Halo,")).toBeVisible();

  // open a product from explore
  await page.goto("/explore");
  await page.getByText("Nexus Vision Pro").first().click();
  await expect(page.getByRole("button", { name: /Beli Sekarang/ })).toBeVisible();

  // buy now -> cart
  await page.getByRole("button", { name: /Beli Sekarang/ }).click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByRole("link", { name: /Lanjut ke Pembayaran/ })).toBeVisible();

  // cart -> checkout
  await page.getByRole("link", { name: /Lanjut ke Pembayaran/ }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // agree + pay
  await page.getByTestId("agree-toggle").click();
  await page.getByRole("button", { name: /Bayar/ }).click();

  // order confirmation
  await expect(page.getByText("Pembayaran berhasil")).toBeVisible();
  await expect(page).toHaveURL(/\/orders\//);
});
