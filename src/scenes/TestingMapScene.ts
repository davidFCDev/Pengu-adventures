import { Player } from "../objects/player/Player";
import { PlayerStateManager, setupTileMapSystem } from "../systems/tilemap";

// You can write more code here

/* START OF COMPILED CODE */

export class TestingMapScene extends Phaser.Scene {
  constructor() {
    super("TestingMapScene");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  /** @returns {void} */
  editorCreate() {
    // testingMap
    const testingMap = this.add.tilemap("TestingMap");
    testingMap.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );
    testingMap.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );

    // fondo_1
    const fondoLayer = testingMap.createLayer(
      "fondo",
      ["spritesheet-backgrounds-default"],
      0,
      0
    );

    // superficies_1
    const superficiesLayer = testingMap.createLayer(
      "superficies",
      ["spritesheet-tiles-default"],
      0,
      0
    );

    this.testingMap = testingMap;
    this.fondoLayer = fondoLayer!;
    this.superficiesLayer = superficiesLayer!;

    this.events.emit("scene-awake");
  }

  testingMap!: Phaser.Tilemaps.Tilemap;
  fondoLayer!: Phaser.Tilemaps.TilemapLayer;
  superficiesLayer!: Phaser.Tilemaps.TilemapLayer;
  player!: Player;
  playerStateManager!: PlayerStateManager; /* START-USER-CODE */

  // Write your code here

  create() {
    // Crear el mapa y layers primero
    this.editorCreate();

    // Crear el player
    this.createPlayer();

    // Configurar sistema de tilemap automático
    // Usar el tilemap que ya se creó en editorCreate()
    const { stateManager, layer } = setupTileMapSystem(
      this,
      this.player,
      "TestingMap",
      "superficies",
      this.testingMap // Pasar el tilemap existente
    );

    // Si no se encontró el layer, usar el que ya tenemos
    if (!layer && this.superficiesLayer) {
      console.log("🔧 Usando layer existente de superficies");
    } else if (layer) {
      this.superficiesLayer = layer;
    }

    this.playerStateManager = stateManager;

    // Configurar colisiones del player con el layer (que ya existe)
    if (this.superficiesLayer) {
      this.physics.add.collider(this.player, this.superficiesLayer);
    }

    // Configurar la cámara
    this.setupCamera();

    console.log(
      "🎮 TestingMapScene configurado con sistema automático de tilemap"
    );
  }

  setupCollisions() {
    if (!this.superficiesLayer) return;

    // Solo configurar colisiones para tiles que tengan la propiedad collision=true
    // Esto excluirá automáticamente las escaleras que tienen climb=true pero no collision=true
    this.testingMap.setCollisionByProperty(
      { collision: true },
      true,
      true,
      this.superficiesLayer
    );

    // Debug: verificar qué tiles tienen colisión activada
    console.log("Colisiones configuradas para tiles con collision=true");

    // Verificar si la configuración funcionó
    this.superficiesLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.collides && Math.random() < 0.01) {
        // Solo mostrar algunos para no saturar la consola
        console.log(
          `Tile ${tile.index} en (${tile.x}, ${tile.y}) tiene colisión activada`
        );
      }
    });
  }

  createPlayer() {
    // Crear el player en una posición inicial segura
    this.player = new Player(this, 400, 1200);

    // Debug: crear un sprite de debug para marcar la posición inicial
    const debugMarker = this.add.circle(400, 1200, 5, 0xff0000);
    debugMarker.setScrollFactor(1, 1);
  }

  setupCamera() {
    if (!this.player) return;

    // Configurar los límites del mundo de físicas
    const mapWidth = this.testingMap.widthInPixels;
    const mapHeight = this.testingMap.heightInPixels;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // Configurar la cámara para seguir al player
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    // Centrar en X, altura media para Y
    this.cameras.main.setFollowOffset(0, 100);

    // Configurar límites de la cámara al tamaño del mapa
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Zoom opcional para mejor vista
    this.cameras.main.setZoom(1.0);

    console.log("Límites del mundo:", mapWidth, "x", mapHeight);
  }

  update() {
    if (this.player && this.playerStateManager) {
      this.player.update();

      // El sistema automático se encarga de todo
      this.playerStateManager.update();

      // Debug ocasional
      if (Math.random() < 0.005) {
        const debugInfo = this.playerStateManager.getDebugInfo();
        console.log("🎮 Estado del player:", debugInfo);
      }
    }
  }

  checkSpecialTiles() {
    if (!this.player || !this.superficiesLayer) return;

    // Obtener la posición del player en tiles (centro del sprite)
    const tileX = Math.floor(this.player.x / this.testingMap.tileWidth);
    const tileY = Math.floor(this.player.y / this.testingMap.tileHeight);

    // También verificar tiles adyacentes para mejor detección
    const tiles = [
      this.testingMap.getTileAt(tileX, tileY, false, "superficies"),
      this.testingMap.getTileAt(tileX, tileY + 1, false, "superficies"), // Tile de abajo
      this.testingMap.getTileAt(tileX, tileY - 1, false, "superficies"), // Tile de arriba
    ];

    let isInWater = false;
    let isOnLadder = false;

    for (const tile of tiles) {
      if (tile) {
        // Debug: mostrar información del tile ocasionalmente
        if (Math.random() < 0.003) {
          console.log(
            `Player cerca de tile ID: ${tile.index} en posición (${tile.x}, ${tile.y}), propiedades:`,
            tile.properties
          );
        }

        // Detectar agua usando propiedades del tileset (método robusto)
        isInWater = this.checkTileProperty(tile, "swim");

        // Detectar escaleras usando propiedades del tileset (método robusto)
        isOnLadder = this.checkTileProperty(tile, "climb");
      }
    }

    // Debug temporal: mostrar todos los tiles detectados
    const mainTile = this.testingMap.getTileAt(
      tileX,
      tileY,
      false,
      "superficies"
    );
    if (mainTile && Math.random() < 0.05) {
      console.log(
        `🔍 Tile principal: ID ${mainTile.index}, pos(${tileX}, ${tileY}), props:`,
        mainTile.properties
      );
    }

    // Actualizar estados del player
    if (isInWater && !this.player.getIsSwimming()) {
      console.log("🌊 Player entró al agua - modo Flappy Bird activado");
      console.log(
        `Posición del player: (${Math.round(this.player.x)}, ${Math.round(
          this.player.y
        )})`
      );
      console.log(`Tile detectado en: (${tileX}, ${tileY})`);
      this.player.setSwimming(true);
    } else if (!isInWater && this.player.getIsSwimming()) {
      console.log("🏃 Player salió del agua - modo normal activado");
      this.player.setSwimming(false);
    }

    // Debug adicional: mostrar estado actual
    if (Math.random() < 0.005) {
      console.log(
        `Estado actual: isInWater=${isInWater}, isSwimming=${this.player.getIsSwimming()}`
      );
    }

    if (isOnLadder && !this.player.getIsClimbing()) {
      console.log("🪜 Player en escalera - modo trepar activado");
      this.player.setClimbing(true);
    } else if (!isOnLadder && this.player.getIsClimbing()) {
      console.log("🚶 Player salió de escalera - modo normal activado");
      this.player.setClimbing(false);
    }
  }

  /**
   * Método robusto para verificar propiedades de tiles que funciona con cualquier mapa
   * @param tile - El tile a verificar
   * @param property - La propiedad a buscar ('swim', 'climb', 'collision', etc.)
   * @returns true si el tile tiene la propiedad con valor true
   */
  checkTileProperty(tile: Phaser.Tilemaps.Tile, property: string): boolean {
    if (!tile) return false;

    // Método 1: Verificar propiedades directas del tile (funciona si Phaser las carga automáticamente)
    if (tile.properties && (tile.properties as any)[property] === true) {
      if (Math.random() < 0.01) {
        console.log(
          `✅ Propiedad '${property}' encontrada en tile ${tile.index} (método directo)`
        );
      }
      return true;
    }

    // Método 2: Cache de tiles conocidos que se construye la primera vez
    if (!this.tilePropertyCache) {
      this.buildTilePropertyCache();
    }

    if (this.tilePropertyCache) {
      const tileProps = this.tilePropertyCache.get(tile.index);
      if (tileProps && tileProps[property] === true) {
        if (Math.random() < 0.01) {
          console.log(
            `✅ Propiedad '${property}' encontrada en tile ${tile.index} (método cache)`
          );
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Cache de propiedades de tiles para mejor rendimiento
   */
  private tilePropertyCache?: Map<number, Record<string, boolean>>;

  /**
   * Construye un cache de propiedades leyendo directamente el JSON del tilemap
   */
  private buildTilePropertyCache(): void {
    this.tilePropertyCache = new Map();

    try {
      // Obtener los datos originales del tilemap
      const tilemapData = this.cache.tilemap.get("TestingMap");
      if (tilemapData && tilemapData.data && tilemapData.data.tilesets) {
        tilemapData.data.tilesets.forEach((tilesetData: any) => {
          if (tilesetData.tiles) {
            tilesetData.tiles.forEach((tileData: any) => {
              if (tileData.properties) {
                const tileIndex = tileData.id + tilesetData.firstgid;
                const properties: Record<string, boolean> = {};

                tileData.properties.forEach((prop: any) => {
                  if (prop.type === "bool") {
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

      console.log(
        `🏗️ Cache de propiedades construido: ${this.tilePropertyCache.size} tiles con propiedades especiales`
      );

      // Debug: mostrar algunos tiles encontrados
      let count = 0;
      this.tilePropertyCache.forEach((props, tileId) => {
        if (count < 5) {
          console.log(`   Tile ${tileId}:`, props);
          count++;
        }
      });
    } catch (error) {
      console.warn("Error construyendo cache de propiedades:", error);
      this.tilePropertyCache = new Map();
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
