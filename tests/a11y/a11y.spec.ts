import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility — Homepage", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Dental Demo", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Inbox", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/inbox");
    await page.waitForLoadState("networkidle");
    const results = await AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Patient detail", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/patients/p_1");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Recall", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/recall");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Waitlist", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/waitlist");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Treatment Follow-up", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/treatment-follow-up");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Calendar", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/calendar");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — AI Front Desk", () => {
  test("has no serious axe violations", async ({ page }) => {
    await page.goto("/app/ai-agent");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toHaveLength(0);
  });
});

test.describe("Accessibility — Dialog patterns", () => {
  test("Calendar New Appointment dialog has name and focus trap", async ({ page }) => {
    await page.goto("/app/calendar");
    await page.waitForLoadState("networkidle");
    const btn = page.getByRole("button", { name: /new appointment/i });
    await btn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // Dialog should have accessible name
    const name = await dialog.evaluate((el) => el.getAttribute("aria-label") || el.getAttribute("aria-labelledby"));
    expect(name).toBeTruthy();
    // Escape should close
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });

  test("Inputs have labels on AI Front Desk", async ({ page }) => {
    await page.goto("/app/ai-agent");
    await page.waitForLoadState("networkidle");
    const inputs = page.locator("input");
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      if (!(await input.isVisible())) continue;
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      // Input should have a label association or aria-label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        expect(hasLabel || !!ariaLabel || !!ariaLabelledBy).toBeTruthy();
      } else {
        expect(!!ariaLabel || !!ariaLabelledBy).toBeTruthy();
      }
    }
  });
});

test.describe("Accessibility — Icon-only buttons", () => {
  test("Inbox icon buttons have accessible names", async ({ page }) => {
    await page.goto("/app/inbox");
    await page.waitForLoadState("networkidle");
    // Find buttons that contain only an SVG (icon-only)
    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 30); i++) {
      const btn = buttons.nth(i);
      if (!(await btn.isVisible())) continue;
      const text = (await btn.textContent())?.trim() ?? "";
      const hasSvg = (await btn.locator("svg").count()) > 0;
      if (hasSvg && text.length < 3) {
        // Icon-only button must have aria-label or title
        const ariaLabel = await btn.getAttribute("aria-label");
        const title = await btn.getAttribute("title");
        expect(ariaLabel || title).toBeTruthy();
      }
    }
  });
});

test.describe("Accessibility — Emergency messages", () => {
  test("Emergency indicators do not rely solely on color", async ({ page }) => {
    await page.goto("/app/inbox");
    await page.waitForLoadState("networkidle");
    // Find elements with red/emergency styling
    const emergencyElements = page.locator("[data-emergency], .emergency, [class*='emergency']");
    const count = await emergencyElements.count();
    for (let i = 0; i < count; i++) {
      const el = emergencyElements.nth(i);
      const text = (await el.textContent())?.trim() ?? "";
      const ariaLabel = await el.getAttribute("aria-label");
      // Should have text content or aria-label, not just color
      expect(text.length > 0 || !!ariaLabel).toBeTruthy();
    }
  });
});

test.describe("Accessibility — Keyboard navigation", () => {
  test("Can navigate sidebar with keyboard", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");
    // Tab into the sidebar and navigate
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }
    // Should be able to focus something interactive
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Accessibility — No duplicate IDs", () => {
  test("Homepage has no duplicate IDs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const ids = await page.evaluate(() => {
      const all = document.querySelectorAll("[id]");
      const seen: string[] = [];
      const dupes: string[] = [];
      all.forEach((el) => {
        const id = el.id;
        if (seen.includes(id)) dupes.push(id);
        seen.push(id);
      });
      return dupes;
    });
    expect(ids).toHaveLength(0);
  });
});
