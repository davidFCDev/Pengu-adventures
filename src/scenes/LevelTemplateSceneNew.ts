import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/**
 * TEMPLATE DE ESCENA - Copia este archivo para crear nuevas escenas de niveles
 *
 * ✅ Funcionará automáticamente con cualquier mapa que tenga tiles con propiedades:
 *    - collision=true (para colisiones)
 *    - swim=true (para agua con efecto Flappy Bird)
 *    - climb=true (para escaleras)
 *
 * 📋 PASOS PARA USAR:
 * 1. Copia este archivo y renómbralo (ej: Level1Scene.ts)
 * 2. Cambia la clase y key de la escena en el constructor
 * 3. Modifica la configuración en el constructor:
 *    - tilemapKey: nombre de tu tilemap
 *    - surfaceLayerName: nombre de tu layer principal
 *    - playerStartPosition: posición inicial del player
 * 4. Implementa createMap() con la lógica específica de tu mapa
 * 5. ¡Listo! Todo funcionará automáticamente gracias a BaseGameScene
 */

export class LevelTemplateScene extends BaseGameScene {
  constructor() {
    // 🎯 CONFIGURACIÓN: Cambia estos valores para tu nivel
    const config: GameSceneConfig = {
      tilemapKey: "MiMapa", // ← Cambia por tu tilemap key
      surfaceLayerName: "miLayer", // ← Cambia por tu layer name
      backgroundLayerName: "fondo", // ← Opcional: layer de fondo
      playerStartPosition: { x: 100, y: 100 }, // ← Ajusta posición inicial
      cameraZoom: 1.0, // ← Opcional: zoom de cámara
      cameraFollow: {
        // ← Opcional: configuración de seguimiento
        lerp: { x: 0.05, y: 0.05 },
        offset: { x: 0, y: 100 },
      },
    };

    super("LevelTemplateScene", config); // ← Cambia la key de la escena
  }

  preload(): void {
    // Cargar assets del mapa
    this.load.tilemapTiledJSON("MiMapa", "assets/MiMapa.json");
    this.load.image("tileset-tiles", "assets/tileset-tiles.png");
    this.load.image("tileset-backgrounds", "assets/tileset-backgrounds.png");
  }

  /**
   * 🎯 IMPLEMENTACIÓN REQUERIDA: Crear el mapa específico
   * Aquí defines cómo se crea tu mapa particular
   */
  protected createMap(): void {
    // Crear el tilemap y configurar tilesets
    this.tilemap = this.add.tilemap("MiMapa");
    this.tilemap.addTilesetImage("tileset-tiles", "tileset-tiles");
    this.tilemap.addTilesetImage("tileset-backgrounds", "tileset-backgrounds");

    // Crear layer de fondo (opcional)
    this.backgroundLayer =
      this.tilemap.createLayer("fondo", ["tileset-backgrounds"], 0, 0) ||
      undefined;

    // Crear layer principal de superficies
    this.surfaceLayer = this.tilemap.createLayer(
      "miLayer",
      ["tileset-tiles"],
      0,
      0
    )!;
  }

  // 🎯 LÓGICA ESPECÍFICA DEL NIVEL (opcional)
  create(): void {
    // La clase base maneja toda la configuración automática
    super.create();

    // Aquí puedes agregar elementos específicos de tu nivel:
    // - NPCs únicos
    // - Efectos especiales
    // - Elementos interactivos específicos
    // - Música de fondo
    // - etc.
  }
}

/**
 * 🎯 EJEMPLO DE USO PARA CREAR UNA NUEVA ESCENA:
 *
 * 1. Crear Level1Scene.ts:
 * ```typescript
 * import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";
 *
 * export class Level1Scene extends BaseGameScene {
 *   constructor() {
 *     const config: GameSceneConfig = {
 *       tilemapKey: "Level1Map",
 *       surfaceLayerName: "ground",
 *       playerStartPosition: { x: 200, y: 800 },
 *       cameraZoom: 1.2,
 *     };
 *     super("Level1Scene", config);
 *   }
 *
 *   protected createMap(): void {
 *     this.tilemap = this.add.tilemap("Level1Map");
 *     this.tilemap.addTilesetImage("my-tileset", "my-tileset");
 *     this.surfaceLayer = this.tilemap.createLayer("ground", ["my-tileset"], 0, 0)!;
 *   }
 * }
 * ```
 *
 * 2. En main.ts añadir:
 * ```typescript
 * import { Level1Scene } from "./scenes/Level1Scene";
 * scene: [PreloadScene, Level1Scene],
 * ```
 *
 * 3. En PreloadScene cargar el mapa:
 * ```typescript
 * this.load.tilemapTiledJSON("Level1Map", "assets/Level1Map.json");
 * ```
 *
 * ✅ ¡Y ya está! Todo funciona automáticamente:
 * - Detección de agua, escaleras y colisiones
 * - Configuración de cámara y físicas
 * - Estados automáticos del player
 * - Sistema de cache de propiedades de tiles
 */
