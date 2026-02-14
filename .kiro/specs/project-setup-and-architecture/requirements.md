# Requirements Document

## Introduction

Данный документ определяет требования к настройке проекта и архитектуре Full-Stack приложения для трекинга личных финансов. Спецификация охватывает правила разработки для IDE, архитектурные решения, технологический стек и план поэтапной разработки проекта.

## Glossary

- **IDE_Agent**: Агент IDE, выполняющий задачи разработки согласно определённым правилам
- **Project_Structure**: Организация файлов и директорий проекта
- **Git_Convention**: Соглашения по работе с системой контроля версий
- **Docker_Compose**: Инструмент для определения и запуска многоконтейнерных Docker приложений
- **Architecture_Document**: Документ, описывающий архитектуру системы
- **Development_Plan**: Поэтапный план разработки проекта
- **Seed_Data**: Начальные данные для заполнения базы данных
- **CI_Pipeline**: Конвейер непрерывной интеграции для автоматизации проверок кода
- **REST_API**: Архитектурный стиль для создания веб-сервисов
- **Migration**: Скрипт для изменения схемы базы данных
- **Changelog**: Файл с историей изменений проекта в формате версий

## Requirements

### Requirement 1: Git Configuration and Commit Conventions

**User Story:** Как разработчик, я хочу иметь чёткие правила работы с Git, чтобы обеспечить консистентность истории коммитов и упростить совместную работу.

#### Acceptance Criteria

1. WHEN creating a commit, THE IDE_Agent SHALL use format "[Этап: <название>] Выполнен шаг: <описание>"
2. THE Project_Structure SHALL include .gitignore file with appropriate exclusions for Node.js, Python, and Docker
3. THE Git_Convention SHALL define branch naming pattern: feature/<feature-name>, bugfix/<bug-name>
4. THE Git_Convention SHALL require pull requests for merging feature branches into main branch
5. THE README.md SHALL include instructions for configuring git author locally

### Requirement 2: File and Code Naming Conventions

**User Story:** Как разработчик, я хочу иметь единые соглашения по именованию файлов и кода, чтобы проект был легко читаемым и поддерживаемым.

#### Acceptance Criteria

1. WHEN creating frontend files, THE IDE_Agent SHALL use PascalCase for React/Vue components (e.g., TransactionList.jsx)
2. WHEN creating backend files, THE IDE_Agent SHALL use snake_case for Python modules (e.g., transaction_service.py)
3. WHEN creating utility files, THE IDE_Agent SHALL use camelCase for JavaScript/TypeScript (e.g., formatCurrency.js)
4. THE IDE_Agent SHALL use kebab-case for CSS/SCSS files (e.g., transaction-card.scss)
5. WHEN creating database migration files, THE IDE_Agent SHALL include timestamp prefix (e.g., 20240101_create_transactions_table.sql)

### Requirement 3: Code Documentation Standards

**User Story:** Как разработчик, я хочу иметь документированный код, чтобы понимать назначение функций и компонентов без изучения их реализации.

#### Acceptance Criteria

1. WHEN writing JavaScript/TypeScript functions, THE IDE_Agent SHALL include JSDoc comments with @param and @returns tags
2. WHEN writing Python functions, THE IDE_Agent SHALL include docstrings with Args and Returns sections
3. WHEN creating React components, THE IDE_Agent SHALL include PropTypes or TypeScript interfaces for props
4. THE IDE_Agent SHALL document complex business logic with inline comments
5. WHEN creating API endpoints, THE IDE_Agent SHALL include OpenAPI/Swagger annotations

### Requirement 4: Project Architecture Documentation

**User Story:** Как разработчик, я хочу иметь документ с описанием архитектуры, чтобы понимать структуру проекта и взаимодействие компонентов.

#### Acceptance Criteria

1. THE Project_Structure SHALL include ARCHITECTURE.md file in root directory
2. THE Architecture_Document SHALL describe frontend architecture with component hierarchy
3. THE Architecture_Document SHALL describe backend architecture with API layer, service layer, and data layer
4. THE Architecture_Document SHALL describe database schema with entity relationships
5. THE Architecture_Document SHALL include technology stack with justification for each choice
6. THE Architecture_Document SHALL define folder structure for frontend, backend, and database directories

### Requirement 5: Development Plan Definition

**User Story:** Как разработчик, я хочу иметь чёткий план разработки, чтобы понимать последовательность реализации функциональности.

#### Acceptance Criteria

1. THE Development_Plan SHALL be included in ARCHITECTURE.md file
2. THE Development_Plan SHALL define Stage 1: Infrastructure Setup (Docker, Database, CI/CD)
3. THE Development_Plan SHALL define Stage 2: Backend API (models, endpoints, OpenAPI)
4. THE Development_Plan SHALL define Stage 3: Frontend (components, routing, state management)
5. THE Development_Plan SHALL define Stage 4: Core Features (transactions, categories, budgets, dashboard)
6. THE Development_Plan SHALL define Stage 5: Additional Features (CSV import/export, recurring transactions, multi-currency)
7. THE Development_Plan SHALL define Stage 6: Testing and Documentation
8. THE Development_Plan SHALL define Stage 7: Seed Data and Final Integration

### Requirement 6: Docker Compose Configuration

**User Story:** Как разработчик, я хочу запускать все сервисы одной командой, чтобы упростить локальную разработку и тестирование.

#### Acceptance Criteria

1. THE Project_Structure SHALL include docker-compose.yml file in root directory
2. THE Docker_Compose SHALL define service for frontend application
3. THE Docker_Compose SHALL define service for backend application
4. THE Docker_Compose SHALL define service for PostgreSQL database
5. WHEN running docker-compose up, THE Docker_Compose SHALL start all services with proper networking
6. THE Docker_Compose SHALL define volumes for database persistence
7. THE Docker_Compose SHALL expose appropriate ports for each service

### Requirement 7: Initial Project Structure

**User Story:** Как разработчик, я хочу иметь организованную структуру проекта, чтобы легко находить и добавлять файлы.

#### Acceptance Criteria

1. THE Project_Structure SHALL include frontend/ directory for client application
2. THE Project_Structure SHALL include backend/ directory for server application
3. THE Project_Structure SHALL include database/ directory for migrations and seed data
4. THE Project_Structure SHALL include README.md with setup and run instructions
5. THE Project_Structure SHALL include REPORT.md for development journal
6. WHEN creating directory structure, THE IDE_Agent SHALL create placeholder files to preserve empty directories

### Requirement 8: CI/CD Pipeline Configuration

**User Story:** Как разработчик, я хочу автоматизировать проверки кода, чтобы обнаруживать ошибки до их попадания в основную ветку.

#### Acceptance Criteria

1. THE Project_Structure SHALL include .github/workflows directory for GitHub Actions
2. WHEN code is pushed to feature branch, THE CI_Pipeline SHALL run linting and formatting checks
3. WHEN pull request is created to main branch, THE CI_Pipeline SHALL run full test suite
4. THE CI_Pipeline SHALL fail if linting errors are detected
5. THE CI_Pipeline SHALL fail if tests do not pass
6. WHERE Docker image building is enabled, THE CI_Pipeline SHALL build and validate Docker images on PR to main

### Requirement 9: README Documentation

**User Story:** Как новый разработчик, я хочу иметь инструкции по запуску проекта, чтобы быстро начать работу.

#### Acceptance Criteria

1. THE Project_Structure SHALL include README.md in root directory
2. THE README.md SHALL include project description and goals
3. THE README.md SHALL include prerequisites (Node.js, Python, Docker versions)
4. THE README.md SHALL include step-by-step setup instructions
5. THE README.md SHALL include commands for running application with Docker Compose
6. THE README.md SHALL include commands for running tests
7. THE README.md SHALL include link to ARCHITECTURE.md for detailed documentation

### Requirement 10: Development Journal

**User Story:** Как разработчик, я хочу вести журнал разработки, чтобы отслеживать прогресс и принятые решения.

#### Acceptance Criteria

1. THE Project_Structure SHALL include REPORT.md in root directory
2. THE REPORT.md SHALL include template for logging completed stages
3. THE REPORT.md SHALL include sections for each development stage
4. WHEN stage is completed, THE IDE_Agent SHALL update REPORT.md with completion date and summary
5. THE REPORT.md SHALL include section for tracking technical decisions and their rationale

### Requirement 11: Technology Stack Selection

**User Story:** Как архитектор, я хочу выбрать подходящий технологический стек, чтобы обеспечить эффективную разработку и поддержку приложения.

#### Acceptance Criteria

1. THE Architecture_Document SHALL specify frontend framework choice (React/Next.js or Vue)
2. THE Architecture_Document SHALL specify backend framework choice (FastAPI, Flask, or Django)
3. THE Architecture_Document SHALL specify PostgreSQL as database
4. THE Architecture_Document SHALL specify state management solution for frontend
5. THE Architecture_Document SHALL specify ORM or database client for backend
6. THE Architecture_Document SHALL include justification for each technology choice
7. THE Architecture_Document SHALL specify testing frameworks for frontend and backend

### Requirement 12: Database Migration Strategy

**User Story:** Как разработчик, я хочу иметь систему миграций базы данных, чтобы безопасно изменять схему данных.

#### Acceptance Criteria

1. THE Architecture_Document SHALL define migration tool (e.g., Alembic for Python)
2. THE Project_Structure SHALL include database/migrations/ directory
3. WHEN database schema changes, THE IDE_Agent SHALL create migration file with timestamp
4. THE Migration SHALL include both upgrade and downgrade operations
5. THE Architecture_Document SHALL define migration naming convention

### Requirement 13: Seed Data Requirements

**User Story:** Как разработчик, я хочу иметь тестовые данные, чтобы проверять функциональность приложения в реалистичных условиях.

#### Acceptance Criteria

1. THE Project_Structure SHALL include database/seeds/ directory
2. THE Seed_Data SHALL include at least 200 transactions
3. THE Seed_Data SHALL include 12 categories with icons and colors
4. THE Seed_Data SHALL include 3 budget entries
5. THE Seed_Data SHALL include script for loading seed data into database
6. WHEN seed script is executed, THE Seed_Data SHALL populate database with consistent, realistic data

### Requirement 14: API Documentation Standards

**User Story:** Как разработчик, я хочу иметь автоматически генерируемую документацию API, чтобы понимать доступные эндпоинты без изучения кода.

#### Acceptance Criteria

1. THE REST_API SHALL expose OpenAPI/Swagger documentation endpoint
2. WHEN backend server is running, THE REST_API SHALL serve interactive API documentation
3. THE Architecture_Document SHALL specify URL for accessing API documentation
4. WHEN creating API endpoints, THE IDE_Agent SHALL include OpenAPI annotations
5. THE REST_API SHALL document request/response schemas for all endpoints

### Requirement 15: Code Modularity and Separation of Concerns

**User Story:** Как разработчик, я хочу иметь модульную архитектуру, чтобы легко тестировать и изменять отдельные компоненты.

#### Acceptance Criteria

1. THE Architecture_Document SHALL define separation between presentation, business logic, and data layers
2. WHEN creating backend code, THE IDE_Agent SHALL separate API routes, services, and data access
3. WHEN creating frontend code, THE IDE_Agent SHALL separate components, hooks/composables, and API clients
4. THE Architecture_Document SHALL prohibit direct database access from API routes
5. THE Architecture_Document SHALL require business logic to be in service layer, not in routes or components

### Requirement 16: Changelog Maintenance

**User Story:** Как разработчик, я хочу вести историю изменений проекта в CHANGELOG.md, чтобы отслеживать все важные изменения и версии.

#### Acceptance Criteria

1. THE Project_Structure SHALL include CHANGELOG.md file in root directory
2. THE Changelog SHALL follow format with version headers (## X.Y.Z) and bullet points for changes
3. WHEN project is initialized, THE Changelog SHALL contain entry "## 0.0.0\n- Создан проект"
4. WHEN completing a development stage, THE IDE_Agent SHALL add new version entry to CHANGELOG.md
5. WHEN adding changelog entry, THE IDE_Agent SHALL increment version number (0.0.1, 0.0.2, etc.)
6. THE Changelog SHALL list changes in reverse chronological order (newest first)
7. WHEN feature is completed, THE Changelog entry SHALL describe what was added/changed
8. THE README.md SHALL include link to CHANGELOG.md for viewing project history
