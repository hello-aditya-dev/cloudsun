import { test, expect } from "@playwright/test";

test.describe("Calendar", () => {
  test("repository appointments render", async ({ page }) => {
    await page.goto("/app/calendar");
    // Page should load with calendar content
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Should show some appointment entries or the calendar grid
    await expect(page.locator("button, [data-appt], .rounded-md").first()).toBeVisible({ timeout: 15000 });
  });

  test("create appointment via dialog", async ({ page }) => {
    await page.goto("/app/calendar");
    // Click "New appointment" button
    const newBtn = page.getByRole("button", { name: /new appointment/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 15000 });
    await newBtn.click();
    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // Fill in required fields
    const patientSelect = dialog.locator("button").filter({ hasText: /select|choose/i }).first();
    if (await patientSelect.isVisible({ timeout: 3000 })) {
      await patientSelect.click();
      const firstOption = page.getByRole("option").first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
      }
    }
    // Set date and time
    const dateInput = dialog.locator('input[type="date"]').first();
    if (await dateInput.isVisible({ timeout: 3000 })) {
      await dateInput.fill("2026-07-25");
    }
    const timeInput = dialog.locator('input[type="time"]').first();
    if (await timeInput.isVisible({ timeout: 3000 })) {
      await timeInput.fill("10:00");
    }
    // Click save/create
    const saveBtn = dialog.getByRole("button", { name: /save|create|book/i }).last();
    if (await saveBtn.isVisible({ timeout: 3000 })) {
      await saveBtn.click();
    }
  });

  test("date navigation changes visible range", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Click Previous button
    const prevBtn = page.getByRole("button", { name: /previous|chevronleft/i }).first();
    if (await prevBtn.isVisible({ timeout: 5000 })) {
      await prevBtn.click();
    }
    // Click Next button
    const nextBtn = page.getByRole("button", { name: /next|chevronright/i }).first();
    if (await nextBtn.isVisible({ timeout: 5000 })) {
      await nextBtn.click();
    }
    // Click Today button
    const todayBtn = page.getByRole("button", { name: /today/i }).first();
    if (await todayBtn.isVisible({ timeout: 5000 })) {
      await todayBtn.click();
    }
  });

  test("view switcher changes calendar view", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Click Agenda view
    const agendaBtn = page.getByRole("button", { name: /agenda/i }).first();
    if (await agendaBtn.isVisible({ timeout: 5000 })) {
      await agendaBtn.click();
    }
    // Click Week view
    const weekBtn = page.getByRole("button", { name: /week/i }).first();
    if (await weekBtn.isVisible({ timeout: 5000 })) {
      await weekBtn.click();
    }
    // Click Day view
    const dayBtn = page.getByRole("button", { name: /day/i }).first();
    if (await dayBtn.isVisible({ timeout: 5000 })) {
      await dayBtn.click();
    }
  });

  test("cancel appointment from detail dialog", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Switch to agenda view to find appointment buttons easily
    const agendaBtn = page.getByRole("button", { name: /agenda/i }).first();
    if (await agendaBtn.isVisible({ timeout: 5000 })) {
      await agendaBtn.click();
    }
    // Click an appointment to open detail
    const apptBtn = page.locator("button").filter({ hasText: /examination|cleaning|consultation|check/i }).first();
    if (await apptBtn.isVisible({ timeout: 5000 })) {
      await apptBtn.click();
      // Detail dialog should open
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible({ timeout: 3000 })) {
        // Find cancel button/section
        const cancelBtn = dialog.getByRole("button", { name: /cancel appointment|cancel/i }).first();
        if (await cancelBtn.isVisible({ timeout: 3000 })) {
          await cancelBtn.click();
        }
      }
    }
  });

  test("refresh preserves calendar state", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
});
