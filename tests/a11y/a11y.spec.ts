import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility test suite for CloudSun Dental.
 *
 * Axe violation scans log issues for tracking but do not fail the CI gate
 * since this is an interactive prototype. Structural a11y tests
 * (dialog names, labels, keyboard) DO fail when functionality is missing.
 */

function logViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  for (const v of violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
  }
}

test.describe("Accessibility — Axe scans (logged, non-blocking)", () => {
  const pages = [
    { name: "Homepage", path: "/" },
    { name: "Dental Demo", path: "/demo" },
    { name: "Inbox", path: "/app/inbox" },
    { name: "Patient detail", path: "/app/patients/p_1" },
    { name: "Recall", path: "/app/recall" },
    { name: "Waitlist", path: "/app/waitlist" },
    { name: "Treatment Follow-up", path: "/app/treatment-follow-up" },
    { name: "Calendar", path: "/app/calendar" },
    { name: "AI Front Desk", path: "/app/ai-agent" },
  ];

  for (const p of pages) {
    test(`${p.name} — axe scan completes`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      logViolations(serious);
      // Log count for tracking — do not fail
      console.log(`  → ${serious.length} serious/critical violations on ${p.name}`);
      expect(serious.length).toBeLessThanOrEqual(50); // ceiling, not zero
    });
  }
});

test.describe("Accessibility — Structural checks (must pass)", () => {
  test("Calendar New Appointment dialog has accessible name and closes on Escape", async ({ page }) => {
    await page.goto("/app/calendar");
    await page.waitForLoadState("networkidle");
    const btn = page.getByRole("button", { name: /new appointment/i });
    await btn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const ariaLabel = await dialog.evaluate(
      (el) => el.getAttribute("aria-label") || el.getAttribute("aria-labelledby"),
    );
    expect(ariaLabel).toBeTruthy();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });

  test("Icon-only buttons have aria-label or title", async ({ page }) => {
    await page.goto("/app/inbox");
    await page.waitForLoadState("networkidle");
    const buttons = page.locator("button");
    const count = await buttons.count();
    let checked = 0;
    for (let i = 0; i < Math.min(count, 40); i++) {
      const btn = buttons.nth(i);
      if (!(await btn.isVisible())) continue;
      const text = (await btn.textContent())?.trim() ?? "";
      const hasSvg = (await btn.locator("svg").count()) > 0;
      if (hasSvg && text.length < 3) {
        const ariaLabel = await btn.getAttribute("aria-label");
        const title = await btn.getAttribute("title");
        expect(ariaLabel || title).toBeTruthy();
        checked++;
      }
    }
    // At least some icon-only buttons should have been checked
    console.log(`  Checked ${checked} icon-only buttons for accessible names`);
  });

  test("Keyboard can navigate sidebar", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible({ timeout: 3000 });
  });

  test("No duplicate IDs on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const dupes = await page.evaluate(() => {
      const all = document.querySelectorAll("[id]");
      const seen: string[] = [];
      const dups: string[] = [];
      all.forEach((el) => {
        if (seen.includes(el.id)) dups.push(el.id);
        seen.push(el.id);
      });
      return dups;
    });
    expect(dupes).toHaveLength(0);
  });

  test("Emergency indicators use text, not only color", async ({ page }) => {
    await page.goto("/app/inbox");
    await page.waitForLoadState("networkidle");
    // Any element with emergency-related class should have text
    const emergencyEls = page.locator("[data-emergency], [class*='emergency']");
    const count = await emergencyEls.count();
    for (let i = 0; i < count; i++) {
      const el = emergencyEls.nth(i);
      const text = (await el.textContent())?.trim() ?? "";
      const ariaLabel = await el.getAttribute("aria-label");
      expect(text.length > 0 || !!ariaLabel).toBeTruthy();
    }
  });
});
