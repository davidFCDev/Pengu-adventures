# Script para incrustar la fuente Fobble como base64 en el HTML

# Leer el archivo de fuente y convertirlo a base64
$fontPath = "public\assets\fonts\Fobble_regular-Regular.otf"
$fontBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($fontPath))

# Crear el CSS con la fuente embebida
$fontCss = @"
@font-face {
  font-family: "Fobble";
  src: url(data:font/otf;base64,$fontBase64) format("opentype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
"@

# Leer el HTML actual
$htmlPath = "dist\index.html"
$html = Get-Content $htmlPath -Raw

# Reemplazar las referencias externas por el CSS inline
$html = $html -replace '<link rel="preload"[^>]*Fobble[^>]*>', ''
$html = $html -replace '<link rel="stylesheet"[^>]*custom-fonts\.css[^>]*>', $fontCss

# Guardar el nuevo HTML
$html | Set-Content -Path "dist\index-standalone.html" -Encoding UTF8

Write-Host "✅ HTML standalone creado: dist\index-standalone.html"
Write-Host "📦 Tamaño de la fuente embebida: $($fontBase64.Length) caracteres"
