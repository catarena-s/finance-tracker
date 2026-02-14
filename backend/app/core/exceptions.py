"""Кастомные исключения приложения"""


class AppException(Exception):
    """Базовое исключение приложения"""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Ресурс не найден"""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class ConflictException(AppException):
    """Конфликт данных (duplicate, foreign key)"""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=409)


class ValidationException(AppException):
    """Ошибка валидации"""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=422)
