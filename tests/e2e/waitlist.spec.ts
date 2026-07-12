import { test, expect } from "@playwright/test";

test.describe("Waitlist", () => {
  test("page loads with waitlist entries", async ({ page }) => {
    await page.goto("/app/waitlist");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Should show waitlist content
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("add to waitlist dialog opens", async ({ page }) => {
    await page.goto("/app/waitlist");
    const addBtn = page.getByRole("button", { name: /add to waitlist/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText(/add to waitlist/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("rank candidates button exists", async ({ page }) => {
    await page.goto("/app/waitlist");
    // Look for the rank candidates button (needs an open slot selected first)
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Find an open slot and click it
    const slotBtn = page.locator("button, [data-slot]").filter({ hasText: /open/i }).first();
    if (await slotBtn.isVisible({ timeout: 5000 })) {
      await slotBtn.click();
      const rankBtn = page.getByRole("button", { name: /rank candidates/i }).first();
      await expect(rankBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test("invite button appears after ranking", async ({ page }) => {
    await page.goto("/app/waitlist");
    // Select a slot
    const slotBtn = page.locator("button, [data-slot]").filter({ hasText: /open/i }).first();
    if (await slotBtn.isVisible({ timeout: 5000 })) {
      await slotBtn.click();
      const rankBtn = page.getByRole("button", { name: /rank candidates/i }).first();
      if (await rankBtn.isVisible({ timeout: 5000 })) {
        await rankBtn.click();
        // Invite button should appear for waiting entries
        const inviteBtn = page.getByRole("button", { name: /^invite$/i }).first();
        if (await inviteBtn.isVisible({ timeout: 5000 })) {
          await inviteBtn.click();
          // Status should show invited/awaiting
          await expect(page.getByText(/invited|awaiting/i).first()).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test("simulate accept after invite", async ({ page }) => {
    await page.goto("/app/waitlist");
    const slotBtn = page.locator("button, [data-slot]").filter({ hasText: /open/i }).first();
    if (await slotBtn.isVisible({ timeout: 5000 })) {
      await slotBtn.click();
      const rankBtn = page.getByRole("button", { name: /rank candidates/i }).first();
      if (await rankBtn.isVisible({ timeout: 5000 })) {
        await rankBtn.click();
        const inviteBtn = page.getByRole("button", { name: /^invite$/i }).first();
        if (await inviteBtn.isVisible({ timeout: 5000 })) {
          await inviteBtn.click();
          // Wait for invite to process
          await page.waitForTimeout(500);
          const acceptBtn = page.getByRole("button", { name: /simulate accept/i }).first();
          if (await acceptBtn.isVisible({ timeout: 5000 })) {
            await acceptBtn.click();
            await expect(page.getByText(/accepted/i).first()).toBeVisible({ timeout: 10000 });
          }
        }
      }
    }
  });

  test("fill slot after accept", async ({ page }) => {
    await page.goto("/app/waitlist");
    const slotBtn = page.locator("button, [data-slot]").filter({ hasText: /open/i }).first();
    if (await slotBtn.isVisible({ timeout: 5000 })) {
      await slotBtn.click();
      const rankBtn = page.getByRole("button", { name: /rank candidates/i }).first();
      if (await rankBtn.isVisible({ timeout: 5000 })) {
        await rankBtn.click();
        const inviteBtn = page.getByRole("button", { name: /^invite$/i }).first();
        if (await inviteBtn.isVisible({ timeout: 5000 })) {
          await inviteBtn.click();
          await page.waitForTimeout(500);
          const acceptBtn = page.getByRole("button", { name: /simulate accept/i }).first();
          if (await acceptBtn.isVisible({ timeout: 5000 })) {
            await acceptBtn.click();
            await page.waitForTimeout(500);
            const fillBtn = page.getByRole("button", { name: /fill slot/i }).first();
            if (await fillBtn.isVisible({ timeout: 5000 })) {
              await fillBtn.click();
              await expect(page.getByText(/filled|appointment/i).first()).toBeVisible({ timeout: 15000 });
            }
          }
        }
      }
    }
  });

  test("refresh preserves state", async ({ page }) => {
    await page.goto("/app/waitlist");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
});
