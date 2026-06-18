# =====================================================
#  MODEX PLUS — Seed con gender + fotos de Unsplash
#  Ejecutar: powershell -ExecutionPolicy Bypass -File .\seed_con_fotos.ps1
# =====================================================

$API          = "http://localhost:8080"
$EMAIL        = "admin@modex.com"
$PASSWORD     = "password123"
$UNSPLASH_KEY = "7g1pmi7PNlI-f3uAZYOAHxIyG95VcRneNzAljHcIgy8"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MODEX PLUS — Seed con Fotos" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# ─── LOGIN ────────────────────────────────────────
Write-Host "Iniciando sesion como admin..." -ForegroundColor Yellow
$loginBody = '{"email":"' + $EMAIL + '","password":"' + $PASSWORD + '"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$API/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $TOKEN = $loginRes.accessToken
    Write-Host "OK - Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "ERROR en login: $_" -ForegroundColor Red
    pause; exit
}

$HEADERS = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# ─── BORRAR PRODUCTOS EXISTENTES ──────────────────
Write-Host "Borrando productos existentes..." -ForegroundColor Yellow
try {
    $existentes = Invoke-RestMethod -Uri "$API/api/products" -Method GET -Headers $HEADERS
    $lista = if ($existentes -is [array]) { $existentes } else { $existentes.content }
    $borrados = 0
    foreach ($p in $lista) {
        try { Invoke-RestMethod -Uri "$API/api/products/$($p.id)" -Method DELETE -Headers $HEADERS | Out-Null; $borrados++ } catch { }
    }
    Write-Host "OK - $borrados productos eliminados" -ForegroundColor Green
} catch {
    Write-Host "No se pudieron borrar productos (continuando)" -ForegroundColor Yellow
}

# ─── FUNCION: buscar foto en Unsplash ─────────────
function Get-UnsplashPhoto($query) {
    try {
        $encoded = [System.Uri]::EscapeDataString($query)
        $url = "https://api.unsplash.com/photos/random?query=$encoded&orientation=portrait&client_id=$UNSPLASH_KEY"
        $res = Invoke-RestMethod -Uri $url -Method GET
        return $res.urls.regular
    } catch {
        return $null
    }
}

# Queries por genero y categoria
$QUERIES = @{
    # MUJER
    "MUJER_VESTIDO"   = "plus size woman elegant dress fashion"
    "MUJER_CAMISETA"  = "plus size woman blouse top fashion"
    "MUJER_PANTALON"  = "plus size woman pants fashion"
    "MUJER_FALDA"     = "plus size woman skirt fashion"
    "MUJER_CHAQUETA"  = "plus size woman jacket blazer fashion"
    "MUJER_CONJUNTO"  = "plus size woman outfit set fashion"
    "MUJER_ACCESORIO" = "woman fashion accessories jewelry"
    # HOMBRE
    "HOMBRE_CAMISETA" = "plus size man shirt fashion"
    "HOMBRE_PANTALON" = "plus size man pants fashion"
    "HOMBRE_CHAQUETA" = "plus size man jacket fashion"
    "HOMBRE_CONJUNTO" = "plus size man outfit suit fashion"
    "HOMBRE_ACCESORIO"= "man fashion accessories"
    # NINOS
    "NINOS_VESTIDO"   = "kids girl dress fashion"
    "NINOS_CAMISETA"  = "kids fashion shirt clothing"
    "NINOS_PANTALON"  = "kids fashion pants clothing"
    "NINOS_CONJUNTO"  = "kids fashion outfit set"
}

# Cache de fotos para no repetir queries identicos
$photoCache = @{}

function Get-Photo($gender, $category) {
    $key = "${gender}_${category}"
    if (-not $QUERIES.ContainsKey($key)) { $key = "${gender}_CAMISETA" }
    if ($photoCache.ContainsKey($key)) {
        # Devolver foto del cache pero rotar para variar
        return $photoCache[$key]
    }
    $photo = Get-UnsplashPhoto $QUERIES[$key]
    if ($photo) { $photoCache[$key] = $photo }
    Start-Sleep -Milliseconds 300  # respetar rate limit Unsplash
    return $photo
}

# ─── PRODUCTOS ────────────────────────────────────
$productos = @(
    # ══ MUJER — VESTIDOS ══
    @{ name="Aurora Luxe"; description="Vestido elegante de saten con caida perfecta para tallas grandes. Ideal para bodas y eventos formales. Su corte A-line favorece toda silueta plus size."; price=2800; category="VESTIDO"; gender="MUJER"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Champagne","Borgona"); stock=25; occasion="Boda"; style="Elegante" },
    @{ name="Bella Night"; description="Vestido midi de encaje con forro interior. Perfecto para graduaciones y cenas especiales. Diseno wrap que se adapta a curvas voluminosas."; price=1950; category="VESTIDO"; gender="MUJER"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","1X","2X"); availableColors=@("Negro","Azul marino"); stock=18; occasion="Graduacion"; style="Encaje" },
    @{ name="Carmen Floral"; description="Vestido maxi con estampado floral vibrante. Tela chiffon ligera y fresca, ideal para eventos de verano y playa."; price=1400; category="VESTIDO"; gender="MUJER"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Estampado floral","Azul cielo"); stock=30; occasion="Casual"; style="Floral" },
    @{ name="Diana Gala"; description="Vestido de noche con lentejuelas sutiles y escote en V. Silueta ajustada que realza las curvas con elegancia."; price=3200; category="VESTIDO"; gender="MUJER"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Dorado","Plata","Negro"); stock=12; occasion="Gala"; style="Ajustado" },
    @{ name="Elena Wrap"; description="Vestido wrap de jersey stretch en color nude. Versatil y comodo para el trabajo o una cita."; price=1200; category="VESTIDO"; gender="MUJER"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","1X","2X"); availableColors=@("Nude","Blanco","Negro"); stock=40; occasion="Trabajo"; style="Wrap" },
    @{ name="Fiona Baby Shower"; description="Vestido suelto de tul con lazada en la cintura. Romantico y femenino, perfecto para baby showers."; price=1650; category="VESTIDO"; gender="MUJER"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Pastel","Rosado","Lila"); stock=22; occasion="Baby Shower"; style="Suelto" },
    @{ name="Gala Queen"; description="Vestido largo con abertura lateral y escote halter. Disenado para mujeres plus size que celebran sus curvas."; price=2100; category="VESTIDO"; gender="MUJER"; brand="PlusGlow"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Rojo","Negro","Fucsia"); stock=15; occasion="Fiesta"; style="Ajustado" },
    @{ name="Helena Navidad"; description="Vestido con detalles de encaje rojo y verde. Diseno festivo y elegante para celebraciones navidenas."; price=1800; category="VESTIDO"; gender="MUJER"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","1X","2X","3X"); availableColors=@("Rojo","Verde esmeralda"); stock=20; occasion="Navidad"; style="Elegante" },
    @{ name="Iris Midi"; description="Vestido midi de viscosa con bolsillos laterales. Practico y elegante para el dia a dia."; price=1100; category="VESTIDO"; gender="MUJER"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Azul marino","Borgona"); stock=35; occasion="Casual"; style="Midi" },
    @{ name="Julia Pre-Boda"; description="Vestido romantico con hombros descubiertos y olanes en el ruedo. Ideal para pre-bodas y sesiones de fotos."; price=2400; category="VESTIDO"; gender="MUJER"; brand="NoviaSize"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Rosado","Nude","Blanco"); stock=10; occasion="Pre-Boda"; style="Olanes" },
    @{ name="Patricia Fiesta"; description="Vestido corto con top de encaje y falda de tul. Festivo y romantico para cumpleanos y celebraciones."; price=1750; category="VESTIDO"; gender="MUJER"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Rosado","Negro","Rojo"); stock=18; occasion="Cumpleanos"; style="Encaje" },
    @{ name="Raquel Coctel"; description="Vestido de coctel con manga tres cuartos y escote bardot. Sofisticado y elegante para eventos semi-formales."; price=2050; category="VESTIDO"; gender="MUJER"; brand="NoviaSize"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Negro","Azul marino","Borgona"); stock=14; occasion="Coctel"; style="Elegante" },
    @{ name="Sandra Beach Dress"; description="Vestido playero de algodon con estampado tropical. Ligero y fresco para vacaciones en la playa."; price=980; category="VESTIDO"; gender="MUJER"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Estampado floral","Azul cielo","Coral"); stock=35; occasion="Playa"; style="Floral" },
    @{ name="Teresa Maxi Elegance"; description="Vestido maxi de jersey con escote en V profundo. Versatil para usar de dia o de noche."; price=1600; category="VESTIDO"; gender="MUJER"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","4XL","1X","2X","3X"); availableColors=@("Negro","Azul marino","Terracota"); stock=28; occasion="Casual"; style="Maxi" },
    @{ name="Vivian Satin Gown"; description="Vestido largo de saten liso con escote en A y abertura en la pierna. El maximo de la elegancia para bodas."; price=3800; category="VESTIDO"; gender="MUJER"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Champagne","Negro","Azul marino"); stock=8; occasion="Boda"; style="Ajustado" },
    @{ name="Alicia Wrap Dress"; description="Vestido wrap de punto con manga larga. Perfecto para el otono e invierno."; price=1350; category="VESTIDO"; gender="MUJER"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Borgona","Verde oliva","Negro"); stock=32; occasion="Trabajo"; style="Wrap" },
    @{ name="Beatriz Ruffle Dress"; description="Vestido con volantes en el hombro y ruedo asimetrico. Romantico y femenino para fiestas y cumpleanos."; price=1850; category="VESTIDO"; gender="MUJER"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Coral","Fucsia","Lila"); stock=20; occasion="Cumpleanos"; style="Olanes" },
    @{ name="Cecilia Linen Dress"; description="Vestido de lino con bolsillos y cinturon a juego. Casual y sofisticado para el dia a dia."; price=1250; category="VESTIDO"; gender="MUJER"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X"); availableColors=@("Beige","Blanco","Verde oliva"); stock=38; occasion="Casual"; style="Liso" },
    @{ name="Dulce Quinceanera"; description="Vestido de quinceanera con corse y falda voluminosa. Especialmente disenado en tallas plus."; price=4500; category="VESTIDO"; gender="MUJER"; brand="NoviaSize"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Rosado","Lila","Azul cielo","Rojo"); stock=5; occasion="Cumpleanos"; style="Elegante" },
    @{ name="Esmeralda Tropical"; description="Vestido midi con estampado tropical de hojas verdes. Fresco y vibrante para el verano caribeno."; price=1100; category="VESTIDO"; gender="MUJER"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Estampado floral","Verde esmeralda"); stock=30; occasion="Casual"; style="Floral" },
    # ══ MUJER — BLUSAS ══
    @{ name="Karla Blouse"; description="Blusa de chiffon con mangas mariposa. Fresca y elegante para la oficina o salidas casuales."; price=750; category="CAMISETA"; gender="MUJER"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Blanco","Negro","Coral"); stock=50; occasion="Trabajo"; style="Suelto" },
    @{ name="Luna Wrap Top"; description="Top estilo wrap de algodon lycra. Se ajusta perfectamente al busto y la cintura."; price=680; category="CAMISETA"; gender="MUJER"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","1X","2X","3X"); availableColors=@("Negro","Rojo","Azul marino"); stock=45; occasion="Casual"; style="Ajustado" },
    @{ name="Mirna Lace Top"; description="Top de encaje con forro interior. Romantico y femenino para citas y salidas especiales."; price=890; category="CAMISETA"; gender="MUJER"; brand="ElleSize"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Nude","Negro","Borgona"); stock=30; occasion="Coctel"; style="Encaje" },
    @{ name="Olga Satin Blouse"; description="Blusa de saten con lazo frontal. Un toque de lujo para el dia a dia en tallas plus."; price=920; category="CAMISETA"; gender="MUJER"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Champagne","Negro","Rosado"); stock=25; occasion="Trabajo"; style="Satinado" },
    @{ name="Rosa Off-Shoulder"; description="Blusa off-shoulder con olanes en el ruedo. Femenina y fresca para salidas casuales y citas."; price=820; category="CAMISETA"; gender="MUJER"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Blanco","Coral","Fucsia"); stock=35; occasion="Casual"; style="Olanes" },
    # ══ MUJER — FALDAS ══
    @{ name="Valentina Midi Skirt"; description="Falda midi plisada de saten. Elegante y femenina para eventos formales y trabajo."; price=1050; category="FALDA"; gender="MUJER"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Champagne","Borgona"); stock=30; occasion="Trabajo"; style="Satinado" },
    @{ name="Wendy Floral Skirt"; description="Falda maxi con estampado floral y cintura elastica. Ligera y fresca para el verano."; price=880; category="FALDA"; gender="MUJER"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","Plus","1X"); availableColors=@("Estampado floral","Azul cielo"); stock=25; occasion="Casual"; style="Floral" },
    @{ name="Ximena Pencil"; description="Falda lapiz de algodon stretch con abertura posterior. Clasica y profesional para la oficina."; price=950; category="FALDA"; gender="MUJER"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Azul marino","Gris"); stock=35; occasion="Trabajo"; style="Ajustado" },
    @{ name="Yasmin Olanes"; description="Falda con volantes escalonados de chiffon. Romantica y femenina para citas y eventos especiales."; price=1100; category="FALDA"; gender="MUJER"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Coral","Rosado","Blanco"); stock=20; occasion="Coctel"; style="Olanes" },
    @{ name="Zoe Mini Skirt"; description="Mini falda de cuero vegano con cierre lateral. Atrevida y moderna para salidas nocturnas."; price=1200; category="FALDA"; gender="MUJER"; brand="PlusGlow"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Negro","Borgona"); stock=15; occasion="Fiesta"; style="Ajustado" },
    # ══ MUJER — PANTALONES ══
    @{ name="Paola Wide Leg"; description="Pantalon de pierna ancha en tela fluida. Elegante y comodo para la oficina o eventos formales."; price=1300; category="PANTALON"; gender="MUJER"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Beige","Azul marino"); stock=35; occasion="Trabajo"; style="Suelto" },
    @{ name="Sofia Palazzo"; description="Pantalon palazzo de gasa con bolsillos. Fluido y elegante para eventos formales y semi-formales."; price=1150; category="PANTALON"; gender="MUJER"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Blanco","Estampado floral"); stock=28; occasion="Gala"; style="Suelto" },
    @{ name="Ursula Legging"; description="Legging de cintura alta con panel abdominal de control. Tela opaca y resistente para uso diario."; price=720; category="PANTALON"; gender="MUJER"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Borgona","Verde oliva"); stock=70; occasion="Casual"; style="Ajustado" },
    @{ name="Tania Jean Plus"; description="Jean de corte recto con tiro alto especialmente disenado para cuerpos plus size femeninos."; price=1400; category="PANTALON"; gender="MUJER"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Azul marino","Negro","Gris"); stock=60; occasion="Casual"; style="Liso" },
    # ══ MUJER — CHAQUETAS ══
    @{ name="Adriana Blazer"; description="Blazer estructurado de lana con boton dorado. El clasico de la moda plus size para looks formales."; price=2200; category="CHAQUETA"; gender="MUJER"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Beige","Azul marino"); stock=20; occasion="Trabajo"; style="Elegante" },
    @{ name="Brenda Denim Jacket"; description="Chaqueta de denim con bordados florales en la espalda. Casual y trendy para el dia a dia."; price=1500; category="CHAQUETA"; gender="MUJER"; brand="FullFashion"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Azul marino","Negro"); stock=25; occasion="Casual"; style="Suelto" },
    @{ name="Claudia Cardigan"; description="Cardigan largo de punto con botones de nacar. Abrigado y elegante para los dias frios."; price=1350; category="CHAQUETA"; gender="MUJER"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Beige","Gris","Negro","Borgona"); stock=40; occasion="Casual"; style="Suelto" },
    @{ name="Eva Kimono"; description="Kimono de seda estampado con cinto en la cintura. Versatil y elegante para usar como chaqueta o sobre un vestido."; price=1680; category="CHAQUETA"; gender="MUJER"; brand="ElleSize"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Estampado floral","Negro","Azul marino"); stock=18; occasion="Casual"; style="Suelto" },
    # ══ MUJER — CONJUNTOS ══
    @{ name="Fernanda Set Gala"; description="Conjunto de dos piezas: top y pantalon palazzo de tela fluida. Coordinado y elegante para eventos semi-formales."; price=2100; category="CONJUNTO"; gender="MUJER"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Blanco","Coral"); stock=20; occasion="Gala"; style="Elegante" },
    @{ name="Gloria Casual Set"; description="Conjunto casual de camiseta y legging a juego. Perfecto para el fin de semana o actividades al aire libre."; price=1200; category="CONJUNTO"; gender="MUJER"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Gris","Negro","Rosado"); stock=45; occasion="Casual"; style="Suelto" },
    @{ name="Isabel Party Set"; description="Conjunto de fiesta: top brillante y falda midi de saten. Perfecto para celebraciones y eventos nocturnos."; price=2400; category="CONJUNTO"; gender="MUJER"; brand="PlusGlow"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Dorado","Plata","Negro"); stock=15; occasion="Fiesta"; style="Satinado" },
    @{ name="Jessica Athleisure"; description="Conjunto deportivo de lycra con franja lateral contrastante. Comodo y estiloso para el gym o actividades casuales."; price=1300; category="CONJUNTO"; gender="MUJER"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Fucsia","Azul marino"); stock=35; occasion="Casual"; style="Ajustado" },
    @{ name="Hilda Linen Set"; description="Conjunto de lino con top sin mangas y pantalon recto. Fresco y elegante para el verano."; price=1750; category="CONJUNTO"; gender="MUJER"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Beige","Blanco","Verde oliva"); stock=22; occasion="Casual"; style="Liso" },
    # ══ MUJER — ACCESORIOS ══
    @{ name="Karina Belt Plus"; description="Cinturon ancho de cuero vegano con hebilla dorada. Disenado especialmente para tallas grandes."; price=450; category="ACCESORIO"; gender="MUJER"; brand="ModexBasic"; availableSizes=@("U"); availableColors=@("Negro","Marron","Dorado"); stock=60; occasion="Casual"; style="Liso" },
    @{ name="Laura Bag Tote"; description="Bolso tote de cuero vegano con asas largas. Espacioso y practico para el trabajo o compras."; price=1800; category="ACCESORIO"; gender="MUJER"; brand="ElleSize"; availableSizes=@("U"); availableColors=@("Negro","Beige","Marron"); stock=30; occasion="Trabajo"; style="Liso" },
    @{ name="Mariana Necklace"; description="Collar de perlas sinteticas con colgante dorado. Elegante y versatil para vestidos formales."; price=380; category="ACCESORIO"; gender="MUJER"; brand="GlamCurve"; availableSizes=@("U"); availableColors=@("Dorado","Plata"); stock=50; occasion="Gala"; style="Elegante" },
    @{ name="Natalia Scarf"; description="Panuelo de seda estampado multiusos. Usalo como accesorio de cabello, cinturon o bufanda."; price=320; category="ACCESORIO"; gender="MUJER"; brand="BellaSize"; availableSizes=@("U"); availableColors=@("Estampado floral","Negro","Coral"); stock=70; occasion="Casual"; style="Floral" },
    @{ name="Olivia Hat"; description="Sombrero de paja con cinta de tela. Ideal para la playa y eventos al aire libre."; price=520; category="ACCESORIO"; gender="MUJER"; brand="PlusGlow"; availableSizes=@("U"); availableColors=@("Beige","Negro","Coral"); stock=40; occasion="Playa"; style="Suelto" },
    # ══ HOMBRE — CAMISETAS ══
    @{ name="Carlos Classic Polo"; description="Polo de algodon pique con cuello solapa. El clasico masculino adaptado para tallas grandes."; price=650; category="CAMISETA"; gender="HOMBRE"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Blanco","Negro","Azul marino","Gris"); stock=60; occasion="Casual"; style="Liso" },
    @{ name="Diego Linen Shirt"; description="Camisa de lino manga larga para hombres talla grande. Fresca y elegante para verano."; price=980; category="CAMISETA"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Blanco","Beige","Azul cielo"); stock=40; occasion="Trabajo"; style="Liso" },
    @{ name="Eduardo Graphic Tee"; description="Camiseta de algodon con grafico urbano. Estilo streetwear para hombres plus size."; price=550; category="CAMISETA"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Negro","Gris","Blanco"); stock=75; occasion="Casual"; style="Suelto" },
    @{ name="Fernando Formal Shirt"; description="Camisa formal de algodon con tejido premium para hombres de tallas grandes."; price=1100; category="CAMISETA"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Blanco","Azul marino","Negro"); stock=35; occasion="Trabajo"; style="Elegante" },
    @{ name="Gabriel Guayabera"; description="Guayabera de lino con bordado tradicional. Prenda clasica del Caribe adaptada para tallas plus masculinas."; price=1200; category="CAMISETA"; gender="HOMBRE"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Blanco","Beige","Azul cielo"); stock=30; occasion="Fiesta"; style="Liso" },
    @{ name="Hector Henley"; description="Camiseta henley de algodon con botones en el cuello. Casual y comoda para hombres plus size."; price=620; category="CAMISETA"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Gris","Negro","Azul marino","Bordo"); stock=50; occasion="Casual"; style="Liso" },
    @{ name="Ivan Dress Shirt"; description="Camisa de vestir slim fit adaptada para tallas grandes. Para bodas, graduaciones y eventos formales."; price=1350; category="CAMISETA"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Blanco","Azul claro","Negro"); stock=25; occasion="Boda"; style="Elegante" },
    # ══ HOMBRE — PANTALONES ══
    @{ name="Jorge Chino Plus"; description="Pantalon chino de algodon stretch para hombres talla grande. Elastico en la cintura para mayor comodidad."; price=1200; category="PANTALON"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Beige","Azul marino","Gris","Negro"); stock=50; occasion="Casual"; style="Liso" },
    @{ name="Kevin Jogger Plus"; description="Pantalon jogger de algodon con punos en los tobillos. Comodo y moderno para hombres plus size."; price=950; category="PANTALON"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Negro","Gris","Azul marino"); stock=65; occasion="Casual"; style="Suelto" },
    @{ name="Luis Dress Pant"; description="Pantalon de vestir con pinzas frontales. Elegante y comodo para hombres de tallas grandes."; price=1450; category="PANTALON"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Azul marino","Gris oscuro"); stock=30; occasion="Trabajo"; style="Elegante" },
    @{ name="Miguel Jean Relaxed"; description="Jean de corte relaxed especialmente disenado para cuerpos masculinos plus size."; price=1500; category="PANTALON"; gender="HOMBRE"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Azul marino","Negro","Azul claro"); stock=55; occasion="Casual"; style="Liso" },
    @{ name="Nicolas Cargo Plus"; description="Pantalon cargo de algodon con multiples bolsillos. Practico y resistente para actividades al aire libre."; price=1300; category="PANTALON"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Verde oliva","Negro","Beige"); stock=40; occasion="Casual"; style="Suelto" },
    # ══ HOMBRE — CHAQUETAS ══
    @{ name="Oscar Blazer Hombre"; description="Blazer masculino de lana con boton unico. Silueta moderna adaptada para hombres plus size."; price=2500; category="CHAQUETA"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Azul marino","Gris"); stock=18; occasion="Trabajo"; style="Elegante" },
    @{ name="Pedro Bomber Plus"; description="Chaqueta bomber de poliester con interior de felpa. Casual y moderna para hombres de tallas grandes."; price=1800; category="CHAQUETA"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Negro","Verde militar","Azul marino"); stock=25; occasion="Casual"; style="Suelto" },
    @{ name="Rafael Denim Jacket H"; description="Chaqueta de denim clasica para hombres plus size. Corte recto y confortable."; price=1600; category="CHAQUETA"; gender="HOMBRE"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Azul marino","Negro"); stock=30; occasion="Casual"; style="Liso" },
    # ══ HOMBRE — CONJUNTOS ══
    @{ name="Samuel Suit Set"; description="Conjunto de traje masculino: saco y pantalon a juego. Elegante y profesional para bodas y negocios."; price=3500; category="CONJUNTO"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Azul marino","Gris"); stock=12; occasion="Boda"; style="Elegante" },
    @{ name="Tomas Casual Set H"; description="Conjunto casual masculino: camiseta y jogger a juego. Comodo y estiloso para el fin de semana."; price=1400; category="CONJUNTO"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("XL","2XL","3XL","4XL","5XL"); availableColors=@("Gris","Negro","Azul marino"); stock=40; occasion="Casual"; style="Suelto" },
    @{ name="Victor Linen Set H"; description="Conjunto de lino masculino: camisa y pantalon. Fresco y elegante para el verano."; price=2100; category="CONJUNTO"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Beige","Blanco","Verde oliva"); stock=20; occasion="Casual"; style="Liso" },
    # ══ HOMBRE — ACCESORIOS ══
    @{ name="William Belt H"; description="Cinturon de cuero genuino para hombres talla grande. Hebilla metalica clasica."; price=580; category="ACCESORIO"; gender="HOMBRE"; brand="ModexBasic"; availableSizes=@("U"); availableColors=@("Negro","Marron"); stock=55; occasion="Casual"; style="Liso" },
    @{ name="Xavier Wallet Plus"; description="Billetera de cuero vegano con multiples compartimentos y proteccion RFID."; price=650; category="ACCESORIO"; gender="HOMBRE"; brand="BigManStyle"; availableSizes=@("U"); availableColors=@("Negro","Marron","Azul marino"); stock=45; occasion="Casual"; style="Liso" },
    @{ name="Yoel Cap Urban"; description="Gorra de beisbol de algodon con bordado urbano. Talla ajustable para cabezas grandes."; price=420; category="ACCESORIO"; gender="HOMBRE"; brand="UrbanPlus"; availableSizes=@("U"); availableColors=@("Negro","Gris","Azul marino","Blanco"); stock=70; occasion="Casual"; style="Suelto" },
    # ══ NINOS — CAMISETAS ══
    @{ name="Ariel Tee Kids"; description="Camiseta de algodon suave para ninos tallas grandes. Suave, comoda y facil de lavar."; price=380; category="CAMISETA"; gender="NINOS"; brand="KidsCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Blanco","Azul cielo","Rojo","Gris"); stock=80; occasion="Casual"; style="Liso" },
    @{ name="Bruno Polo Kids"; description="Polo de algodon pique para ninos tallas grandes. Perfecto para el colegio o salidas casuales."; price=450; category="CAMISETA"; gender="NINOS"; brand="KidsCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Blanco","Azul marino","Verde"); stock=60; occasion="Casual"; style="Liso" },
    @{ name="Clara Blouse Kids"; description="Blusa de algodon con bordado floral para ninas tallas grandes. Comoda y femenina."; price=420; category="CAMISETA"; gender="NINOS"; brand="LittleCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Blanco","Rosado","Amarillo"); stock=55; occasion="Casual"; style="Floral" },
    # ══ NINOS — PANTALONES ══
    @{ name="David Jean Kids"; description="Jean de corte relaxed para ninos de tallas grandes. Con elastico en la cintura para ajuste facil."; price=750; category="PANTALON"; gender="NINOS"; brand="KidsCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Azul marino","Negro"); stock=70; occasion="Casual"; style="Liso" },
    @{ name="Emma Legging Kids"; description="Legging de algodon con cintura elastica para ninas tallas grandes. Suave y comodo."; price=480; category="PANTALON"; gender="NINOS"; brand="LittleCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Negro","Rosado","Morado"); stock=65; occasion="Casual"; style="Ajustado" },
    # ══ NINOS — VESTIDOS ══
    @{ name="Florencia Dress Kids"; description="Vestido de algodon con estampado floral para ninas tallas grandes. Ligero y fresco para el verano."; price=680; category="VESTIDO"; gender="NINOS"; brand="LittleCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Estampado floral","Rosado","Amarillo"); stock=45; occasion="Casual"; style="Floral" },
    @{ name="Genesis Party Dress"; description="Vestido de fiesta para ninas tallas grandes. Con top de tul y lazo en la espalda."; price=980; category="VESTIDO"; gender="NINOS"; brand="LittleCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Rosado","Lila","Azul cielo","Blanco"); stock=30; occasion="Cumpleanos"; style="Elegante" },
    # ══ NINOS — CONJUNTOS ══
    @{ name="Hugo Casual Set Kids"; description="Conjunto casual para ninos tallas grandes: camiseta y pantalon a juego."; price=850; category="CONJUNTO"; gender="NINOS"; brand="KidsCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Azul marino","Gris","Negro"); stock=50; occasion="Casual"; style="Liso" },
    @{ name="Isabella Party Set Kids"; description="Conjunto de fiesta para ninas tallas grandes: top y falda a juego."; price=1100; category="CONJUNTO"; gender="NINOS"; brand="LittleCurve"; availableSizes=@("8","10","12","14","16"); availableColors=@("Rosado","Dorado","Blanco"); stock=25; occasion="Fiesta"; style="Elegante" }
)

# ─── INSERTAR CON FOTOS ───────────────────────────
Write-Host ""
Write-Host "Buscando fotos e insertando $($productos.Count) productos..." -ForegroundColor Yellow
Write-Host ""

$exitosos = 0; $fallidos = 0; $i = 0

foreach ($p in $productos) {
    $i++

    # Buscar foto de Unsplash segun gender + category
    $imgUrl = Get-Photo $p.gender $p.category
    if ($imgUrl) { $p["imageUrl"] = $imgUrl }

    $body = $p | ConvertTo-Json -Depth 3
    try {
        Invoke-RestMethod -Uri "$API/api/products" -Method POST -Headers $HEADERS -Body $body -ContentType "application/json" | Out-Null
        $exitosos++
        $foto = if ($imgUrl) { "con foto" } else { "sin foto" }
        Write-Host "  OK [$i/$($productos.Count)] [$($p.gender.PadRight(7))] $($p.name.PadRight(28)) $foto" -ForegroundColor Green
    } catch {
        $fallidos++
        Write-Host "  ERROR [$i] $($p.name) - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Insertados: $exitosos / Fallidos: $fallidos" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
pause
