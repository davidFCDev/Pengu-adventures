/**
 * Sistema de gestión de tilemaps y estados de player
 *
 * Exporta todas las clases necesarias para manejar automáticamente
 * las propiedades de tiles y estados del player
 */

export { PlayerStateManager } from "./PlayerStateManager";
export { TileMapManager, type TileProperties } from "./TileMapManager";

import { PlayerStateManager } from "./PlayerStateManager";
import { TileMapManager } from "./TileMapManager";

/**
 * Función helper para setup rápido en cualquier escena
 */
export function setupTileMapSystem(
  scene: Phaser.Scene,
  player: any,
  tilemapKey: string,
  layerName: string,
  existingTilemap?: Phaser.Tilemaps.Tilemap
): {
  tileManager: TileMapManager;
  stateManager: PlayerStateManager;
  layer?: Phaser.Tilemaps.TilemapLayer;
} {
  // Crear el tile manager con tilemap existente si se proporciona
  const tileManager = new TileMapManager(scene, tilemapKey, existingTilemap);

  // Obtener el layer - primero buscar en capas existentes
  const tilemap = tileManager.getTilemap();
  let layer: Phaser.Tilemaps.TilemapLayer | undefined;

  // Buscar el layer en las capas ya creadas
  const existingLayer = scene.children.getAll().find((child) => {
    if (child.type === "TilemapLayer") {
      const tilemapLayer = child as Phaser.Tilemaps.TilemapLayer;
      return tilemapLayer.layer && tilemapLayer.layer.name === layerName;
    }
    return false;
  }) as Phaser.Tilemaps.TilemapLayer;

  if (existingLayer) {
    layer = existingLayer;
    console.log(`🎯 Encontrado layer existente '${layerName}'`);
  } else {
    // Si no existe, intentar obtenerlo del tilemap
    const layerData = tilemap.getLayer(layerName);
    if (layerData) {
      layer = layerData.tilemapLayer;
      console.log(`🎯 Obtenido layer '${layerName}' del tilemap`);
    }
  }

  if (!layer) {
    console.warn(
      `⚠️ Layer '${layerName}' no encontrado en el tilemap '${tilemapKey}'`
    );
    console.log(
      "🔍 Layers disponibles:",
      tilemap.layers.map((l) => l.name)
    );
    console.log(
      "🔍 Objetos en escena:",
      scene.children
        .getAll()
        .filter((c) => c.type === "TilemapLayer")
        .map((c) => (c as any).layer?.name)
    );
  } else {
    // Configurar colisiones automáticamente
    tileManager.setupCollisions(layer);
  }

  // Crear el state manager
  const stateManager = new PlayerStateManager(player, tileManager, layerName);

  console.log(
    `🚀 Sistema de tilemap configurado para '${tilemapKey}' con layer '${layerName}'`
  );

  return {
    tileManager,
    stateManager,
    layer,
  };
}
