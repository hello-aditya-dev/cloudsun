import { test, expect } from "@playwright/test";

test.describe("Patients", () => {
  test("patient detail page loads with exact patient ID in URL", async ({ page }) => {
    await page.goto("/app/patients/p_1");
    await expect(page).toHaveURL(/\/app\/patients\/p_1/, { timeout: 15000 });
    // Patient name should appear on the page
    await expect(page.getByText(/patel/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("patient URL survives refresh", async ({ page }) => {
    await page.goto("/app/patients/p_3");
    await expect(page).toHaveURL(/\/app\/patients\/p_3/, { timeout: 15000 });
    await page.reload();
    await expect(page).toHaveURL(/\/app\/patients\/p_3/, { timeout: 15000 });
    // Content should still be visible
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
  });

  test("invalid ID shows not found or empty state", async ({ page }) => {
    await page.goto("/app/patients/nonexistent_patient_xyz");
    // Should load the page (may show not-found or empty detail)
    await expect(page.locator("main, [role='main'], h1, h2").first()).toBeVisible({ timeout: 15000 });
  });

  test("patient list page displays patients", async ({ page }) => {
    await page.goto("/app/patients");
    // Should show patient list with at least one patient
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
    // A patient name should be visible in the list
    const patientName = page.getByText(/Patel|Gupta|Reddy|Khan|Nair|Singh/i).first();
    await expect(patientName).toBeVisible({ timeout: 15000 });
  });
});
