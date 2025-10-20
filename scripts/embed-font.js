import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const fontPath = path.join(
  rootDir,
  "public",
  "assets",
  "fonts",
  "TT-Trailers-ExtraBold.otf"
);
const htmlPath = path.join(rootDir, "dist", "index.html");
const outputPath = path.join(rootDir, "dist", "index-standalone.html");

console.log("📦 Generando HTML standalone con fuente embebida...");

try {
  // Leer y convertir fuente a base64
  const fontBuffer = fs.readFileSync(fontPath);
  const fontBase64 = fontBuffer.toString("base64");

  // Crear CSS con fuente embebida
  const fontCss = `<style>
@font-face {
  font-family: "TT-Trailers";
  src: url(data:font/otf;base64,${fontBase64}) format("opentype");
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}
</style>`;

  // Leer HTML
  let html = fs.readFileSync(htmlPath, "utf8");

  // **FIX 1**: Cambiar SDK de @latest a @0.2.1 para compatibilidad Farcade
  html = html.replace(/@farcade\/game-sdk@latest/g, "@farcade/game-sdk@0.2.1");

  // **FIX 2**: Agregar Phaser CDN si no existe
  if (!html.includes("phaser.min.js")) {
    // Insertar después del script del SDK
    html = html.replace(
      /(<script[^>]*@farcade\/game-sdk[^>]*><\/script>)/,
      '$1\n    <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>'
    );
  }

  // **FIX 3**: Simplificar Google Fonts a solo Bangers (Pixelify Sans no se usa)
  html = html.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Bangers&amp;family=Pixelify\+Sans:[^"]*" rel="stylesheet">/g,
    '<link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">'
  );

  // Reemplazar referencias externas por CSS inline
  html = html.replace(/<link rel="preload"[^>]*TT-Trailers[^>]*>/g, "");

  // Reemplazar <link> de custom-fonts.css con el CSS embebido
  html = html.replace(
    /<link rel="stylesheet" href="\.\/assets\/fonts\/custom-fonts\.css">/g,
    fontCss
  );

  // Guardar HTML standalone
  fs.writeFileSync(outputPath, html, "utf8");

  console.log("✅ HTML standalone creado: dist/index-standalone.html");
  console.log(
    `📏 Tamaño de fuente embebida: ${(fontBase64.length / 1024).toFixed(2)} KB`
  );
} catch (error) {
  console.error("❌ Error al generar HTML standalone:", error.message);
  process.exit(1);
}
