"""
Finance Tracker API
Main application entry point
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command
import os

from app.core.config import settings
from app.core.exceptions import AppException
from app.api.routes import categories, transactions, budgets, analytics

# Настройка логирования
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events для приложения"""
    # Startup: автоматическое применение миграций
    logger.info("Применение миграций базы данных...")
    try:
        import asyncio

        def run_migrations():
            alembic_cfg = Config(
                os.path.join(os.path.dirname(__file__), "..", "alembic.ini")
            )
            alembic_cfg.set_main_option(
                "script_location",
                os.path.join(os.path.dirname(__file__), "..", "alembic"),
            )
            command.upgrade(alembic_cfg, "head")

        # Запускаем миграции в отдельном потоке
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, run_migrations)
        logger.info("Миграции успешно применены")
    except Exception as e:
        logger.error(f"Ошибка при применении миграций: {e}")
        # Не останавливаем приложение, если миграции уже применены

    yield

    # Shutdown
    logger.info("Завершение работы приложения")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    ## API для управления личными финансами
    
    Этот API предоставляет полный набор эндпоинтов для:
    
    * **Категории** - управление категориями доходов и расходов
    * **Транзакции** - создание, редактирование и фильтрация транзакций
    * **Бюджеты** - планирование и отслеживание бюджетов
    * **Аналитика** - получение статистики и отчетов
    
    ### Возможности
    
    - Импорт и экспорт транзакций в CSV
    - Фильтрация и пагинация данных
    - Расчет прогресса бюджетов
    - Аналитика по категориям и периодам
    - Поддержка мультивалютности
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={"name": "Finance Tracker Team", "email": "support@financetracker.com"},
    license_info={
        "name": "MIT",
    },
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(categories.router, prefix=settings.API_V1_PREFIX)
app.include_router(transactions.router, prefix=settings.API_V1_PREFIX)
app.include_router(budgets.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint

    Returns:
        dict: Status message
    """
    return {"status": "ok", "message": "Finance Tracker API is running"}


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint

    Returns:
        dict: Welcome message
    """
    return {
        "message": "Welcome to Finance Tracker API",
        "docs": "/docs",
        "redoc": "/redoc",
    }


# Exception handlers


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Обработчик кастомных исключений приложения"""
    logger.error(f"AppException: {exc.message}", exc_info=True)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "detail": exc.message,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Обработчик ошибок валидации Pydantic"""
    from decimal import Decimal
    
    def convert_decimals(obj):
        """Recursively convert Decimal objects to strings for JSON serialization"""
        if isinstance(obj, Decimal):
            return str(obj)
        elif isinstance(obj, dict):
            return {k: convert_decimals(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_decimals(item) for item in obj]
        return obj
    
    logger.error(f"ValidationError: {exc.errors()}", exc_info=True)
    errors = convert_decimals(exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "detail": errors,
            "status_code": 422,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Обработчик всех остальных исключений"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "detail": "An unexpected error occurred",
            "status_code": 500,
        },
    )
