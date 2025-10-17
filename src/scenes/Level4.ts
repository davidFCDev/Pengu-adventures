import { FreezableEnemy } from "../objects/enemies/FreezableEnemy";
import { CoinSystem } from "../systems/CoinSystem";
import { DoorSystem } from "../systems/DoorSystem";
import { KeySystem } from "../systems/KeySystem";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
import { calculateLevelScore, type LevelStats } from "../systems/ScoreSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

export class Level4 extends BaseGameScene {
  private coinSystem!: CoinSystem;
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;
  private miniPinguSystem!: MiniPinguSystem;
  private freezableEnemies: FreezableEnemy[] = [];

  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level4",
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
      musicKey: "level4_music",
      // ?? Habilitar sistema de cajas con pinchos
      enableSpikeBoxes: true,
      spikeBoxConfig: {
        spikeBoxTileIds: [287], // GID de las cajas con pinchos en el tileset
        moveInterval: 800, // Pausa más corta (0.8s) para movimiento fluido
        moveSpeed: 250, // Velocidad de movimiento (más rápido y explosivo)
        damage: 1, // Quitar 1 vida
        knockbackForce: 300, // Fuerza de repulsión
      },
      // ?? Habilitar sistema de plataformas temporales
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
      // ?? Habilitar sistema de elevadores
      enableElevators: true,
      elevatorConfig: {
        leftTileGID: 20, // GID = firstgid(1) + tileID(19)
        rightTileGID: 2, // GID = firstgid(1) + tileID(1)
        moveSpeed: 100, // Velocidad de movimiento vertical continuo (píxeles/segundo)
      },
      // ?? Habilitar sistema de enemigos acuáticos
      enableAquaticEnemies: true,
      aquaticEnemyConfig: {
        manualPositions: [
          { x: 1344, y: 2048, direction: 1 },
          { x: 4032, y: 2048, direction: -1 },
        ],
        damage: 1,
        speed: 100,
      },
    };
    super("Level4", config);
  }

  create() {
    this.freezableEnemies = [];
    super.create();
    this.createCoins();
    this.createMiniPingus();
    this.createKeys();
    this.createDoors();
    this.createFreezableEnemies();
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
      { x: 1696, y: 1824 },
      { x: 1376, y: 1824 },
      { x: 1056, y: 1824 },
      { x: 2080, y: 1824 },
      { x: 2208, y: 1824 },
      { x: 2528, y: 1824 },
      { x: 2848, y: 1824 },
      { x: 864, y: 2048 },
      { x: 1216, y: 2048 },
      { x: 1536, y: 2048 },
      { x: 1888, y: 2048 },
      { x: 2336, y: 2048 },
      { x: 3008, y: 2080 },
      { x: 3168, y: 1824 },
      { x: 3552, y: 1824 },
      { x: 3872, y: 1824 },
      { x: 4192, y: 1824 },
      { x: 3360, y: 2048 },
      { x: 3712, y: 2048 },
      { x: 4352, y: 2048 },
      { x: 4032, y: 2048 },
      { x: 3360, y: 224 },
      { x: 3616, y: 384 },
      { x: 3488, y: 608 },
      { x: 192, y: 1312 },
      { x: 192, y: 672 },
      { x: 192, y: 352 },
      { x: 576, y: 192 },
      { x: 4064, y: 448 },
      { x: 4352, y: 384 },
      { x: 4608, y: 288 },
    ];
    this.coinSystem.createCoins(coinPositions);
    this.time.delayedCall(100, () => {
      if (this.player) this.coinSystem.setupPlayerCollision(this.player);
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
      { x: 3872, y: 128 },
      { x: 2688, y: 2080 },
      { x: 2848, y: 128 },
    ];
    this.miniPinguSystem.createMiniPingus(miniPinguPositions);
    this.time.delayedCall(100, () => {
      if (this.player) this.miniPinguSystem.setupPlayerCollision(this.player);
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
      doorTileIds: [52, 70], // GIDs de las puertas (igual que Level3)
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
      { x: 3136, y: 1152 },
      { x: 3680, y: 1152 },
      { x: 2592, y: 1152 },
      { x: 4224, y: 1152 },
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

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.freezableEnemies.forEach((enemy) => enemy.update(time, delta));
  }

  shutdown(): void {
    this.freezableEnemies.forEach((enemy) => {
      if (enemy && enemy.active) enemy.destroy();
    });
    this.freezableEnemies = [];
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
      coinsCollected: this.coinSystem.getCollectedCoins(),
      totalCoins: this.coinSystem.getTotalCoins(),
      miniPingusCollected: this.miniPinguSystem.getCollectedMiniPingus(),
      totalMiniPingus: this.miniPinguSystem.getTotalMiniPingus(),
      timeInSeconds: timeInSeconds,
      livesMissed: this.livesMissedDuringLevel,
    };

    const scoreBreakdown = calculateLevelScore(stats);

    console.log("?? Level 4 Score:", scoreBreakdown);

    return {
      ...stats,
      ...scoreBreakdown,
      levelNumber: 4,
    };
  }
}
