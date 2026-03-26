/**
 * Game Settings for GAME_NAME
 * Centralized configuration for all tunable game parameters
 */

/**
 * Calcula las dimensiones del canvas adaptadas al viewport real.
 * Ancho fijo 720, alto proporcional al aspect ratio del viewport.
 * Clampado entre 1080 (2:3) y 1600 (pantallas muy altas como 9:20).
 */
function calculateCanvasDimensions(): { width: number; height: number } {
  const BASE_WIDTH = 720;
  const MIN_HEIGHT = 1080; // 2:3
  const MAX_HEIGHT = 1600; // ~9:20

  const vw = window.innerWidth || 720;
  const vh = window.innerHeight || 1080;
  const viewportRatio = vw / vh;

  // Altura proporcional al viewport, manteniendo ancho fijo
  const rawHeight = Math.round(BASE_WIDTH / viewportRatio);
  const height = Math.min(Math.max(rawHeight, MIN_HEIGHT), MAX_HEIGHT);

  return { width: BASE_WIDTH, height };
}

const canvasDimensions = calculateCanvasDimensions();

/**
 * Calcula el offset superior para la zona de notch/cámara del teléfono.
 * Usa env(safe-area-inset-top) si está disponible.
 * Fallback: si el canvas es más alto que 2:3 y es un dispositivo táctil,
 * asume un notch de ~50px en coordenadas del juego.
 */
function calculateSafeAreaTop(): number {
  // Intentar detectar via CSS env()
  try {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top,0px);pointer-events:none;visibility:hidden;";
    document.body.appendChild(el);
    const cssSafeArea = parseFloat(getComputedStyle(el).paddingTop) || 0;
    document.body.removeChild(el);

    if (cssSafeArea > 0) {
      const scaleFactor = canvasDimensions.width / (window.innerWidth || 720);
      return Math.ceil(cssSafeArea * scaleFactor);
    }
  } catch {
    // Ignorar error de detección CSS
  }

  // Fallback: detectar dispositivo táctil + pantalla más alta que 2:3
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isFullScreen = canvasDimensions.height > 1080;

  if (hasTouch && isFullScreen) {
    // Offset fijo de 50px en coordenadas del juego para zona de notch
    return 50;
  }

  return 0;
}

export const GameSettings = {
  debug: true,

  // Modo desarrollo: mostrar controles móviles en PC para testing
  // true = mostrar siempre | false = solo en dispositivos móviles
  forceShowMobileControls: false,

  canvas: canvasDimensions,

  // Offset superior para notch/cámara del teléfono (en coordenadas del juego)
  safeAreaTop: calculateSafeAreaTop(),
};

export default GameSettings;
