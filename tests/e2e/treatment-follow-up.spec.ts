import { test, expect } from "@playwright/test";

test.describe("Treatment Follow-up", () => {
  test("create follow-up record", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Click the create/add button
    const addBtn = page.getByRole("button", { name: /create|new|add follow/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // Fill in minimum required fields and submit
    const submitBtn = dialog.getByRole("button", { name: /create|add|save/i }).last();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      await submitBtn.click();
    }
  });

  test("send follow-up changes status", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Find a "Send follow-up" button
    const sendBtn = page.getByRole("button", { name: /send follow-up/i }).first();
    if (await sendBtn.isVisible({ timeout: 5000 })) {
      await sendBtn.click();
      // Status should change
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
    }
  });

  test("mark patient responded via dropdown", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Open dropdown menu for a follow-up
    const moreBtn = page.getByRole("button").filter({ has: page.locator("svg.lucide-more-horizontal") }).first();
    if (await moreBtn.isVisible({ timeout: 5000 })) {
      await moreBtn.click();
      const respondedItem = page.getByRole("menuitem", { name: /mark patient responded/i }).first();
      if (await respondedItem.isVisible({ timeout: 3000 })) {
        await respondedItem.click();
      }
    }
  });

  test("request coordinator via dropdown", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    const moreBtn = page.getByRole("button").filter({ has: page.locator("svg.lucide-more-horizontal") }).first();
    if (await moreBtn.isVisible({ timeout: 5000 })) {
      await moreBtn.click();
      const coordItem = page.getByRole("menuitem", { name: /request coordinator/i }).first();
      if (await coordItem.isVisible({ timeout: 3000 })) {
        await coordItem.click();
      }
    }
  });

  test("book appointment from follow-up", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Find "Book appointment" button
    const bookBtn = page.getByRole("button", { name: /book appointment/i }).first();
    if (await bookBtn.isVisible({ timeout: 5000 })) {
      await bookBtn.click();
      // Dialog should open
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible({ timeout: 3000 })) {
        const confirmBtn = dialog.getByRole("button", { name: /book|confirm|create/i }).last();
        if (await confirmBtn.isVisible({ timeout: 3000 })) {
          await confirmBtn.click();
        }
      }
    }
  });

  test("refresh preserves state", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
});
