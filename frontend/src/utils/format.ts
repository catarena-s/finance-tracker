/**
 * Форматирует денежную сумму с символом валюты
 * @param amount - Сумма для форматирования
 * @param currency - Код валюты (по умолчанию 'USD')
 * @returns Отформатированная строка с валютой
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Форматирует дату в консистентный формат
 * @param date - Дата для форматирования (строка ISO или объект Date)
 * @param format - Формат вывода ('short' | 'long' | 'iso')
 * @returns Отформатированная строка даты
 */
export function formatDate(
  date: string | Date,
  format: "short" | "long" | "iso" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  switch (format) {
    case "iso":
      return dateObj.toISOString().split("T")[0];
    case "long":
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    case "short":
    default:
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj);
  }
}

/**
 * Парсит строку даты с учетом часового пояса
 * @param dateString - Строка даты в формате ISO 8601
 * @returns Объект Date
 */
export function parseDate(dateString: string): Date {
  // Если строка уже содержит информацию о часовом поясе, используем её
  if (dateString.includes("T") || dateString.includes("Z")) {
    return new Date(dateString);
  }

  // Для дат без времени (YYYY-MM-DD), создаем дату в локальном часовом поясе
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}
