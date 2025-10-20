import { FreezableEnemy } from "../objects/enemies/FreezableEnemy";
import { SnowmanEnemyManager } from "../objects/enemies/SnowmanEnemyManager";
import { CoinSystem } from "../systems/CoinSystem";
import { DoorSystem } from "../systems/DoorSystem";
import { KeySystem } from "../systems/KeySystem";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
import { calculateLevelScore, type LevelStats } from "../systems/ScoreSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

export class Level5 extends BaseGameScene {
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;
  private freezableEnemies: FreezableEnemy[] = [];
  private snowmanManager!: SnowmanEnemyManager;

  /**
   * Retorna el número del nivel (requerido por BaseGameScene)
   */
  protected getLevelNumber(): number {
    return 5;
  }

  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level5",
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
      playerStartPosition: { x: 100, y: 2080 },
      musicKey: "level5_music",
      // 🔥 Habilitar sistema de cajas con pinchos
      enableSpikeBoxes: true,
      spikeBoxConfig: {
        spikeBoxTileIds: [287], // GID de las cajas con pinchos en el tileset
        moveInterval: 800, // Pausa más corta (0.8s) para movimiento fluido
        moveSpeed: 250, // Velocidad de movimiento (más rápido y explosivo)
        damage: 1, // Quitar 1 vida
        knockbackForce: 300, // Fuerza de repulsión
      },
      // ⏱️ Habilitar sistema de plataformas temporales
      enableTemporaryPlatforms: true,
      temporaryPlatformConfig: {
        temporaryPlatformGID: 215, // GID del tile con signo de exclamación
        disappearDelay: 1000, // 1 segundo antes de desaparecer
        disappearDuration: 300, // 300ms de fade out
        invisibleDuration: 4000, // 4 segundos invisible
        reappearDuration: 300, // 300ms de fade in
        blinkDuration: 150, // 150ms por parpadeo
        blinkRepeat: 5, // 5 parpadeos
        blinkAlpha: 0.3, // 30% opacidad en parpadeo
      },
      // 🛗 Habilitar sistema de elevadores
      enableElevators: true,
      elevatorConfig: {
        leftTileGID: 20, // GID = firstgid(1) + tileID(19)
        rightTileGID: 2, // GID = firstgid(1) + tileID(1)
        moveSpeed: 100, // Velocidad de movimiento vertical continuo (píxeles/segundo)
      },
      // 🚀 Habilitar sistema de trampolines
      enableJumpButtons: true,
      jumpButtonConfig: {
        unpressedGID: 137, // ID 136 + 1
        pressedGID: 119, // ID 118 + 1
        superJumpVelocity: -800, // Potencia del super salto
        resetDelay: 500, // Tiempo antes de resetear
      },
      // 🔴 Habilitar sistema de botones rojos y cadenas
      enableRedButtons: true,
      redButtonConfig: {
        unpressedGID: 11, // ID 10 + 1
        pressedGID: 316, // ID 315 + 1
        chainGID: 214, // ID 213 + 1
      },
    };
    super("Level5", config);
  }

  /**
   * Método generado por Phaser Editor para crear los elementos visuales
   */
  editorCreate(): void {
    // Crear sprites de Snowman desde el editor
    // Estos serán convertidos a enemigos funcionales en createSnowmanEnemies()
    // Todos miran a la izquierda por defecto (direction = -1)

    // Snowman 1
    const snowman1 = this.add
      .sprite(1696, 480, "snowman-spritesheet", 0)
      .setScale(1.5);
    snowman1.setData("direction", -1);

    // Snowman 2
    const snowman2 = this.add
      .sprite(1952, 352, "snowman-spritesheet", 0)
      .setScale(1.5);
    snowman2.setData("direction", -1);

    // Snowman 3
    const snowman3 = this.add
      .sprite(3040, 288, "snowman-spritesheet", 0)
      .setScale(1.5);
    snowman3.setData("direction", -1);

    // Snowman 4
    const snowman4 = this.add
      .sprite(3616, 608, "snowman-spritesheet", 0)
      .setScale(1.5);
    snowman4.setData("direction", -1);
  }

  create() {
    this.freezableEnemies = [];
    super.create();

    // Crear elementos del editor ANTES de los sistemas
    this.editorCreate();

    this.createCoins();
    this.createMiniPingus();
    this.createKeys();
    this.createDoors();
    this.createFreezableEnemies();
    this.createSnowmanEnemies();
  }

  /**
   * Método requerido por BaseGameScene
   * Crear el mapa y asignar los layers
   */
  protected createMap(): void {
    // Crear el tilemap desde el JSON cargado
    this.tilemap = this.make.tilemap({ key: this.config.tilemapKey });

    // Añadir los tilesets
    const tilesets = this.config.tilesets || [];
    tilesets.forEach((tilesetConfig) => {
      this.tilemap.addTilesetImage(tilesetConfig.name, tilesetConfig.imageKey);
    });

    // Crear los layers
    if (this.config.backgroundLayerName) {
      this.backgroundLayer = this.tilemap.createLayer(
        this.config.backgroundLayerName,
        ["spritesheet-backgrounds-default"],
        0,
        0
      )!;
    }

    this.surfaceLayer = this.tilemap.createLayer(
      this.config.surfaceLayerName,
      ["spritesheet-tiles-default"],
      0,
      0
    )!;

    if (this.config.objectsLayerName) {
      this.objectsLayer = this.tilemap.createLayer(
        this.config.objectsLayerName,
        ["spritesheet-tiles-default"],
        0,
        0
      )!;

      // Asegurar que el layer sea visible
      this.objectsLayer.setVisible(true);
      this.objectsLayer.setAlpha(1);
    }
  }

  private createCoins(): void {
    this.coinSystem = new CoinSystem(this, {
      textureKey: "PT_TOKEN_MASTER_001",
      scale: 1.0,
      depth: 10,
      floatDistance: 5,
      floatDuration: 1000,
      collectSoundKey: "coin_collect_sound",
      soundVolume: 0.5,
    });
    const coinPositions = [
      { x: 128, y: 224 },
      { x: 256, y: 224 },
      { x: 512, y: 896 },
      { x: 704, y: 384 },
      { x: 1024, y: 896 },
      { x: 1248, y: 352 },
      { x: 1568, y: 224 },
      { x: 2464, y: 256 },
      { x: 3040, y: 928 },
      { x: 3200, y: 928 },
      { x: 3360, y: 928 },
      { x: 3488, y: 288 },
      { x: 4000, y: 256 },
      { x: 4128, y: 256 },
      { x: 4544, y: 256 },
      { x: 4672, y: 256 },
      { x: 4480, y: 960 },
      { x: 4736, y: 992 },
      { x: 928, y: 1728 },
      { x: 1184, y: 1728 },
      { x: 1440, y: 1728 },
      { x: 1664, y: 1728 },
      { x: 1888, y: 1728 },
      { x: 2112, y: 1728 },
      { x: 2912, y: 2112 },
      { x: 3040, y: 2112 },
      { x: 3168, y: 2112 },
      { x: 4160, y: 1792 },
      { x: 4352, y: 1792 },
      { x: 4576, y: 1792 },
      { x: 4800, y: 1792 },
    ];
    this.coinSystem!.createCoins(coinPositions);
    this.time.delayedCall(100, () => {
      if (this.player) this.coinSystem!.setupPlayerCollision(this.player);
    });
  }

  private createMiniPingus(): void {
    this.miniPinguSystem = new MiniPinguSystem(this, {
      textureKey: "mini-pingu",
      scale: 1.0,
      depth: 10,
      bounceDistance: 10,
      bounceDuration: 800,
      collectSoundKey: "minipingu_collect_sound",
      soundVolume: 0.6,
    });
    const miniPinguPositions = [
      { x: 992, y: 256 },
      { x: 1504, y: 2048 },
      { x: 2208, y: 800 },
    ];
    this.miniPinguSystem!.createMiniPingus(miniPinguPositions);
    this.time.delayedCall(100, () => {
      if (this.player) this.miniPinguSystem!.setupPlayerCollision(this.player);
    });
  }

  private createKeys(): void {
    this.keySystem = new KeySystem(this, {
      tilemap: this.tilemap,
      keyTileIds: [229], // GID de la llave en el tileset
      collectSoundKey: "key_pickup_sound",
      soundVolume: 0.5,
    });

    // Crear llaves desde el tilemap
    this.keySystem.createKeys();

    this.time.delayedCall(100, () => {
      if (this.player) this.keySystem.setupPlayerCollision(this.player);
    });
  }

  private createDoors(): void {
    this.doorSystem = new DoorSystem(this, {
      tilemap: this.tilemap,
      keySystem: this.keySystem,
      doorTileIds: [52, 70], // GIDs de las puertas
      openSoundKey: "door_open_sound",
      soundVolume: 0.5,
    });
    this.doorSystem.createDoors();
    this.time.delayedCall(100, () => {
      if (this.player) this.doorSystem.setupPlayerCollision(this.player);
    });
  }

  private createFreezableEnemies(): void {
    const enemyPositions = [
      { x: 1216, y: 1504 },
      { x: 2112, y: 1440 },
      { x: 3072, y: 1376 },
      { x: 3840, y: 1312 },
      { x: 4448, y: 1312 },
    ];
    enemyPositions.forEach((pos, index) => {
      const enemy = new FreezableEnemy(
        this,
        pos.x,
        pos.y,
        this.surfaceLayer,
        index % 2 === 0 ? 1 : -1
      );
      this.freezableEnemies.push(enemy);

      // Configurar colisión con el player
      this.time.delayedCall(100, () => {
        if (this.player) {
          this.physics.add.overlap(
            this.player,
            enemy,
            (player, enemySprite) => {
              const freezableEnemy =
                (enemySprite as any).enemyRef || enemySprite;
              if (
                freezableEnemy &&
                typeof freezableEnemy.damagePlayer === "function"
              ) {
                freezableEnemy.damagePlayer(player);
              }
            },
            undefined,
            this
          );
        }
      });
    });

    // Configurar colisiones con proyectiles
    this.setupEnemyProjectileCollisions();

    // Configurar colisiones del jugador con bloques de hielo
    this.setupPlayerIceBlockCollisions();
  }

  private createSnowmanEnemies(): void {
    // Crear manager de Snowman
    this.snowmanManager = new SnowmanEnemyManager(this);

    // Detectar y crear enemigos desde el editor
    this.snowmanManager.createSnowmenFromEditor();

    // Configurar colisiones con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.snowmanManager.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Configurar colisiones entre enemigos y proyectiles
   */
  private setupEnemyProjectileCollisions(): void {
    // Escuchar cuando se crea una nueva snowball y configurar colisión con cada enemigo
    this.events.on("snowballCreated", (snowball: any) => {
      this.freezableEnemies.forEach((enemy) => {
        this.physics.add.overlap(
          snowball,
          enemy,
          (proj, enemySprite) => {
            const freezableEnemy = (enemySprite as any).enemyRef || enemySprite;
            if (
              freezableEnemy &&
              typeof freezableEnemy.takeDamageFromSnowball === "function"
            ) {
              freezableEnemy.takeDamageFromSnowball();
              (proj as any).destroy();
            }
          },
          undefined,
          this
        );
      });
    });
  }

  /**
   * Configurar colisiones del jugador con bloques de hielo (enemigos congelados)
   * El jugador puede saltar sobre los enemigos congelados como plataformas
   */
  private setupPlayerIceBlockCollisions(): void {
    // Verificar periódicamente si hay bloques de hielo nuevos
    this.time.addEvent({
      delay: 100, // Cada 100ms
      callback: () => {
        if (!this.player) return;

        this.freezableEnemies.forEach((enemy) => {
          const iceBlock = enemy.getIceBlock();
          if (iceBlock && iceBlock.active) {
            // Verificar si ya existe un collider para este bloque
            const existingCollider = this.physics.world.colliders
              .getActive()
              .find(
                (c: any) =>
                  (c.object1 === this.player && c.object2 === iceBlock) ||
                  (c.object1 === iceBlock && c.object2 === this.player)
              );

            // Si no existe, crear la colisión
            if (!existingCollider) {
              this.physics.add.collider(this.player, iceBlock);
            }
          }
        });
      },
      loop: true,
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.freezableEnemies.forEach((enemy) => enemy.update(time, delta));
    this.snowmanManager?.update(time, delta);
  }

  shutdown(): void {
    this.freezableEnemies.forEach((enemy) => {
      if (enemy && enemy.active) enemy.destroy();
    });
    this.freezableEnemies = [];
    if (this.snowmanManager) this.snowmanManager.destroy();
    if (this.coinSystem) this.coinSystem.destroy();
    if (this.miniPinguSystem) this.miniPinguSystem.destroy();
    if (this.keySystem) this.keySystem.destroy();
    if (this.doorSystem) this.doorSystem.destroy();
    super.shutdown();
  }

  /**
   * Calcular score del nivel basado en monedas, mini-pingus, tiempo y vidas
   */
  protected calculateLevelScore(): any {
    const timeInSeconds = (this.levelEndTime - this.levelStartTime) / 1000;

    const stats: LevelStats = {
      coinsCollected: this.coinSystem!.getCollectedCoins(),
      totalCoins: this.coinSystem!.getTotalCoins(),
      miniPingusCollected: this.miniPinguSystem!.getCollectedMiniPingus(),
      totalMiniPingus: this.miniPinguSystem!.getTotalMiniPingus(),
      timeInSeconds: timeInSeconds,
      livesMissed: this.livesMissedDuringLevel,
    };

    const scoreBreakdown = calculateLevelScore(stats);

    console.log("📊 Level 5 Score:", scoreBreakdown);

    return {
      ...stats,
      ...scoreBreakdown,
      levelNumber: 5,
    };
  }
}
