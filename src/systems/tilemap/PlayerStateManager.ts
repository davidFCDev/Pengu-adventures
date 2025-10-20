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

    // Detectar input de teclado o joystick móvil (arriba o abajo)
    const keyboardUp = this.cursors.up.isDown || this.wasdKeys.W.isDown;
    const keyboardDown = this.cursors.down.isDown || this.wasdKeys.S.isDown;
    const mobileControls = (this.player as any).mobileControls;
    const joystickUp =
      mobileControls && mobileControls.joystickDirection.y < -0.5;
    const joystickDown =
      mobileControls && mobileControls.joystickDirection.y > 0.5;
    const isPressingUpOrDown =
      keyboardUp || joystickUp || keyboardDown || joystickDown;

    // ACTIVAR climbing: Si está en escalera Y presiona UP o DOWN intencionalmente
    if (isOnLadder && isPressingUpOrDown && !this.player.getIsClimbing()) {
      this.player.setClimbing(true);
    }
    // DESACTIVAR climbing:
    // 1. Si ya NO está en la escalera
    // 2. Si está bajando (DOWN presionado) Y hay suelo sólido debajo
    else if (this.player.getIsClimbing()) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const isPressingDown = keyboardDown || joystickDown;

      // Detectar si hay un tile sólido debajo del jugador
      const tileX = Math.floor(
        this.player.x / this.tileManager.getTilemap().tileWidth
      );
      const tileY = Math.floor(
        this.player.y / this.tileManager.getTilemap().tileHeight
      );

      // Verificar tile justo debajo (en los pies del jugador)
      const tileBelow = this.tileManager
        .getTilemap()
        .getTileAt(tileX, tileY + 1, false, this.layerName);
      const hasSolidTileBelow = this.tileManager.hasTileProperty(
        tileBelow,
        "collision"
      );

      // Salir de climbing si:
      // - Ya no está en tile de escalera, O
      // - Está bajando Y hay un tile sólido debajo
      if (!isOnLadder || (isPressingDown && hasSolidTileBelow)) {
        this.player.setClimbing(false);
      }
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
