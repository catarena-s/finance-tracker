# Запуск всех тестов бэкенда в контейнере (в т.ч. Celery — там есть Redis).
# Из корня репозитория: .\scripts\run-backend-tests-in-docker.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path "$root\docker-compose.yml")) {
    $root = (Get-Location).Path
}
Set-Location $root

Write-Host "Backend tests (including Celery) run in container..." -ForegroundColor Cyan
docker-compose exec backend python -m pytest tests/ -v --ignore=tests/e2e -x
exit $LASTEXITCODE
