"""
Finance Tracker API
Main application entry point
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

from app.core.exceptions import AppException

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Finance Tracker API",
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
    contact={
        "name": "Finance Tracker Team",
        "email": "support@financetracker.com"
    },
    license_info={
        "name": "MIT",
    }
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Обработчик ошибок валидации Pydantic"""
    logger.error(f"ValidationError: {exc.errors()}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "detail": exc.errors(),
            "status_code": 422
        }
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
            "status_code": 500
        }
    )
