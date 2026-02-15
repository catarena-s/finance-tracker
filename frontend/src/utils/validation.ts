/**
 * Валидирует денежную сумму
 * @param amount - Сумма для валидации
 * @returns Сообщение об ошибке или null если валидна
 */
export function validateAmount(amount: number | string): string | null {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "Amount must be a valid number";
  }

  if (numAmount <= 0) {
    return "Amount must be greater than 0";
  }

  // Проверка на максимум 2 десятичных знака
  const decimalPart = numAmount.toString().split(".")[1];
  if (decimalPart && decimalPart.length > 2) {
    return "Amount must have at most 2 decimal places";
  }

  return null;
}

/**
 * Валидирует дату
 * @param date - Дата для валидации
 * @param allowFuture - Разрешить ли будущие даты (по умолчанию false)
 * @returns Сообщение об ошибке или null если валидна
 */
export function validateDate(
  date: string | Date,
  allowFuture: boolean = false
): string | null {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid date format";
  }

  if (!allowFuture && dateObj > new Date()) {
    return "Date cannot be in the future";
  }

  return null;
}

/**
 * Валидирует строку
 * @param value - Строка для валидации
 * @param options - Опции валидации
 * @returns Сообщение об ошибке или null если валидна
 */
export function validateString(
  value: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): string | null {
  const { required = false, minLength, maxLength, pattern } = options;

  if (required && (!value || value.trim().length === 0)) {
    return "This field is required";
  }

  if (!value) {
    return null;
  }

  if (minLength !== undefined && value.length < minLength) {
    return `Must be at least ${minLength} characters`;
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return `Must be at most ${maxLength} characters`;
  }

  if (pattern && !pattern.test(value)) {
    return "Invalid format";
  }

  return null;
}

/**
 * Валидирует hex цвет
 * @param color - Hex цвет для валидации
 * @returns Сообщение об ошибке или null если валиден
 */
export function validateHexColor(color: string): string | null {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;

  if (!hexPattern.test(color)) {
    return "Color must be a valid hex code (e.g., #FF5733)";
  }

  return null;
}

/**
 * Валидирует диапазон дат
 * @param startDate - Начальная дата
 * @param endDate - Конечная дата
 * @returns Сообщение об ошибке или null если валиден
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date
): string | null {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime())) {
    return "Invalid start date";
  }

  if (isNaN(end.getTime())) {
    return "Invalid end date";
  }

  if (end <= start) {
    return "End date must be after start date";
  }

  return null;
}
