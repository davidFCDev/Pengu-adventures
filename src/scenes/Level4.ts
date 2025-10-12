import { FreezableEnemy } from "../objects/enemies/FreezableEnemy";

import { CoinSystem } from "../systems/CoinSystem";// You can write more code here

import { DoorSystem } from "../systems/DoorSystem";

import { KeySystem } from "../systems/KeySystem";/* START OF COMPILED CODE */

import { MiniPinguSystem } from "../systems/MiniPinguSystem";

import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";class Level4 extends Phaser.Scene {



/**	constructor() {

 * Level4 - Cuarto nivel del juego		super("Level4");

 * Usa BaseGameScene para toda la funcionalidad automática

 */		/* START-USER-CTR-CODE */

export class Level4 extends BaseGameScene {		// Write your code here.

  // Sistemas de coleccionables		/* END-USER-CTR-CODE */

  private coinSystem!: CoinSystem;	}

  private keySystem!: KeySystem;

  private doorSystem!: DoorSystem;	editorCreate(): void {

  private miniPinguSystem!: MiniPinguSystem;

		// level4

  // Array de enemigos congelables para gestionar colisiones		const level4 = this.add.tilemap("Level4");

  private freezableEnemies: FreezableEnemy[] = [];		level4.addTilesetImage("spritesheet-tiles-default", "spritesheet-tiles-default");

		level4.addTilesetImage("spritesheet-backgrounds-default", "spritesheet-backgrounds-default");

  constructor() {

    // Configuración del nivel		// level

    const config: GameSceneConfig = {		const level = this.add.tilemap("Level4");

      tilemapKey: "Level4",		level.addTilesetImage("spritesheet-tiles-default", "spritesheet-tiles-default");

      surfaceLayerName: "superficies",		level.addTilesetImage("spritesheet-backgrounds-default", "spritesheet-backgrounds-default");

      backgroundLayerName: "fondo",

      objectsLayerName: "objects",		// level_1

      tilesets: [		const level_1 = this.add.tilemap("Level4");

        {		level_1.addTilesetImage("spritesheet-tiles-default", "spritesheet-tiles-default");

          name: "spritesheet-tiles-default",		level_1.addTilesetImage("spritesheet-backgrounds-default", "spritesheet-backgrounds-default");

          imageKey: "spritesheet-tiles-default",

        },		// fondo_1

        {		level4.createLayer("fondo", ["spritesheet-backgrounds-default"], 0, 0);

          name: "spritesheet-backgrounds-default",

          imageKey: "spritesheet-backgrounds-default",		// superficies_1

        },		level.createLayer("superficies", ["spritesheet-tiles-default"], 0, 0);

      ],

      playerStartPosition: { x: 100, y: 2080 }, // Posición inicial del jugador		// objects_1

      musicKey: "level4_music", // Música del nivel 4		level_1.createLayer("objects", ["spritesheet-tiles-default"], 0, 0);

      // 🐟 Habilitar sistema de enemigos acuáticos

      enableAquaticEnemies: true,		// image_18

      aquaticEnemyConfig: {		const image_18 = this.add.image(1696, 1824, "PT_TOKEN_MASTER_001");

        // Usar posiciones manuales (las del Phaser Editor)		image_18.scaleX = 0.03;

        manualPositions: [		image_18.scaleY = 0.03;

          { x: 1344, y: 2048, direction: 1 }, // sprite_5

          { x: 4032, y: 2048, direction: -1 }, // sprite		// miniegg

        ],		this.add.image(3872, 128, "mini-pingu");

        damage: 1,

        speed: 100,		// sprite_5

      },		const sprite_5 = this.add.sprite(1344, 2048, "__green_angler_fish_swim_snapping", 0);

    };		sprite_5.scaleX = 0.35;

		sprite_5.scaleY = 0.35;

    super("Level4", config);

  }		// sprite

		const sprite = this.add.sprite(4032, 2048, "__green_angler_fish_swim_snapping", 0);

  /**		sprite.scaleX = 0.35;

   * Método create llamado después de que BaseGameScene haya creado el mapa y el jugador		sprite.scaleY = 0.35;

   */

  create() {		// sprite_1

    // Limpiar arrays de enemigos (importante para reinicios)		const sprite_1 = this.add.sprite(3136, 1152, "MediumSlime_Blue", 0);

    this.freezableEnemies = [];		sprite_1.scaleX = 0.5;

		sprite_1.scaleY = 0.5;

    // Llamar al create de BaseGameScene (crea el tilemap, player, etc.)

    // BaseGameScene ya se encarga de:		// sprite_2

    // - Reproducir la música según this.config.musicKey		const sprite_2 = this.add.sprite(3680, 1152, "MediumSlime_Blue", 0);

    // - Crear sistema de enemigos acuáticos (enableAquaticEnemies)		sprite_2.scaleX = 0.5;

    super.create();		sprite_2.scaleY = 0.5;



    // Crear sistemas de coleccionables		// sprite_3

    this.createCoins();		const sprite_3 = this.add.sprite(2592, 1152, "MediumSlime_Blue", 0);

    this.createMiniPingus();		sprite_3.scaleX = 0.5;

    this.createKeys();		sprite_3.scaleY = 0.5;

    this.createDoors();

		// sprite_4

    // Crear enemigos freezables		const sprite_4 = this.add.sprite(4224, 1152, "MediumSlime_Blue", 0);

    this.createFreezableEnemies();		sprite_4.scaleX = 0.5;

		sprite_4.scaleY = 0.5;

    // Configurar colisiones entre bolas de nieve y enemigos freezables

    this.setupFreezableEnemiesCollisions();		// miniegg_1

  }		this.add.image(2688, 2080, "mini-pingu");



  /**		// miniegg_2

   * Crear sistema de monedas		this.add.image(2848, 128, "mini-pingu");

   */

  private createCoins(): void {		// image

    // Inicializar sistema de monedas con sonido		const image = this.add.image(1376, 1824, "PT_TOKEN_MASTER_001");

    this.coinSystem = new CoinSystem(this, {		image.scaleX = 0.03;

      textureKey: "PT_TOKEN_MASTER_001",		image.scaleY = 0.03;

      scale: 1.0,

      depth: 10,		// image_1

      floatDistance: 5,		const image_1 = this.add.image(1056, 1824, "PT_TOKEN_MASTER_001");

      floatDuration: 1000,		image_1.scaleX = 0.03;

      collectSoundKey: "coin_collect_sound",		image_1.scaleY = 0.03;

      soundVolume: 0.5,

    });		// image_2

		const image_2 = this.add.image(2080, 1824, "PT_TOKEN_MASTER_001");

    // Posiciones de las monedas (30 monedas extraídas del Level4.scene)		image_2.scaleX = 0.03;

    const coinPositions = [		image_2.scaleY = 0.03;

      { x: 1696, y: 1824 }, // image_18

      { x: 1376, y: 1824 }, // image		// image_3

      { x: 1056, y: 1824 }, // image_1		const image_3 = this.add.image(2208, 1824, "PT_TOKEN_MASTER_001");

      { x: 2080, y: 1824 }, // image_2		image_3.scaleX = 0.03;

      { x: 2208, y: 1824 }, // image_3		image_3.scaleY = 0.03;

      { x: 2528, y: 1824 }, // image_4

      { x: 2848, y: 1824 }, // image_5		// image_4

      { x: 864, y: 2048 }, // image_6		const image_4 = this.add.image(2528, 1824, "PT_TOKEN_MASTER_001");

      { x: 1216, y: 2048 }, // image_7		image_4.scaleX = 0.03;

      { x: 1536, y: 2048 }, // image_8		image_4.scaleY = 0.03;

      { x: 1888, y: 2048 }, // image_9

      { x: 2336, y: 2048 }, // image_10		// image_5

      { x: 3008, y: 2080 }, // image_11		const image_5 = this.add.image(2848, 1824, "PT_TOKEN_MASTER_001");

      { x: 3168, y: 1824 }, // image_12		image_5.scaleX = 0.03;

      { x: 3552, y: 1824 }, // image_13		image_5.scaleY = 0.03;

      { x: 3872, y: 1824 }, // image_14

      { x: 4192, y: 1824 }, // image_15		// image_6

      { x: 3360, y: 2048 }, // image_16		const image_6 = this.add.image(864, 2048, "PT_TOKEN_MASTER_001");

      { x: 3712, y: 2048 }, // image_17		image_6.scaleX = 0.03;

      { x: 4352, y: 2048 }, // image_19		image_6.scaleY = 0.03;

      { x: 4032, y: 2048 }, // image_20

      { x: 3360, y: 224 }, // image_21		// image_7

      { x: 3616, y: 384 }, // image_22		const image_7 = this.add.image(1216, 2048, "PT_TOKEN_MASTER_001");

      { x: 3488, y: 608 }, // image_23		image_7.scaleX = 0.03;

      { x: 192, y: 1312 }, // image_24		image_7.scaleY = 0.03;

      { x: 192, y: 672 }, // image_25

      { x: 192, y: 352 }, // image_26		// image_8

      { x: 576, y: 192 }, // image_27		const image_8 = this.add.image(1536, 2048, "PT_TOKEN_MASTER_001");

      { x: 4064, y: 448 }, // image_28		image_8.scaleX = 0.03;

      { x: 4352, y: 384 }, // image_29		image_8.scaleY = 0.03;

      { x: 4608, y: 288 }, // image_30

    ];		// image_9

		const image_9 = this.add.image(1888, 2048, "PT_TOKEN_MASTER_001");

    // Crear las monedas		image_9.scaleX = 0.03;

    this.coinSystem.createCoins(coinPositions);		image_9.scaleY = 0.03;



    // Configurar colisión con el jugador		// image_10

    this.time.delayedCall(100, () => {		const image_10 = this.add.image(2336, 2048, "PT_TOKEN_MASTER_001");

      if (this.player) {		image_10.scaleX = 0.03;

        this.coinSystem.setupPlayerCollision(this.player);		image_10.scaleY = 0.03;

      }

    });		// image_11

  }		const image_11 = this.add.image(3008, 2080, "PT_TOKEN_MASTER_001");

		image_11.scaleX = 0.03;

  /**		image_11.scaleY = 0.03;

   * Crear sistema de mini-pingüinos

   */		// image_12

  private createMiniPingus(): void {		const image_12 = this.add.image(3168, 1824, "PT_TOKEN_MASTER_001");

    // Inicializar sistema de mini-pingüinos con sonido		image_12.scaleX = 0.03;

    this.miniPinguSystem = new MiniPinguSystem(this, {		image_12.scaleY = 0.03;

      textureKey: "mini-pingu",

      scale: 1.0,		// image_13

      depth: 10,		const image_13 = this.add.image(3552, 1824, "PT_TOKEN_MASTER_001");

      bounceDistance: 10,		image_13.scaleX = 0.03;

      bounceDuration: 800,		image_13.scaleY = 0.03;

      collectSoundKey: "minipingu_collect_sound",

      soundVolume: 0.6,		// image_14

    });		const image_14 = this.add.image(3872, 1824, "PT_TOKEN_MASTER_001");

		image_14.scaleX = 0.03;

    // Posiciones de los mini-pingüinos (3 mini-pingüinos del Level4.scene)		image_14.scaleY = 0.03;

    const miniPinguPositions = [

      { x: 3872, y: 128 }, // miniegg		// image_15

      { x: 2688, y: 2080 }, // miniegg_1		const image_15 = this.add.image(4192, 1824, "PT_TOKEN_MASTER_001");

      { x: 2848, y: 128 }, // miniegg_2		image_15.scaleX = 0.03;

    ];		image_15.scaleY = 0.03;



    // Crear los mini-pingüinos		// image_16

    this.miniPinguSystem.createMiniPingus(miniPinguPositions);		const image_16 = this.add.image(3360, 2048, "PT_TOKEN_MASTER_001");

		image_16.scaleX = 0.03;

    // Configurar colisión con el jugador		image_16.scaleY = 0.03;

    this.time.delayedCall(100, () => {

      if (this.player) {		// image_17

        this.miniPinguSystem.setupPlayerCollision(this.player);		const image_17 = this.add.image(3712, 2048, "PT_TOKEN_MASTER_001");

      }		image_17.scaleX = 0.03;

    });		image_17.scaleY = 0.03;

  }

		// image_19

  /**		const image_19 = this.add.image(4352, 2048, "PT_TOKEN_MASTER_001");

   * Crear sistema de llaves		image_19.scaleX = 0.03;

   */		image_19.scaleY = 0.03;

  private createKeys(): void {

    this.keySystem = new KeySystem(this, {		// image_20

      tilemap: this.tilemap,		const image_20 = this.add.image(4032, 2048, "PT_TOKEN_MASTER_001");

      keyTileIds: [229], // GID de la llave en el tileset (tile ID 228 + 1)		image_20.scaleX = 0.03;

      collectSoundKey: "key_pickup_sound", // Sonido específico de llave		image_20.scaleY = 0.03;

      soundVolume: 0.5,

    });		// image_21

		const image_21 = this.add.image(3360, 224, "PT_TOKEN_MASTER_001");

    this.keySystem.createKeys();		image_21.scaleX = 0.03;

		image_21.scaleY = 0.03;

    // Configurar colisión con el jugador

    this.time.delayedCall(100, () => {		// image_22

      if (this.player) {		const image_22 = this.add.image(3616, 384, "PT_TOKEN_MASTER_001");

        this.keySystem.setupPlayerCollision(this.player);		image_22.scaleX = 0.03;

      }		image_22.scaleY = 0.03;

    });

  }		// image_23

		const image_23 = this.add.image(3488, 608, "PT_TOKEN_MASTER_001");

  /**		image_23.scaleX = 0.03;

   * Crear sistema de puertas		image_23.scaleY = 0.03;

   */

  private createDoors(): void {		// image_24

    this.doorSystem = new DoorSystem(this, {		const image_24 = this.add.image(192, 1312, "PT_TOKEN_MASTER_001");

      tilemap: this.tilemap,		image_24.scaleX = 0.03;

      keySystem: this.keySystem,		image_24.scaleY = 0.03;

      doorTileIds: [230], // GID de la puerta en el tileset (tile ID 229 + 1)

      openSoundKey: "door_open_sound",		// image_25

      soundVolume: 0.5,		const image_25 = this.add.image(192, 672, "PT_TOKEN_MASTER_001");

    });		image_25.scaleX = 0.03;

		image_25.scaleY = 0.03;

    this.doorSystem.createDoors();

		// image_26

    // Configurar colisión con el jugador		const image_26 = this.add.image(192, 352, "PT_TOKEN_MASTER_001");

    this.time.delayedCall(100, () => {		image_26.scaleX = 0.03;

      if (this.player) {		image_26.scaleY = 0.03;

        this.doorSystem.setupPlayerCollision(this.player);

      }		// image_27

    });		const image_27 = this.add.image(576, 192, "PT_TOKEN_MASTER_001");

  }		image_27.scaleX = 0.03;

		image_27.scaleY = 0.03;

  /**

   * Crear enemigos freezables (slimes azules)		// image_28

   */		const image_28 = this.add.image(4064, 448, "PT_TOKEN_MASTER_001");

  private createFreezableEnemies(): void {		image_28.scaleX = 0.03;

    // Posiciones de los enemigos freezables (4 slimes del Level4.scene)		image_28.scaleY = 0.03;

    const enemyPositions = [

      { x: 3136, y: 1152 }, // sprite_1		// image_29

      { x: 3680, y: 1152 }, // sprite_2		const image_29 = this.add.image(4352, 384, "PT_TOKEN_MASTER_001");

      { x: 2592, y: 1152 }, // sprite_3		image_29.scaleX = 0.03;

      { x: 4224, y: 1152 }, // sprite_4		image_29.scaleY = 0.03;

    ];

		// image_30

    enemyPositions.forEach((pos, index) => {		const image_30 = this.add.image(4608, 288, "PT_TOKEN_MASTER_001");

      const enemy = new FreezableEnemy(		image_30.scaleX = 0.03;

        this,		image_30.scaleY = 0.03;

        pos.x,

        pos.y,		this.level4 = level4;

        this.surfaceLayer,		this.level = level;

        index % 2 === 0 ? 1 : -1 // Alternar dirección inicial		this.level_1 = level_1;

      );

		this.events.emit("scene-awake");

      this.freezableEnemies.push(enemy);	}



      // Configurar colisión con el player	private level4!: Phaser.Tilemaps.Tilemap;

      this.physics.add.overlap(	private level!: Phaser.Tilemaps.Tilemap;

        this.player,	private level_1!: Phaser.Tilemaps.Tilemap;

        enemy,

        () => {	/* START-USER-CODE */

          if (!enemy.getIsFrozen()) {

            this.player.takeDamage(enemy.x);	// Write your code here

          }

        },	create() {

        undefined,

        this		this.editorCreate();

      );	}

    });

  }	/* END-USER-CODE */

}

  /**

   * Configurar colisiones entre bolas de nieve y enemigos freezables/* END OF COMPILED CODE */

   */

  private setupFreezableEnemiesCollisions(): void {// You can write more code here

    this.time.delayedCall(100, () => {
      if (this.projectileSystem) {
        const projectileGroup = this.projectileSystem.getProjectileGroup();

        this.freezableEnemies.forEach((enemy) => {
          this.physics.add.overlap(
            projectileGroup,
            enemy,
            (snowball: any, enemySprite: any) => {
              if (snowball && snowball.active) {
                // Destruir la bola de nieve
                snowball.destroy();

                // Congelar al enemigo
                const freezableEnemy = enemySprite as FreezableEnemy;
                if (freezableEnemy && !freezableEnemy.getIsFrozen()) {
                  freezableEnemy.freeze();
                }
              }
            },
            undefined,
            this
          );
        });
      }
    });
  }

  /**
   * Update llamado cada frame
   */
  update(time: number, delta: number): void {
    super.update(time, delta);

    // Actualizar enemigos freezables
    this.freezableEnemies.forEach((enemy) => {
      enemy.update(time, delta);
    });
  }

  /**
   * Shutdown llamado al destruir la escena
   */
  shutdown(): void {
    // Destruir enemigos freezables
    this.freezableEnemies.forEach((enemy) => {
      if (enemy && enemy.active) {
        enemy.destroy();
      }
    });
    this.freezableEnemies = [];

    // Destruir sistemas de coleccionables
    if (this.coinSystem) {
      this.coinSystem.destroy();
    }
    if (this.miniPinguSystem) {
      this.miniPinguSystem.destroy();
    }
    if (this.keySystem) {
      this.keySystem.destroy();
    }
    if (this.doorSystem) {
      this.doorSystem.destroy();
    }

    // Llamar al shutdown de BaseGameScene
    super.shutdown();
  }
}
