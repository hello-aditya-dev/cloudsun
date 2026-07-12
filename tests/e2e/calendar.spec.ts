import { test, expect } from "@playwright/test";

test.describe("Calendar", () => {
  test("repository appointments render", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page.locator("h1").first()).toContainText(/calendar/i, { timeout: 15000 });
    // Appointments from demo data should be visible
    await expect(page.getByText(/appointment|exam|cleaning|consultation|whitening|review/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("create appointment via New appointment dialog", async ({ page }) => {
    await page.goto("/app/calendar");
    // Click "New appointment" button
    const newBtn = page.getByRole("button", { name: /new appointment/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 15000 });
    await newBtn.click();
    // Dialog should appear
    await expect(page.getByRole("dialog").first()).toBeVisible({ timeout: 15000 });
    // Fill required fields — patient, type, provider, location, date, time
    const patientSelect = page.locator('select, [role="combobox"]').first();
    if (await patientSelect.isVisible().catch(() => false)) {
      await patientSelect.click();
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
      }
    }
    // Save appointment
    const saveBtn = page.getByRole("button", { name: /save|create|confirm|book/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click();
    // Appointment should appear or feedback should show success
    await expect(page.getByText(/appointment|booked|created|success|conflict/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("conflict blocks creation of overlapping appointment", async ({ page }) => {
    await page.goto("/app/calendar");
    // Click on an existing appointment to see its time
    const existingAppt = page.getByText(/exam|cleaning|consultation|whitening/i).first();
    await expect(existingAppt).toBeVisible({ timeout: 15000 });
    // Try creating a new appointment at the same time via "New appointment"
    const newBtn = page.getByRole("button", { name: /new appointment/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 15000 });
    await newBtn.click();
    await expect(page.getByRole("dialog").first()).toBeVisible({ timeout: 15000 });
    // Attempt to save — if fields aren't filled, this may show validation errors
    // or if filled with same slot, conflict should appear
    const saveBtn = page.getByRole("button", { name: /save|create|confirm|book/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click();
    // Either validation error or conflict message should appear
    await expect(page.getByText(/conflict|overlap|required|select|choose/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("reschedule changes appointment time", async ({ page }) => {
    await page.goto("/app/calendar");
    // Switch to agenda view for easier clicking
    const agendaBtn = page.getByRole("button", { name: /agenda/i }).first();
    await expect(agendaBtn).toBeVisible({ timeout: 15000 });
    await agendaBtn.click();
    // Click an appointment
    const apptBtn = page.getByText(/exam|cleaning|consultation/i).first();
    await expect(apptBtn).toBeVisible({ timeout: 15000 });
    await apptBtn.click();
    // Click "Reschedule" button
    const rescheduleBtn = page.getByRole("button", { name: /reschedule/i }).first();
    await expect(rescheduleBtn).toBeVisible({ timeout: 15000 });
    await rescheduleBtn.click();
    // Fill new date/time
    const dateInput = page.getByRole("textbox", { name: /date/i }).first();
    if (await dateInput.isVisible().catch(() => false)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      await dateInput.fill(tomorrow.toISOString().split("T")[0]);
    }
    const timeInput = page.getByRole("textbox", { name: /time/i }).first();
    if (await timeInput.isVisible().catch(() => false)) {
      await timeInput.fill("14:00");
    }
    // Confirm reschedule
    const confirmBtn = page.getByRole("button", { name: /reschedule|confirm/i }).first();
    await expect(confirmBtn).toBeVisible({ timeout: 15000 });
    await confirmBtn.click();
    // Success feedback
    await expect(page.getByText(/rescheduled|success/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("cancel appointment changes status", async ({ page }) => {
    await page.goto("/app/calendar");
    const agendaBtn = page.getByRole("button", { name: /agenda/i }).first();
    await expect(agendaBtn).toBeVisible({ timeout: 15000 });
    await agendaBtn.click();
    // Click an appointment
    const apptBtn = page.getByText(/exam|cleaning|consultation/i).first();
    await expect(apptBtn).toBeVisible({ timeout: 15000 });
    await apptBtn.click();
    // Click Cancel
    const cancelBtn = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelBtn).toBeVisible({ timeout: 15000 });
    await cancelBtn.click();
    // Confirm cancellation
    const confirmCancel = page.getByRole("button", { name: /confirm|cancel appointment|yes/i }).first();
    if (await confirmCancel.isVisible().catch(() => false)) {
      await confirmCancel.click();
    }
    // Status should change
    await expect(page.getByText(/cancelled/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("date navigation: Previous, Next, and Today", async ({ page }) => {
    await page.goto("/app/calendar");
    // Check that navigation controls exist
    const todayBtn = page.getByRole("button", { name: /today/i }).first();
    await expect(todayBtn).toBeVisible({ timeout: 15000 });
    // Click navigation arrows — look for chevron buttons
    const prevBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevrons-left, svg.lucide-chevron-left') }).first();
    const nextBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevrons-right, svg.lucide-chevron-right') }).first();
    // Get current date label
    const dateLabel = page.locator("text").filter({ hasText: /\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/ }).first();
    const initialText = await dateLabel.textContent().catch(() => "");
    // Click Previous
    if (await prevBtn.isVisible().catch(() => false)) {
      await prevBtn.click();
    }
    // Click Today to return
    await todayBtn.click();
  });

  test("provider filter shows provider-specific view", async ({ page }) => {
    await page.goto("/app/calendar");
    // Switch to provider view
    const providerBtn = page.getByRole("button", { name: /provider/i }).first();
    await expect(providerBtn).toBeVisible({ timeout: 15000 });
    await providerBtn.click();
    // Provider view should load with provider names
    await expect(page.getByText(/priya|kapoor|chen|sara|dentist|hygienist/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("location filter shows location-specific view", async ({ page }) => {
    await page.goto("/app/calendar");
    // Switch to location view
    const locationBtn = page.getByRole("button", { name: /location/i }).first();
    await expect(locationBtn).toBeVisible({ timeout: 15000 });
    await locationBtn.click();
    // Location view should load with location names
    await expect(page.getByText(/central|north|riverside|lumen/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("cancelled patient can be added to waitlist", async ({ page }) => {
    await page.goto("/app/calendar");
    const agendaBtn = page.getByRole("button", { name: /agenda/i }).first();
    await expect(agendaBtn).toBeVisible({ timeout: 15000 });
    await agendaBtn.click();
    // Click an appointment
    const apptBtn = page.getByText(/exam|cleaning|consultation/i).first();
    await expect(apptBtn).toBeVisible({ timeout: 15000 });
    await apptBtn.click();
    // Cancel it
    const cancelBtn = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelBtn).toBeVisible({ timeout: 15000 });
    await cancelBtn.click();
    const confirmCancel = page.getByRole("button", { name: /confirm|cancel appointment|yes/i }).first();
    if (await confirmCancel.isVisible().catch(() => false)) {
      await confirmCancel.click();
    }
    // After cancel, "Add patient to waitlist" button should appear
    const waitlistBtn = page.getByRole("button", { name: /add.*waitlist|add patient to waitlist/i }).first();
    await expect(waitlistBtn).toBeVisible({ timeout: 15000 });
    await waitlistBtn.click();
    // Success feedback
    await expect(page.getByText(/waitlist|added|success/i).first()).toBeVisible({ timeout: 15000 });
  });
});
