/**
 * Sistema para detectar superficies válidas en el tilemap
 * Útil para colocar enemigos, objetos, etc.
 */
export interface Surface {
  startX: number;
  endX: number;
  centerX: number;
  y: number;
  width: number;
  tilesCount: number;
}
export interface SurfaceDetectorOptions {
  minTilesWidth?: number; // Mínimo de tiles de ancho (default: 5)
  excludeAreas?: Array<{ x: number; y: number; radius: number }>; // Áreas a excluir
  tileSize?: number; // Tamaño del tile (default: 32)
}
export class SurfaceDetector {
  /**
   * Detecta todas las superficies horizontales válidas en un layer
   */
  static findValidSurfaces(
    layer: Phaser.Tilemaps.TilemapLayer,
    options: SurfaceDetectorOptions = {}
  ): Surface[] {
    const { minTilesWidth = 5, excludeAreas = [], tileSize = 32 } = options;
    const surfaces: Surface[] = [];

    // Recorrer el mapa buscando superficies horizontales
    for (let y = 0; y < layer.height; y++) {
      let surfaceStart = -1;
      for (let x = 0; x < layer.width; x++) {
        const tile = layer.getTileAt(x, y);

        // Solo superficies con colisión, NO agua (swim)
        const hasCollision =
          tile &&
          tile.properties &&
          tile.properties.collision === true &&
          tile.properties.swim !== true;

        if (hasCollision) {
          if (surfaceStart === -1) {
            surfaceStart = x;
          }
        } else {
          // Fin de superficie
          if (surfaceStart !== -1) {
            const surface = this.createSurface(
              surfaceStart,
              x,
              y,
              tileSize,
              minTilesWidth,
              excludeAreas
            );
            if (surface) {
              surfaces.push(surface);
            }
            surfaceStart = -1;
          }
        }
      }
      // Verificar superficie al final de la fila
      if (surfaceStart !== -1) {
        const surface = this.createSurface(
          surfaceStart,
          layer.width,
          y,
          tileSize,
          minTilesWidth,
          excludeAreas
        );
        if (surface) {
          surfaces.push(surface);
        }
      }
    }

    return surfaces;
  }

  /**
   * Crea un objeto Surface si cumple los requisitos
   */
  private static createSurface(
    startTile: number,
    endTile: number,
    yTile: number,
    tileSize: number,
    minTilesWidth: number,
    excludeAreas: Array<{ x: number; y: number; radius: number }>
  ): Surface | null {
    const surfaceWidth = endTile - startTile;
    if (surfaceWidth < minTilesWidth) {
      return null;
    }
    const startX = startTile * tileSize;
    const endX = endTile * tileSize;
    const centerX = (startX + endX) / 2;
    const surfaceY = yTile * tileSize;
    // Verificar si está en un área excluida
    for (const area of excludeAreas) {
      const distance = Math.sqrt(
        Math.pow(centerX - area.x, 2) + Math.pow(surfaceY - area.y, 2)
      );
      if (distance < area.radius) {
        return null;
      }
    }
    return {
      startX,
      endX,
      centerX,
      y: surfaceY,
      width: endX - startX,
      tilesCount: surfaceWidth,
    };
  }
  /**
   * Filtra superficies por ancho mínimo adicional
   */
  static filterByWidth(surfaces: Surface[], minWidth: number): Surface[] {
    return surfaces.filter((s) => s.width >= minWidth);
  }
  /**
   * Obtiene las N superficies más grandes
   */
  static getLargestSurfaces(surfaces: Surface[], count: number): Surface[] {
    return [...surfaces].sort((a, b) => b.width - a.width).slice(0, count);
  }
  /**
   * Distribuye posiciones uniformemente en una superficie
   */
  static distributePositions(
    surface: Surface,
    count: number,
    margin: number = 50
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    const availableWidth = surface.width - margin * 2;
    const spacing = availableWidth / (count + 1);
    for (let i = 1; i <= count; i++) {
      positions.push({
        x: surface.startX + margin + spacing * i,
        y: surface.y,
      });
    }
    return positions;
  }
}
