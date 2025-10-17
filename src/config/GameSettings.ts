/**
 * Game Settings for GAME_NAME
 * Centralized configuration for all tunable game parameters
 */

export const GameSettings = {
  debug: true,

  // Modo desarrollo: mostrar controles móviles en PC para testing
  // true = mostrar siempre | false = solo en dispositivos móviles
  forceShowMobileControls: false,

  canvas: {
    width: 720,
    height: 1080,
  },
};

export default GameSettings;
