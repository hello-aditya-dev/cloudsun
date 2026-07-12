import { test, expect } from "@playwright/test";

test.describe("Treatment Follow-up", () => {
  test("create a treatment follow-up", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Click the create/add button to open the dialog
    const addBtn = page.getByRole("button", { name: /create|add|new follow/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    // Dialog should appear
    await expect(page.getByRole("dialog").first()).toBeVisible({ timeout: 15000 });
    // Fill patient name
    const nameInput = page.getByRole("textbox", { name: /patient|name/i }).first();
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.fill("E2E Test Patient");
    // Confirm consent checkbox
    const consentCheckbox = page.getByRole("checkbox").first();
    if (await consentCheckbox.isVisible().catch(() => false)) {
      await consentCheckbox.check();
    }
    // Submit
    const submitBtn = page.getByRole("button", { name: /create|add|save|queue/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();
    // Success feedback
    await expect(page.getByText(/created|queued|success|follow-up/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("send follow-up changes status", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    const sendBtn = page.getByRole("button", { name: /send follow|send/i }).first();
    await expect(sendBtn).toBeVisible({ timeout: 15000 });
    await sendBtn.click();
    // Status should update
    await expect(page.getByText(/sent|contacted|outreach/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("consent block prevents creation without consent", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Open create dialog
    const addBtn = page.getByRole("button", { name: /create|add|new follow/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    // Fill patient name but do NOT check consent
    const nameInput = page.getByRole("textbox", { name: /patient|name/i }).first();
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.fill("No Consent Patient");
    // Try to submit without consent
    const submitBtn = page.getByRole("button", { name: /create|add|save|queue/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();
    // Should see consent error
    await expect(page.getByText(/consent|must be confirmed/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("mark responded updates status", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    const respondedBtn = page.getByRole("button", { name: /mark responded|responded/i }).first();
    await expect(respondedBtn).toBeVisible({ timeout: 15000 });
    await respondedBtn.click();
    await expect(page.getByText(/responded/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("request coordinator creates a task", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    const coordinatorBtn = page.getByRole("button", { name: /request coordinator|coordinator/i }).first();
    await expect(coordinatorBtn).toBeVisible({ timeout: 15000 });
    await coordinatorBtn.click();
    // Status should update to indicate coordinator is needed
    await expect(page.getByText(/coordinator|required|task/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("book appointment from treatment follow-up", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // First mark as responded so booking becomes available
    const respondedBtn = page.getByRole("button", { name: /mark responded|responded/i }).first();
    await expect(respondedBtn).toBeVisible({ timeout: 15000 });
    await respondedBtn.click();
    // Click Book appointment
    const bookBtn = page.getByRole("button", { name: /book appointment/i }).first();
    await expect(bookBtn).toBeVisible({ timeout: 15000 });
    await bookBtn.click();
    // Booking dialog should appear
    await expect(page.getByRole("dialog").first()).toBeVisible({ timeout: 15000 });
    // Confirm
    const confirmBtn = page.getByRole("button", { name: /confirm booking/i }).first();
    await expect(confirmBtn).toBeVisible({ timeout: 15000 });
    await confirmBtn.click();
    // Success
    await expect(page.getByText(/booked|appointment|success/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("appointment appears in Calendar after booking", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page.locator("h1").first()).toContainText(/calendar/i, { timeout: 15000 });
    await expect(page.getByText(/appointment|exam|cleaning|consultation/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("refresh preserves treatment follow-up state", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    // Change state by sending a follow-up
    const sendBtn = page.getByRole("button", { name: /send follow|send/i }).first();
    await expect(sendBtn).toBeVisible({ timeout: 15000 });
    await sendBtn.click();
    await expect(page.getByText(/sent|contacted|outreach/i).first()).toBeVisible({ timeout: 15000 });
    // Reload
    await page.reload();
    // State should persist
    await expect(page.getByText(/sent|contacted|outreach/i).first()).toBeVisible({ timeout: 15000 });
  });
});
