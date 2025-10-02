import { EnemySystem } from "../objects/enemies/EnemyManager";
import { PenguinSprites } from "../objects/player/PenguinSprites";
import { Player } from "../objects/player/Player";
import { LifeSystem } from "../systems/LifeSystem";
import { ProjectileSystem } from "../systems/ProjectileSystem";
import { SnowParticleSystem } from "../systems/SnowParticleSystem";
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
  };
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
  protected ghostToggleButton!: Phaser.GameObjects.Graphics;
  protected isGameOverInProgress: boolean = false;
  protected currentMusic?: Phaser.Sound.BaseSound;
  protected snowWalls: Array<{
    container: Phaser.GameObjects.Container;
    sprite: Phaser.Physics.Arcade.Sprite;
    worldX: number;
    worldY: number;
  }> = []; // Array para muros de nieve
  protected levelEndUI?: any; // UI de fin de nivel
  protected hasFinishedLevel: boolean = false;
  protected snowParticleSystem?: SnowParticleSystem; // Sistema de partículas de nieve
  protected enemySystem?: EnemySystem; // Sistema de enemigos
  protected projectileSystem?: ProjectileSystem; // Sistema de proyectiles
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
    // 1. Crear el mapa específico (implementado por la escena hija)
    this.createMap();

    // 2. Crear las animaciones del pingüino
    PenguinSprites.createAnimations(this);

    // 3. Crear el player
    this.createPlayer();

    // 4. Crear sistema de vidas
    this.createLifeSystem();

    // 5. Crear botón de prueba fantasma
    this.createGhostToggleButton();

    // 6. Configurar sistema de tilemap automático
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

    // 14. Crear sistema de enemigos (si está habilitado)
    if (this.config.enableEnemies) {
      this.createEnemySystem();
    }

    // 15. Configurar detección de final de nivel
    this.setupLevelEndDetection();

    // 16. Escuchar evento de soplido para destruir muros de nieve
    this.events.on("playerBlowing", () => {
      this.checkSnowWallDestruction();
    });
  }

  /**
   * Update principal que maneja toda la lógica del juego
   */
  update(): void {
    if (this.player && this.playerStateManager) {
      this.player.update();
      this.playerStateManager.update(); // Centraliza TODA la lógica de states
    }

    // Actualizar sistema de enemigos
    if (this.enemySystem) {
      this.enemySystem.update(this.time.now, this.game.loop.delta);
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

    // DEBUG: Mostrar información del tile
    console.log(
      `🔍 DEBUG: Verificando tile ${tile.index} - texto: "${textToCheck}"`
    );
    const isSpike = spikePatterns.some((pattern) => pattern.test(textToCheck));

    if (isSpike) {
      console.log(
        `🔥 AUTO-CONFIGURACIÓN: Tile ${tile.index} detectado como spike (${textToCheck})`
      );

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
   */
  private createSpikesGroup(): void {
    // Crear grupo estático para los spikes
    this.spikesGroup = this.physics.add.staticGroup();

    console.log("🔍 DEBUG: Iniciando createSpikesGroup...");
    console.log(`🔍 DEBUG: objectsLayer existe: ${!!this.objectsLayer}`);
    console.log(`🔍 DEBUG: objectsLayer nombre: ${this.objectsLayer?.name}`);
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
            console.log(
              `🔥 SPIKE ENCONTRADO: Tile ${tile.index} en posición (${tile.x}, ${tile.y})`
            );
          }

          if (hasKill) {
            // Detectar orientación automáticamente basada en las transformaciones de Tiled
            const isFlippedVertically = tile.rotation === Math.PI; // 180° rotation = volteado
            const isRotated90 = tile.rotation === Math.PI / 2; // 90° rotation
            const isRotated270 = tile.rotation === (3 * Math.PI) / 2; // 270° rotation

            // También podemos usar las propiedades directas de Tiled si están disponibles
            const position =
              this.getTilePropertyValue(tile, "position") || "auto";

            // Configurar posición y tamaño según la orientación
            let spikeX, spikeY, spikeWidth, spikeHeight;
            let detectedPosition = "bottom"; // Por defecto

            // Auto-detectar si no se especifica posición manualmente
            if (position === "auto") {
              if (isFlippedVertically) {
                detectedPosition = "top";
              } else if (isRotated90) {
                detectedPosition = "right";
              } else if (isRotated270) {
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
                spikeY = tile.getCenterY() - 16; // Mover hacia arriba 16px
                spikeWidth = tile.width;
                spikeHeight = 32;
                break;

              case "left":
                // Spike apuntando hacia la derecha (parte izquierda del tile)
                spikeX = tile.getCenterX() - 16; // Mover hacia la izquierda 16px
                spikeY = tile.getCenterY();
                spikeWidth = 32;
                spikeHeight = tile.height;
                break;

              case "right":
                // Spike apuntando hacia la izquierda (parte derecha del tile)
                spikeX = tile.getCenterX() + 16; // Mover hacia la derecha 16px
                spikeY = tile.getCenterY();
                spikeWidth = 32;
                spikeHeight = tile.height;
                break;

              case "bottom":
              default:
                // Spike apuntando hacia arriba (parte inferior del tile) - DEFAULT
                spikeX = tile.getCenterX();
                spikeY = tile.getCenterY() + 16; // Mover hacia abajo 16px
                spikeWidth = tile.width;
                spikeHeight = 32;
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

      console.log(
        `🔍 DEBUG: Tiles verificados: ${tilesChecked}, Spikes encontrados: ${spikesFound}`
      );
      console.log(
        `🔍 DEBUG: Spikes en grupo: ${this.spikesGroup.children.size}`
      );
    } else {
      console.warn("⚠️ DEBUG: objectsLayer no existe!");
    }

    // 🔍 DEBUG ADICIONAL: Revisar TODOS los layers para encontrar los spikes
    console.log("🔍 DEBUG: Revisando TODOS los layers...");
    if (this.tilemap) {
      this.tilemap.layers.forEach((layerData, index) => {
        console.log(
          `🔍 Layer ${index}: ${layerData.name} (${
            layerData.tilemapLayer ? "activo" : "inactivo"
          })`
        );

        if (layerData.tilemapLayer) {
          let layerTiles = 0;
          layerData.tilemapLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
            if (tile) {
              layerTiles++;
              // Solo verificar algunos tiles para no spam la consola
              if (layerTiles <= 5) {
                console.log(
                  `🔍 Tile ejemplo en ${layerData.name}: index=${tile.index}, pos=(${tile.x},${tile.y})`
                );
              }
            }
          });
          console.log(`🔍 Total tiles en ${layerData.name}: ${layerTiles}`);
        }
      });
    }
  }

  /**
   * Crear botón redondo para alternar modo fantasma
   */
  private createGhostToggleButton(): void {
    const buttonRadius = 30;
    const margin = 25;

    // Posicionar en la esquina inferior derecha
    const buttonX = this.cameras.main.width - buttonRadius - margin;
    const buttonY = this.cameras.main.height - buttonRadius - margin;

    // Crear botón usando Graphics (más confiable)
    this.ghostToggleButton = this.add.graphics();
    this.ghostToggleButton.x = buttonX;
    this.ghostToggleButton.y = buttonY;

    // Dibujar círculo inicial (modo normal)
    this.drawButton(false);

    // Hacer interactivo
    this.ghostToggleButton.setInteractive(
      new Phaser.Geom.Circle(0, 0, buttonRadius),
      Phaser.Geom.Circle.Contains
    );

    // Evento de click
    this.ghostToggleButton.on("pointerdown", () => {
      console.log("🖱️ Click en botón ghost toggle");
      this.toggleGhostMode();
    });

    // Efectos hover
    this.ghostToggleButton.on("pointerover", () => {
      this.ghostToggleButton.setScale(1.1);
    });

    this.ghostToggleButton.on("pointerout", () => {
      this.ghostToggleButton.setScale(1.0);
    });

    // Mantener fijo en pantalla
    this.ghostToggleButton.setScrollFactor(0);
    this.ghostToggleButton.setDepth(1000);
  }

  /**
   * Dibujar el botón según el estado
   */
  private drawButton(isGhost: boolean): void {
    this.ghostToggleButton.clear();

    const radius = 30;

    if (isGhost) {
      // Modo ghost: círculo verde con "G"
      this.ghostToggleButton.fillStyle(0x4caf50); // Verde
      this.ghostToggleButton.lineStyle(3, 0xffffff); // Borde blanco
      this.ghostToggleButton.fillCircle(0, 0, radius);
      this.ghostToggleButton.strokeCircle(0, 0, radius);
    } else {
      // Modo normal: círculo azul con "N"
      this.ghostToggleButton.fillStyle(0x2196f3); // Azul
      this.ghostToggleButton.lineStyle(3, 0xffffff); // Borde blanco
      this.ghostToggleButton.fillCircle(0, 0, radius);
      this.ghostToggleButton.strokeCircle(0, 0, radius);
    }
  }

  /**
   * Alternar modo fantasma del player
   */
  private toggleGhostMode(): void {
    const isCurrentlyGhost = this.player.getIsGhost();
    this.player.setGhostMode(!isCurrentlyGhost);

    // Actualizar colisiones de tiles cross
    this.updateCrossCollisions();

    // Redibujar botón con el nuevo estado
    this.drawButton(this.player.getIsGhost());

    console.log(
      `🔄 Botón actualizado: ${
        this.player.getIsGhost() ? "GHOST (verde)" : "NORMAL (azul)"
      }`
    );
  }

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
    this.lifeSystem = new LifeSystem(this, 0, 0);

    // Configurar callback para cuando el player recibe daño
    this.player.setOnHitCallback(() => {
      // Evitar múltiples activaciones si ya está en proceso de game over
      if (this.isGameOverInProgress || this.lifeSystem.isGameOver()) {
        console.log(
          "⚠️ Ya en Game Over o proceso en curso, ignorando daño adicional"
        );
        return;
      }

      console.log(
        `💔 Jugador recibe daño. Vidas antes: ${this.lifeSystem.getCurrentLives()}`
      );

      const hasLivesLeft = this.lifeSystem.loseLife();

      console.log(
        `💔 Vidas después: ${this.lifeSystem.getCurrentLives()}, ¿Vidas restantes? ${hasLivesLeft}`
      );

      // Verificar tanto el retorno como el estado interno
      if (!hasLivesLeft || this.lifeSystem.isGameOver()) {
        console.log("💀 GAME OVER - Iniciando reinicio de nivel");

        // Marcar que el game over está en proceso
        this.isGameOverInProgress = true;

        // Pequeño delay para que se vea la última animación de pérdida de vida
        this.time.delayedCall(1000, () => {
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
    console.log("💥 DEBUG: handleSpikeCollision ejecutado!");
    console.log(
      `💥 DEBUG: Player invulnerable: ${this.player.getIsInvulnerable()}`
    );

    // Solo hacer daño si el player no es invulnerable
    if (!this.player.getIsInvulnerable()) {
      console.log("💔 DEBUG: Ejecutando player.hit()");
      this.player.hit();
    } else {
      console.log("🛡️ DEBUG: Player invulnerable, no hace daño");
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
   * Reiniciar el nivel actual
   */
  private restartLevel(): void {
    console.log("🔄 Reiniciando nivel - Game Over");

    // 0. CRÍTICO: Cancelar todos los timers pendientes para evitar callbacks retrasados
    this.time.removeAllEvents();
    console.log("⏹️ Todos los timers cancelados");

    // 1. Resetear completamente el estado del jugador
    this.player.resetForRestart();

    // 2. Volver al jugador a modo normal
    if (this.player.getIsGhost()) {
      this.player.setGhostMode(false);
      console.log("🐧 Jugador vuelto a modo normal");
    }

    // 3. Reiniciar sistema de vidas (después de limpiar timers)
    this.lifeSystem.resetLivesImmediate();

    // 4. Encontrar y mover a posición de inicio real
    this.positionPlayerAtStart();

    // 5. Detener velocidades y resetear estado
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // 6. Resetear estados del jugador
    this.player.setSwimming(false);
    this.player.setClimbing(false);

    // 7. Efecto visual de respawn mejorado
    this.player.setAlpha(0);
    this.player.setScale(0.5);

    this.tweens.add({
      targets: this.player,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: "Back.easeOut",
      onComplete: () => {
        // Resetear bandera de game over
        this.isGameOverInProgress = false;
        console.log(
          "✅ Reinicio de nivel completado - Game Over flag reseteado"
        );
      },
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
      console.log("🎵 No hay música configurada para este nivel");
      return;
    }

    // Detener música anterior si existe
    this.stopCurrentMusic();

    // Verificar que el audio existe
    if (!this.sound.get(this.config.musicKey)) {
      console.log(`🎵 Iniciando música del nivel: ${this.config.musicKey}`);

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
    if (this.currentMusic && this.currentMusic.isPlaying) {
      console.log("🎵 Deteniendo música actual");
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = undefined;
    }
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
        console.log("🎵 Música pausada");
      } else {
        this.currentMusic.resume();
        console.log("🎵 Música reanudada");
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

        // Crear montaña de nieve ACUMULADA (bolas de nieve apiladas de forma irregular)
        const snowMountain = this.add.graphics();

        // CAPA BASE - Fila inferior (las más grandes)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-18, 18, 19); // Izquierda base
        snowMountain.fillCircle(0, 20, 21); // Centro base (la más grande)
        snowMountain.fillCircle(19, 19, 18); // Derecha base
        snowMountain.fillCircle(-8, 15, 16); // Extra izquierda
        snowMountain.fillCircle(10, 16, 17); // Extra derecha

        // Sombras debajo de las bolas base
        snowMountain.fillStyle(0xd0e0f0, 0.7);
        snowMountain.fillCircle(-18, 18, 15);
        snowMountain.fillCircle(0, 20, 17);
        snowMountain.fillCircle(19, 19, 14);

        // SEGUNDA CAPA - Encima de la base (irregular)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-14, -2, 17); // Izquierda
        snowMountain.fillCircle(3, 0, 18); // Centro
        snowMountain.fillCircle(16, -1, 15); // Derecha
        snowMountain.fillCircle(-5, -4, 14); // Extra centro-izq

        // Sombras segunda capa
        snowMountain.fillStyle(0xd8e8f5, 0.6);
        snowMountain.fillCircle(-14, -2, 13);
        snowMountain.fillCircle(3, 0, 14);

        // TERCERA CAPA - Medianas (más irregular)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-9, -18, 15); // Izquierda
        snowMountain.fillCircle(7, -20, 16); // Derecha
        snowMountain.fillCircle(-1, -17, 14); // Centro
        snowMountain.fillCircle(12, -15, 12); // Extra derecha

        // Sombras tercera capa
        snowMountain.fillStyle(0xe0edf7, 0.6);
        snowMountain.fillCircle(-9, -18, 11);
        snowMountain.fillCircle(7, -20, 12);

        // CUARTA CAPA - Superior (menos picuda)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-5, -34, 13); // Izquierda
        snowMountain.fillCircle(6, -36, 14); // Derecha
        snowMountain.fillCircle(0, -32, 12); // Centro
        snowMountain.fillCircle(-8, -30, 10); // Extra izquierda

        // Sombras cuarta capa
        snowMountain.fillStyle(0xe5f1f9, 0.6);
        snowMountain.fillCircle(-5, -34, 10);
        snowMountain.fillCircle(6, -36, 11);

        // PICO - Bolas redondeadas arriba (no tan puntiagudo)
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(-2, -50, 11); // Izquierda
        snowMountain.fillCircle(4, -52, 12); // Derecha
        snowMountain.fillCircle(0, -48, 10); // Centro bajo

        // Cima redondeada
        snowMountain.fillStyle(0xffffff, 1);
        snowMountain.fillCircle(1, -62, 10); // Bola superior

        // Highlight sutil (brillo de nieve)
        snowMountain.fillStyle(0xffffff, 0.7);
        snowMountain.fillCircle(-1, -64, 5);
        snowMountain.fillCircle(3, -60, 4);

        // CONTORNOS SUTILES para dar definición
        snowMountain.lineStyle(1.5, 0xc8dce8, 0.5);
        snowMountain.strokeCircle(-18, 18, 19);
        snowMountain.strokeCircle(0, 20, 21);
        snowMountain.strokeCircle(19, 19, 18);
        snowMountain.strokeCircle(3, 0, 18);
        snowMountain.strokeCircle(7, -20, 16);
        snowMountain.strokeCircle(6, -36, 14);
        snowMountain.strokeCircle(4, -52, 12);
        snowMountain.strokeCircle(1, -62, 10);

        wallContainer.add(snowMountain);

        // Crear física para colisión (invisible)
        // La montaña tiene aproximadamente 64x120 (ancho x alto)
        const physicsSprite = this.physics.add.sprite(
          centerX,
          centerY - 30,
          ""
        );
        physicsSprite.setVisible(false);
        (physicsSprite.body as Phaser.Physics.Arcade.Body).setSize(60, 120);
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
    // Crear el sistema de partículas pasando el layer de superficies para colisiones
    this.snowParticleSystem = new SnowParticleSystem(this, this.surfaceLayer);
  }

  /**
   * Crear sistema de proyectiles (snowballs)
   */
  protected createProjectileSystem(): void {
    this.projectileSystem = new ProjectileSystem(this);
    console.log("✅ Sistema de proyectiles inicializado");
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

    console.log("✅ Sistema de enemigos inicializado");
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

    // Detener al player
    if (this.player && this.player.body) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      body.setAllowGravity(false);
    }

    // Reproducir sonido de finalización
    this.sound.play("finish_level_sound", { volume: 0.5 });

    // Pausar música del nivel
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }

    // Mostrar UI de fin de nivel con un pequeño delay para ver la animación completa
    this.time.delayedCall(300, () => {
      import("../objects/ui/LevelEndUI").then(({ LevelEndUI }) => {
        this.levelEndUI = new LevelEndUI(this);
        this.levelEndUI.show();
      });
    });
  }

  /**
   * Cleanup cuando se destruye la escena
   */
  shutdown(): void {
    this.stopCurrentMusic();

    // Destruir sistema de partículas de nieve
    if (this.snowParticleSystem) {
      this.snowParticleSystem.destroy();
      this.snowParticleSystem = undefined;
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
  }
}
