import { test, expect } from "@playwright/test";

test.describe("AI Front Desk", () => {
  test("edit agent name updates the input value", async ({ page }) => {
    await page.goto("/app/ai-agent");
    // Find the agent name input and change it
    const nameInput = page.getByRole("textbox", { name: /name|agent name|front desk name/i }).first();
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.clear();
    await nameInput.fill("Lumen Dental Front Desk");
    // Value should be updated
    await expect(nameInput).toHaveValue(/Lumen Dental Front Desk/, { timeout: 15000 });
  });

  test("save draft shows Saved feedback", async ({ page }) => {
    await page.goto("/app/ai-agent");
    // Make a change first
    const nameInput = page.getByRole("textbox", { name: /name|agent name|front desk name/i }).first();
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.clear();
    await nameInput.fill("Updated Agent Name");
    // Click Save draft
    const saveBtn = page.getByRole("button", { name: /save draft/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click();
    // "Saved" feedback should appear
    await expect(page.getByText(/saved|✓/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("refresh preserves agent name after save", async ({ page }) => {
    await page.goto("/app/ai-agent");
    // Change and save
    const nameInput = page.getByRole("textbox", { name: /name|agent name|front desk name/i }).first();
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.clear();
    await nameInput.fill("Persistent Agent");
    const saveBtn = page.getByRole("button", { name: /save draft/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click();
    await expect(page.getByText(/saved|✓/i).first()).toBeVisible({ timeout: 15000 });
    // Reload
    await page.reload();
    // Agent name should be preserved
    const nameInputAfter = page.getByRole("textbox", { name: /name|agent name|front desk name/i }).first();
    await expect(nameInputAfter).toHaveValue(/Persistent Agent/, { timeout: 15000 });
  });

  test("publish shows published timestamp", async ({ page }) => {
    await page.goto("/app/ai-agent");
    // Click Publish button
    const publishBtn = page.getByRole("button", { name: /publish/i }).first();
    await expect(publishBtn).toBeVisible({ timeout: 15000 });
    await publishBtn.click();
    // Published indicator should appear
    await expect(page.getByText(/published|last published/i).first()).toBeVisible({ timeout: 15000 });
  });
});
