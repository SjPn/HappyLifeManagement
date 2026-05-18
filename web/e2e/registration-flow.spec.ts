import { test, expect } from "@playwright/test";

/**
 * Requires seeded DB with community invite code in E2E_INVITE_CODE
 * and chair credentials for approval step.
 */
const invite = process.env.E2E_INVITE_CODE ?? "DEMO-E2E-INVITE";
const chairEmail = process.env.E2E_CHAIR_EMAIL ?? "chair@hlm.kiev.ua";
const chairPassword = process.env.E2E_CHAIR_PASSWORD ?? "H@ppYL!fe";

test.describe("registration → ticket flow", () => {

  test("register, approve, create ticket, change status", async ({ page }) => {
    const email = `e2e-${Date.now()}@happylife.test`;
    const password = "TestPass123";

    await page.goto("/uk/register");
    await page.getByLabel(/код запрошення|invite/i).fill(invite);
    await page.getByLabel(/код запрошення|invite/i).blur();
    await page.waitForTimeout(500);

    await page.getByLabel(/піб|name/i).fill("E2E Resident");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/пароль|password/i).first().fill(password);

    const addressSelect = page.locator('select[name="communityAddressId"]');
    if ((await addressSelect.count()) > 0) {
      await addressSelect.selectOption({ index: 1 });
    }

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /зареєструвати|register/i }).click();

    await expect(page).toHaveURL(/pending/, { timeout: 15_000 });

    await page.goto("/uk/login");
    await page.getByLabel(/email/i).fill(chairEmail);
    await page.getByLabel(/пароль|password/i).fill(chairPassword);
    await page.getByRole("button", { name: /увійти|sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });

    await page.goto("/uk/chair/users");
    await page.getByText(email).click();
    await page.getByRole("combobox").selectOption("APPROVED");
    await page.getByRole("button", { name: /зберегти|save/i }).click();

    await page.goto("/uk/login");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/пароль|password/i).fill(password);
    await page.getByRole("button", { name: /увійти|sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });

    await page.goto("/uk/requests/new");
    await page.locator('select[name="category"]').selectOption("ROADS");
    await page.locator('textarea[name="description"]').fill("E2E pothole");
    await page.getByRole("button", { name: /надіслати|submit|створити/i }).click();
    await expect(page).toHaveURL(/requests/, { timeout: 15_000 });

    await page.getByRole("button").filter({ hasText: /E2E pothole/i }).click();
    await page.getByRole("combobox").selectOption("IN_PROGRESS");
    await expect(page.getByText(/в роботі|in progress/i)).toBeVisible();
  });
});
