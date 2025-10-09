import { FreezableEnemy } from "../objects/enemies/FreezableEnemy";
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
  // Sistemas de coleccionables
  private coinSystem!: CoinSystem;
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;
  private miniPinguSystem!: MiniPinguSystem;

  // Array de enemigos congelables para gestionar colisiones
  private freezableEnemies: FreezableEnemy[] = [];

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
    };

    super("Level2", config);
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
   * Posiciones extraídas de Level2.scene (Phaser Editor)
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

    // Posiciones de las monedas (extraídas de Level2.scene generado por Phaser Editor)
    const coinPositions = [
      { x: 672, y: 1664 }, // image_28
      { x: 1408, y: 1600 }, // image
      { x: 1600, y: 1600 }, // image_1
      { x: 1888, y: 1856 }, // image_2
      { x: 224, y: 1600 }, // image_3
      { x: 96, y: 1600 }, // image_4
      { x: 2240, y: 1696 }, // image_5
      { x: 2400, y: 1696 }, // image_6
      { x: 3008, y: 1600 }, // image_7
      { x: 3200, y: 1600 }, // image_8
      { x: 3552, y: 1824 }, // image_9
      { x: 4064, y: 1824 }, // image_10
      { x: 4608, y: 1792 }, // image_11
      { x: 4928, y: 1472 }, // image_12
      { x: 4160, y: 1216 }, // image_13
      { x: 3904, y: 1216 }, // image_14
      { x: 3648, y: 1216 }, // image_15
      { x: 2976, y: 1152 }, // image_16
      { x: 416, y: 1248 }, // image_17
      { x: 1792, y: 1248 }, // image_18
      { x: 1536, y: 1248 }, // image_19
      { x: 1280, y: 1248 }, // image_20
      { x: 1024, y: 1248 }, // image_21
      { x: 736, y: 1248 }, // image_22
      { x: 128, y: 1344 }, // image_23
      { x: 864, y: 640 }, // image_24
      { x: 1760, y: 640 }, // image_25
      { x: 2656, y: 640 }, // image_26
      { x: 3232, y: 288 }, // image_27
      { x: 2528, y: 288 }, // image_29
      { x: 1568, y: 288 }, // image_30
      { x: 928, y: 288 }, // image_31
      { x: 4192, y: 384 }, // image_32
      { x: 3904, y: 128 }, // image_33
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
   * Posiciones extraídas de Level2.scene (Phaser Editor)
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

    // Posiciones de los mini-pingüinos (extraídas de Level2.scene generado por Phaser Editor)
    const miniPinguPositions = [
      { x: 3008, y: 1920 }, // miniegg
      { x: 2368, y: 1344 }, // miniegg_1
      { x: 64, y: 544 }, // miniegg_2
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
      keyTileIds: [229], // GID de la llave en el tileset (tile ID 228 + 1)
      collectSoundKey: "coin_collect_sound", // Mismo sonido que las monedas
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
   * Extraído de Level2.scene (Phaser Editor)
   */
  private createFreezableEnemies(): void {
    // Posiciones exactas desde Level2.scene (5 sprites MediumSlime_Blue)
    const enemyPositions = [
      { x: 1344, y: 864, direction: 1 }, // sprite_1 - comienza hacia derecha
      { x: 2208, y: 864, direction: -1 }, // sprite - comienza hacia izquierda
      { x: 2976, y: 864, direction: 1 }, // sprite_2 - comienza hacia derecha
      { x: 3392, y: 864, direction: -1 }, // sprite_3 - comienza hacia izquierda
      { x: 3808, y: 864, direction: 1 }, // sprite_4 - comienza hacia derecha
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
}
