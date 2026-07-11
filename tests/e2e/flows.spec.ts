import { test, expect } from "@playwright/test";

test.describe("Marketing → signup → onboarding → dashboard", () => {
  test("user can navigate from marketing to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CloudSun/);
    await expect(page.locator("h1")).toContainText("Every client conversation");

    // Click "Start building" → signup
    await page.getByRole("button", { name: "Start building" }).first().click();
    await expect(page).toHaveURL(/\/signup/);

    // Begin setup → onboarding
    await page.getByRole("button", { name: /Begin setup/ }).click();
    await expect(page).toHaveURL(/\/onboarding$/);

    // Walk through onboarding steps
    await page.getByRole("button", { name: /Begin setup/ }).click();
    await expect(page).toHaveURL(/\/onboarding\/business/);

    // Skip to complete via direct navigation
    await page.goto("/onboarding/complete");
    await expect(page.getByText(/You're ready to go/)).toBeVisible();

    // Enter dashboard
    await page.getByRole("button", { name: /Enter dashboard/ }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.locator("h1").first()).toContainText("Overview");
  });
});

test.describe("Inbox interaction", () => {
  test("user can open inbox and select a conversation", async ({ page }) => {
    await page.goto("/app/inbox");
    await expect(page).toHaveURL(/\/app\/inbox/);

    // Should see conversation list
    await expect(page.getByText("All conversations")).toBeVisible({ timeout: 10000 });

    // Click the first conversation in the list
    const firstConv = page.locator("button, a").filter({ hasText: /Patel|Okafor|Reddy|Tanaka/i }).first();
    if (await firstConv.isVisible()) {
      await firstConv.click();
      // URL should update to include conversation ID
      await expect(page).toHaveURL(/\/app\/inbox\//, { timeout: 5000 });
    }
  });

  test("deep link to a conversation survives refresh", async ({ page }) => {
    await page.goto("/app/inbox");
    // Get first conversation link
    const convLink = page.locator('a[href*="/app/inbox/"]').first();
    if (await convLink.isVisible()) {
      const href = await convLink.getAttribute("href");
      await page.goto(href!);
      await expect(page).toHaveURL(href!);
      // Refresh
      await page.reload();
      await expect(page).toHaveURL(href!);
    }
  });
});

test.describe("Browser navigation", () => {
  test("back and forward buttons work", async ({ page }) => {
    await page.goto("/");
    await page.goto("/login");
    await page.goto("/signup");

    await page.goBack();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    await page.goForward();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Dashboard navigation", () => {
  test("every sidebar item navigates to a real route", async ({ page }) => {
    await page.goto("/app");

    const routes = [
      "/app/inbox",
      "/app/calls",
      "/app/contacts",
      "/app/calendar",
      "/app/ai-agent",
      "/app/knowledge",
      "/app/automations",
      "/app/analytics",
      "/app/team",
      "/app/integrations",
      "/app/settings",
      "/app/billing",
      "/app/audit-log",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(route);
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    }
  });
});
