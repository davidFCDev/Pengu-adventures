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
  "Fobble_regular-Regular.otf"
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
  font-family: "Fobble";
  src: url(data:font/otf;base64,${fontBase64}) format("opentype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
</style>`;

  // Leer HTML
  let html = fs.readFileSync(htmlPath, "utf8");

  // Reemplazar referencias externas por CSS inline
  html = html.replace(/<link rel="preload"[^>]*Fobble[^>]*>/g, "");
  html = html.replace(
    /<link rel="stylesheet"[^>]*custom-fonts\.css[^>]*>/g,
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
