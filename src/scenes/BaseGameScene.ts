import { AquaticEnemyManager } from "../objects/enemies/AquaticEnemyManager";
import { EnemySystem } from "../objects/enemies/EnemyManager";
import { PenguinSprites } from "../objects/player/PenguinSprites";
import { Player } from "../objects/player/Player";
import { ElevatorSystem } from "../systems/ElevatorSystem";
import { JumpButtonSystem } from "../systems/JumpButtonSystem";
import { LifeSystem } from "../systems/LifeSystem";
import { ProjectileSystem } from "../systems/ProjectileSystem";
import { RedButtonSystem } from "../systems/RedButtonSystem";
import { SnowParticleSystem } from "../systems/SnowParticleSystem";
import { SpikeBoxSystem } from "../systems/SpikeBoxSystem";
import {
  TemporaryPlatformConfig,
  TemporaryPlatformSystem,
} from "../systems/TemporaryPlatformSystem";
import { PlayerStateManager, setupTileMapSystem } from "../systems/tilemap";

/**
 * Configuración de tileset para carga automática
 */
export interface TilesetConfig {
  /** Nombre del tileset en Tiled */
  name: string;
  /** Key de la imagen cargada en Preload */
  imageKey: string;
}

/**
 * Interfaz de configuración para escenas de juego
 */
export interface GameSceneConfig {
  /** Clave del tilemap a cargar */
  tilemapKey: string;
  /** Nombre del layer principal de superficies */
  surfaceLayerName: string;
  /** Nombre del layer de fondo (opcional) */
  backgroundLayerName?: string;
  /** Nombre del layer de objetos (opcional) */
  objectsLayerName?: string;
  /** Configuración de tilesets (opcional, por defecto usa nombres estándar) */
  tilesets?: TilesetConfig[];
  /** Posición inicial del player */
  playerStartPosition: { x: number; y: number };
  /** Configuración de zoom de cámara (opcional, por defecto 1.0) */
  cameraZoom?: number;
  /** Configuración de seguimiento de cámara (opcional) */
  cameraFollow?: {
    lerp?: { x: number; y: number };
    offset?: { x: number; y: number };
  };
  /** Clave de la música del nivel (opcional) */
  musicKey?: string;
  /** Habilitar sistema de enemigos automático (opcional, default: false) */
  enableEnemies?: boolean;
  /** Configuración del sistema de enemigos (opcional) */
  enemyConfig?: {
    maxEnemies?: number;
    minSurfaceWidth?: number;
    patrolMargin?: number;
    safeDistance?: number;
    enemyTypeRatio?: { basic: number; freezable: number; aquatic: number };
  };
  /** Habilitar sistema de cajas con pinchos (opcional, default: false) */
  enableSpikeBoxes?: boolean;
  /** Configuración del sistema de cajas con pinchos (opcional) */
  spikeBoxConfig?: {
    spikeBoxTileIds?: number[]; // GIDs de las cajas (default: buscar tiles con smash=true)
    moveInterval?: number; // Intervalo de movimiento en ms (default: 2000)
    moveSpeed?: number; // Velocidad de movimiento (default: 100)
    damage?: number; // Daño al jugador (default: 1)
    knockbackForce?: number; // Fuerza de repulsión (default: 300)
  };
  /** Habilitar sistema de plataformas temporales (opcional, default: false) */
  enableTemporaryPlatforms?: boolean;
  /** Configuración del sistema de plataformas temporales (opcional) */
  temporaryPlatformConfig?: Partial<TemporaryPlatformConfig>;
  /** Habilitar sistema de elevadores/plataformas móviles (opcional, default: false) */
  enableElevators?: boolean;
  /** Configuración del sistema de elevadores (opcional) */
  elevatorConfig?: {
    leftTileGID: number; // GID del tile izquierdo del elevador
    rightTileGID: number; // GID del tile derecho del elevador
    moveSpeed?: number; // Velocidad de movimiento (default: 100)
  };
  /** Habilitar sistema de enemigos acuáticos (opcional, default: false) */
  enableAquaticEnemies?: boolean;
  /** Configuración del sistema de enemigos acuáticos (opcional) */
  aquaticEnemyConfig?: {
    aquaticEnemyGID?: number; // GID del tile del enemigo acuático (para detección automática)
    manualPositions?: Array<{ x: number; y: number; direction: number }>; // Posiciones manuales
    damage?: number; // Daño al jugador (default: 1)
    speed?: number; // Velocidad de nado (default: 100)
  };
  /** Habilitar sistema de trampolines/jump buttons (opcional, default: false) */
  enableJumpButtons?: boolean;
  /** Configuración del sistema de jump buttons (opcional) */
  jumpButtonConfig?: {
    unpressedGID?: number; // GID del trampolín sin presionar (default: 137)
    pressedGID?: number; // GID del trampolín presionado (default: 119)
    superJumpVelocity?: number; // Velocidad del super salto (default: -800)
    resetDelay?: number; // Tiempo antes de resetear (default: 500ms)
  };
  /** Habilitar sistema de botones rojos y cadenas (opcional, default: false) */
  enableRedButtons?: boolean;
  /** Configuración del sistema de botones rojos (opcional) */
  redButtonConfig?: {
    unpressedGID?: number; // GID del botón sin presionar (default: 11)
    pressedGID?: number; // GID del botón presionado (default: 316)
    chainGID?: number; // GID de las cadenas (default: 214)
  };
  /** Habilitar sistema de partículas de nieve (opcional, default: true) */
  enableSnow?: boolean;
  /** Mostrar contadores de UI en el header (monedas, llaves, mini-pingus) (opcional, default: true) */
  showUICounters?: boolean;
  /** Nombre del boss para mostrar en la barra de salud (opcional, solo para niveles de boss) */
  bossName?: string;
}

/**
 * Clase base para todas las escenas de juego con mecánicas de plataformas
 *
 * ✅ Incluye automáticamente:
 * - Sistema de detección de tiles especiales (agua, escaleras, colisiones)
 * - Manejo automático de estados del player (nado, escalada)
 * - Configuración de cámara y físicas
 * - Sistema de cache de propiedades de tiles
 * - Colisiones automáticas basadas en propiedades
 */
export abstract class BaseGameScene extends Phaser.Scene {
  // Propiedades del mapa
  protected tilemap!: Phaser.Tilemaps.Tilemap;
  protected backgroundLayer?: Phaser.Tilemaps.TilemapLayer;
  protected surfaceLayer!: Phaser.Tilemaps.TilemapLayer;
  protected objectsLayer?: Phaser.Tilemaps.TilemapLayer;

  // Player y sistemas
  protected player!: Player;
  protected playerStateManager!: PlayerStateManager;
  protected playerCollider!: Phaser.Physics.Arcade.Collider;
  protected lifeSystem!: LifeSystem;
  protected spikesGroup!: Phaser.Physics.Arcade.StaticGroup;
  protected isGameOverInProgress: boolean = false;
  protected currentMusic?: Phaser.Sound.BaseSound;
  protected snowWalls: Array<{
    container: Phaser.GameObjects.Container;
    sprite: Phaser.Physics.Arcade.Sprite;
    worldX: number;
    worldY: number;
  }> = []; // Array para muros de nieve
  protected levelEndUI?: any; // UI de fin de nivel
  protected gameOverUI?: any; // UI de game over
  protected hasFinishedLevel: boolean = false;
  protected snowParticleSystem?: SnowParticleSystem; // Sistema de partículas de nieve
  protected enemySystem?: EnemySystem; // Sistema de enemigos
  protected projectileSystem?: ProjectileSystem; // Sistema de proyectiles
  protected spikeBoxSystem?: SpikeBoxSystem; // Sistema de cajas con pinchos
  protected temporaryPlatformSystem?: TemporaryPlatformSystem; // Sistema de plataformas temporales
  protected elevatorSystem?: ElevatorSystem; // Sistema de elevadores/plataformas móviles
  protected jumpButtonSystem?: JumpButtonSystem; // Sistema de trampolines/jump buttons
  protected aquaticEnemyManager?: any; // Sistema de enemigos acuáticos (AquaticEnemyManager)
  protected redButtonSystem?: any; // Sistema de botones rojos y cadenas (RedButtonSystem)

  // Sistema de puntuación y cronómetro
  protected levelStartTime: number = 0; // Timestamp del inicio del nivel
  protected levelEndTime: number = 0; // Timestamp del fin del nivel
  protected initialLives: number = 3; // Vidas al inicio del nivel
  protected livesMissedDuringLevel: number = 0; // Vidas perdidas durante el nivel

  // Configuración
  protected config!: GameSceneConfig;

  // Cache de propiedades de tiles
  private tilePropertyCache?: Map<number, Record<string, any>>;

  constructor(key: string, config: GameSceneConfig) {
    super(key);
    this.config = config;
  }

  /**
   * Método helper para configurar tilesets automáticamente
   */
  protected setupTilesets(): void {
    const defaultTilesets: TilesetConfig[] = [
      {
        name: "spritesheet-tiles-default",
        imageKey: "spritesheet-tiles-default",
      },
      {
        name: "spritesheet-backgrounds-default",
        imageKey: "spritesheet-backgrounds-default",
      },
    ];

    const tilesets = this.config.tilesets || defaultTilesets;

    tilesets.forEach((tileset) => {
      this.tilemap.addTilesetImage(tileset.name, tileset.imageKey);
    });
  }

  /**
   * Método helper para crear layers estándar
   */
  protected createStandardLayers(): void {
    const backgroundLayerName = this.config.backgroundLayerName || "fondo";
    const objectsLayerName = this.config.objectsLayerName || "objects";

    // Crear layer de fondo si está configurado
    if (this.config.backgroundLayerName) {
      this.backgroundLayer =
        this.tilemap.createLayer(
          backgroundLayerName,
          ["spritesheet-backgrounds-default"],
          0,
          0
        ) || undefined;
    }

    // Crear layer de superficies (obligatorio)
    this.surfaceLayer = this.tilemap.createLayer(
      this.config.surfaceLayerName,
      ["spritesheet-tiles-default"],
      0,
      0
    )!;

    // Crear layer de objetos
    this.objectsLayer =
      this.tilemap.createLayer(
        objectsLayerName,
        ["spritesheet-tiles-default"],
        0,
        0
      ) || undefined;

    // Configurar layer de objetos
    if (this.objectsLayer) {
      this.objectsLayer.setVisible(true);
      this.objectsLayer.setDepth(100);
    }
  }

  /**
   * Método a implementar por las escenas hijas para crear el mapa específico
   * Este método debe crear el tilemap y los layers usando this.config
   */
  protected abstract createMap(): void;

  /**
   * Método principal de creación que las escenas hijas pueden override
   * pero generalmente solo necesitarán implementar createMap()
   */
  create(): void {
    console.log("🎮 Iniciando escena desde CERO...");

    // 0. IMPORTANTE: Resetear banderas de estado al inicio
    this.isGameOverInProgress = false;
    this.hasFinishedLevel = false;

    // 0.1. Iniciar cronómetro del nivel
    this.levelStartTime = this.time.now;
    this.levelEndTime = 0;
    this.livesMissedDuringLevel = 0;

    // 1. Crear el mapa específico (implementado por la escena hija)
    this.createMap();

    // 2. Crear las animaciones del pingüino
    PenguinSprites.createAnimations(this);

    // 3. Crear el player
    this.createPlayer();

    // 4. Crear sistema de vidas
    this.createLifeSystem();

    // 5. Configurar sistema de tilemap automático
    this.setupTileMapSystem();

    // 6. Crear grupo de spikes
    this.createSpikesGroup();

    // 7. Configurar colisiones
    this.setupCollisions();

    // 8. Configurar colisiones físicas
    this.setupPhysicsCollisions();

    // 8. Configurar la cámara
    this.setupCamera();

    // 10. Posicionar el player basándose en el tile de inicio (después de que todo esté configurado)
    this.positionPlayerAtStart();

    // 11. Inicializar música del nivel
    this.setupLevelMusic();

    // 11. Crear muros de nieve
    this.createSnowWalls();

    // 12. Crear sistema de partículas de nieve
    this.createSnowParticleSystem();

    // 13. Crear sistema de proyectiles
    this.createProjectileSystem();

    // 14. Crear sistema de cajas con pinchos (si está habilitado)
    if (this.config.enableSpikeBoxes) {
      this.createSpikeBoxSystem();
    }

    // 15. Crear sistema de plataformas temporales (si está habilitado)
    if (this.config.enableTemporaryPlatforms) {
      this.createTemporaryPlatformSystem();
    }

    // 16. Crear sistema de elevadores (si está habilitado)
    if (this.config.enableElevators) {
      this.createElevatorSystem();
    }

    // 17. Crear sistema de trampolines/jump buttons (si está habilitado)
    if (this.config.enableJumpButtons) {
      this.createJumpButtonSystem();
    }

    // 18. Crear sistema de botones rojos y cadenas (si está habilitado)
    if (this.config.enableRedButtons) {
      this.createRedButtonSystem();
    }

    // 19. Crear sistema de enemigos acuáticos (si está habilitado)
    if (this.config.enableAquaticEnemies) {
      this.createAquaticEnemySystem();
    }

    // 20. Crear sistema de enemigos (si está habilitado)
    if (this.config.enableEnemies) {
      this.createEnemySystem();
    }

    // 21. Configurar detección de final de nivel
    this.setupLevelEndDetection();

    // 22. Escuchar evento de soplido para destruir muros de nieve
    this.events.on("playerBlowing", () => {
      this.checkSnowWallDestruction();
    });
  }

  /**
   * Update principal que maneja toda la lógica del juego
   */
  update(time: number, delta: number): void {
    if (this.player && this.playerStateManager) {
      this.player.update();
      this.playerStateManager.update(); // Centraliza TODA la lógica de states
    }

    // Actualizar sistema de cajas con pinchos
    if (this.spikeBoxSystem) {
      this.spikeBoxSystem.update();
    }

    // Actualizar sistema de enemigos
    if (this.enemySystem) {
      this.enemySystem.update(this.time.now, this.game.loop.delta);
    }

    // Actualizar sistema de elevadores
    if (this.elevatorSystem) {
      this.elevatorSystem.update();
    }

    // Actualizar sistema de enemigos acuáticos
    if (this.aquaticEnemyManager) {
      this.aquaticEnemyManager.update();
    }
  }

  /**
   * Crear el player en la posición inicial
   */
  private createPlayer(): void {
    const { x, y } = this.config.playerStartPosition;
    this.player = new Player(this, x, y, "penguin_standing");
  }

  /**
   * Posicionar al player basándose en el tile con start=true
   */
  private positionPlayerAtStart(): void {
    if (this.player && this.surfaceLayer) {
      // Buscar específicamente en la capa "superficies"
      const superficiesLayer = this.tilemap?.getLayer("superficies");
      if (superficiesLayer && superficiesLayer.tilemapLayer) {
        this.player.setStartPosition(superficiesLayer.tilemapLayer);
      } else {
        this.player.setStartPosition(this.surfaceLayer);
      }
    }
  }

  /**
   * Configurar el sistema automático de tilemap
   */
  private setupTileMapSystem(): void {
    const { stateManager, layer } = setupTileMapSystem(
      this,
      this.player,
      this.config.tilemapKey,
      this.config.surfaceLayerName,
      this.player.getCursors()!,
      this.player.getWasdKeys(),
      this.tilemap
    );

    if (layer) {
      this.surfaceLayer = layer;
    }

    this.playerStateManager = stateManager;
  }

  /**
   * Configurar colisiones de tiles
   */
  private setupCollisions(): void {
    // Configurar colisiones en el layer de superficie
    if (this.surfaceLayer) {
      this.surfaceLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        if (tile && tile.properties) {
          const hasCollision = this.checkTileProperty(tile, "collision");
          const hasCross = this.checkTileProperty(tile, "cross");

          if (hasCollision) {
            tile.setCollision(true);
          }

          // Los tiles con cross=true siempre tienen colisión inicialmente (modo normal)
          if (hasCross) {
            tile.setCollision(true);
          }
        }
      });
    }

    // Configurar colisiones en el layer de objetos (spikes, etc.)
    if (this.objectsLayer) {
      this.objectsLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        if (tile && tile.properties) {
          const hasKill = this.checkTileProperty(tile, "kill");
          const hasCollision = this.checkTileProperty(tile, "collision");

          // Solo configurar colisión para tiles sin kill (spikes se manejan por separado)
          if (hasCollision && !hasKill) {
            tile.setCollision(true);
          } else if (hasKill) {
            // Los spikes se manejan con sprites personalizados en createSpikesGroup
            tile.setCollision(false);
          }
        }
      });
    }
  }

  /**
   * Actualizar colisiones de tiles cross según el estado del jugador
   */
  public updateCrossCollisions(): void {
    if (!this.surfaceLayer || !this.player) return;

    const isGhostMode = this.player.getIsGhost();

    this.surfaceLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile && tile.properties) {
        const hasCross = this.checkTileProperty(tile, "cross");

        if (hasCross) {
          // En modo fantasma, los tiles cross no tienen colisión
          // En modo normal, sí tienen colisión
          tile.setCollision(!isGhostMode);
        }
      }
    });
  }

  /**
   * Configurar colisiones físicas entre player y superficie
   */
  private setupPhysicsCollisions(): void {
    if (this.surfaceLayer) {
      this.playerCollider = this.physics.add.collider(
        this.player,
        this.surfaceLayer
      );
      this.player.setCollider(this.playerCollider);
    }

    // Configurar colisiones con objetos peligrosos
    this.setupObjectCollisions();
  }

  /**
   * Auto-configurar propiedades de tiles especiales basándose en patrones comunes
   * 🔥 Detecta automáticamente spikes, agua, escaleras, etc. por nombre o ID
   */
  private autoConfigureSpikeProperties(tile: Phaser.Tilemaps.Tile): boolean {
    if (!tile) return false;

    // Patrones comunes para detectar spikes automáticamente
    const spikePatterns = [
      /spike/i, // Cualquier cosa con "spike" en el nombre
      /pua/i, // "pua" en español
      /espina/i, // "espina" en español
      /thorn/i, // "thorn" en inglés
      /needle/i, // "needle" en inglés
      /pincho/i, // "pincho" en español
    ];

    // Obtener información del tile desde el tilemap
    let tileName = "";
    let tilesetName = "";

    try {
      // Intentar obtener el nombre del tileset y tile
      const tilemapData = this.cache.tilemap.get(this.config.tilemapKey);
      if (tilemapData && tilemapData.data && tilemapData.data.tilesets) {
        tilemapData.data.tilesets.forEach((tilesetData: any) => {
          if (
            tile.index >= tilesetData.firstgid &&
            tile.index < tilesetData.firstgid + tilesetData.tilecount
          ) {
            tilesetName = tilesetData.name || "";

            // Buscar información específica del tile
            if (tilesetData.tiles) {
              const localTileId = tile.index - tilesetData.firstgid;
              const tileData = tilesetData.tiles.find(
                (t: any) => t.id === localTileId
              );
              if (tileData) {
                tileName = tileData.type || tileData.class || "";
              }
            }
          }
        });
      }
    } catch (error) {
      console.warn(
        "Error al obtener información del tile para auto-configuración:",
        error
      );
    }

    // Verificar patrones en nombre del tile o tileset
    const textToCheck = `${tileName} ${tilesetName}`.toLowerCase();

    const isSpike = spikePatterns.some((pattern) => pattern.test(textToCheck));

    if (isSpike) {
      // Crear propiedades temporales para este tile
      if (!tile.properties) {
        tile.properties = {};
      }
      (tile.properties as any).kill = true;

      return true;
    }

    return false;
  }

  /**
   * Crear grupo de spikes с colisiones personalizadas
   * ✅ AUTO-CONFIGURACIÓN: Detecta automáticamente tiles de spikes por nombre/ID y les asigna kill=true
   *
   * 📋 DETECCIÓN AUTOMÁTICA DE ORIENTACIÓN:
   * - Bottom (default): Spike apuntando hacia arriba
   * - Top: Tile volteado verticalmente (flipY) o rotado 180°
   * - Right: Tile rotado 90° en sentido horario
   * - Left: Tile rotado 270° o volteado horizontalmente (flipX)
   *
   * 🎯 MANUAL OVERRIDE:
   * En Tiled, puedes añadir una propiedad personalizada al tile:
   * - Nombre: "position"
   * - Tipo: string
   * - Valor: "top", "bottom", "left", o "right"
   */
  private createSpikesGroup(): void {
    // Crear grupo estático para los spikes
    this.spikesGroup = this.physics.add.staticGroup();

    let tilesChecked = 0;
    let spikesFound = 0;

    // Buscar tiles con propiedad kill Y auto-configurar spikes por nombre
    if (this.objectsLayer) {
      this.objectsLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        if (tile) {
          tilesChecked++;
          let hasKill = this.checkTileProperty(tile, "kill");

          // 🔥 AUTO-CONFIGURACIÓN: Si no tiene kill=true pero es un spike, configurarlo automáticamente
          if (!hasKill) {
            hasKill = this.autoConfigureSpikeProperties(tile);
          }

          if (hasKill) {
            spikesFound++;
          }

          if (hasKill) {
            // Detectar orientación automáticamente basada en las transformaciones de Tiled
            // Tiled usa propiedades flipped en lugar de rotation directa
            const isFlippedVertically = tile.flipY; // Tile volteado verticalmente
            const isFlippedHorizontally = tile.flipX; // Tile volteado horizontalmente
            const isFlippedDiagonally = tile.rotation !== 0; // Rotación diagonal

            // Verificar la rotación en radianes también por si acaso
            const rotation = tile.rotation;
            const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1; // 90° rotation
            const isRotated180 = Math.abs(rotation - Math.PI) < 0.1; // 180° rotation
            const isRotated270 = Math.abs(rotation - (3 * Math.PI) / 2) < 0.1; // 270° rotation

            // También podemos usar las propiedades directas de Tiled si están disponibles
            const position =
              this.getTilePropertyValue(tile, "position") || "auto";

            // Configurar posición y tamaño según la orientación
            let spikeX, spikeY, spikeWidth, spikeHeight;
            let detectedPosition = "bottom"; // Por defecto

            // Auto-detectar si no se especifica posición manualmente
            if (position === "auto") {
              // Detectar basándose en flip y rotación
              if (isFlippedVertically || isRotated180) {
                detectedPosition = "top";
              } else if (isRotated90) {
                detectedPosition = "right";
              } else if (isRotated270) {
                detectedPosition = "left";
              } else if (isFlippedHorizontally) {
                // Si está volteado horizontalmente, podría ser left o right
                detectedPosition = "left";
              } else {
                detectedPosition = "bottom";
              }
            } else {
              detectedPosition = position.toLowerCase();
            }

            switch (detectedPosition) {
              case "top":
                // Spike apuntando hacia abajo (parte superior del tile)
                spikeX = tile.getCenterX();
                spikeY = tile.pixelY + 16; // Hitbox en la parte superior (primeros 32px)
                spikeWidth = tile.width; // Ancho completo del tile (64px)
                spikeHeight = 32; // Alto reducido a la mitad (32px)
                break;

              case "left":
                // Spike apuntando hacia la DERECHA (las puntas están en el lado DERECHO del tile)
                spikeX = tile.pixelX + tile.width - 16; // Hitbox en el lado DERECHO (donde están las puntas)
                spikeY = tile.getCenterY();
                spikeWidth = 32; // Ancho reducido a la mitad (32px)
                spikeHeight = tile.height; // Alto completo del tile (64px)
                break;

              case "right":
                // Spike apuntando hacia la IZQUIERDA (las puntas están en el lado IZQUIERDO del tile)
                spikeX = tile.pixelX + 16; // Hitbox en el lado IZQUIERDO (donde están las puntas)
                spikeY = tile.getCenterY();
                spikeWidth = 32; // Ancho reducido a la mitad (32px)
                spikeHeight = tile.height; // Alto completo del tile (64px)
                break;

              case "bottom":
              default:
                // Spike apuntando hacia arriba (parte inferior del tile) - DEFAULT
                spikeX = tile.getCenterX();
                spikeY = tile.pixelY + tile.height - 16; // Hitbox en la parte inferior (últimos 32px)
                spikeWidth = tile.width; // Ancho completo del tile (64px)
                spikeHeight = 32; // Alto reducido a la mitad (32px)
                break;
            }

            // Crear el rectángulo de colisión (invisible)
            const spikeCollider = this.add.rectangle(
              spikeX,
              spikeY,
              spikeWidth,
              spikeHeight,
              0x000000, // Color negro
              0 // Alpha 0 = completamente invisible
            );

            // Añadir física estática
            this.physics.add.existing(spikeCollider, true);

            // Configurar el cuerpo de colisión
            const body = spikeCollider.body as Phaser.Physics.Arcade.StaticBody;
            body.setSize(spikeWidth, spikeHeight);
            body.setOffset(0, 0);

            // Añadir al grupo de spikes
            this.spikesGroup.add(spikeCollider);

            // Marcar el tile original como no colisionable
            tile.setCollision(false);
          }
        }
      });
    }

    if (this.tilemap) {
      this.tilemap.layers.forEach((layerData, index) => {
        if (layerData.tilemapLayer) {
          let layerTiles = 0;
          layerData.tilemapLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
            if (tile) {
              layerTiles++;
            }
          });
        }
      });
    }
  }

  /**
   * Crear botón redondo para alternar modo fantasma
   */
  /**
   * Configurar la cámara
   */
  private setupCamera(): void {
    if (!this.player || !this.tilemap) return;

    // Configurar límites del mundo de físicas
    const mapWidth = this.tilemap.widthInPixels;
    const mapHeight = this.tilemap.heightInPixels;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // Configurar seguimiento de cámara
    const followConfig = this.config.cameraFollow || {};
    const lerp = followConfig.lerp || { x: 1, y: 1 };
    const offset = followConfig.offset || { x: 0, y: 0 };

    this.cameras.main.startFollow(this.player, true, lerp.x, lerp.y);
    this.cameras.main.setFollowOffset(offset.x, offset.y);

    // Configurar límites y zoom de cámara
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setZoom(this.config.cameraZoom || 1.0);
  }

  // NOTA: Toda la lógica de state management se movió a PlayerStateManager
  // para centralizar y evitar duplicación

  /**
   * Verificar si un tile tiene una propiedad específica
   */
  protected checkTileProperty(
    tile: Phaser.Tilemaps.Tile,
    property: string,
    expectedValue: any = true
  ): boolean {
    if (!tile) return false;

    // Método 1: Verificar propiedades directas del tile
    if (
      tile.properties &&
      (tile.properties as any)[property] === expectedValue
    ) {
      return true;
    }

    // Método 2: Cache de tiles conocidos
    if (!this.tilePropertyCache) {
      this.buildTilePropertyCache();
    }

    if (this.tilePropertyCache) {
      const tileProps = this.tilePropertyCache.get(tile.index);
      if (tileProps && tileProps[property] === expectedValue) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtener el valor de una propiedad específica de un tile
   */
  protected getTilePropertyValue(
    tile: Phaser.Tilemaps.Tile,
    property: string
  ): any {
    if (!tile) return null;

    // Método 1: Verificar propiedades directas del tile
    if (tile.properties && (tile.properties as any)[property] !== undefined) {
      return (tile.properties as any)[property];
    }

    // Método 2: Cache de tiles conocidos
    if (!this.tilePropertyCache) {
      this.buildTilePropertyCache();
    }

    if (this.tilePropertyCache) {
      const tileProps = this.tilePropertyCache.get(tile.index);
      if (tileProps && tileProps[property] !== undefined) {
        return tileProps[property];
      }
    }

    return null;
  }

  /**
   * Construir cache de propiedades de tiles
   */
  private buildTilePropertyCache(): void {
    this.tilePropertyCache = new Map();

    try {
      const tilemapData = this.cache.tilemap.get(this.config.tilemapKey);

      if (tilemapData && tilemapData.data && tilemapData.data.tilesets) {
        tilemapData.data.tilesets.forEach((tilesetData: any) => {
          if (tilesetData.tiles) {
            tilesetData.tiles.forEach((tileData: any) => {
              if (tileData.properties) {
                const tileIndex = tileData.id + tilesetData.firstgid;
                const properties: Record<string, any> = {};

                tileData.properties.forEach((prop: any) => {
                  switch (prop.type) {
                    case "bool":
                    case "string":
                    case "float":
                    case "int":
                      properties[prop.name] = prop.value;
                      break;
                    default:
                      properties[prop.name] = prop.value;
                  }
                });

                if (Object.keys(properties).length > 0) {
                  this.tilePropertyCache!.set(tileIndex, properties);
                }
              }
            });
          }
        });
      }
    } catch (error) {
      this.tilePropertyCache = new Map();
    }
  }

  /**
   * Crear sistema de vidas
   */
  private createLifeSystem(): void {
    // Determinar si se muestran los contadores (por defecto true)
    const showCounters = this.config.showUICounters !== false;
    const bossName = this.config.bossName; // Nombre del boss (opcional)

    this.lifeSystem = new LifeSystem(this, 0, 0, showCounters, bossName);

    // Configurar callbacks de botones (solo en niveles normales, no boss)
    if (!bossName) {
      // Callback del botón EXIT
      this.lifeSystem.setExitCallback(() => {
        // Abandonar el nivel sin guardar progreso y volver al Roadmap
        console.log(
          "EXIT button clicked - Returning to Roadmap without saving"
        );
        this.scene.start("Roadmap");
      });
    }

    // Inicializar contador de monedas en 0 (solo si los contadores están activos)
    if (showCounters) {
      this.lifeSystem.updateCoinCount(0);
    }

    // Inicializar contador de mini-pingüinos en 0 (solo si los contadores están activos)
    if (showCounters) {
      this.lifeSystem.updateMiniPinguCount(0);
    }

    // Inicializar contador de llaves en 0 (solo si los contadores están activos)
    if (showCounters) {
      this.lifeSystem.updateKeyCount(0);
    }

    // Escuchar evento de recolección de monedas (reutilizable para todos los niveles)
    this.events.on(
      "coinCollected",
      (data: { collected: number; total: number }) => {
        // Actualizar contador visual de monedas
        this.lifeSystem.updateCoinCount(data.collected);
      }
    );

    // Escuchar evento de recolección de mini-pingüinos (reutilizable para todos los niveles)
    this.events.on(
      "miniPinguCollected",
      (data: { collected: number; total: number }) => {
        // Actualizar contador visual de mini-pingüinos
        this.lifeSystem.updateMiniPinguCount(data.collected);
      }
    );

    // Escuchar evento de recolección de llaves (reutilizable para todos los niveles)
    this.events.on("keyCollected", (count: number) => {
      // Actualizar contador visual de llaves
      this.lifeSystem.updateKeyCount(count);
    });

    // Escuchar evento de uso de llaves (cuando se abre una puerta)
    this.events.on("keyUsed", (count: number) => {
      // Actualizar contador visual de llaves
      this.lifeSystem.updateKeyCount(count);
    });

    // Configurar callback para cuando el player recibe daño
    this.player.setOnHitCallback(() => {
      // Evitar múltiples activaciones si ya está en proceso de game over
      if (this.isGameOverInProgress || this.lifeSystem.isGameOver()) {
        return;
      }

      const hasLivesLeft = this.lifeSystem.loseLife();

      // Incrementar contador de vidas perdidas para el score
      this.livesMissedDuringLevel++;

      // Verificar tanto el retorno como el estado interno
      if (!hasLivesLeft || this.lifeSystem.isGameOver()) {
        // Marcar que el game over está en proceso
        this.isGameOverInProgress = true;

        // Delay breve para que se vea la última animación de pérdida de vida
        // y se reproduzca el sonido de game over
        this.time.delayedCall(500, () => {
          this.restartLevel();
        });
      }
    });
  }

  /**
   * Configurar colisiones con objetos peligrosos en el layer objects
   */
  private setupObjectCollisions(): void {
    // Configurar colisiones con spikes personalizados
    if (this.spikesGroup) {
      this.physics.add.collider(
        this.player,
        this.spikesGroup,
        this.handleSpikeCollision,
        undefined,
        this
      );
    }

    // Configurar colisiones con otros objetos del layer (no spikes)
    if (this.objectsLayer) {
      this.physics.add.collider(
        this.player,
        this.objectsLayer,
        this.handleObjectCollision,
        undefined,
        this
      );
    }
  }

  /**
   * Manejar colisiones con spikes personalizados
   */
  private handleSpikeCollision(player: any, spike: any): void {
    // Solo hacer daño si el player no es invulnerable
    if (!this.player.getIsInvulnerable()) {
      this.player.hit();
    }
  }

  /**
   * Manejar colisiones con objetos del layer objects
   */
  private handleObjectCollision(player: any, tile: any): void {
    const tileObject = tile as Phaser.Tilemaps.Tile;

    if (!tileObject || !tileObject.properties) return;

    // Verificar si el tile tiene propiedad de daño
    const hasKillProperty = this.checkTileProperty(tileObject, "kill", true);

    if (hasKillProperty) {
      // Solo hacer daño si el player no es invulnerable
      if (!this.player.getIsInvulnerable()) {
        this.player.hit();
      }
    }
  }

  /**
   * Mostrar modal de Game Over (en lugar de reiniciar directamente)
   */
  private restartLevel(): void {
    // Reproducir sonido de game over
    this.sound.play("game_over_sound", {
      volume: 0.6,
    });

    // CRÍTICO: Bloquear el control del jugador
    if (this.player) {
      this.player.setControlsActive(false);
    }

    // Cargar GameOverUI dinámicamente y mostrar el modal
    import("../objects/ui/GameOverUI").then((module) => {
      const GameOverUI = module.default;

      // SIEMPRE crear un nuevo GameOverUI (para evitar bugs al reintentar)
      if (this.gameOverUI) {
        this.gameOverUI.destroy();
      }
      this.gameOverUI = new GameOverUI(this);

      // Mostrar el modal con animación
      this.gameOverUI.show();
    });
  }

  // Getters para acceso a propiedades protegidas (si es necesario)
  public getPlayer(): Player {
    return this.player;
  }
  public getTilemap(): Phaser.Tilemaps.Tilemap {
    return this.tilemap;
  }
  public getSurfaceLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.surfaceLayer;
  }
  public getLifeSystem(): LifeSystem {
    return this.lifeSystem;
  }

  /**
   * Configurar música del nivel
   */
  private setupLevelMusic(): void {
    if (!this.config.musicKey) {
      return;
    }

    // Detener música anterior si existe
    this.stopCurrentMusic();

    // Verificar que el audio existe
    if (!this.sound.get(this.config.musicKey)) {
      this.currentMusic = this.sound.add(this.config.musicKey, {
        loop: true,
        volume: 0.3, // Volumen medio/bajo como solicitado
      });

      this.currentMusic.play();
    } else {
      console.warn(`⚠️ Música "${this.config.musicKey}" no encontrada`);
    }
  }

  /**
   * Detener música actual
   */
  private stopCurrentMusic(): void {
    // Detener y destruir la música actual si existe
    if (this.currentMusic) {
      if (this.currentMusic.isPlaying) {
        this.currentMusic.stop();
      }
      this.currentMusic.destroy();
      this.currentMusic = undefined;
    }

    // Seguridad adicional: detener TODOS los sonidos en loop
    // Esto previene duplicación de música al reiniciar
    this.sound.getAllPlaying().forEach((sound) => {
      const webAudioSound = sound as Phaser.Sound.WebAudioSound;
      if (webAudioSound.loop) {
        sound.stop();
        sound.destroy();
      }
    });
  }

  /**
   * Cambiar música del nivel
   */
  public changeMusic(musicKey: string): void {
    this.config.musicKey = musicKey;
    this.setupLevelMusic();
  }

  /**
   * Pausar/reanudar música
   */
  public toggleMusic(): void {
    if (this.currentMusic) {
      if (this.currentMusic.isPlaying) {
        this.currentMusic.pause();
      } else {
        this.currentMusic.resume();
      }
    }
  }

  /**
   * Crear muros de nieve desde tiles con propiedad snow=true
   * Usa la misma estrategia que createSpikesGroup - crear objetos inmediatamente
   */
  protected createSnowWalls(): void {
    if (!this.objectsLayer) {
      return;
    }

    // Buscar tiles con propiedad snow INMEDIATAMENTE (como los spikes)
    this.objectsLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (
        tile &&
        tile.index !== -1 &&
        tile.properties &&
        tile.properties.snow === true
      ) {
        const centerX = tile.getCenterX();
        const centerY = tile.getCenterY();

        // Crear el muro centrado en el tile
        const wallContainer = this.add.container(centerX, centerY);
        wallContainer.setDepth(50);

        // Crear montaña de nieve ACUMULADA - forma más baja y redondeada
        const snowMountain = this.add.graphics();

        // CAPA BASE - Fila inferior (las más grandes) - más anchas
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-20, 20, 22); // Izquierda base - más grande
        snowMountain.fillCircle(0, 22, 24); // Centro base (la más grande)
        snowMountain.fillCircle(21, 21, 21); // Derecha base
        snowMountain.fillCircle(-10, 18, 19); // Extra izquierda
        snowMountain.fillCircle(12, 19, 20); // Extra derecha

        // Sombras debajo de las bolas base
        snowMountain.fillStyle(0xd0e0f0, 0.7);
        snowMountain.fillCircle(-20, 20, 18);
        snowMountain.fillCircle(0, 22, 20);
        snowMountain.fillCircle(21, 21, 17);

        // SEGUNDA CAPA - Más baja y más ancha
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-16, 0, 19); // Izquierda
        snowMountain.fillCircle(4, 2, 20); // Centro
        snowMountain.fillCircle(18, 1, 17); // Derecha
        snowMountain.fillCircle(-6, -2, 16); // Extra centro-izq
        snowMountain.fillCircle(10, 0, 15); // Extra centro-der

        // Sombras segunda capa
        snowMountain.fillStyle(0xd8e8f5, 0.6);
        snowMountain.fillCircle(-16, 0, 15);
        snowMountain.fillCircle(4, 2, 16);

        // TERCERA CAPA - Menor altura (reducida)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-10, -16, 16); // Izquierda
        snowMountain.fillCircle(8, -18, 17); // Derecha
        snowMountain.fillCircle(-1, -15, 15); // Centro
        snowMountain.fillCircle(14, -14, 13); // Extra derecha

        // Sombras tercera capa
        snowMountain.fillStyle(0xe0edf7, 0.6);
        snowMountain.fillCircle(-10, -16, 12);
        snowMountain.fillCircle(8, -18, 13);

        // PICO REDONDEADO - Mucho más bajo y suave
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-6, -30, 14); // Izquierda
        snowMountain.fillCircle(7, -32, 15); // Derecha
        snowMountain.fillCircle(0, -28, 13); // Centro

        // Sombras pico
        snowMountain.fillStyle(0xe5f1f9, 0.6);
        snowMountain.fillCircle(-6, -30, 11);
        snowMountain.fillCircle(7, -32, 12);

        // Cima muy redondeada (sin pico puntiagudo)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(0, -42, 13); // Bola superior grande y suave
        snowMountain.fillCircle(-4, -40, 10); // Lateral izquierdo
        snowMountain.fillCircle(5, -41, 11); // Lateral derecho

        // Highlight sutil (brillo de nieve)
        snowMountain.fillStyle(0xffffff, 0.7);
        snowMountain.fillCircle(-2, -44, 6);
        snowMountain.fillCircle(3, -43, 5);

        // CONTORNOS SUTILES para dar definición
        snowMountain.lineStyle(1.5, 0xc8dce8, 0.5);
        snowMountain.strokeCircle(-20, 20, 22);
        snowMountain.strokeCircle(0, 22, 24);
        snowMountain.strokeCircle(21, 21, 21);
        snowMountain.strokeCircle(4, 2, 20);
        snowMountain.strokeCircle(8, -18, 17);
        snowMountain.strokeCircle(7, -32, 15);
        snowMountain.strokeCircle(0, -42, 13);

        wallContainer.add(snowMountain);

        // Crear física para colisión (invisible)
        // La montaña tiene aproximadamente 64x120 (ancho x alto)
        const physicsSprite = this.physics.add.sprite(
          centerX,
          centerY - 10,
          ""
        );
        physicsSprite.setVisible(false);
        (physicsSprite.body as Phaser.Physics.Arcade.Body).setSize(60, 80);
        (physicsSprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        (physicsSprite.body as Phaser.Physics.Arcade.Body).moves = false;
        (physicsSprite as any).isSnowWall = true;

        // Guardar referencias
        (wallContainer as any).physicsSprite = physicsSprite;
        (physicsSprite as any).wallContainer = wallContainer;
        this.snowWalls.push({
          container: wallContainer,
          sprite: physicsSprite,
          worldX: centerX,
          worldY: centerY,
        });

        // Configurar colisión
        if (this.player) {
          this.physics.add.collider(this.player, physicsSprite);
        }

        tile.setVisible(false);
        tile.setCollision(false);
      }
    });
  }

  /**
   * Detectar si el jugador puede destruir un muro cercano con el soplido
   */
  protected checkSnowWallDestruction(): void {
    if (!this.player || !this.player.getIsGhost()) return;

    const playerX = this.player.x;
    const playerY = this.player.y;
    const direction = this.player.flipX ? -1 : 1;

    // Buscar muros cercanos
    for (let i = this.snowWalls.length - 1; i >= 0; i--) {
      const wall = this.snowWalls[i];
      if (wall && wall.container && wall.sprite) {
        const distance = Phaser.Math.Distance.Between(
          playerX,
          playerY,
          wall.worldX,
          wall.worldY - 30 // Ajustado para el centro de la montaña
        );

        if (distance <= 200) {
          // Reproducir sonido
          this.sound.play("blow_sound", { volume: 0.3 });

          // Crear partículas de nieve dispersándose
          this.createNaturalSnowParticles(wall.worldX, wall.worldY - 30);

          // Fade out más lento de la montaña (dispersión)
          this.tweens.add({
            targets: wall.container,
            alpha: 0,
            duration: 1200,
            ease: "Cubic.easeOut",
            onComplete: () => {
              wall.container.destroy();
              wall.sprite.destroy();
            },
          });

          // Remover del array
          this.snowWalls.splice(i, 1);
        }
      }
    }
  }

  /**
   * Crear partículas de nieve dispersándose de la montaña
   */
  private createNaturalSnowParticles(x: number, y: number): void {
    // Partículas desde diferentes alturas de la montaña (simulando dispersión)
    const emissionPoints = [
      { x: x, y: y - 62, quantity: 14 }, // Pico
      { x: x - 8, y: y - 50, quantity: 12 }, // Superior izquierda
      { x: x + 8, y: y - 50, quantity: 12 }, // Superior derecha
      { x: x - 12, y: y - 35, quantity: 10 }, // Medio izquierda
      { x: x + 12, y: y - 35, quantity: 10 }, // Medio derecha
      { x: x - 18, y: y - 18, quantity: 8 }, // Inferior izquierda
      { x: x + 18, y: y - 18, quantity: 8 }, // Inferior derecha
      { x: x, y: y - 5, quantity: 10 }, // Base centro
      { x: x - 10, y: y, quantity: 8 }, // Base izquierda
      { x: x + 10, y: y, quantity: 8 }, // Base derecha
    ];

    emissionPoints.forEach((point, index) => {
      // Delay escalonado para simular que se dispersa de arriba hacia abajo
      this.time.delayedCall(index * 70, () => {
        const particles = this.add.particles(
          point.x,
          point.y,
          "snow_particle",
          {
            speed: { min: 40, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 2.5, end: 0.3 }, // Partículas MÁS GRANDES
            alpha: { start: 1, end: 0 },
            lifespan: 1600,
            quantity: point.quantity,
            gravityY: 120,
            rotate: { start: 0, end: 360 },
            emitting: false,
            tint: 0xffffff, // Asegurar que sean blancas
          }
        );

        particles.explode(point.quantity, point.x, point.y);

        this.time.delayedCall(1800, () => particles.destroy());
      });
    });
  }

  /**
   * Crear sistema de partículas de nieve cayendo en el nivel
   */
  protected createSnowParticleSystem(): void {
    // Solo crear el sistema si está habilitado (por defecto true)
    if (this.config.enableSnow === false) {
      return;
    }

    // Crear el sistema de partículas pasando el layer de superficies para colisiones
    this.snowParticleSystem = new SnowParticleSystem(this, this.surfaceLayer);
  }

  /**
   * Crear sistema de proyectiles (snowballs)
   */
  protected createProjectileSystem(): void {
    this.projectileSystem = new ProjectileSystem(this);
  }

  /**
   * Crear sistema de cajas con pinchos
   */
  protected createSpikeBoxSystem(): void {
    if (!this.surfaceLayer) {
      console.warn(
        "⚠️ No se puede crear sistema de cajas con pinchos: falta surfaceLayer"
      );
      return;
    }

    const config = this.config.spikeBoxConfig || {};

    this.spikeBoxSystem = new SpikeBoxSystem(this, {
      tilemap: this.tilemap,
      surfaceLayer: this.surfaceLayer,
      spikeBoxTileIds: config.spikeBoxTileIds || [], // Se buscarán tiles con smash=true si está vacío
      moveInterval: config.moveInterval,
      moveSpeed: config.moveSpeed,
      damage: config.damage,
      knockbackForce: config.knockbackForce,
    });

    // Crear las cajas
    this.spikeBoxSystem.createSpikeBoxes();

    // Configurar colisión con el jugador
    if (this.player) {
      this.spikeBoxSystem.setupPlayerCollision(this.player);
    }
  }

  /**
   * Crear sistema de plataformas temporales
   */
  protected createTemporaryPlatformSystem(): void {
    if (!this.tilemap || !this.player) {
      console.warn(
        "⚠️ No se puede crear sistema de plataformas temporales: falta tilemap o player"
      );
      return;
    }

    const config = this.config.temporaryPlatformConfig || {};

    // El GID es obligatorio, si no se proporciona mostrar warning
    if (!config.temporaryPlatformGID) {
      console.warn(
        "⚠️ No se puede crear sistema de plataformas temporales: falta temporaryPlatformGID en la configuración"
      );
      return;
    }

    this.temporaryPlatformSystem = new TemporaryPlatformSystem(
      this,
      this.tilemap,
      this.player,
      config as TemporaryPlatformConfig
    );
  }

  /**
   * Crear sistema de elevadores/plataformas móviles
   */
  protected createElevatorSystem(): void {
    if (!this.tilemap || !this.surfaceLayer || !this.player) {
      console.warn(
        "⚠️ No se puede crear sistema de elevadores: falta tilemap, surfaceLayer o player"
      );
      return;
    }

    const config = this.config.elevatorConfig;

    if (!config || !config.leftTileGID || !config.rightTileGID) {
      console.warn(
        "⚠️ No se puede crear sistema de elevadores: faltan leftTileGID y rightTileGID en elevatorConfig"
      );
      return;
    }

    this.elevatorSystem = new ElevatorSystem(this, {
      tilemap: this.tilemap,
      surfaceLayer: this.surfaceLayer,
      leftTileGID: config.leftTileGID,
      rightTileGID: config.rightTileGID,
      moveSpeed: config.moveSpeed,
    });

    this.elevatorSystem.createElevators();
    this.elevatorSystem.setupPlayerCollision(this.player);
  }

  /**
   * Crear sistema de trampolines/jump buttons
   */
  protected createJumpButtonSystem(): void {
    if (!this.tilemap || !this.player) {
      console.warn(
        "⚠️ No se puede crear sistema de jump buttons: falta tilemap o player"
      );
      return;
    }

    const config = this.config.jumpButtonConfig || {};

    this.jumpButtonSystem = new JumpButtonSystem({
      tilemap: this.tilemap,
      scene: this,
      player: this.player,
      unpressedGID: config.unpressedGID ?? 137,
      pressedGID: config.pressedGID ?? 119,
      superJumpVelocity: config.superJumpVelocity ?? -800,
      resetDelay: config.resetDelay ?? 500,
    });
  }

  /**
   * Crear sistema de botones rojos y cadenas
   */
  protected createRedButtonSystem(): void {
    if (!this.tilemap || !this.player) {
      console.warn(
        "⚠️ No se puede crear sistema de botones rojos: falta tilemap o player"
      );
      return;
    }

    const config = this.config.redButtonConfig || {};

    this.redButtonSystem = new RedButtonSystem({
      tilemap: this.tilemap,
      scene: this,
      player: this.player,
      unpressedGID: config.unpressedGID ?? 11, // ID 10 + 1
      pressedGID: config.pressedGID ?? 316, // ID 315 + 1
      chainGID: config.chainGID ?? 214, // ID 213 + 1
    });
  }

  /**
   * Crear sistema de enemigos acuáticos
   */
  protected createAquaticEnemySystem(): void {
    if (!this.player || !this.surfaceLayer) {
      console.warn(
        "⚠️ No se puede crear sistema de enemigos acuáticos: faltan player o surfaceLayer"
      );
      return;
    }

    const config = this.config.aquaticEnemyConfig;

    // Verificar que hay configuración (manual o GID)
    if (
      !config ||
      (!config.manualPositions && (!this.tilemap || !config.aquaticEnemyGID))
    ) {
      console.warn(
        "⚠️ No se puede crear sistema de enemigos acuáticos: falta configuración (manualPositions o aquaticEnemyGID)"
      );
      return;
    }

    this.aquaticEnemyManager = new AquaticEnemyManager(this, {
      player: this.player,
      surfaceLayer: this.surfaceLayer,
      tilemap: this.tilemap,
      aquaticEnemyGID: config.aquaticEnemyGID,
      manualPositions: config.manualPositions,
      damage: config.damage,
      speed: config.speed,
    });

    this.aquaticEnemyManager.create();
  }

  /**
   * Crear sistema de enemigos automático
   */
  protected createEnemySystem(): void {
    if (!this.player || !this.surfaceLayer) {
      console.warn(
        "⚠️ No se puede crear sistema de enemigos: faltan player o surfaceLayer"
      );
      return;
    }

    this.enemySystem = new EnemySystem(
      this,
      this.player,
      this.surfaceLayer,
      this.config.enemyConfig
    );

    this.enemySystem.initialize(this.config.playerStartPosition);

    // Configurar colisiones con proyectiles si existe el sistema
    if (this.projectileSystem) {
      this.enemySystem.setupProjectileCollisions(
        this.projectileSystem.getProjectileGroup()
      );
    }
  }

  /**
   * Configurar detección de final de nivel
   * Usa la misma estrategia que createSpikesGroup - crear objetos inmediatamente
   */
  protected setupLevelEndDetection(): void {
    if (!this.objectsLayer || !this.player) {
      return;
    }

    // Buscar tile con propiedad end=true INMEDIATAMENTE (como los spikes)
    this.objectsLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (
        tile &&
        tile.index !== -1 &&
        tile.properties &&
        tile.properties.end === true
      ) {
        // Crear zona de trigger centrada en el tile
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Crear sprite invisible para física (como los spikes)
        const endZone = this.add.rectangle(worldX, worldY, 64, 64);
        endZone.setVisible(false);

        // Agregar física
        this.physics.add.existing(endZone);
        const body = endZone.body as Phaser.Physics.Arcade.Body;
        body.setSize(64, 64);
        body.setAllowGravity(false);
        body.setImmovable(true);

        // Detectar overlap con el player (como los spikes con el player)
        this.physics.add.overlap(
          this.player,
          endZone,
          () => {
            this.onLevelEnd();
          },
          undefined,
          this
        );
      }
    });
  }

  /**
   * Llamado cuando el jugador llega al final del nivel
   */
  private onLevelEnd(): void {
    if (this.hasFinishedLevel) return;

    this.hasFinishedLevel = true;

    // Detener cronómetro del nivel
    this.levelEndTime = this.time.now;

    // Detener al player completamente
    if (this.player && this.player.body) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      body.setAllowGravity(false);

      // Poner animación de standing (quieto)
      if (typeof (this.player as any).playAnimation === "function") {
        (this.player as any).playAnimation("penguin_standing");
      }

      // Desactivar controles del jugador
      if (typeof (this.player as any).setControlsActive === "function") {
        (this.player as any).setControlsActive(false);
      }
    }

    // Reproducir sonido de finalización
    this.sound.play("finish_level_sound", { volume: 0.5 });

    // Pausar música del nivel
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }

    // Calcular score del nivel
    const levelScore = this.calculateLevelScore();

    // Mostrar UI de fin de nivel con un pequeño delay para ver la animación completa
    this.time.delayedCall(300, () => {
      import("../objects/ui/LevelEndUI").then(({ LevelEndUI }) => {
        this.levelEndUI = new LevelEndUI(this, levelScore);
        this.levelEndUI.show();
      });
    });
  }

  /**
   * Calcula el score del nivel actual basado en las estadísticas
   * Las escenas hijas pueden override este método para lógica personalizada
   */
  protected calculateLevelScore(): any {
    const timeInSeconds = (this.levelEndTime - this.levelStartTime) / 1000;

    // Por defecto retornamos null (las escenas hijas deben implementar su cálculo)
    // Este método será override por Level1-5 (con monedas/mini-pingus) y Level6 (boss)
    console.warn("⚠️ calculateLevelScore() no implementado en esta escena");
    return {
      timeInSeconds,
      livesMissed: this.livesMissedDuringLevel,
    };
  }

  /**
   * Cleanup cuando se destruye la escena
   */
  shutdown(): void {
    console.log("🔄 Limpiando escena completamente...");

    // Detener toda la música
    this.stopCurrentMusic();

    // CRÍTICO: Cancelar todos los timers pendientes
    this.time.removeAllEvents();

    // CRÍTICO: Cancelar todos los tweens activos
    this.tweens.killAll();

    // Remover todos los event listeners personalizados
    this.events.removeAllListeners();

    // Destruir el player completamente
    if (this.player) {
      this.player.destroy();
      this.player = undefined as any;
    }

    // Limpiar TODOS los colliders de física de forma agresiva
    if (this.physics && this.physics.world) {
      // Destruir todos los colliders activos
      this.physics.world.colliders.destroy();
      // Resetear el mundo de física
      this.physics.world.bodies.clear();
      this.physics.world.staticBodies.clear();
    }

    // Destruir sistema de partículas de nieve
    if (this.snowParticleSystem) {
      this.snowParticleSystem.destroy();
      this.snowParticleSystem = undefined;
    }

    // Destruir sistema de cajas con pinchos
    if (this.spikeBoxSystem) {
      this.spikeBoxSystem.destroy();
      this.spikeBoxSystem = undefined;
    }

    // Destruir sistema de plataformas temporales
    if (this.temporaryPlatformSystem) {
      this.temporaryPlatformSystem.destroy();
      this.temporaryPlatformSystem = undefined;
    }

    // Destruir sistema de elevadores
    if (this.elevatorSystem) {
      this.elevatorSystem.destroy();
      this.elevatorSystem = undefined;
    }

    // Destruir sistema de trampolines/jump buttons
    if (this.jumpButtonSystem) {
      this.jumpButtonSystem.destroy();
      this.jumpButtonSystem = undefined;
    }

    // Destruir sistema de botones rojos y cadenas
    if (this.redButtonSystem) {
      this.redButtonSystem.destroy();
      this.redButtonSystem = undefined;
    }

    // Destruir sistema de enemigos acuáticos
    if (this.aquaticEnemyManager) {
      this.aquaticEnemyManager.destroy();
      this.aquaticEnemyManager = undefined;
    }

    // Destruir sistema de enemigos
    if (this.enemySystem) {
      this.enemySystem.destroy();
      this.enemySystem = undefined;
    }

    // Destruir sistema de proyectiles
    if (this.projectileSystem) {
      this.projectileSystem.destroy();
      this.projectileSystem = undefined;
    }

    // Destruir sistema de vidas
    if (this.lifeSystem) {
      this.lifeSystem.destroy();
      this.lifeSystem = undefined as any;
    }

    // Limpiar referencias del tilemap
    this.tilemap = undefined as any;
    this.surfaceLayer = undefined as any;
    this.backgroundLayer = undefined as any;
    this.objectsLayer = undefined as any;

    // Resetear bandera de game over
    this.isGameOverInProgress = false;

    console.log("✅ Escena limpiada completamente");
  }
}
