import { test, expect } from "@playwright/test";

test("register a new account shows the email-verification screen", async ({ page }) => {
  await page.goto("/register");
  await page.fill("input[name=name]", "Tester");
  await page.fill("input[name=email]", `t${Date.now()}@nexora.ai`);
  await page.fill("input[name=password]", "Demo1234!");
  await page.click('button:has-text("Daftar")');
  await expect(page.getByText("Cek email kamu")).toBeVisible();
});
