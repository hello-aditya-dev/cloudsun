import { test, expect } from "@playwright/test";

test.describe("Navigation and responsive behaviour", () => {
  const sidebarRoutes = [
    { label: /inbox/i, path: "/app/inbox" },
    { label: /calls/i, path: "/app/calls" },
    { label: /patients/i, path: "/app/patients" },
    { label: /calendar/i, path: "/app/calendar" },
    { label: /recall/i, path: "/app/recall" },
    { label: /waitlist/i, path: "/app/waitlist" },
    { label: /treatment follow/i, path: "/app/treatment-follow-up" },
    { label: /ai front desk/i, path: "/app/ai-agent" },
    { label: /knowledge/i, path: "/app/knowledge" },
    { label: /automations/i, path: "/app/automations" },
    { label: /analytics/i, path: "/app/analytics" },
    { label: /team/i, path: "/app/team" },
    { label: /integrations/i, path: "/app/integrations" },
    { label: /settings/i, path: "/app/settings" },
    { label: /billing/i, path: "/app/billing" },
    { label: /audit/i, path: "/app/audit-log" },
  ];

  test("all sidebar routes load", async ({ page }) => {
    await page.goto("/app");
    for (const route of sidebarRoutes) {
      // Click each sidebar link
      const navLink = page.getByRole("link", { name: route.label }).first();
      await expect(navLink).toBeVisible({ timeout: 15000 });
      await navLink.click();
      await expect(page).toHaveURL(new RegExp(route.path.replace("/", "\\/")), { timeout: 15000 });
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    }
  });

  test("back and forward browser navigation works", async ({ page }) => {
    await page.goto("/app");
    await page.goto("/app/inbox");
    await page.goto("/app/calendar");
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/app\/inbox/, { timeout: 15000 });
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(/\/app$/, { timeout: 15000 });
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/app\/inbox/, { timeout: 15000 });
  });

  test("deep-route refresh loads correctly", async ({ page }) => {
    await page.goto("/app/inbox/cv_1");
    // Page should load (conversation or not-found)
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Refresh
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("demo reset functionality exists in Settings", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Look for reset button
    const resetBtn = page.getByRole("button", { name: /reset|demo/i }).first();
    await expect(resetBtn).toBeVisible({ timeout: 15000 });
  });

  test("no horizontal overflow at mobile width 430px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
    const page = await context.newPage();
    await page.goto("/app");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await context.close();
  });

  test("no horizontal overflow at mobile width 390px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/app");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await context.close();
  });

  test("no horizontal overflow at mobile width 360px", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 360, height: 780 } });
    const page = await context.newPage();
    await page.goto("/app");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await context.close();
  });

  test("pages render with reduced motion preference", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    await page.goto("/app");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await context.close();
  });
});
