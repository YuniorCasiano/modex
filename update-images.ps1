# =====================================================
#  MODEX PLUS — Asignar imagenes Unsplash a productos
#  Ejecutar desde ropa-store/
#  powershell -ExecutionPolicy Bypass -File .\update-images.ps1
# =====================================================

$API          = "http://localhost:8080"
$UNSPLASH_KEY = "xKIKC6P2MXlb3fRJhZpETmuTDkaIwcjp-EJvWYZln5A"
$EMAIL        = "admin@modex.com"
$PASSWORD     = "password123"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MODEX — Asignando imagenes Unsplash" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ─── LOGIN ────────────────────────────────────────
Write-Host "Iniciando sesion..." -ForegroundColor Yellow
$loginBody = '{"email":"' + $EMAIL + '","password":"' + $PASSWORD + '"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$API/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $TOKEN = $loginRes.accessToken
    Write-Host "OK - Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "ERROR en login: $_" -ForegroundColor Red
    pause; exit
}

$HEADERS = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# ─── OBTENER PRODUCTOS ────────────────────────────
Write-Host "Obteniendo productos..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$API/api/products" -Method GET -Headers $HEADERS
    Write-Host "OK - $($products.Count) productos encontrados" -ForegroundColor Green
} catch {
    Write-Host "ERROR obteniendo productos: $_" -ForegroundColor Red
    pause; exit
}

Write-Host ""

# ─── MAPA DE BUSQUEDA POR PRODUCTO ───────────────
# Cada producto tiene su propia busqueda personalizada
# para obtener la imagen mas relevante posible
$searchMap = @{
    "Aurora Luxe"          = "elegant red satin gown formal"
    "Bella Night"          = "black lace midi dress evening"
    "Carmen Floral"        = "colorful floral maxi dress summer"
    "Diana Gala"           = "sequin gold evening gown glamour"
    "Elena Wrap"           = "nude wrap dress casual chic"
    "Fiona Baby Shower"    = "pink tulle dress baby shower"
    "Gala Queen"           = "red hot party dress night out"
    "Helena Navidad"       = "red velvet christmas dress elegant"
    "Iris Midi"            = "black midi dress minimalist"
    "Julia Pre-Boda"       = "pink off shoulder chiffon dress"
    "Karla Blouse"         = "chiffon butterfly sleeve blouse fashion"
    "Luna Wrap Top"        = "wrap crop top fashion casual"
    "Mirna Lace Top"       = "lace blouse romantic fashion"
    "Nina Casual"          = "basic v-neck tshirt casual fashion"
    "Olga Satin"           = "satin bow blouse elegant office"
    "Paola Wide Leg"       = "wide leg palazzo pants elegant"
    "Regina Skinny"        = "skinny stretch pants fashion"
    "Sofia Palazzo"        = "palazzo pants flowy chiffon"
    "Tania Jean Plus"      = "high waist jeans denim fashion"
    "Ursula Legging"       = "high waist legging activewear"
    "Valentina Midi Skirt" = "pleated satin midi skirt elegant"
    "Wendy Floral Skirt"   = "floral maxi skirt boho fashion"
    "Ximena Pencil"        = "pencil skirt office professional"
    "Yasmin Olanes"        = "ruffle chiffon skirt romantic"
    "Zoe Mini Skirt"       = "leather mini skirt edgy fashion"
    "Adriana Blazer"       = "structured blazer women formal"
    "Brenda Denim Jacket"  = "embroidered denim jacket casual"
    "Claudia Cardigan"     = "long knit cardigan cozy fashion"
    "Daniela Leather Jacket" = "leather jacket women rock chic"
    "Eva Kimono"           = "floral kimono jacket elegant"
    "Fernanda Set"         = "two piece set palazzo elegant"
    "Gloria Casual Set"    = "matching set loungewear casual"
    "Hilda Linen Set"      = "linen co-ord set summer casual"
    "Isabel Party Set"     = "sparkle party two piece set"
    "Jessica Athleisure"   = "athletic set gym sporty women"
    "Karina Belt Plus"     = "wide leather belt fashion accessory"
    "Laura Bag Tote"       = "leather tote bag women fashion"
    "Mariana Necklace"     = "pearl necklace elegant jewelry"
    "Natalia Scarf"        = "floral silk scarf fashion accessory"
    "Olivia Hat"           = "straw hat summer beach fashion"
    "Patricia Fiesta"      = "pink tulle party dress birthday"
    "Raquel Coctel"        = "navy blue cocktail dress elegant"
    "Sandra Beach Dress"   = "tropical beach dress colorful summer"
    "Teresa Maxi Elegance" = "jersey maxi dress versatile fashion"
    "Vivian Satin Gown"    = "champagne satin mermaid gown wedding"
    "Alicia Wrap Dress"    = "burgundy wrap dress autumn fashion"
    "Beatriz Ruffle Dress" = "coral ruffle shoulder party dress"
    "Cecilia Linen Dress"  = "beige linen dress casual chic"
    "Dulce Quinceanhera"   = "pink princess ballgown quinceanera"
    "Esmeralda Tropical"   = "tropical print midi dress colorful"
}

# Busquedas por categoria (fallback si el nombre no esta en el mapa)
$categorySearch = @{
    "VESTIDO"   = "elegant dress fashion women"
    "CAMISETA"  = "women blouse fashion top"
    "PANTALON"  = "women pants fashion trousers"
    "FALDA"     = "women skirt fashion"
    "CHAQUETA"  = "women jacket fashion outerwear"
    "CONJUNTO"  = "women outfit set fashion"
    "ACCESORIO" = "fashion accessories women"
}

# ─── FUNCION: Buscar imagen en Unsplash ───────────
function Get-UnsplashImage {
    param([string]$query, [string]$productId)

    $encodedQuery = [Uri]::EscapeDataString($query)
    $url = "https://api.unsplash.com/search/photos?query=$encodedQuery&per_page=5&orientation=portrait&client_id=$UNSPLASH_KEY"

    try {
        $res     = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        $results = $res.results

        if ($results -and $results.Count -gt 0) {
            # Elegir una foto diferente segun el ID del producto
            # para que no todos tengan la misma foto
            $index = [Math]::Abs($productId.GetHashCode()) % $results.Count
            $photo = $results[$index]
            return $photo.urls.regular + "&w=400&h=520&fit=crop"
        }
    } catch {
        Write-Host "    ERROR Unsplash: $_" -ForegroundColor DarkRed
    }
    return $null
}

# ─── ACTUALIZAR PRODUCTOS ─────────────────────────
Write-Host "Buscando y asignando imagenes..." -ForegroundColor Yellow
Write-Host ""

$exitosos = 0
$fallidos  = 0
$i = 0

foreach ($product in $products) {
    $i++
    $name     = $product.name
    $category = $product.category
    $id       = $product.id

    # Buscar query personalizada o usar la de la categoria
    $query = $searchMap[$name]
    if (-not $query) {
        $query = $categorySearch[$category]
        if (-not $query) { $query = "fashion women clothing" }
    }

    Write-Host "  [$i/$($products.Count)] $($name.PadRight(28)) Buscando: $query" -ForegroundColor Gray

    # Buscar imagen en Unsplash
    $imgUrl = Get-UnsplashImage -query $query -productId $id

    if ($imgUrl) {
        # Actualizar el producto con la nueva imagen
        $updateBody = @{
            name            = $product.name
            description     = $product.description
            price           = $product.price
            category        = $product.category
            brand           = $product.brand
            availableSizes  = $product.availableSizes
            availableColors = $product.availableColors
            stock           = $product.stock
            imageUrl        = $imgUrl
        } | ConvertTo-Json -Depth 3

        try {
            Invoke-RestMethod -Uri "$API/api/products/$id" -Method PUT -Headers $HEADERS -Body $updateBody -ContentType "application/json" | Out-Null
            $exitosos++
            Write-Host "    OK - Imagen asignada" -ForegroundColor Green
        } catch {
            $fallidos++
            Write-Host "    ERROR actualizando: $_" -ForegroundColor Red
        }
    } else {
        $fallidos++
        Write-Host "    Sin imagen encontrada" -ForegroundColor DarkYellow
    }

    # Pausa para respetar el rate limit de Unsplash (50 req/hora demo)
    Start-Sleep -Milliseconds 1200
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Productos actualizados: $exitosos"   -ForegroundColor Green
Write-Host "  Fallidos:               $fallidos"   -ForegroundColor $(if ($fallidos -gt 0) {"Red"} else {"Green"})
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Refresca http://localhost:5173 para ver las imagenes" -ForegroundColor Yellow
Write-Host ""
pause
