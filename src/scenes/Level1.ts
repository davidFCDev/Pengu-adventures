import { CoinSystem } from "../systems/CoinSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/* START OF COMPILED CODE */

/**
 * Level 1 - Primer nivel del juego
 *
 * Esta escena implementa toda la lógica del primer nivel:
 * - Punto de inicio del personaje
 * - Sistema de colisiones automático
 * - Detección de agua/mar
 * - Punto final del nivel
 * - Sistema de monedas coleccionables
 */
export class Level1 extends BaseGameScene {
  // Sistema de monedas
  private coinSystem!: CoinSystem;

  constructor() {
    // Configuración del nivel
    const config: GameSceneConfig = {
      // Configuración del mapa
      tilemapKey: "Level1",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",

      // Configuración del player - Punto de inicio
      playerStartPosition: { x: 100, y: 100 },

      // Configuración de cámara
      cameraZoom: 1.0,
      cameraFollow: {
        lerp: { x: 1, y: 1 },
        offset: { x: 0, y: 0 },
      },

      // Música del nivel
      musicKey: "level1_music",

      // Sistema de enemigos desactivado por ahora
      enableEnemies: false,
    };

    super("Level1", config);
  }

  /**
   * Implementación específica para crear el mapa Level1
   */
  protected createMap(): void {
    // Crear tilemap
    this.tilemap = this.add.tilemap("Level1");

    // Configurar tilesets usando el método helper
    this.setupTilesets();

    // Crear layers estándar usando el método helper
    this.createStandardLayers();

    // Crear las monedas DESPUÉS de crear los layers
    this.createCoins();

    // Emitir evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  /**
   * Crear sistema de monedas
   */
  private createCoins(): void {
    // Inicializar sistema de monedas
    this.coinSystem = new CoinSystem(this, {
      textureKey: "PT_TOKEN_MASTER_001",
      scale: 0.03,
      depth: 10,
      floatDistance: 5,
      floatDuration: 1000,
      // collectSoundKey: "coin_sound", // Descomentar cuando tengas el sonido
      // soundVolume: 0.3,
    });

    // Posiciones de las monedas (copiadas del editor de Phaser)
    const coinPositions = [
      { x: 128, y: 1024 },
      { x: 128, y: 768 },
      { x: 128, y: 512 },
      { x: 512, y: 896 },
      { x: 512, y: 640 },
      { x: 384, y: 1728 },
      { x: 512, y: 1728 },
      { x: 1216, y: 1728 },
      { x: 1344, y: 1728 },
      { x: 1472, y: 1728 },
      { x: 1600, y: 1728 },
      { x: 2304, y: 1728 },
      { x: 2432, y: 1728 },
      { x: 1536, y: 960 },
      { x: 3520, y: 768 },
      { x: 3136, y: 64 },
      { x: 3840, y: 640 },
      { x: 3392, y: 640 },
      { x: 1856, y: 128 },
      { x: 1728, y: 128 },
      { x: 1600, y: 128 },
      { x: 1472, y: 128 },
      { x: 128, y: 256 },
      { x: 512, y: 128 },
      { x: 512, y: 384 },
      { x: 1536, y: 832 },
      { x: 3584, y: 960 },
      { x: 3776, y: 128 },
      { x: 4352, y: 256 },
    ];

    // Crear las monedas
    this.coinSystem.createCoins(coinPositions);

    // Configurar colisión con el jugador (después de que el player se cree)
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.coinSystem.setupPlayerCollision(this.player);
      }
    });

    // Escuchar evento de recolección (opcional - para UI o efectos)
    this.events.on(
      "coinCollected",
      (data: { collected: number; total: number }) => {
        // Aquí puedes actualizar UI, mostrar partículas, etc.
        // console.log(`Progreso: ${data.collected}/${data.total}`);
      }
    );
  }

  /** @returns {void} */
  editorCreate(): void {
    // Mantenido para compatibilidad con el editor de Phaser
    this.createMap();
  }

  /* START-USER-CTR-CODE */

  /**
   * Método create - Se ejecuta automáticamente al iniciar la escena
   * BaseGameScene maneja automáticamente:
   * - Colisiones con tiles marcados como collision: true
   * - Detección de agua (tiles con propiedad water: true)
   * - Punto final del nivel (tiles con propiedad end: true)
   * - Sistema de proyectiles (bolas de nieve)
   * - Sistema de vidas
   */

  /* END-USER-CTR-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
