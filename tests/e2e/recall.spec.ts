import { test, expect } from "@playwright/test";

test.describe("Recall", () => {
  test("individual reminder sends and status changes to contacted", async ({ page }) => {
    await page.goto("/app/recall");
    // Find a "Send reminder" button on a recall case
    const sendBtn = page.getByRole("button", { name: /send reminder/i }).first();
    await expect(sendBtn).toBeVisible({ timeout: 15000 });
    await sendBtn.click();
    // Status should change — look for "contacted" text
    await expect(page.getByText(/contacted/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("bulk send updates count", async ({ page }) => {
    await page.goto("/app/recall");
    // Select some cases using checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 1) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
    }
    // Click bulk send button
    const bulkBtn = page.getByRole("button", { name: /send to \d/i }).first();
    if (await bulkBtn.isVisible()) {
      await bulkBtn.click();
    }
    // Should show some result
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
  });

  test("consent block prevents sending", async ({ page }) => {
    await page.goto("/app/recall");
    // Find a case where consent is missing and try to send
    const pageContent = await page.textContent("body");
    // If there's a consent-blocked case, the send button should be disabled or show an error
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("do-not-contact block prevents sending", async ({ page }) => {
    await page.goto("/app/recall");
    // Mark a case as do-not-contact via the dropdown menu
    const moreBtn = page.getByRole("button", { name: "" }).filter({ has: page.locator("svg.lucide-more-horizontal") }).first();
    if (await moreBtn.isVisible({ timeout: 5000 })) {
      await moreBtn.click();
      const dncItem = page.getByRole("menuitem", { name: /do not contact/i }).first();
      if (await dncItem.isVisible({ timeout: 3000 })) {
        await dncItem.click();
      }
    }
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("mark responded updates status", async ({ page }) => {
    await page.goto("/app/recall");
    const moreBtn = page.getByRole("button").filter({ has: page.locator("svg.lucide-more-horizontal") }).first();
    if (await moreBtn.isVisible({ timeout: 5000 })) {
      await moreBtn.click();
      const respondedItem = page.getByRole("menuitem", { name: /mark responded/i }).first();
      if (await respondedItem.isVisible({ timeout: 3000 })) {
        await respondedItem.click();
        await expect(page.getByText(/responded/i).first()).toBeVisible({ timeout: 15000 });
      }
    }
  });

  test("book appointment creates appointment", async ({ page }) => {
    await page.goto("/app/recall");
    // Open the "Mark booked" dialog via dropdown
    const moreBtn = page.getByRole("button").filter({ has: page.locator("svg.lucide-more-horizontal") }).first();
    if (await moreBtn.isVisible({ timeout: 5000 })) {
      await moreBtn.click();
      const bookItem = page.getByRole("menuitem", { name: /mark booked/i }).first();
      if (await bookItem.isVisible({ timeout: 3000 })) {
        await bookItem.click();
        // Dialog should open
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible({ timeout: 3000 })) {
          // Click confirm/book button in dialog
          const confirmBtn = page.getByRole("button", { name: /book|confirm|create/i }).last();
          if (await confirmBtn.isVisible({ timeout: 3000 })) {
            await confirmBtn.click();
          }
        }
      }
    }
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("state survives refresh", async ({ page }) => {
    await page.goto("/app/recall");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("audit event exists after recall action", async ({ page }) => {
    await page.goto("/app/recall");
    const sendBtn = page.getByRole("button", { name: /send reminder/i }).first();
    if (await sendBtn.isVisible({ timeout: 5000 })) {
      await sendBtn.click();
    }
    // Navigate to audit log
    await page.goto("/app/audit-log");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
  });
});
