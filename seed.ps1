# =====================================================
#  MODEX PLUS — Seed de productos via PowerShell
#  Ejecutar: powershell -ExecutionPolicy Bypass -File .\seed.ps1
# =====================================================

$API = "http://localhost:8080"
$EMAIL = "admin@modex.com"
$PASSWORD = "password123"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MODEX PLUS — Cargando productos..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ─── LOGIN ────────────────────────────────────────
Write-Host "Iniciando sesion como admin..." -ForegroundColor Yellow

$loginBody = '{"email":"' + $EMAIL + '","password":"' + $PASSWORD + '"}'

try {
    $loginRes = Invoke-RestMethod -Uri "$API/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $TOKEN = $loginRes.accessToken
    Write-Host "OK - Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "ERROR en login: $_" -ForegroundColor Red
    Write-Host "Asegurate de que el backend este corriendo" -ForegroundColor Red
    pause
    exit
}

Write-Host ""

# ─── PRODUCTOS ────────────────────────────────────
$HEADERS = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

$productos = @(
    # VESTIDOS
    @{ name="Aurora Luxe"; description="Vestido elegante de satén con caída perfecta para tallas grandes. Ideal para bodas y eventos formales. Su corte A-line favorece toda silueta plus size."; price=2800; category="VESTIDO"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Champagne","Borgoña"); stock=25; occasion="Boda"; style="Elegante" },
    @{ name="Bella Night"; description="Vestido midi de encaje con forro interior. Perfecto para graduaciones y cenas especiales. Diseño wrap que se adapta a curvas voluminosas."; price=1950; category="VESTIDO"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","1X","2X"); availableColors=@("Negro","Azul marino"); stock=18; occasion="Graduacion"; style="Encaje" },
    @{ name="Carmen Floral"; description="Vestido maxi con estampado floral vibrante. Tela chiffon ligera y fresca, ideal para eventos de verano y playa. Corte suelto y favorecedor."; price=1400; category="VESTIDO"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Estampado floral","Azul cielo"); stock=30; occasion="Casual"; style="Floral" },
    @{ name="Diana Gala"; description="Vestido de noche con lentejuelas sutiles y escote en V. Silueta ajustada que realza las curvas con elegancia. Para galas y eventos especiales."; price=3200; category="VESTIDO"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Dorado","Plata","Negro"); stock=12; occasion="Gala"; style="Ajustado" },
    @{ name="Elena Wrap"; description="Vestido wrap de jersey stretch en color nude. Versatil y comodo para el trabajo o una cita. El tejido se adapta perfectamente al cuerpo plus size."; price=1200; category="VESTIDO"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","1X","2X"); availableColors=@("Nude","Blanco","Negro"); stock=40; occasion="Trabajo"; style="Wrap" },
    @{ name="Fiona Baby Shower"; description="Vestido suelto de tul con lazada en la cintura. Romantico y femenino, perfecto para baby showers y celebraciones. Disponible en tonos pasteles."; price=1650; category="VESTIDO"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Pastel","Rosado","Lila"); stock=22; occasion="Baby Shower"; style="Suelto" },
    @{ name="Gala Queen"; description="Vestido largo con abertura lateral y escote halter. Diseño atrevido y sensual para mujeres plus size que celebran sus curvas. Para fiestas y eventos nocturnos."; price=2100; category="VESTIDO"; brand="PlusGlow"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Rojo","Negro","Fucsia"); stock=15; occasion="Fiesta"; style="Ajustado" },
    @{ name="Helena Navidad"; description="Vestido con detalles de encaje rojo y verde. Diseno festivo y elegante para celebraciones navidenas. Tela terciopelo suave y comodo."; price=1800; category="VESTIDO"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","1X","2X","3X"); availableColors=@("Rojo","Verde esmeralda"); stock=20; occasion="Navidad"; style="Elegante" },
    @{ name="Iris Midi"; description="Vestido midi de viscosa con bolsillos laterales. Practico y elegante para el dia a dia. El corte recto favorece siluetas voluminosas con un toque moderno."; price=1100; category="VESTIDO"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Azul marino","Borgoña"); stock=35; occasion="Casual"; style="Midi" },
    @{ name="Julia Pre-Boda"; description="Vestido romantico con hombros descubiertos y olanes en el ruedo. Ideal para pre-bodas y sesiones de fotos. Tela chiffon fluida en tonos rosados."; price=2400; category="VESTIDO"; brand="NoviaSize"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Rosado","Nude","Blanco"); stock=10; occasion="Pre-Boda"; style="Olanes" },

    # CAMISETAS / BLUSAS
    @{ name="Karla Blouse"; description="Blusa de chiffon con mangas mariposa. Fresca y elegante para la oficina o salidas casuales. El corte holgado es ideal para tallas grandes."; price=750; category="CAMISETA"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Blanco","Negro","Coral"); stock=50; occasion="Trabajo"; style="Suelto" },
    @{ name="Luna Wrap Top"; description="Top estilo wrap de algodon lycra. Se ajusta perfectamente al busto y la cintura creando una silueta favorecida. Para el dia a dia."; price=680; category="CAMISETA"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","1X","2X","3X"); availableColors=@("Negro","Rojo","Azul marino"); stock=45; occasion="Casual"; style="Ajustado" },
    @{ name="Mirna Lace Top"; description="Top de encaje con forro interior. Romantico y femenino para citas y salidas especiales. Disponible en colores neutros y vibrantes."; price=890; category="CAMISETA"; brand="ElleSize"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Nude","Negro","Borgoña"); stock=30; occasion="Cita"; style="Encaje" },
    @{ name="Nina Casual"; description="Camiseta basica de algodon premium con cuello en V. El esencial del guardarropa plus size. Suave, comoda y versatil para cualquier ocasion."; price=550; category="CAMISETA"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Blanco","Negro","Gris","Azul cielo","Coral"); stock=80; occasion="Casual"; style="Liso" },
    @{ name="Olga Satín"; description="Blusa de satin con lazo frontal. Un toque de lujo para el dia a dia. Perfecta para combinar con pantalones de vestir o jeans en tallas grandes."; price=920; category="CAMISETA"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Champagne","Negro","Rosado"); stock=25; occasion="Trabajo"; style="Satinado" },

    # PANTALONES
    @{ name="Paola Wide Leg"; description="Pantalon de pierna ancha en tela fluida. Elegante y comodo para la oficina o eventos formales. El corte de cintura alta estiliza la silueta plus size."; price=1300; category="PANTALON"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Beige","Azul marino"); stock=35; occasion="Trabajo"; style="Suelto" },
    @{ name="Regina Skinny"; description="Pantalon skinny de algodon lycra con maximo confort. El tejido stretch se adapta perfectamente a curvas generosas sin perder la forma."; price=980; category="PANTALON"; brand="FullFashion"; availableSizes=@("XL","2XL","3XL","4XL","1X","2X","3X"); availableColors=@("Negro","Azul marino","Borgoña"); stock=40; occasion="Casual"; style="Ajustado" },
    @{ name="Sofia Palazzo"; description="Pantalon palazzo de gasa con bolsillos. Fluido y elegante para eventos formales y semi-formales. Cintura elastica para maximo confort en tallas plus."; price=1150; category="PANTALON"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Blanco","Estampado floral"); stock=28; occasion="Gala"; style="Suelto" },
    @{ name="Tania Jean Plus"; description="Jean de corte recto con tiro alto especialmente disenado para cuerpos plus size. Denim premium con 2% elastano para comodidad total durante todo el dia."; price=1400; category="PANTALON"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Azul marino","Negro","Gris"); stock=60; occasion="Casual"; style="Liso" },
    @{ name="Ursula Legging"; description="Legging de cintura alta con panel abdominal de control. Tela opaca y resistente. Ideal para uso diario, ejercicio suave o combinar con tunicas largas."; price=720; category="PANTALON"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Borgoña","Verde oliva"); stock=70; occasion="Casual"; style="Ajustado" },

    # FALDAS
    @{ name="Valentina Midi Skirt"; description="Falda midi plisada de satén. Elegante y femenina para eventos formales y trabajo. El plisado crea movimiento y favorece siluetas plus size con distincion."; price=1050; category="FALDA"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Champagne","Borgoña"); stock=30; occasion="Trabajo"; style="Satinado" },
    @{ name="Wendy Floral Skirt"; description="Falda maxi con estampado floral y cintura elastica. Ligera y fresca para el verano. El largo maxi cubre y estiliza las piernas en cuerpos plus size."; price=880; category="FALDA"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","Plus","1X"); availableColors=@("Estampado floral","Azul cielo"); stock=25; occasion="Casual"; style="Floral" },
    @{ name="Ximena Pencil"; description="Falda lapiz de algodon stretch con abertura posterior. Clasica y profesional para la oficina. El corte ajustado resalta la cintura y las caderas con elegancia."; price=950; category="FALDA"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Azul marino","Gris"); stock=35; occasion="Trabajo"; style="Ajustado" },
    @{ name="Yasmin Olanes"; description="Falda con volantes escalonados de chiffon. Romantica y femenina para citas y eventos especiales. Los olanes agregan movimiento y gracia al caminar."; price=1100; category="FALDA"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Coral","Rosado","Blanco"); stock=20; occasion="Cita"; style="Olanes" },
    @{ name="Zoe Mini Skirt"; description="Mini falda de cuero vegano con cierre lateral. Atrevida y moderna para salidas nocturnas. Cintura elastica para ajuste perfecto en tallas plus."; price=1200; category="FALDA"; brand="PlusGlow"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Negro","Borgoña"); stock=15; occasion="Fiesta"; style="Ajustado" },

    # CHAQUETAS
    @{ name="Adriana Blazer"; description="Blazer estructurado de lana con boton dorado. El clasico de la moda plus size para looks formales y de negocios. Corte slim adaptado para curvas generosas."; price=2200; category="CHAQUETA"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Beige","Azul marino"); stock=20; occasion="Trabajo"; style="Elegante" },
    @{ name="Brenda Denim Jacket"; description="Chaqueta de denim con bordados florales en la espalda. Casual y trendy para el dia a dia. Corte oversized especialmente concebido para tallas grandes."; price=1500; category="CHAQUETA"; brand="FullFashion"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Azul marino","Negro"); stock=25; occasion="Casual"; style="Suelto" },
    @{ name="Claudia Cardigan"; description="Cardigan largo de punto con botones de nacar. Abrigado y elegante para los dias frios. Versatil para combinar con vestidos o pantalones en tallas plus."; price=1350; category="CHAQUETA"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Beige","Gris","Negro","Borgoña"); stock=40; occasion="Casual"; style="Suelto" },
    @{ name="Daniela Leather Jacket"; description="Chaqueta de cuero vegano con detalles metalicos. Rock chic para mujeres plus size que no tienen miedo de destacar. Forro interior de felpa suave."; price=2800; category="CHAQUETA"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Borgoña"); stock=12; occasion="Casual"; style="Ajustado" },
    @{ name="Eva Kimono"; description="Kimono de seda estampado con cinto en la cintura. Versatil y elegante para usar como chaqueta o sobre un vestido. Diseno oriental con flores y pajaros."; price=1680; category="CHAQUETA"; brand="ElleSize"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Estampado floral","Negro","Azul marino"); stock=18; occasion="Casual"; style="Suelto" },

    # CONJUNTOS
    @{ name="Fernanda Set"; description="Conjunto de dos piezas: top y pantalon palazzo de tela fluida. Coordinado y elegante para eventos semi-formales. El set completo crea una silueta armoniosa plus size."; price=2100; category="CONJUNTO"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Negro","Blanco","Coral"); stock=20; occasion="Gala"; style="Elegante" },
    @{ name="Gloria Casual Set"; description="Conjunto casual de camiseta y legging a juego. Perfecto para el fin de semana o actividades al aire libre. Tela suave de algodon con 5% elastano para comodidad total."; price=1200; category="CONJUNTO"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X","2X"); availableColors=@("Gris","Negro","Rosado"); stock=45; occasion="Casual"; style="Suelto" },
    @{ name="Hilda Linen Set"; description="Conjunto de lino con top sin mangas y pantalon recto. Fresco y elegante para el verano. El lino natural es ideal para dias calurosos en tallas plus."; price=1750; category="CONJUNTO"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","Plus"); availableColors=@("Beige","Blanco","Verde oliva"); stock=22; occasion="Casual"; style="Liso" },
    @{ name="Isabel Party Set"; description="Conjunto de fiesta: top brillante y falda midi de satén. Perfecto para celebraciones y eventos nocturnos. Materiales premium para un look sofisticado plus size."; price=2400; category="CONJUNTO"; brand="PlusGlow"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Dorado","Plata","Negro"); stock=15; occasion="Fiesta"; style="Satinado" },
    @{ name="Jessica Athleisure"; description="Conjunto deportivo de lycra con franja lateral contrastante. Comodo y estiloso para el gym o actividades casuales. Tela de alta compresion para soporte optimo."; price=1300; category="CONJUNTO"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Negro","Fucsia","Azul marino"); stock=35; occasion="Casual"; style="Ajustado" },

    # ACCESORIOS
    @{ name="Karina Belt Plus"; description="Cinturon ancho de cuero vegano con hebilla dorada. Disenado especialmente para tallas grandes con mayor rango de ajuste. Define la cintura y transforma cualquier look."; price=450; category="ACCESORIO"; brand="ModexBasic"; availableSizes=@("U"); availableColors=@("Negro","Marron","Dorado"); stock=60; occasion="Casual"; style="Liso" },
    @{ name="Laura Bag Tote"; description="Bolso tote de cuero vegano con asas largas. Espacioso y practico para el trabajo o compras. Capacidad para laptop de 13 pulgadas. Perfecto complemento plus size."; price=1800; category="ACCESORIO"; brand="ElleSize"; availableSizes=@("U"); availableColors=@("Negro","Beige","Marron"); stock=30; occasion="Trabajo"; style="Liso" },
    @{ name="Mariana Necklace"; description="Collar de perlas sinteticas con colgante dorado. Elegante y versatil para complementar vestidos formales o looks casuales. Longitud ajustable."; price=380; category="ACCESORIO"; brand="GlamCurve"; availableSizes=@("U"); availableColors=@("Dorado","Plata"); stock=50; occasion="Gala"; style="Elegante" },
    @{ name="Natalia Scarf"; description="Panuelo de seda estampado multiusos. Usalo como accesorio de cabello, cinturon o bufanda. Estampado floral vibrante que complementa looks plus size minimalistas."; price=320; category="ACCESORIO"; brand="BellaSize"; availableSizes=@("U"); availableColors=@("Estampado floral","Negro","Coral"); stock=70; occasion="Casual"; style="Floral" },
    @{ name="Olivia Hat"; description="Sombrero de paja con cinta de tela. Ideal para la playa y eventos al aire libre. Protege del sol con estilo. Talla unica con ajuste interior para mayor comodidad."; price=520; category="ACCESORIO"; brand="PlusGlow"; availableSizes=@("U"); availableColors=@("Beige","Negro","Coral"); stock=40; occasion="Playa"; style="Suelto" },

    # MAS VESTIDOS
    @{ name="Patricia Fiesta"; description="Vestido corto con top de encaje y falda de tul. Festivo y romantico para cumpleanos y celebraciones. El conjunto de texturas crea un look sofisticado y juvenil."; price=1750; category="VESTIDO"; brand="CurvyChic"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Rosado","Negro","Rojo"); stock=18; occasion="Cumpleanos"; style="Encaje" },
    @{ name="Raquel Coctel"; description="Vestido de coctel con manga tres cuartos y escote bardot. Sofisticado y elegante para eventos semi-formales. Tela de crepe que cae perfectamente en cuerpos plus size."; price=2050; category="VESTIDO"; brand="NoviaSize"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Negro","Azul marino","Borgoña"); stock=14; occasion="Coctel"; style="Elegante" },
    @{ name="Sandra Beach Dress"; description="Vestido playero de algodon con estampado tropical. Ligero y fresco para vacaciones en la playa. El corte A-line es comodo y favorecedor para tallas plus en verano."; price=980; category="VESTIDO"; brand="SizeFree"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Estampado floral","Azul cielo","Coral"); stock=35; occasion="Playa"; style="Floral" },
    @{ name="Teresa Maxi Elegance"; description="Vestido maxi de jersey con escote en V profundo. Versatil para usar de dia o de noche segun los accesorios. Tela stretch que se adapta y abraza las curvas plus."; price=1600; category="VESTIDO"; brand="PlusElegance"; availableSizes=@("XL","2XL","3XL","4XL","1X","2X","3X"); availableColors=@("Negro","Azul marino","Terracota"); stock=28; occasion="Casual"; style="Maxi" },
    @{ name="Vivian Satín Gown"; description="Vestido largo de satén liso con escote en A y abertura en la pierna. El maximo de la elegancia para bodas y eventos de gala. Silueta de sirena adaptada para plus size."; price=3800; category="VESTIDO"; brand="GlamCurve"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Champagne","Negro","Azul marino"); stock=8; occasion="Boda"; style="Ajustado" },
    @{ name="Alicia Wrap Dress"; description="Vestido wrap de punto con manga larga. Perfecto para el otono e invierno. El cruce frontal permite ajustar el escote segun la preferencia. Elegante y comodo para tallas plus."; price=1350; category="VESTIDO"; brand="StyleCurve"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Borgoña","Verde oliva","Negro"); stock=32; occasion="Trabajo"; style="Wrap" },
    @{ name="Beatriz Ruffle Dress"; description="Vestido con volantes en el hombro y ruedo asimetrico. Romantico y femenino para fiestas y cumpleanos. Los volantes agregan dimension y movimiento al look plus size."; price=1850; category="VESTIDO"; brand="CurveLux"; availableSizes=@("XL","2XL","3XL","4XL"); availableColors=@("Coral","Fucsia","Lila"); stock=20; occasion="Cumpleanos"; style="Olanes" },
    @{ name="Cecilia Linen Dress"; description="Vestido de lino con bolsillos y cinturon a juego. Casual y sofisticado para el dia a dia. El lino natural permite la transpiracion y es ideal para cuerpos plus en climas calidos."; price=1250; category="VESTIDO"; brand="ModexBasic"; availableSizes=@("XL","2XL","3XL","4XL","Plus","1X"); availableColors=@("Beige","Blanco","Verde oliva"); stock=38; occasion="Casual"; style="Liso" },
    @{ name="Dulce Quinceañera"; description="Vestido de quinceañera con corsé y falda voluminosa. Especialmente disenado en tallas plus para el dia mas especial. Disponible en los colores mas soñados con telas de lujo."; price=4500; category="VESTIDO"; brand="NoviaSize"; availableSizes=@("XL","2XL","3XL"); availableColors=@("Rosado","Lila","Azul cielo","Rojo"); stock=5; occasion="Cumpleanos"; style="Elegante" },
    @{ name="Esmeralda Tropical"; description="Vestido midi con estampado tropical de hojas verdes. Fresco y vibrante para el verano caribeno. Tela viscosa que cae con elegancia en siluetas voluminosas."; price=1100; category="VESTIDO"; brand="BellaSize"; availableSizes=@("XL","2XL","3XL","4XL","Plus"); availableColors=@("Estampado floral","Verde esmeralda"); stock=30; occasion="Casual"; style="Floral" }
)

# ─── CREAR PRODUCTOS ──────────────────────────────
Write-Host "Creando $($productos.Count) productos..." -ForegroundColor Yellow
Write-Host ""

$exitosos = 0
$fallidos  = 0
$i = 0

foreach ($p in $productos) {
    $i++
    $body = $p | ConvertTo-Json -Depth 3

    try {
        $res = Invoke-RestMethod -Uri "$API/api/products" -Method POST -Headers $HEADERS -Body $body -ContentType "application/json"
        $exitosos++
        $precio = "RD$" + $p.price.ToString("N0")
        Write-Host "  OK [$i/$($productos.Count)] $($p.name.PadRight(30)) $($p.category.PadRight(12)) $precio" -ForegroundColor Green
    } catch {
        $fallidos++
        Write-Host "  ERROR [$i/$($productos.Count)] $($p.name) - $_" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Productos creados:  $exitosos" -ForegroundColor Green
Write-Host "  Fallidos:           $fallidos" -ForegroundColor $(if ($fallidos -gt 0) { "Red" } else { "Green" })
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abre http://localhost:5173 para ver los productos" -ForegroundColor Yellow
Write-Host ""
pause
