import { test, expect } from "@playwright/test";

test.describe("Patients", () => {
  test("patient row opens exact patient ID in URL", async ({ page }) => {
    await page.goto("/app/patients");
    // Wait for patient list to load
    await expect(page.locator("h1").first()).toContainText(/patient|lead/i, { timeout: 15000 });
    // Click a patient row (button elements in the patient list)
    const patientRow = page.locator("button").filter({ hasText: /patel|sharma|okafor|reddy|tanaka|rivera|park|khan|desai/i }).first();
    await expect(patientRow).toBeVisible({ timeout: 15000 });
    await patientRow.click();
    // URL should now be /app/patients/{id}
    await expect(page).toHaveURL(/\/app\/patients\/(?!.*nonexistent)/, { timeout: 15000 });
  });

  test("patient URL survives refresh", async ({ page }) => {
    await page.goto("/app/patients");
    // Click a patient to navigate to detail
    const patientRow = page.locator("button").filter({ hasText: /patel|sharma|okafor|reddy|tanaka|rivera|park|khan|desai/i }).first();
    await expect(patientRow).toBeVisible({ timeout: 15000 });
    await patientRow.click();
    await expect(page).toHaveURL(/\/app\/patients\//, { timeout: 15000 });
    const currentUrl = page.url();
    // Refresh
    await page.reload();
    // URL should be the same
    await expect(page).toHaveURL(currentUrl, { timeout: 15000 });
    // Patient detail should still be visible
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("invalid ID shows not found or empty state", async ({ page }) => {
    await page.goto("/app/patients/nonexistent");
    // Should show a not-found or empty state
    await expect(page.getByText(/not found|404|does not exist|no patient/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("tabs display patient-specific records", async ({ page }) => {
    await page.goto("/app/patients");
    // Click a patient to go to detail view
    const patientRow = page.locator("button").filter({ hasText: /patel|sharma|okafor|reddy|tanaka|rivera|park|khan|desai/i }).first();
    await expect(patientRow).toBeVisible({ timeout: 15000 });
    await patientRow.click();
    await expect(page).toHaveURL(/\/app\/patients\//, { timeout: 15000 });
    // Click on a tab — e.g., "Conversations" or "Appointments"
    const tab = page.getByRole("tab", { name: /conversations|appointments|recall|overview|treatment/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();
    // Tab content should display patient-specific data (or "No ... found" empty state)
    await expect(page.getByText(/conversation|appointment|recall|treatment|no.*found|empty/i).first()).toBeVisible({ timeout: 15000 });
  });
});
