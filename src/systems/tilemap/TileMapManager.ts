/**
 * TileMapManager - Sistema reutilizable para gestionar propiedade
 *
 * Uso:
 * 1. En cualquier escena: this.tileManager = new TileMapManager(this, 'MiMapa', 'layerName');
 * 2. Verificar propiedades: this.tileManager.hasTileProperty(tile, 'swim');
 * 3. Configurar colisiones: this.tileManager.setupCollisions(layer);
 */

export interface TileProperties {
  swim?: boolean;
  climb?: boolean;
  collision?: boolean;
  cross?: boolean;
  [key: string]: boolean | undefined;
}

export class TileMapManager {
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap;
  private tilePropertyCache: Map<number, TileProperties>;
  private tilemapKey: string;

  constructor(
    scene: Phaser.Scene,
    tilemapKey: string,
    existingTilemap?: Phaser.Tilemaps.Tilemap
  ) {
    this.scene = scene;
    this.tilemapKey = tilemapKey;
    this.tilePropertyCache = new Map();

    // Usar tilemap existente si se proporciona, si no intentar obtenerlo
    if (existingTilemap) {
      this.tilemap = existingTilemap;
    } else {
      // Intentar encontrar un tilemap existente en la escena primero
      let foundTilemap: Phaser.Tilemaps.Tilemap | null = null;

      // Buscar en las capas de tilemap existentes
      scene.children.getAll().forEach((child) => {
        if (child instanceof Phaser.Tilemaps.TilemapLayer) {
          const layer = child as Phaser.Tilemaps.TilemapLayer;
          if (layer.tilemap && (layer.tilemap as any).key === tilemapKey) {
            foundTilemap = layer.tilemap;
          }
        }
      });

      if (foundTilemap) {
        this.tilemap = foundTilemap;
      } else {
        this.tilemap = scene.add.tilemap(tilemapKey);
      }
    }

    // Construir el cache de propiedades automáticamente
    this.buildTilePropertyCache();
  }

  /**
   * Configura las colisiones automáticamente para un layer
   * @param layer - El layer donde configurar colisiones
   */
  setupCollisions(layer: Phaser.Tilemaps.TilemapLayer): void {
    if (!layer) {
      return;
    }

    // Configurar colisiones usando propiedades (funciona automáticamente)
    this.tilemap.setCollisionByProperty({ collision: true }, true, true, layer);
  }

  /**
   * Verifica si un tile tiene una propiedad específica
   * @param tile - El tile a verificar
   * @param property - La propiedad a buscar
   * @returns true si el tile tiene la propiedad con valor true
   */
  hasTileProperty(
    tile: Phaser.Tilemaps.Tile | null,
    property: keyof TileProperties
  ): boolean {
    if (!tile) return false;

    // Método 1: Verificar propiedades directas del tile
    if (tile.properties && (tile.properties as any)[property] === true) {
      return true;
    }

    // Método 2: Usar cache construido
    const tileProps = this.tilePropertyCache.get(tile.index);
    return tileProps?.[property] === true;
  }

  /**
   * Verifica si un player está en tiles con una propiedad específica
   * @param player - El objeto player
   * @param property - La propiedad a buscar ('swim', 'climb', etc.)
   * @param layerName - Nombre del layer a verificar
   * @returns true si está en un tile con esa propiedad
   */
  isPlayerOnTileWithProperty(
    player: { x: number; y: number },
    property: keyof TileProperties,
    layerName: string
  ): boolean {
    // Obtener posición en tiles
    const tileX = Math.floor(player.x / this.tilemap.tileWidth);
    const tileY = Math.floor(player.y / this.tilemap.tileHeight);

    // Verificar tile actual y adyacentes para mejor detección
    const tilesToCheck = [
      this.tilemap.getTileAt(tileX, tileY, false, layerName),
      this.tilemap.getTileAt(tileX, tileY + 1, false, layerName), // Abajo
      this.tilemap.getTileAt(tileX, tileY - 1, false, layerName), // Arriba
    ];

    return tilesToCheck.some((tile) => this.hasTileProperty(tile, property));
  }

  /**
   * Obtiene todas las propiedades de un tile
   * @param tile - El tile a verificar
   * @returns Objeto con todas las propiedades del tile
   */
  getTileProperties(tile: Phaser.Tilemaps.Tile | null): TileProperties {
    if (!tile) return {};

    return this.tilePropertyCache.get(tile.index) || {};
  }

  /**
   * Obtiene el tilemap asociado
   */
  getTilemap(): Phaser.Tilemaps.Tilemap {
    return this.tilemap;
  }

  /**
   * Obtiene estadísticas del cache de propiedades
   */
  getCacheStats(): { totalTiles: number; tilesWithProperties: number } {
    return {
      totalTiles: this.tilePropertyCache.size,
      tilesWithProperties: Array.from(this.tilePropertyCache.values()).filter(
        (props) => Object.keys(props).length > 0
      ).length,
    };
  }

  /**
   * Construye el cache de propiedades leyendo el JSON original del tilemap
   */
  private buildTilePropertyCache(): void {
    try {
      // Obtener datos originales del tilemap desde el cache de Phaser
      const tilemapData = this.scene.cache.tilemap.get(this.tilemapKey);

      if (tilemapData && tilemapData.data && tilemapData.data.tilesets) {
        tilemapData.data.tilesets.forEach((tilesetData: any) => {
          if (tilesetData.tiles) {
            tilesetData.tiles.forEach((tileData: any) => {
              if (tileData.properties && tileData.properties.length > 0) {
                const tileIndex = tileData.id + tilesetData.firstgid;
                const properties: TileProperties = {};

                // Convertir array de propiedades a objeto
                tileData.properties.forEach((prop: any) => {
                  if (prop.type === "bool") {
                    properties[prop.name] = prop.value;
                  }
                });

                this.tilePropertyCache.set(tileIndex, properties);
              }
            });
          }
        });
      }
    } catch (error) {
      this.tilePropertyCache = new Map();
    }
  }
}
