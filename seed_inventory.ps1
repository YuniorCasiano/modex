# =====================================================
#  MODEX PLUS — Seed de Inventario
#  Agrega stock en el Inventory Service para todos los productos
#  Ejecutar: powershell -ExecutionPolicy Bypass -File .\seed_inventory.ps1
# =====================================================

$API      = "http://localhost:8080"
$EMAIL    = "admin@modex.com"
$PASSWORD = "password123"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MODEX PLUS — Seed de Inventario" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# ─── LOGIN ────────────────────────────────────────
Write-Host "Iniciando sesion como admin..." -ForegroundColor Yellow
$loginBody = '{"email":"' + $EMAIL + '","password":"' + $PASSWORD + '"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$API/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $TOKEN = $loginRes.accessToken
    $HEADERS = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }
    Write-Host "OK - Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "ERROR en login: $_" -ForegroundColor Red
    pause; exit
}

# ─── OBTENER PRODUCTOS ────────────────────────────
Write-Host "Obteniendo productos..." -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri "$API/api/products" -Headers $HEADERS
    $productos = if ($resp -is [array]) { $resp } else { $resp.content }
    Write-Host "OK - $($productos.Count) productos encontrados" -ForegroundColor Green
} catch {
    Write-Host "ERROR obteniendo productos: $_" -ForegroundColor Red
    pause; exit
}

# Tallas por gender
$tallasAdulto = @("XL","2XL","3XL","4XL")
$tallasHombre = @("XL","2XL","3XL","4XL","5XL")
$tallasNinos  = @("8","10","12","14","16")

# Cantidades por talla adulto
$cantidadAdulto = @{ "XL"=20; "2XL"=20; "3XL"=15; "4XL"=10; "5XL"=8 }
# Cantidades por talla ninos
$cantidadNinos  = @{ "8"=15; "10"=15; "12"=10; "14"=10; "16"=8 }

# ─── AGREGAR STOCK ────────────────────────────────
Write-Host ""
Write-Host "Agregando stock al Inventory Service..." -ForegroundColor Yellow
Write-Host ""

$exitosos = 0; $fallidos = 0; $i = 0

foreach ($p in $productos) {
    $i++

    # Determinar tallas segun gender
    if ($p.gender -eq "NINOS") {
        $tallas = $tallasNinos
        $cantidades = $cantidadNinos
    } elseif ($p.gender -eq "HOMBRE") {
        $tallas = $tallasHombre
        $cantidades = $cantidadAdulto
    } else {
        $tallas = $tallasAdulto
        $cantidades = $cantidadAdulto
    }

    # Accesorios solo tienen talla U
    if ($p.category -eq "ACCESORIO") {
        $tallas = @("U")
        $cantidades = @{ "U"=30 }
    }

    $tallaOk = 0
    foreach ($talla in $tallas) {
        $cantidad = $cantidades[$talla]
        if (-not $cantidad) { $cantidad = 10 }

        $body = @{
            productId = $p.id
            size      = $talla
            quantity  = $cantidad
        } | ConvertTo-Json

        try {
            Invoke-RestMethod -Uri "$API/api/inventory" -Method POST -Headers $HEADERS -Body $body -ContentType "application/json" | Out-Null
            $exitosos++; $tallaOk++
        } catch {
            $fallidos++
        }
        Start-Sleep -Milliseconds 50
    }

    $gender = if ($p.gender) { $p.gender } else { "?" }
    Write-Host "  [$i/$($productos.Count)] [$gender] $($p.name.PadRight(30)) $tallaOk tallas agregadas" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Registros creados: $exitosos" -ForegroundColor Green
Write-Host "  Fallidos:          $fallidos" -ForegroundColor $(if ($fallidos -gt 0) { "Red" } else { "Green" })
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
pause
