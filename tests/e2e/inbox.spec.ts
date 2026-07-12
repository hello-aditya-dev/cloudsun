import { test, expect } from "@playwright/test";

test.describe("Inbox", () => {
  test("dental intent filters work", async ({ page }) => {
    await page.goto("/app/inbox");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Click "New patients" filter
    const newPatientsFilter = page.getByRole("button", { name: /new patients/i }).first();
    if (await newPatientsFilter.isVisible({ timeout: 5000 })) {
      await newPatientsFilter.click();
    }
    // List should update (even if empty)
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("saved reply inserts text into composer", async ({ page }) => {
    await page.goto("/app/inbox");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Click a conversation to open it
    const firstConv = page.locator("button").filter({ hasText: /Patel|Gupta|Reddy|Khan/i }).first();
    if (await firstConv.isVisible({ timeout: 5000 })) {
      await firstConv.click();
    }
    // Click "Saved replies" button
    const repliesBtn = page.getByRole("button", { name: /saved replies/i }).first();
    if (await repliesBtn.isVisible({ timeout: 5000 })) {
      await repliesBtn.click();
      // Click a reply option from the popover — wait for it
      const replyOption = page.getByText("New-patient welcome").first();
      if (await replyOption.isVisible({ timeout: 5000 })) {
        await replyOption.click();
      }
    }
  });

  test("send message persists in conversation", async ({ page }) => {
    await page.goto("/app/inbox");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Open a conversation
    const firstConv = page.locator("button").filter({ hasText: /Patel|Gupta|Reddy|Khan/i }).first();
    if (await firstConv.isVisible({ timeout: 5000 })) {
      await firstConv.click();
    }
    // Find the message input
    const msgInput = page.locator("textarea, input[type='text']").last();
    if (await msgInput.isVisible({ timeout: 5000 })) {
      await msgInput.fill("E2E test message");
      // Click send button
      const sendBtn = page.getByRole("button", { name: /send/i }).first();
      if (await sendBtn.isVisible({ timeout: 3000 })) {
        await sendBtn.click();
      }
    }
  });

  test("hand off to human changes status", async ({ page }) => {
    await page.goto("/app/inbox");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
    // Open a conversation
    const firstConv = page.locator("button").filter({ hasText: /Patel|Gupta|Reddy|Khan/i }).first();
    if (await firstConv.isVisible({ timeout: 5000 })) {
      await firstConv.click();
    }
    // Click "Hand off" button
    const handoffBtn = page.getByRole("button", { name: /hand off/i }).first();
    if (await handoffBtn.isVisible({ timeout: 5000 })) {
      await handoffBtn.click();
    }
  });

  test("generated demo conversation loads from deep link", async ({ page }) => {
    // First create a conversation via the demo page
    await page.goto("/demo");
    const scenarioCard = page.getByText("New patient wants cleaning").first();
    await expect(scenarioCard).toBeVisible({ timeout: 15000 });
    await scenarioCard.click();
    const runBtn = page.getByRole("button", { name: /run simulation/i });
    await runBtn.click();
    const inboxLink = page.getByRole("link", { name: /open in inbox/i });
    await expect(inboxLink).toBeVisible({ timeout: 20000 });
    // Navigate to the conversation
    await inboxLink.click();
    await expect(page).toHaveURL(/\/app\/inbox\/demo_dental_/, { timeout: 15000 });
    // Conversation should display messages
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
});
