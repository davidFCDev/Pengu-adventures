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
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: any;

  constructor(
    player: Player,
    tileManager: TileMapManager,
    layerName: string,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasdKeys: any
  ) {
    this.player = player;
    this.tileManager = tileManager;
    this.layerName = layerName;
    this.cursors = cursors;
    this.wasdKeys = wasdKeys;
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
      this.player.setSwimming(true);
    } else if (!isInWater && this.player.getIsSwimming()) {
      this.player.setSwimming(false);
    }

    // Verificar si está en escaleras
    const isOnLadder = this.tileManager.isPlayerOnTileWithProperty(
      this.player,
      "climb",
      this.layerName
    );

    // Solo activar climbing si está en escalera Y presiona hacia arriba
    // Detectar input de teclado o joystick móvil
    const keyboardUp = this.cursors.up.isDown || this.wasdKeys.W.isDown;
    const mobileControls = (this.player as any).mobileControls;
    const joystickUp =
      mobileControls && mobileControls.joystickDirection.y < -0.5;
    const isPressingUp = keyboardUp || joystickUp;

    // ACTIVAR climbing: Solo si está en escalera Y presiona UP intencionalmente
    if (isOnLadder && isPressingUp && !this.player.getIsClimbing()) {
      this.player.setClimbing(true);
    }
    // DESACTIVAR climbing: Si no está en escalera O deja de presionar UP
    else if (this.player.getIsClimbing() && (!isOnLadder || !isPressingUp)) {
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
