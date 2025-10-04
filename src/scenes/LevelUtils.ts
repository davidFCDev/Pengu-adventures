import { GameSceneConfig } from "./BaseGameScene";

/**
 * 🛠️ Utilidades para creación de niveles - Configuraciones predefinidas
 *
 * Este archivo contiene configuraciones comunes y helpers para acelerar
 * la creación de nuevos niveles.
 */

/**
 * 🎯 Configuraciones predefinidas de cámara
 */
export const CameraPresets = {
  // Seguimiento normal - bueno para la mayoría de niveles
  NORMAL: {
    lerp: { x: 1, y: 1 },
    offset: { x: 0, y: 0 },
  },

  // Seguimiento suave - para niveles con movimiento rápido
  SMOOTH: {
    lerp: { x: 0.1, y: 0.1 },
    offset: { x: 0, y: -50 }, // Offset hacia arriba para ver más adelante
  },

  // Seguimiento horizontal - para niveles de plataformas
  PLATFORMER: {
    lerp: { x: 0.1, y: 1 },
    offset: { x: 100, y: -30 }, // Offset hacia adelante en la dirección de movimiento
  },

  // Sin seguimiento vertical - para niveles verticales
  VERTICAL_FIXED: {
    lerp: { x: 1, y: 0 },
    offset: { x: 0, y: 0 },
  },
};

/**
 * 🎨 Configuraciones predefinidas de tilesets
 */
export const TilesetPresets = {
  // Configuración estándar para la mayoría de niveles
  STANDARD: [
    {
      name: "spritesheet-tiles-default",
      imageKey: "spritesheet-tiles-default",
    },
    {
      name: "spritesheet-backgrounds-default",
      imageKey: "spritesheet-backgrounds-default",
    },
  ],

  // Para niveles con tilesets personalizados
  CUSTOM: (customTilesets: Array<{ name: string; imageKey: string }>) => [
    ...TilesetPresets.STANDARD,
    ...customTilesets,
  ],
};

/**
 * 🏁 Posiciones de inicio comunes
 */
export const StartPositions = {
  // Posición estándar para testing
  DEFAULT: { x: 400, y: 900 },

  // Esquina superior izquierda
  TOP_LEFT: { x: 100, y: 100 },

  // Centro del mapa (recomendado calcular según el tamaño real del mapa)
  CENTER: { x: 960, y: 540 },

  // Parte inferior central
  BOTTOM_CENTER: { x: 960, y: 1000 },
};

/**
 * 🎮 Factory function para crear configuraciones de nivel rápidamente
 */
export function createLevelConfig(
  tilemapKey: string,
  options: {
    surfaceLayerName?: string;
    backgroundLayerName?: string;
    objectsLayerName?: string;
    startPosition?: { x: number; y: number };
    cameraPreset?: keyof typeof CameraPresets;
    cameraZoom?: number;
    customTilesets?: Array<{ name: string; imageKey: string }>;
    musicKey?: string;
  } = {}
): GameSceneConfig {
  const {
    surfaceLayerName = "superficies",
    backgroundLayerName = "fondo",
    objectsLayerName = "objects",
    startPosition = StartPositions.DEFAULT,
    cameraPreset = "NORMAL",
    cameraZoom = 1.0,
    customTilesets = [],
    musicKey,
  } = options;

  return {
    tilemapKey,
    surfaceLayerName,
    backgroundLayerName,
    objectsLayerName,
    playerStartPosition: startPosition,
    cameraZoom,
    cameraFollow: CameraPresets[cameraPreset],
    tilesets:
      customTilesets.length > 0
        ? TilesetPresets.CUSTOM(customTilesets)
        : undefined,
    musicKey,
  };
}

/**
 * 🎯 Configuraciones específicas para tipos de nivel comunes
 */
export const LevelTypeConfigs = {
  /**
   * Nivel de testing/debug - configuración similar al TestingMapScene actual
   */
  TESTING: (tilemapKey: string) =>
    createLevelConfig(tilemapKey, {
      startPosition: StartPositions.DEFAULT,
      cameraPreset: "NORMAL",
      musicKey: "level1_music",
    }),

  /**
   * Nivel de plataformas horizontal
   */
  PLATFORMER: (tilemapKey: string) =>
    createLevelConfig(tilemapKey, {
      startPosition: StartPositions.BOTTOM_CENTER,
      cameraPreset: "PLATFORMER",
      cameraZoom: 1.2,
    }),

  /**
   * Nivel vertical (torre, pozo)
   */
  VERTICAL: (tilemapKey: string) =>
    createLevelConfig(tilemapKey, {
      startPosition: StartPositions.BOTTOM_CENTER,
      cameraPreset: "VERTICAL_FIXED",
    }),

  /**
   * Nivel de exploración (mapa grande)
   */
  EXPLORATION: (tilemapKey: string) =>
    createLevelConfig(tilemapKey, {
      startPosition: StartPositions.CENTER,
      cameraPreset: "SMOOTH",
      cameraZoom: 0.8,
    }),
};

/**
 * 📋 Validator para configuraciones de nivel
 */
export function validateLevelConfig(config: GameSceneConfig): string[] {
  const errors: string[] = [];

  if (!config.tilemapKey || config.tilemapKey.trim() === "") {
    errors.push("tilemapKey es requerido");
  }

  if (!config.surfaceLayerName || config.surfaceLayerName.trim() === "") {
    errors.push("surfaceLayerName es requerido");
  }

  if (!config.playerStartPosition) {
    errors.push("playerStartPosition es requerido");
  } else {
    if (
      typeof config.playerStartPosition.x !== "number" ||
      config.playerStartPosition.x < 0
    ) {
      errors.push("playerStartPosition.x debe ser un número positivo");
    }
    if (
      typeof config.playerStartPosition.y !== "number" ||
      config.playerStartPosition.y < 0
    ) {
      errors.push("playerStartPosition.y debe ser un número positivo");
    }
  }

  if (config.cameraZoom && (config.cameraZoom <= 0 || config.cameraZoom > 5)) {
    errors.push("cameraZoom debe estar entre 0 y 5");
  }

  return errors;
}

/**
 * 🎨 Helper para generar código de nivel automáticamente
 */
export function generateLevelCode(
  sceneClassName: string,
  sceneKey: string,
  config: GameSceneConfig
): string {
  return `import { BaseGameScene } from "./BaseGameScene";
import { createLevelConfig } from "./LevelUtils";

export class ${sceneClassName} extends BaseGameScene {
  constructor() {
    const config = createLevelConfig("${config.tilemapKey}", {
      startPosition: { x: ${config.playerStartPosition.x}, y: ${
    config.playerStartPosition.y
  } },
      cameraZoom: ${config.cameraZoom || 1.0}
    });

    super("${sceneKey}", config);
  }

  protected createMap(): void {
    this.tilemap = this.add.tilemap(this.config.tilemapKey);
    this.setupTilesets();
    this.createStandardLayers();
    this.events.emit("scene-awake");
  }

  create() {
    super.create();
  }
}`;
}
