# =====================================================
#  MODEX PLUS — Arrancar todo
#  Doble clic en este archivo o ejecutar desde ropa-store/
#  powershell -ExecutionPolicy Bypass -File .\start.ps1
# =====================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MODEX PLUS - Iniciando..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Levantar Docker
Write-Host "Backend: Levantando microservicios con Docker..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker no pudo iniciar. Asegurate de que Docker Desktop este abierto." -ForegroundColor Red
    Write-Host "Abre Docker Desktop y vuelve a ejecutar este script." -ForegroundColor Red
    pause
    exit
}

Write-Host "OK - Docker levantado" -ForegroundColor Green
Write-Host ""

# 2. Esperar a que los servicios estén listos
Write-Host "Esperando 15 segundos para que los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 3. Verificar que el gateway responde
Write-Host "Verificando backend en localhost:8080..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/products" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "OK - Backend respondiendo correctamente" -ForegroundColor Green
} catch {
    Write-Host "AVISO: El gateway aun no responde (puede tardar un poco mas)" -ForegroundColor DarkYellow
    Write-Host "Esto es normal, el frontend igual arrancara" -ForegroundColor DarkYellow
}

Write-Host ""

# 4. Levantar frontend en nueva ventana
Write-Host "Frontend: Arrancando React en localhost:5173..." -ForegroundColor Yellow
$frontendPath = Join-Path $root "frontend"

if (!(Test-Path $frontendPath)) {
    Write-Host "ERROR: No se encontro la carpeta frontend/" -ForegroundColor Red
    Write-Host "Asegurate de haber ejecutado el script setup primero." -ForegroundColor Red
    pause
    exit
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; Write-Host 'Iniciando Modex Plus frontend...' -ForegroundColor Cyan; npm run dev"

Write-Host "OK - Frontend arrancando en nueva ventana" -ForegroundColor Green
Write-Host ""

# 5. Esperar y abrir navegador
Write-Host "Abriendo navegador en 5 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Todo listo!" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para apagar todo luego, ejecuta: docker-compose down" -ForegroundColor Gray
Write-Host ""
pause