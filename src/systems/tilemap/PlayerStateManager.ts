import { Player } from "../../objects/player/Player";
import { TileMapManager } from "./TileMapManager";

/**
 * PlayerStateManager - Gestiona automáticamente los estados del player
 * basándose en las propiedades de los tiles
 */
export class PlayerStateManager {
  private player: Player;
  private tileManager: TileMapManager;
  private layerName: string;

  constructor(player: Player, tileManager: TileMapManager, layerName: string) {
    this.player = player;
    this.tileManager = tileManager;
    this.layerName = layerName;
  }

  /**
   * Actualiza automáticamente el estado del player basándose en los tiles
   * Llama este método en el update() de tu escena
   */
  update(): void {
    // Verificar si está en agua
    const isInWater = this.tileManager.isPlayerOnTileWithProperty(
      this.player,
      "swim",
      this.layerName
    );

    if (isInWater && !this.player.getIsSwimming()) {
      console.log("🌊 Player entró al agua - modo Flappy Bird activado");
      this.player.setSwimming(true);
    } else if (!isInWater && this.player.getIsSwimming()) {
      console.log("🏃 Player salió del agua - modo normal activado");
      this.player.setSwimming(false);
    }

    // Verificar si está en escaleras
    const isOnLadder = this.tileManager.isPlayerOnTileWithProperty(
      this.player,
      "climb",
      this.layerName
    );

    if (isOnLadder && !this.player.getIsClimbing()) {
      console.log("🪜 Player en escalera - modo trepar activado");
      this.player.setClimbing(true);
    } else if (!isOnLadder && this.player.getIsClimbing()) {
      console.log("🚶 Player salió de escalera - modo normal activado");
      this.player.setClimbing(false);
    }
  }

  /**
   * Obtiene información del estado actual para debug
   */
  getDebugInfo(): {
    position: { x: number; y: number };
    states: { swimming: boolean; climbing: boolean; onGround: boolean };
    currentTile: { x: number; y: number; properties: any };
  } {
    const tileX = Math.floor(
      this.player.x / this.tileManager.getTilemap().tileWidth
    );
    const tileY = Math.floor(
      this.player.y / this.tileManager.getTilemap().tileHeight
    );
    const tile = this.tileManager
      .getTilemap()
      .getTileAt(tileX, tileY, false, this.layerName);

    return {
      position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      states: {
        swimming: this.player.getIsSwimming(),
        climbing: this.player.getIsClimbing(),
        onGround: this.player.getIsOnGround(),
      },
      currentTile: {
        x: tileX,
        y: tileY,
        properties: this.tileManager.getTileProperties(tile),
      },
    };
  }
}
