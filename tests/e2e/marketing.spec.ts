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
    // Click a new-patient scenario button
    const newPatientBtn = page.getByRole("button", { name: /new patient.*cleaning|new-cleaning/i }).first();
    await expect(newPatientBtn).toBeVisible({ timeout: 15000 });
    await newPatientBtn.click();
    // Click the Run scenario / play button
    const runBtn = page.getByRole("button", { name: /run|play|start/i }).first();
    await expect(runBtn).toBeVisible({ timeout: 15000 });
    await runBtn.click();
    // Check AI response appears
    await expect(page.getByText(/book|appointment|schedule|cleaning/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("emergency scenario runs and shows emergency language", async ({ page }) => {
    await page.goto("/demo");
    // Find and click an emergency scenario
    const emergencyBtn = page.getByRole("button", { name: /emergency|swelling/i }).first();
    await expect(emergencyBtn).toBeVisible({ timeout: 15000 });
    await emergencyBtn.click();
    const runBtn = page.getByRole("button", { name: /run|play|start/i }).first();
    await runBtn.click();
    // Emergency language should appear
    await expect(page.getByText(/emergency|urgent|severe|hospital|911|immediately/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("clinical scenario hands off to human", async ({ page }) => {
    await page.goto("/demo");
    const clinicalBtn = page.getByRole("button", { name: /clinical question/i }).first();
    await expect(clinicalBtn).toBeVisible({ timeout: 15000 });
    await clinicalBtn.click();
    const runBtn = page.getByRole("button", { name: /run|play|start/i }).first();
    await runBtn.click();
    // Handoff language should appear
    await expect(page.getByText(/hand off|human|team member|speak|person/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("generated inbox deep link works", async ({ page }) => {
    await page.goto("/demo");
    // Run a scenario first to generate a conversation
    const scenarioBtn = page.getByRole("button", { name: /new patient|whitening|reschedule/i }).first();
    await expect(scenarioBtn).toBeVisible({ timeout: 15000 });
    await scenarioBtn.click();
    const runBtn = page.getByRole("button", { name: /run|play|start/i }).first();
    await runBtn.click();
    // Wait for results and "Open in Inbox" link
    const inboxLink = page.getByRole("link", { name: /open in inbox/i }).first();
    await expect(inboxLink).toBeVisible({ timeout: 15000 });
    await inboxLink.click();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
  });

  test("refresh preserves generated conversation", async ({ page }) => {
    await page.goto("/demo");
    const scenarioBtn = page.getByRole("button", { name: /whitening|insurance|reschedule/i }).first();
    await expect(scenarioBtn).toBeVisible({ timeout: 15000 });
    await scenarioBtn.click();
    const runBtn = page.getByRole("button", { name: /run|play|start/i }).first();
    await runBtn.click();
    const inboxLink = page.getByRole("link", { name: /open in inbox/i }).first();
    await expect(inboxLink).toBeVisible({ timeout: 15000 });
    await inboxLink.click();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
    await page.reload();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
    // Conversation content should still be visible
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("legal footer routes resolve — Privacy and Terms", async ({ page }) => {
    // Check Privacy page
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(/privacy/i, { timeout: 15000 });
    // Check Terms page
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText(/terms/i, { timeout: 15000 });
  });
});
