/**
 * 🚀 Jump Button System (Trampolines)
 * Sistema reutilizable para crear trampolines que lanzan al jugador muy alto
 * Similar a ElevatorSystem y TemporaryPlatformSystem
 */

export interface JumpButtonConfig {
  tilemap: Phaser.Tilemaps.Tilemap;
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
  unpressedGID?: number; // GID del trampolín sin presionar (default: 137)
  pressedGID?: number; // GID del trampolín presionado (default: 119)
  superJumpVelocity?: number; // Velocidad del super salto (default: -800)
  resetDelay?: number; // Tiempo antes de resetear (default: 500ms)
  tilesetName?: string; // Nombre del tileset (default: "spritesheet-tiles-default")
  spritesheetKey?: string; // Clave del spritesheet con frames (default: "spritesheet-tiles-frames")
  depth?: number; // Profundidad visual (default: 10)
  soundKey?: string; // Sonido al activar (default: "jump_sound")
  soundVolume?: number; // Volumen del sonido (default: 1.0)
}

export class JumpButtonSystem {
  private config: Required<JumpButtonConfig>;
  private jumpButtonSprites: Phaser.GameObjects.Sprite[] = [];

  constructor(config: JumpButtonConfig) {
    // Configuración por defecto
    this.config = {
      tilemap: config.tilemap,
      scene: config.scene,
      player: config.player,
      unpressedGID: config.unpressedGID ?? 137, // ID 136 + 1
      pressedGID: config.pressedGID ?? 119, // ID 118 + 1
      superJumpVelocity: config.superJumpVelocity ?? -800,
      resetDelay: config.resetDelay ?? 500,
      tilesetName: config.tilesetName ?? "spritesheet-tiles-default",
      spritesheetKey: config.spritesheetKey ?? "spritesheet-tiles-frames",
      depth: config.depth ?? 10,
      soundKey: config.soundKey ?? "jump_sound",
      soundVolume: config.soundVolume ?? 1.0,
    };

    this.createJumpButtons();
  }

  /**
   * Buscar y crear todos los jump buttons del tilemap
   */
  private createJumpButtons(): void {
    // Buscar objetos en las capas de objetos (igual que ElevatorSystem)
    const objectLayers = this.config.tilemap.objects;
    const jumpButtonObjects: any[] = [];

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && obj.gid === this.config.unpressedGID) {
          jumpButtonObjects.push(obj);
        }
      });
    });

    console.log(
      `🚀 [JumpButtonSystem] Encontrados ${jumpButtonObjects.length} jump buttons`
    );

    if (jumpButtonObjects.length === 0) {
      return;
    }

    // Obtener el tileset
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) {
      console.warn(
        `[JumpButtonSystem] Tileset ${this.config.tilesetName} no encontrado`
      );
      return;
    }

    // Crear sprite para cada jump button
    jumpButtonObjects.forEach((obj) => {
      this.createJumpButton(obj, tileset);
    });
  }

  /**
   * Crear un jump button individual
   */
  private createJumpButton(obj: any, tileset: Phaser.Tilemaps.Tileset): void {
    // Calcular ID local del tile (GID - firstgid)
    const localId = obj.gid - tileset.firstgid;

    // Crear sprite usando el spritesheet con frames
    const jumpButtonSprite = this.config.scene.add.sprite(
      obj.x + 32, // Centrar en X (mitad del objeto 64x64)
      obj.y - 32, // Centrar en Y (mitad del objeto 64x64)
      this.config.spritesheetKey,
      localId
    );
    jumpButtonSprite.setOrigin(0.5, 0.5);
    jumpButtonSprite.setDepth(this.config.depth);

    // Añadir física
    this.config.scene.physics.add.existing(jumpButtonSprite);
    const buttonBody = jumpButtonSprite.body as Phaser.Physics.Arcade.Body;
    buttonBody.setAllowGravity(false);
    buttonBody.setImmovable(true);
    buttonBody.setSize(jumpButtonSprite.width, jumpButtonSprite.height);

    // Variable para controlar el cooldown del botón
    let canActivate = true;

    // Detectar overlap con el jugador
    this.config.scene.physics.add.overlap(
      this.config.player,
      jumpButtonSprite,
      () => {
        const playerBody = this.config.player
          .body as Phaser.Physics.Arcade.Body;

        // Solo activar si el jugador está cayendo Y el botón no está en cooldown
        if (playerBody.velocity.y > 0 && canActivate) {
          // Desactivar el botón temporalmente
          canActivate = false;

          // 🚀 SUPER SALTO
          playerBody.setVelocityY(this.config.superJumpVelocity);

          // Cambiar sprite al estado "pressed"
          const pressedLocalId = this.config.pressedGID - tileset.firstgid;
          jumpButtonSprite.setFrame(pressedLocalId);

          // Reproducir sonido de salto
          if (this.config.scene.sound.get(this.config.soundKey)) {
            this.config.scene.sound.play(this.config.soundKey, {
              volume: this.config.soundVolume,
            });
          }

          // Volver al estado normal después de un tiempo
          this.config.scene.time.delayedCall(this.config.resetDelay, () => {
            jumpButtonSprite.setFrame(localId);
            canActivate = true; // Reactivar el botón
          });
        }
      },
      undefined,
      this.config.scene
    );

    // Guardar referencia
    this.jumpButtonSprites.push(jumpButtonSprite);
  }

  /**
   * Destruir todos los jump buttons
   */
  destroy(): void {
    this.jumpButtonSprites.forEach((sprite) => {
      if (sprite && sprite.active) {
        sprite.destroy();
      }
    });
    this.jumpButtonSprites = [];
  }

  /**
   * Obtener todos los sprites de jump buttons
   */
  getJumpButtons(): Phaser.GameObjects.Sprite[] {
    return this.jumpButtonSprites;
  }
}
