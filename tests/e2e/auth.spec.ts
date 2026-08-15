import { test, expect } from "@playwright/test";

// Landing page depends on the project's confirmation setting: straight to the
// dashboard when signup returns a session (local default), otherwise the
// "check your email" screen. Both are a successful registration.
test("register a new account leaves the form for a signed-up state", async ({ page }) => {
  await page.goto("/register");
  await page.fill("input[name=name]", "Tester");
  await page.fill("input[name=email]", `t${Date.now()}@nexora.ai`);
  await page.fill("input[name=password]", "Demo1234!");
  await page.click('button:has-text("Daftar")');
  await expect(page).toHaveURL(/\/(dashboard|verify-email)/);
});

test("guard: visiting /dashboard while logged out redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("login with the demo account reaches the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill("input[name=email]", "user@nexora.ai");
  await page.fill("input[name=password]", "Demo1234!");
  await page.click('button:has-text("Masuk")');
  await expect(page.getByText("Halo,")).toBeVisible();
});

test("forgot password shows the sent confirmation", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.fill("input[name=email]", "user@nexora.ai");
  await page.click('button:has-text("Kirim tautan reset")');
  await expect(page.getByText("Tautan reset sudah dikirim")).toBeVisible();
});
