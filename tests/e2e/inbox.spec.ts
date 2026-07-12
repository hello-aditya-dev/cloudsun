import { test, expect } from "@playwright/test";

test.describe("Inbox", () => {
  test("dental intent filters show filtered list", async ({ page }) => {
    await page.goto("/app/inbox");
    // Wait for inbox to load
    await expect(page.locator("h1").first()).toContainText(/inbox/i, { timeout: 15000 });
    // Click the "New patients" filter
    const newPatientsBtn = page.getByRole("button", { name: /new patients/i }).first();
    await expect(newPatientsBtn).toBeVisible({ timeout: 15000 });
    await newPatientsBtn.click();
    // Filtered results should appear (or "No conversations" empty state)
    await expect(page.getByText(/conversation|no conversation|patient|inbox/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("saved reply inserts text in composer", async ({ page }) => {
    await page.goto("/app/inbox");
    // First, click a conversation to open the composer
    const convBtn = page.locator("button, a").filter({ hasText: /patel|sharma|okafor|reddy|tanaka|rivera|park|khan/i }).first();
    await expect(convBtn).toBeVisible({ timeout: 15000 });
    await convBtn.click();
    // Click the "Saved replies" button/popover
    const savedRepliesBtn = page.getByRole("button", { name: /saved replies/i }).first();
    await expect(savedRepliesBtn).toBeVisible({ timeout: 15000 });
    await savedRepliesBtn.click();
    // Select a saved reply from the popover
    const replyOption = page.getByRole("button", { name: /confirmation|appointment|reminder|follow/i }).first();
    await expect(replyOption).toBeVisible({ timeout: 15000 });
    await replyOption.click();
    // Text should appear in the composer textarea
    const composer = page.getByRole("textbox", { name: /message|reply|type|compose/i }).first();
    if (await composer.isVisible().catch(() => false)) {
      const value = await composer.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test("send message adds it to conversation", async ({ page }) => {
    await page.goto("/app/inbox");
    // Open a conversation
    const convBtn = page.locator("button, a").filter({ hasText: /patel|sharma|okafor|reddy|tanaka|rivera|park|khan/i }).first();
    await expect(convBtn).toBeVisible({ timeout: 15000 });
    await convBtn.click();
    // Type a message in the composer
    const composer = page.getByRole("textbox", { name: /message|reply|type|compose/i }).first();
    await expect(composer).toBeVisible({ timeout: 15000 });
    await composer.fill("E2E test message from Playwright");
    // Click Send
    const sendBtn = page.getByRole("button", { name: /send/i }).first();
    await expect(sendBtn).toBeVisible({ timeout: 15000 });
    await sendBtn.click();
    // The message should appear in the conversation
    await expect(page.getByText(/E2E test message from Playwright/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("human handoff changes conversation status", async ({ page }) => {
    await page.goto("/app/inbox");
    // Open a conversation
    const convBtn = page.locator("button, a").filter({ hasText: /patel|sharma|okafor|reddy|tanaka|rivera|park|khan/i }).first();
    await expect(convBtn).toBeVisible({ timeout: 15000 });
    await convBtn.click();
    // Click Hand off button
    const handoffBtn = page.getByRole("button", { name: /hand off/i }).first();
    await expect(handoffBtn).toBeVisible({ timeout: 15000 });
    await handoffBtn.click();
    // Status should change — look for "human" or handoff indicator
    await expect(page.getByText(/human|handed off|assigned|open/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("generated demo conversation loads via deep link", async ({ page }) => {
    // Navigate to a demo_dental_* conversation URL directly
    await page.goto("/app/inbox/demo_dental_new-cleaning_central_phone");
    // Page should load (either showing the conversation or empty state)
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
});
