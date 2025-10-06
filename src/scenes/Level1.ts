import { CoinSystem } from "../systems/CoinSystem";
import { DoorSystem } from "../systems/DoorSystem";
import { KeySystem } from "../systems/KeySystem";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/* START OF COMPILED CODE */

class Level1 extends BaseGameScene {
  constructor() {
    // Configuración del nivel
    const config: GameSceneConfig = {
      tilemapKey: "Level1",
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
      playerStartPosition: { x: 100, y: 100 },
      musicKey: "level1_music", // Música del nivel
    };

    super("Level1", config);

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

  editorCreate(): void {
    // level1
    const level1 = this.add.tilemap("Level1");
    level1.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );
    level1.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );

    // level
    const level = this.add.tilemap("Level1");
    level.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );
    level.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );

    // level_1
    const level_1 = this.add.tilemap("Level1");
    level_1.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );
    level_1.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );

    // fondo_1
    level1.createLayer("fondo", ["spritesheet-backgrounds-default"], 0, 0);

    // superficies_1
    level.createLayer("superficies", ["spritesheet-tiles-default"], 0, 0);

    // objects_1
    level_1.createLayer("objects", ["spritesheet-tiles-default"], 0, 0);

    // image_1
    const image_1 = this.add.image(128, 1024, "PT_TOKEN_MASTER_001");
    image_1.scaleX = 0.03;
    image_1.scaleY = 0.03;

    // image
    const image = this.add.image(128, 768, "PT_TOKEN_MASTER_001");
    image.scaleX = 0.03;
    image.scaleY = 0.03;

    // image_2
    const image_2 = this.add.image(128, 512, "PT_TOKEN_MASTER_001");
    image_2.scaleX = 0.03;
    image_2.scaleY = 0.03;

    // image_3
    const image_3 = this.add.image(512, 896, "PT_TOKEN_MASTER_001");
    image_3.scaleX = 0.03;
    image_3.scaleY = 0.03;

    // image_4
    const image_4 = this.add.image(512, 640, "PT_TOKEN_MASTER_001");
    image_4.scaleX = 0.03;
    image_4.scaleY = 0.03;

    // image_5
    const image_5 = this.add.image(384, 1728, "PT_TOKEN_MASTER_001");
    image_5.scaleX = 0.03;
    image_5.scaleY = 0.03;

    // image_6
    const image_6 = this.add.image(512, 1728, "PT_TOKEN_MASTER_001");
    image_6.scaleX = 0.03;
    image_6.scaleY = 0.03;

    // image_7
    const image_7 = this.add.image(1216, 1728, "PT_TOKEN_MASTER_001");
    image_7.scaleX = 0.03;
    image_7.scaleY = 0.03;

    // image_8
    const image_8 = this.add.image(1344, 1728, "PT_TOKEN_MASTER_001");
    image_8.scaleX = 0.03;
    image_8.scaleY = 0.03;

    // image_9
    const image_9 = this.add.image(1472, 1728, "PT_TOKEN_MASTER_001");
    image_9.scaleX = 0.03;
    image_9.scaleY = 0.03;

    // image_10
    const image_10 = this.add.image(1600, 1728, "PT_TOKEN_MASTER_001");
    image_10.scaleX = 0.03;
    image_10.scaleY = 0.03;

    // image_11
    const image_11 = this.add.image(2304, 1728, "PT_TOKEN_MASTER_001");
    image_11.scaleX = 0.03;
    image_11.scaleY = 0.03;

    // image_12
    const image_12 = this.add.image(2432, 1728, "PT_TOKEN_MASTER_001");
    image_12.scaleX = 0.03;
    image_12.scaleY = 0.03;

    // image_13
    const image_13 = this.add.image(1536, 960, "PT_TOKEN_MASTER_001");
    image_13.scaleX = 0.03;
    image_13.scaleY = 0.03;

    // image_14
    const image_14 = this.add.image(3520, 768, "PT_TOKEN_MASTER_001");
    image_14.scaleX = 0.03;
    image_14.scaleY = 0.03;

    // image_15
    const image_15 = this.add.image(3136, 64, "PT_TOKEN_MASTER_001");
    image_15.scaleX = 0.03;
    image_15.scaleY = 0.03;

    // image_17
    const image_17 = this.add.image(3840, 640, "PT_TOKEN_MASTER_001");
    image_17.scaleX = 0.03;
    image_17.scaleY = 0.03;

    // image_18
    const image_18 = this.add.image(3392, 640, "PT_TOKEN_MASTER_001");
    image_18.scaleX = 0.03;
    image_18.scaleY = 0.03;

    // image_19
    const image_19 = this.add.image(1856, 128, "PT_TOKEN_MASTER_001");
    image_19.scaleX = 0.03;
    image_19.scaleY = 0.03;

    // image_20
    const image_20 = this.add.image(1728, 128, "PT_TOKEN_MASTER_001");
    image_20.scaleX = 0.03;
    image_20.scaleY = 0.03;

    // image_21
    const image_21 = this.add.image(1600, 128, "PT_TOKEN_MASTER_001");
    image_21.scaleX = 0.03;
    image_21.scaleY = 0.03;

    // image_22
    const image_22 = this.add.image(1472, 128, "PT_TOKEN_MASTER_001");
    image_22.scaleX = 0.03;
    image_22.scaleY = 0.03;

    // image_24
    const image_24 = this.add.image(128, 256, "PT_TOKEN_MASTER_001");
    image_24.scaleX = 0.03;
    image_24.scaleY = 0.03;

    // image_26
    const image_26 = this.add.image(512, 384, "PT_TOKEN_MASTER_001");
    image_26.scaleX = 0.03;
    image_26.scaleY = 0.03;

    // image_27
    const image_27 = this.add.image(1536, 832, "PT_TOKEN_MASTER_001");
    image_27.scaleX = 0.03;
    image_27.scaleY = 0.03;

    // image_16
    const image_16 = this.add.image(3584, 960, "PT_TOKEN_MASTER_001");
    image_16.scaleX = 0.03;
    image_16.scaleY = 0.03;

    // image_23
    const image_23 = this.add.image(3776, 128, "PT_TOKEN_MASTER_001");
    image_23.scaleX = 0.03;
    image_23.scaleY = 0.03;

    // image_28
    const image_28 = this.add.image(4352, 256, "PT_TOKEN_MASTER_001");
    image_28.scaleX = 0.03;
    image_28.scaleY = 0.03;

    // miniegg
    this.add.image(1184, 128, "mini-pingu");

    // miniegg
    this.add.image(2080, 480, "mini-pingu");

    // miniegg
    this.add.image(4000, 1408, "mini-pingu");

    this.level1 = level1;
    this.level = level;
    this.level_1 = level_1;

    this.events.emit("scene-awake");
  }

  private level1!: Phaser.Tilemaps.Tilemap;
  private level!: Phaser.Tilemaps.Tilemap;
  private level_1!: Phaser.Tilemaps.Tilemap;
  private coinSystem!: CoinSystem;
  private miniPinguSystem!: MiniPinguSystem;
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;

  /* START-USER-CODE */

  /**
   * Método create - Se ejecuta automáticamente al iniciar la escena
   * BaseGameScene maneja automáticamente:
   * - Colisiones con tiles marcados como collision: true
   * - Detección de agua (tiles con propiedad water: true)
   * - Punto final del nivel (tiles con propiedad end: true)
   * - Sistema de proyectiles (bolas de nieve)
   * - Sistema de vidas
   */
  create() {
    // Llamar al create de BaseGameScene (esto ya llama a createMap() internamente)
    super.create();

    // Crear los coleccionables DESPUÉS de que BaseGameScene haya creado todo
    this.createCoins();
    this.createMiniPingus();
    this.createKeys();
    this.createDoors();

    // Emitir evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  /**
   * Método abstracto requerido por BaseGameScene
   * Aquí creamos el tilemap y configuramos los layers
   */
  protected createMap(): void {
    // Llamar al método del editor que crea todo
    this.editorCreate();

    // Asignar el tilemap principal para que BaseGameScene pueda acceder
    // Usamos level porque es el que tiene el layer de superficies
    this.tilemap = this.level;

    // Asignar los layers para que BaseGameScene pueda usarlos
    this.surfaceLayer = this.tilemap.getLayer("superficies")!.tilemapLayer;
    this.backgroundLayer = this.level1.getLayer("fondo")?.tilemapLayer;
    this.objectsLayer = this.level_1.getLayer("objects")?.tilemapLayer;

    // IMPORTANTE: Eliminar las imágenes estáticas del editor
    // El editor crea imágenes de monedas y mini-pingüinos que no son interactivas
    // Nuestros sistemas (CoinSystem y MiniPinguSystem) crearán las versiones funcionales
    const allChildren = this.children.getChildren();
    const imagesToDestroy: Phaser.GameObjects.Image[] = [];

    allChildren.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Image) {
        const image = child as Phaser.GameObjects.Image;
        // Recopilar imágenes de monedas y mini-pingüinos para destruir
        if (
          image.texture.key === "PT_TOKEN_MASTER_001" ||
          image.texture.key === "mini-pingu"
        ) {
          imagesToDestroy.push(image);
        }
      }
    });

    // Destruir todas las imágenes del editor
    imagesToDestroy.forEach((image) => image.destroy());
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
    });

    // Posiciones de las monedas (extraídas del editorCreate)
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

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.coinSystem.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Crear sistema de mini-pingüinos
   */
  private createMiniPingus(): void {
    // Inicializar sistema de mini-pingüinos
    this.miniPinguSystem = new MiniPinguSystem(this, {
      textureKey: "mini-pingu",
      scale: 1.0,
      depth: 10,
      bounceDistance: 10,
      bounceDuration: 800,
    });

    // Posiciones de los mini-pingüinos (extraídas del editorCreate)
    const miniPinguPositions = [
      { x: 1184, y: 128 },
      { x: 2080, y: 480 },
      { x: 4000, y: 1408 },
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
   * Crear sistema de llaves
   */
  private createKeys(): void {
    this.keySystem = new KeySystem(this, {
      tilemap: this.tilemap,
      keyTileIds: [229], // GID de la llave en el tileset
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
      doorTileIds: [52, 70], // GIDs de las puertas (superior e inferior)
    });

    this.doorSystem.createDoors();

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.doorSystem.setupPlayerCollision(this.player);
      }
    });
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// Exportar la clase para poder importarla en main.ts
export { Level1 };
