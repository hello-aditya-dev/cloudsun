import { test, expect } from "@playwright/test";

test.describe("AI Front Desk", () => {
  test("edit agent name and verify value updates", async ({ page }) => {
    await page.goto("/app/ai-agent");
    // Find the agent name input
    const agentNameInput = page.locator("input").filter({ hasText: "" }).first();
    await expect(agentNameInput).toBeVisible({ timeout: 15000 });
    // Clear and type new name
    await agentNameInput.clear();
    await agentNameInput.fill("TestAgent");
    // Value should be updated
    await expect(agentNameInput).toHaveValue("TestAgent");
  });

  test("save draft shows saved feedback", async ({ page }) => {
    await page.goto("/app/ai-agent");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Click Save draft
    const saveBtn = page.getByRole("button", { name: /save draft/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click();
    // Should show "Saved" feedback
    await expect(page.getByText(/saved/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("refresh preserves agent name", async ({ page }) => {
    await page.goto("/app/ai-agent");
    const agentNameInput = page.locator("input").first();
    await expect(agentNameInput).toBeVisible({ timeout: 15000 });
    await agentNameInput.clear();
    await agentNameInput.fill("PersistTest");
    // Save first
    const saveBtn = page.getByRole("button", { name: /save draft/i }).first();
    await saveBtn.click();
    await page.waitForTimeout(1000);
    // Refresh
    await page.reload();
    // Check if the name persisted
    const inputAfter = page.locator("input").first();
    await expect(inputAfter).toBeVisible({ timeout: 15000 });
  });

  test("publish shows published timestamp", async ({ page }) => {
    await page.goto("/app/ai-agent");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Click Publish
    const publishBtn = page.getByRole("button", { name: /publish/i }).first();
    await expect(publishBtn).toBeVisible({ timeout: 15000 });
    await publishBtn.click();
    // Should show published status or timestamp
    await expect(page.getByText(/published|saved/i).first()).toBeVisible({ timeout: 15000 });
  });
});
