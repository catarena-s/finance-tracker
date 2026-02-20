# Запуск интеграционных тестов с БД из Docker.
# Из корня репозитория: .\scripts\run-integration-tests.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path "$root\docker-compose.yml")) {
    $root = (Get-Location).Path
}
Set-Location $root

Write-Host "Starting database container..." -ForegroundColor Cyan
docker-compose up -d database 2>&1 | Out-Null

Write-Host "Waiting for Postgres to be ready..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $result = docker exec finance-tracker-db pg_isready -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) { break }
    $attempt++
    if ($attempt -ge $maxAttempts) {
        Write-Error "Database did not become ready in time."
    }
} while ($true)

Write-Host "Creating test database if not exists..." -ForegroundColor Cyan
try { docker exec finance-tracker-db psql -U postgres -d finance_tracker -c "CREATE DATABASE finance_tracker_test;" 2>$null } catch { }

$env:DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5433/finance_tracker_test"
Write-Host "Running integration tests..." -ForegroundColor Cyan
Set-Location "$root\backend"
python -m pytest tests/integration -v --no-cov
exit $LASTEXITCODE
