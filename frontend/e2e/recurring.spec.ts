/**
 * E2E: Повторяющиеся транзакции (требования 3.1, 3.8, 3.9, 3.10, 8.6)
 * Навигация, список, кнопка добавления, форма.
 */
import { test, expect } from "@playwright/test";

const contentTimeout = 20000;

test.describe("Повторяющиеся транзакции", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recurring", { waitUntil: "load", timeout: 20000 });
  });

  test("страница открывается и отображает заголовок", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Повторяющиеся транзакции/ })
    ).toBeVisible({ timeout: contentTimeout });
  });

  test("есть кнопка добавления шаблона", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Добавить шаблон/ })).toBeVisible({
      timeout: contentTimeout,
    });
  });

  test("открывается модалка создания по кнопке", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Добавить шаблон/ })).toBeVisible({
      timeout: contentTimeout,
    });
    await page.getByRole("button", { name: /Добавить шаблон/ }).click();
    await expect(page.getByRole("dialog").getByText(/Создать шаблон/)).toBeVisible({
      timeout: 5000,
    });
  });

  test("есть ссылка к транзакциям", async ({ page }) => {
    await expect(page.getByRole("link", { name: /К транзакциям/ })).toBeVisible({
      timeout: contentTimeout,
    });
  });

  test("создание шаблона: заполнение формы и сохранение", async ({ page }) => {
    await page.getByRole("button", { name: /Добавить шаблон/ }).click();
    await expect(page.getByRole("dialog").getByText(/Создать шаблон/)).toBeVisible({
      timeout: 5000,
    });

    await page.getByLabel(/Название/).fill("E2E подписка");
    await page.getByLabel(/Сумма/).fill("99");
    await page.getByLabel(/Категория/).selectOption({ index: 1 });
    await page.getByLabel(/Дата начала/).fill(new Date().toISOString().split("T")[0]);

    await page.getByRole("button", { name: /Создать/ }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByText("E2E подписка")).toBeVisible({ timeout: 5000 });
  });
});
