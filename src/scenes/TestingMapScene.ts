import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/* START OF COMPILED CODE */

/**
 * Escena de prueba para el nivel TestingMap
 *
 * EJEMPLO MINIMALISTA - Esta escena debe ser el template para nuevos niveles
 *
 * Lo único que necesitas hacer:
 * 1. Configurar el nivel en el constructor (tilemapKey, posición inicial, etc.)
 * 2. Implementar createMap() si tu nivel necesita lógica especial de creación
 *
 * NO añadas lógica aquí:
 * - Enemigos: Se gestionan automáticamente con enableEnemies: true
 * - Proyectiles: Sistema automático en BaseGameScene
 * - Colisiones: Configuradas automáticamente
 * - Nieve: Sistema automático en BaseGameScene
 */
export class TestingMapScene extends BaseGameScene {
  constructor() {
    // SOLO CONFIGURACIÓN - toda la lógica está en BaseGameScene
    const config: GameSceneConfig = {
      // Configuración del mapa
      tilemapKey: "TestingMap",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",

      // Configuración del player
      playerStartPosition: { x: 400, y: 900 },

      // Configuración de cámara
      cameraZoom: 1.0,
      cameraFollow: {
        lerp: { x: 1, y: 1 },
        offset: { x: 0, y: 0 },
      },

      // Música del nivel
      musicKey: "level1_music",

      // Sistema de enemigos automático
      enableEnemies: true,
      enemyConfig: {
        maxEnemies: 8,
        minSurfaceWidth: 5,
        patrolMargin: 50,
        safeDistance: 100,
      },
    };

    super("TestingMapScene", config);
  }

  /**
   * Implementación específica para crear el mapa TestingMap
   */
  protected createMap(): void {
    // Crear tilemap
    this.tilemap = this.add.tilemap("TestingMap");

    // Configurar tilesets usando el método helper
    this.setupTilesets();

    // Crear layers estándar usando el método helper
    this.createStandardLayers();

    // Emitir evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  /** @returns {void} */
  editorCreate(): void {
    // Mantenido para compatibilidad con el editor de Phaser
    this.createMap();
  }

  /* START-USER-CTR-CODE */
  // NO NECESITAS OVERRIDE DE create() o update()
  // BaseGameScene maneja todo automáticamente

  // Solo añade métodos aquí si necesitas lógica ESPECÍFICA de este nivel
  /* END-USER-CTR-CODE */
}

/* END OF COMPILED CODE */
