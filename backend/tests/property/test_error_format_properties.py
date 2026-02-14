"""Property-based тесты для единого формата ошибок

**Property 32: Единый формат ошибок**
Validates: Requirements 8.1, 8.2, 8.3, 8.5
"""
from hypothesis import given, strategies as st
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.exceptions import (
    AppException,
    NotFoundException,
    ConflictException,
    ValidationException,
)


# Стратегии для генерации данных
error_messages = st.text(min_size=1, max_size=200)
status_codes = st.sampled_from([400, 404, 409, 422, 500])


# Создаем отдельное приложение для тестов
def create_test_app():
    """Создать тестовое FastAPI приложение с обработчиками ошибок"""
    from fastapi import Request, status
    from fastapi.responses import JSONResponse
    from fastapi.exceptions import RequestValidationError
    import logging
    
    test_app = FastAPI()
    logger = logging.getLogger(__name__)
    
    @test_app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.error(f"AppException: {exc.message}", exc_info=True)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.__class__.__name__,
                "detail": exc.message,
                "status_code": exc.status_code
            }
        )
    
    @test_app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"ValidationError: {exc.errors()}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "ValidationError",
                "detail": exc.errors(),
                "status_code": 422
            }
        )
    
    @test_app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "detail": "An unexpected error occurred",
                "status_code": 500
            }
        )
    
    return test_app


@given(message=error_messages)
def test_property_app_exception_format(message):
    """
    Property 32.1: AppException возвращает единый формат
    
    Для любого сообщения об ошибке, AppException должен возвращать
    JSON с полями: error, detail, status_code
    """
    test_app = create_test_app()
    
    @test_app.get("/test-error")
    async def test_endpoint():
        raise AppException(message, status_code=500)
    
    client = TestClient(test_app)
    response = client.get("/test-error")
    
    # Проверяем формат ответа
    assert response.status_code == 500
    data = response.json()
    
    # Проверяем наличие всех обязательных полей
    assert "error" in data
    assert "detail" in data
    assert "status_code" in data
    
    # Проверяем типы полей
    assert isinstance(data["error"], str)
    assert isinstance(data["detail"], str)
    assert isinstance(data["status_code"], int)
    
    # Проверяем значения
    assert data["error"] == "AppException"
    assert data["detail"] == message
    assert data["status_code"] == 500


@given(message=error_messages)
def test_property_not_found_exception_format(message):
    """
    Property 32.2: NotFoundException возвращает единый формат с HTTP 404
    
    Для любого сообщения, NotFoundException должен возвращать
    JSON с правильным форматом и status_code=404
    """
    test_app = create_test_app()
    
    @test_app.get("/test-error")
    async def test_endpoint():
        raise NotFoundException(message)
    
    client = TestClient(test_app)
    response = client.get("/test-error")
    
    assert response.status_code == 404
    data = response.json()
    
    assert "error" in data
    assert "detail" in data
    assert "status_code" in data
    
    assert data["error"] == "NotFoundException"
    assert data["detail"] == message
    assert data["status_code"] == 404


@given(message=error_messages)
def test_property_conflict_exception_format(message):
    """
    Property 32.3: ConflictException возвращает единый формат с HTTP 409
    
    Для любого сообщения, ConflictException должен возвращать
    JSON с правильным форматом и status_code=409
    """
    test_app = create_test_app()
    
    @test_app.get("/test-error")
    async def test_endpoint():
        raise ConflictException(message)
    
    client = TestClient(test_app)
    response = client.get("/test-error")
    
    assert response.status_code == 409
    data = response.json()
    
    assert "error" in data
    assert "detail" in data
    assert "status_code" in data
    
    assert data["error"] == "ConflictException"
    assert data["detail"] == message
    assert data["status_code"] == 409


@given(message=error_messages)
def test_property_validation_exception_format(message):
    """
    Property 32.4: ValidationException возвращает единый формат с HTTP 422
    
    Для любого сообщения, ValidationException должен возвращать
    JSON с правильным форматом и status_code=422
    """
    test_app = create_test_app()
    
    @test_app.get("/test-error")
    async def test_endpoint():
        raise ValidationException(message)
    
    client = TestClient(test_app)
    response = client.get("/test-error")
    
    assert response.status_code == 422
    data = response.json()
    
    assert "error" in data
    assert "detail" in data
    assert "status_code" in data
    
    assert data["error"] == "ValidationException"
    assert data["detail"] == message
    assert data["status_code"] == 422


def test_property_generic_exception_format():
    """
    Property 32.5: Необработанные исключения возвращают единый формат с HTTP 500
    
    Для любого необработанного исключения, система должна возвращать
    JSON с единым форматом и status_code=500
    """
    test_app = create_test_app()
    
    @test_app.get("/test-error")
    async def test_endpoint():
        raise ValueError("Unexpected error")
    
    client = TestClient(test_app, raise_server_exceptions=False)
    response = client.get("/test-error")
    
    assert response.status_code == 500
    data = response.json()
    
    assert "error" in data
    assert "detail" in data
    assert "status_code" in data
    
    assert data["error"] == "InternalServerError"
    assert data["detail"] == "An unexpected error occurred"
    assert data["status_code"] == 500


def test_property_validation_error_format():
    """
    Property 32.6: Ошибки валидации Pydantic возвращают единый формат
    
    Для любой ошибки валидации Pydantic, система должна возвращать
    JSON с единым форматом и status_code=422
    """
    from pydantic import BaseModel, Field
    
    test_app = create_test_app()
    
    class TestModel(BaseModel):
        value: int = Field(..., gt=0)
    
    @test_app.post("/test-validation")
    async def test_endpoint(data: TestModel):
        return data
    
    client = TestClient(test_app)
    # Отправляем невалидные данные
    response = client.post("/test-validation", json={"value": -1})
    
    assert response.status_code == 422
    data = response.json()
    
    assert "error" in data
    assert "detail" in data
    assert "status_code" in data
    
    assert data["error"] == "ValidationError"
    assert isinstance(data["detail"], list)  # Pydantic возвращает список ошибок
    assert data["status_code"] == 422
