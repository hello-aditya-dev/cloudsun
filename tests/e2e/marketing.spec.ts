import { test, expect } from "@playwright/test";

test.describe("Marketing and Demo", () => {
  test("dental hero renders with CloudSun branding", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toContainText(/schedule|front.desk|dental|CloudSun/i, { timeout: 15000 });
  });

  test("demo route opens and loads", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
  });

  test("new-patient scenario runs and shows AI response", async ({ page }) => {
    await page.goto("/demo");
    // Select the "New patient wants cleaning" scenario card
    const scenarioCard = page.getByText("New patient wants cleaning").first();
    await expect(scenarioCard).toBeVisible({ timeout: 15000 });
    await scenarioCard.click();
    // Click the "Run simulation" button
    const runBtn = page.getByRole("button", { name: /run simulation/i });
    await expect(runBtn).toBeVisible({ timeout: 15000 });
    await runBtn.click();
    // Check AI response appears (dental-related content)
    await expect(page.getByText(/book|appointment|schedule|cleaning|Lumen/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("emergency scenario runs and shows emergency language", async ({ page }) => {
    await page.goto("/demo");
    // Select the emergency scenario card
    const emergencyCard = page.getByText(/Emergency.*severe swelling/i).first();
    await expect(emergencyCard).toBeVisible({ timeout: 15000 });
    await emergencyCard.click();
    const runBtn = page.getByRole("button", { name: /run simulation/i });
    await runBtn.click();
    // Emergency language should appear
    await expect(page.getByText(/emergency|urgent|severe|hospital|immediately/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("clinical scenario hands off to human", async ({ page }) => {
    await page.goto("/demo");
    const clinicalCard = page.getByText("Clinical question").first();
    await expect(clinicalCard).toBeVisible({ timeout: 15000 });
    await clinicalCard.click();
    const runBtn = page.getByRole("button", { name: /run simulation/i });
    await runBtn.click();
    // Handoff language should appear
    await expect(page.getByText(/team member|speak|person|hand.*off/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("generated inbox deep link works", async ({ page }) => {
    await page.goto("/demo");
    // Select a scenario and run it
    const scenarioCard = page.getByText("New patient wants cleaning").first();
    await expect(scenarioCard).toBeVisible({ timeout: 15000 });
    await scenarioCard.click();
    const runBtn = page.getByRole("button", { name: /run simulation/i });
    await runBtn.click();
    // Wait for "Open in Inbox" link to appear
    const inboxLink = page.getByRole("link", { name: /open in inbox/i });
    await expect(inboxLink).toBeVisible({ timeout: 20000 });
    await inboxLink.click();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
  });

  test("refresh preserves generated conversation", async ({ page }) => {
    await page.goto("/demo");
    const scenarioCard = page.getByText("Whitening info").first();
    await expect(scenarioCard).toBeVisible({ timeout: 15000 });
    await scenarioCard.click();
    const runBtn = page.getByRole("button", { name: /run simulation/i });
    await runBtn.click();
    const inboxLink = page.getByRole("link", { name: /open in inbox/i });
    await expect(inboxLink).toBeVisible({ timeout: 20000 });
    await inboxLink.click();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
    // Refresh and verify URL and content preserved
    await page.reload();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("legal footer routes resolve — Privacy and Terms", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(/privacy/i, { timeout: 15000 });
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText(/terms/i, { timeout: 15000 });
  });
});
