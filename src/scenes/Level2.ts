import { CoinSystem } from "../systems/CoinSystem";
import { DoorSystem } from "../systems/DoorSystem";
import { KeySystem } from "../systems/KeySystem";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/**
 * Level2 - Segundo nivel del juego
 * Usa BaseGameScene para toda la funcionalidad automática
 */
export class Level2 extends BaseGameScene {
  // Sistemas del nivel
  private coinSystem!: CoinSystem;
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;
  private miniPinguSystem!: MiniPinguSystem;

  constructor() {
    // Configuración del nivel
    const config: GameSceneConfig = {
      tilemapKey: "Level2",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",
      tilesets: [
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
        {
          name: "spritesheet-backgrounds-default",
          imageKey: "spritesheet-backgrounds-default",
        },
      ],
      playerStartPosition: { x: 100, y: 1800 }, // Posición inicial del jugador
      musicKey: "level2_music", // Música del nivel 2
    };

    super("Level2", config);
  }

  /**
   * Crear el mapa y configurar layers
   * Implementación requerida por BaseGameScene
   */
  protected createMap(): void {
    // Crear el tilemap directamente sin editor
    const level2Map = this.add.tilemap("Level2");
    level2Map.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );
    level2Map.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );

    // Crear los layers
    const backgroundLayer = level2Map.createLayer(
      "fondo",
      ["spritesheet-backgrounds-default"],
      0,
      0
    );
    const surfaceLayer = level2Map.createLayer(
      "superficies",
      ["spritesheet-tiles-default"],
      0,
      0
    );
    const objectsLayer = level2Map.createLayer(
      "objects",
      ["spritesheet-tiles-default"],
      0,
      0
    );

    // Asignar el tilemap y layers para que BaseGameScene pueda acceder
    this.tilemap = level2Map;
    this.surfaceLayer = surfaceLayer!;
    this.backgroundLayer = backgroundLayer!;
    this.objectsLayer = objectsLayer!;
  }

  /**
   * Crear elementos específicos del nivel
   * Se llama automáticamente después de crear el tilemap y el player
   */
  protected createLevelElements(): void {
    // Crear sistemas en orden
    this.createKeys();
    this.createDoors();
    this.createCoins();
    this.createMiniPingus();
  }

  /**
   * Crear sistema de llaves
   */
  private createKeys(): void {
    this.keySystem = new KeySystem(this, {
      tilemap: this.tilemap,
      keyTileIds: [229], // GID de la llave en el tileset
      collectSoundKey: "coin_collect_sound", // Mismo sonido que las monedas (pop)
      soundVolume: 0.5,
    });

    this.keySystem.createKeys();

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.keySystem.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Crear sistema de puertas
   */
  private createDoors(): void {
    this.doorSystem = new DoorSystem(this, {
      tilemap: this.tilemap,
      keySystem: this.keySystem,
      doorTileIds: [267], // GID de las puertas en Tiled
      openSoundKey: "door_open_sound",
      soundVolume: 0.5,
    });

    this.doorSystem.createDoors();
    this.doorSystem.setupPlayerCollision(this.player);
  }

  /**
   * Crear sistema de monedas
   */
  private createCoins(): void {
    // Inicializar sistema de monedas con sonido
    this.coinSystem = new CoinSystem(this, {
      textureKey: "PT_TOKEN_MASTER_001",
      scale: 1.0,
      depth: 10,
      floatDistance: 5,
      floatDuration: 1000,
      collectSoundKey: "coin_collect_sound",
      soundVolume: 0.5,
    });

    // Posiciones de las monedas (extraídas del editorCreate original)
    const coinPositions = [
      { x: 672, y: 1664 },
      { x: 1408, y: 1600 },
      { x: 1600, y: 1600 },
      { x: 1888, y: 1856 },
      { x: 224, y: 1600 },
      { x: 96, y: 1600 },
      { x: 2240, y: 1696 },
      { x: 2400, y: 1696 },
      { x: 3008, y: 1600 },
      { x: 3200, y: 1600 },
      { x: 3552, y: 1824 },
      { x: 4064, y: 1824 },
      { x: 4608, y: 1792 },
      { x: 4928, y: 1472 },
      { x: 4128, y: 1152 },
      { x: 3872, y: 1152 },
      { x: 3584, y: 1152 },
      { x: 2976, y: 1152 },
      { x: 2112, y: 1152 },
      { x: 1824, y: 1152 },
      { x: 1568, y: 1152 },
      { x: 1312, y: 1152 },
      { x: 992, y: 1152 },
      { x: 672, y: 1152 },
      { x: 128, y: 1344 },
      { x: 864, y: 640 },
      { x: 1760, y: 640 },
      { x: 2656, y: 640 },
      { x: 3232, y: 288 },
      { x: 2528, y: 288 },
      { x: 1568, y: 288 },
      { x: 928, y: 288 },
      { x: 4192, y: 384 },
      { x: 3904, y: 128 },
    ];

    // Crear las monedas
    this.coinSystem.createCoins(coinPositions);

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.coinSystem.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Crear sistema de Mini-Pingus
   */
  private createMiniPingus(): void {
    // Inicializar sistema de mini-pingüinos con sonido
    this.miniPinguSystem = new MiniPinguSystem(this, {
      textureKey: "mini-pingu",
      scale: 1.0,
      depth: 10,
      bounceDistance: 10,
      bounceDuration: 800,
      collectSoundKey: "minipingu_collect_sound",
      soundVolume: 0.6,
    });

    // Posiciones de los Mini-Pingus (extraídas del editorCreate original)
    const miniPinguPositions = [
      { x: 3008, y: 1920 },
      { x: 2368, y: 1344 },
      { x: 64, y: 544 },
    ];

    // Crear los mini-pingüinos
    this.miniPinguSystem.createMiniPingus(miniPinguPositions);

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.miniPinguSystem.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Cleanup al destruir la escena
   */
  shutdown(): void {
    // Limpiar sistemas
    this.coinSystem?.destroy();
    this.doorSystem?.destroy();
    this.miniPinguSystem?.destroy();

    super.shutdown();
  }
}
