/**
 * E2E: Повторяющиеся транзакции (требования 3.1, 3.8, 3.9, 3.10, 8.6)
 * Навигация, список, кнопка добавления, форма (без бэкенда — проверка UI).
 */
import { test, expect } from "@playwright/test";

test.describe("Повторяющиеся транзакции", () => {
  test("страница открывается и отображает заголовок", async ({ page }) => {
    await page.goto("/recurring");
    await expect(page.getByRole("heading", { name: /Повторяющиеся транзакции/ })).toBeVisible();
  });

  test("есть кнопка добавления шаблона", async ({ page }) => {
    await page.goto("/recurring");
    await expect(page.getByRole("button", { name: /Добавить шаблон/ })).toBeVisible();
  });

  test("открывается модалка создания по кнопке", async ({ page }) => {
    await page.goto("/recurring");
    await page.getByRole("button", { name: /Добавить шаблон/ }).click();
    await expect(page.getByRole("dialog").getByText(/Создать шаблон/)).toBeVisible({ timeout: 3000 });
  });

  test("есть ссылка к транзакциям", async ({ page }) => {
    await page.goto("/recurring");
    await expect(page.getByRole("link", { name: /К транзакциям/ })).toBeVisible();
  });
});
