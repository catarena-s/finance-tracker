"""
Конфигурация для property-based тестов
"""

import os
from hypothesis import settings, Verbosity

# Определяем окружение
IS_CI = os.getenv("CI", "false").lower() == "true"
IS_FAST = os.getenv("FAST_TESTS", "false").lower() == "true"

# Настройки для разных окружений
if IS_CI:
    # CI/CD: быстрые тесты с меньшим количеством примеров
    settings.register_profile(
        "ci",
        max_examples=20,
        deadline=5000,  # 5 секунд на пример
        verbosity=Verbosity.normal,
        print_blob=False,
        stateful_step_count=10,
    )
    settings.load_profile("ci")
elif IS_FAST:
    # Быстрый режим для локальной разработки
    settings.register_profile(
        "fast",
        max_examples=10,
        deadline=3000,
        verbosity=Verbosity.normal,
        print_blob=False,
    )
    settings.load_profile("fast")
else:
    # Полный режим для локальной разработки
    settings.register_profile(
        "dev",
        max_examples=100,
        deadline=None,
        verbosity=Verbosity.verbose,
        print_blob=True,
    )
    settings.load_profile("dev")
