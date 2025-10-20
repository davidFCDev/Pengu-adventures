import { FreezableEnemy } from "../objects/enemies/FreezableEnemy";
import { CoinSystem } from "../systems/CoinSystem";
import { DoorSystem } from "../systems/DoorSystem";
import { KeySystem } from "../systems/KeySystem";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
import { calculateLevelScore, type LevelStats } from "../systems/ScoreSystem";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/**
 * Level3 - Tercer nivel del juego
 * Usa BaseGameScene para toda la funcionalidad automática
 */
export class Level3 extends BaseGameScene {
  // Sistemas de coleccionables
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;

  // Array de enemigos congelables para gestionar colisiones
  private freezableEnemies: FreezableEnemy[] = [];

  /**
   * Retorna el número del nivel (requerido por BaseGameScene)
   */
  protected getLevelNumber(): number {
    return 3;
  }

  constructor() {
    // Configuración del nivel
    const config: GameSceneConfig = {
      tilemapKey: "Level3",
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
      playerStartPosition: { x: 100, y: 2080 }, // Posición inicial del jugador
      musicKey: "level3_music", // Música del nivel 3
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
      // 🐟 Habilitar sistema de enemigos acuáticos
      enableAquaticEnemies: true,
      aquaticEnemyConfig: {
        // Usar posiciones manuales (las del Phaser Editor)
        manualPositions: [
          { x: 480, y: 2080, direction: 1 }, // sprite_5
          { x: 2432, y: 1856, direction: -1 }, // sprite_6
          { x: 3072, y: 2080, direction: 1 }, // sprite_7
          { x: 4576, y: 1760, direction: -1 }, // sprite_8
          { x: 4160, y: 2112, direction: 1 }, // sprite_9
        ],
        damage: 1,
        speed: 100,
      },
    };

    super("Level3", config);
  }

  /**
   * Método create llamado después de que BaseGameScene haya creado el mapa y el jugador
   */
  create() {
    // Limpiar arrays de enemigos (importante para reinicios)
    this.freezableEnemies = [];

    // Llamar al create de BaseGameScene (crea el tilemap, player, etc.)
    // BaseGameScene ya se encarga de:
    // - Reproducir la música según this.config.musicKey
    // - Crear sistema de cajas con pinchos (enableSpikeBoxes)
    // - Crear sistema de plataformas temporales (enableTemporaryPlatforms)
    // - Crear sistema de elevadores (enableElevators)
    // - Crear sistema de enemigos acuáticos (enableAquaticEnemies)
    super.create();

    // Crear los sistemas de coleccionables DESPUÉS de que BaseGameScene haya creado todo
    this.createCoins();
    this.createMiniPingus();
    this.createKeys();
    this.createDoors();
    this.createFreezableEnemies();

    // Emitir evento para compatibilidad
    this.events.emit("scene-awake");
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

  /**
   * Crear sistema de monedas
   * Posiciones extraídas de Level3.scene (Phaser Editor)
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

    // Posiciones de las monedas (extraídas de Level3.scene generado por Phaser Editor)
    const coinPositions = [
      { x: 544, y: 2048 }, // image_31
      { x: 704, y: 1952 }, // image
      { x: 864, y: 2048 }, // image_1
      { x: 1056, y: 1952 }, // image_2
      { x: 1216, y: 2048 }, // image_3
      { x: 1568, y: 1600 }, // image_4
      { x: 2080, y: 1600 }, // image_5
      { x: 1568, y: 2112 }, // image_6
      { x: 2080, y: 2112 }, // image_7
      { x: 2496, y: 2016 }, // image_8
      { x: 2656, y: 1856 }, // image_9
      { x: 2816, y: 2016 }, // image_10
      { x: 2976, y: 1856 }, // image_11
      { x: 3584, y: 2112 }, // image_12
      { x: 3776, y: 2112 }, // image_13
      { x: 4384, y: 1920 }, // image_14
      { x: 2624, y: 960 }, // image_15
      { x: 2080, y: 960 }, // image_16
      { x: 1664, y: 960 }, // image_17
      { x: 640, y: 992 }, // image_18
      { x: 96, y: 256 }, // image_19
      { x: 224, y: 256 }, // image_20
      { x: 864, y: 352 }, // image_21
      { x: 1248, y: 352 }, // image_22
      { x: 2400, y: 192 }, // image_23
      { x: 3584, y: 320 }, // image_24
      { x: 3712, y: 320 }, // image_25
      { x: 4192, y: 928 }, // image_26
      { x: 4416, y: 768 }, // image_27
      { x: 4480, y: 512 }, // image_28
    ];

    // Crear las monedas
    this.coinSystem!.createCoins(coinPositions);

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.coinSystem!.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Crear sistema de mini-pingüinos
   * Posiciones extraídas de Level3.scene (Phaser Editor)
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

    // Posiciones de los mini-pingüinos (extraídas de Level3.scene generado por Phaser Editor)
    const miniPinguPositions = [
      { x: 3680, y: 1792 }, // miniegg_2
      { x: 1152, y: 992 }, // miniegg
      { x: 1984, y: 480 }, // miniegg_1
    ];

    // Crear los mini-pingüinos
    this.miniPinguSystem!.createMiniPingus(miniPinguPositions);

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.miniPinguSystem!.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Crear sistema de llaves
   */
  private createKeys(): void {
    this.keySystem = new KeySystem(this, {
      tilemap: this.tilemap,
      keyTileIds: [229], // GID de la llave en el tileset (tile ID 228 + 1)
      collectSoundKey: "key_pickup_sound", // Sonido específico de llave
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
      doorTileIds: [52, 70], // GIDs de las puertas (tile IDs 51 y 69 + 1)
      openSoundKey: "door_open_sound",
      soundVolume: 0.6,
    });

    this.doorSystem.createDoors();

    // Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.doorSystem.setupPlayerCollision(this.player);
      }
    });
  }

  /**
   * Crear enemigos congelables (MediumSlime_Blue)
   * Extraído de Level3.scene (Phaser Editor)
   */
  private createFreezableEnemies(): void {
    // Posiciones exactas desde Level3.scene (5 sprites MediumSlime_Blue)
    const enemyPositions = [
      { x: 1472, y: 608, direction: 1 }, // sprite_1 - comienza hacia derecha
      { x: 2304, y: 608, direction: -1 }, // sprite - comienza hacia izquierda
      { x: 3168, y: 608, direction: 1 }, // sprite_2 - comienza hacia derecha
      { x: 3648, y: 608, direction: -1 }, // sprite_3 - comienza hacia izquierda
      { x: 4096, y: 608, direction: 1 }, // sprite_4 - comienza hacia derecha
    ];

    // Obtener el layer de superficies para colisiones
    const surfaceLayer = this.surfaceLayer;
    if (!surfaceLayer) {
      console.error("No se pudo encontrar el layer de superficies");
      return;
    }

    // Crear cada enemigo
    enemyPositions.forEach((pos, index) => {
      const enemy = new FreezableEnemy(
        this,
        pos.x,
        pos.y,
        surfaceLayer,
        pos.direction
      );

      // Guardar referencia del enemigo
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

    // Configurar colisiones con proyectiles después de que se cree el sistema
    this.setupEnemyProjectileCollisions();

    // Configurar colisiones del player con bloques de hielo
    this.setupPlayerIceBlockCollisions();
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
   * Configurar colisión del player con bloques de hielo
   * Para que pueda saltar sobre enemigos congelados
   */
  private setupPlayerIceBlockCollisions(): void {
    // Revisar continuamente si hay bloques de hielo nuevos
    this.time.addEvent({
      delay: 100, // Revisar cada 100ms
      callback: () => {
        if (!this.player) return;

        this.freezableEnemies.forEach((enemy) => {
          const iceBlock = enemy.getIceBlock();

          // Si el enemigo tiene un bloque de hielo activo
          if (iceBlock && iceBlock.active) {
            // Verificar si ya existe un collider para este bloque
            const hasCollider = (iceBlock as any).playerCollider;

            if (!hasCollider) {
              // Crear collider entre player y bloque de hielo
              const collider = this.physics.add.collider(
                this.player,
                iceBlock,
                undefined,
                undefined,
                this
              );

              // Marcar que este bloque ya tiene collider
              (iceBlock as any).playerCollider = collider;
            }
          }
        });
      },
      loop: true,
    });
  }

  /**
   * Update - Actualizar enemigos manualmente
   */
  update(time: number, delta: number): void {
    super.update(time, delta);

    // Actualizar cada enemigo congelable
    this.freezableEnemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });
  }

  /**
   * Shutdown - Limpiar recursos antes de reiniciar o cambiar de escena
   */
  shutdown(): void {
    // Remover TODOS los eventos de esta escena
    this.events.off("snowballCreated");
    this.events.removeAllListeners();

    // Destruir todos los enemigos congelables y sus bloques de hielo
    if (this.freezableEnemies && this.freezableEnemies.length > 0) {
      this.freezableEnemies.forEach((enemy) => {
        if (enemy) {
          try {
            // Obtener y destruir el bloque de hielo primero
            const iceBlock = enemy.getIceBlock();
            if (iceBlock) {
              if (iceBlock.active) {
                iceBlock.destroy();
              }
            }
            // Luego destruir el enemigo
            if (enemy.active) {
              enemy.destroy(true);
            }
          } catch (e) {
            // Ignorar errores de destrucción en shutdown
            console.warn("Error destroying enemy during shutdown:", e);
          }
        }
      });
    }

    // Limpiar completamente el array de enemigos
    this.freezableEnemies = [];

    // Limpiar sistemas de coleccionables
    if (this.coinSystem) {
      this.coinSystem.destroy();
      this.coinSystem = undefined as any;
    }
    if (this.keySystem) {
      this.keySystem.destroy();
      this.keySystem = undefined as any;
    }
    if (this.doorSystem) {
      this.doorSystem.destroy();
      this.doorSystem = undefined as any;
    }
    if (this.miniPinguSystem) {
      this.miniPinguSystem.destroy();
      this.miniPinguSystem = undefined as any;
    }

    // Llamar al shutdown del padre (limpia player, música, física, etc.)
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

    console.log("📊 Level 3 Score:", scoreBreakdown);

    return {
      ...stats,
      ...scoreBreakdown,
      levelNumber: 3,
    };
  }
}
