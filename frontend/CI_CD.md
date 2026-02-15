# CI/CD Pipeline

## Автоматические проверки

### Pre-commit хуки

При каждом коммите автоматически запускаются:
- ESLint проверка кода
- TypeScript type checking

Для установки хуков:
```bash
npm install
npm run prepare
```

### GitHub Actions

При push в ветки `main`, `develop` или `feature/**` автоматически запускаются:

1. **Lint and Type Check**
   - ESLint проверка
   - TypeScript type checking

2. **Build**
   - Сборка приложения
   - Сохранение артефактов

3. **Test**
   - Запуск всех тестов
   - Генерация отчета о покрытии
   - Загрузка отчета в Codecov

## Локальная проверка

Перед push рекомендуется запустить:

```bash
# Проверка линтинга
npm run lint

# Проверка типов
npm run type-check

# Запуск тестов
npm test

# Сборка
npm run build
```

## Требования к коду

- Все тесты должны проходить
- ESLint не должен выдавать ошибок
- TypeScript не должен выдавать ошибок типов
- Покрытие кода тестами ≥ 80% (рекомендуется)

## Отключение хуков

Если необходимо сделать коммит без проверок (не рекомендуется):
```bash
git commit --no-verify -m "message"
```
