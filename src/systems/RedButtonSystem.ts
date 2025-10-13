/**
 * 🔴 Red Button System
 * Sistema reutilizable para crear botones rojos que desbloquean cadenas permanentemente
 * Cuando el jugador salta sobre un botón rojo, todas las cadenas del nivel se desbloquean
 */

export interface RedButtonConfig {
  tilemap: Phaser.Tilemaps.Tilemap;
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
  unpressedGID?: number; // GID del botón sin presionar (default: 11)
  pressedGID?: number; // GID del botón presionado (default: 316)
  chainGID?: number; // GID de las cadenas (default: 214)
  tilesetName?: string; // Nombre del tileset (default: "spritesheet-tiles-default")
  spritesheetKey?: string; // Clave del spritesheet con frames (default: "spritesheet-tiles-frames")
  depth?: number; // Profundidad visual (default: 10)
  soundKey?: string; // Sonido al activar (default: "unlock_sound")
  soundVolume?: number; // Volumen del sonido (default: 1.0)
}

export class RedButtonSystem {
  private config: Required<RedButtonConfig>;
  private buttonSprites: Phaser.GameObjects.Sprite[] = [];
  private chainSprites: Phaser.GameObjects.Sprite[] = [];
  private isUnlocked: boolean = false; // Estado global de desbloqueo

  constructor(config: RedButtonConfig) {
    // Configuración por defecto
    this.config = {
      tilemap: config.tilemap,
      scene: config.scene,
      player: config.player,
      unpressedGID: config.unpressedGID ?? 11, // ID 10 + 1
      pressedGID: config.pressedGID ?? 316, // ID 315 + 1
      chainGID: config.chainGID ?? 214, // ID 213 + 1
      tilesetName: config.tilesetName ?? "spritesheet-tiles-default",
      spritesheetKey: config.spritesheetKey ?? "spritesheet-tiles-frames",
      depth: config.depth ?? 10,
      soundKey: config.soundKey ?? "unlock_sound",
      soundVolume: config.soundVolume ?? 1.0,
    };

    this.createRedButtons();
    this.createChains();
  }

  /**
   * Buscar y crear todos los botones rojos del tilemap
   */
  private createRedButtons(): void {
    const objectLayers = this.config.tilemap.objects;
    const buttonObjects: any[] = [];

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && obj.gid === this.config.unpressedGID) {
          buttonObjects.push(obj);
        }
      });
    });

    if (buttonObjects.length === 0) {
      return;
    }

    // Obtener el tileset
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) {
      console.warn(
        `[RedButtonSystem] Tileset ${this.config.tilesetName} no encontrado`
      );
      return;
    }

    // Crear sprite para cada botón rojo
    buttonObjects.forEach((obj) => {
      this.createRedButton(obj, tileset);
    });
  }

  /**
   * Buscar y crear todas las cadenas del tilemap
   */
  private createChains(): void {
    const objectLayers = this.config.tilemap.objects;
    const chainObjects: any[] = [];

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && obj.gid === this.config.chainGID) {
          chainObjects.push(obj);
        }
      });
    });

    if (chainObjects.length === 0) {
      return;
    }

    // Obtener el tileset
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) {
      console.warn(
        `[RedButtonSystem] Tileset ${this.config.tilesetName} no encontrado`
      );
      return;
    }

    // Crear sprite para cada cadena
    chainObjects.forEach((obj) => {
      this.createChain(obj, tileset);
    });
  }

  /**
   * Crear un botón rojo individual
   */
  private createRedButton(obj: any, tileset: Phaser.Tilemaps.Tileset): void {
    // Calcular ID local del tile (GID - firstgid)
    const localId = obj.gid - tileset.firstgid;

    // Crear sprite usando el spritesheet con frames
    const buttonSprite = this.config.scene.add.sprite(
      obj.x + 32, // Centrar en X (mitad del objeto 64x64)
      obj.y - 32, // Centrar en Y (mitad del objeto 64x64)
      this.config.spritesheetKey,
      localId
    );
    buttonSprite.setOrigin(0.5, 0.5);
    buttonSprite.setDepth(this.config.depth);

    // Añadir física
    this.config.scene.physics.add.existing(buttonSprite);
    const buttonBody = buttonSprite.body as Phaser.Physics.Arcade.Body;
    buttonBody.setAllowGravity(false);
    buttonBody.setImmovable(true);
    buttonBody.setSize(buttonSprite.width, buttonSprite.height);

    // Variable para evitar múltiples activaciones
    let isPressed = false;

    // Añadir colisión sólida con el jugador (para que no lo atraviese)
    this.config.scene.physics.add.collider(
      this.config.player,
      buttonSprite,
      () => {
        const playerBody = this.config.player
          .body as Phaser.Physics.Arcade.Body;

        // Solo activar si el jugador está cayendo Y no está presionado
        if (playerBody.velocity.y > 0 && !isPressed) {
          // Marcar como presionado permanentemente
          isPressed = true;

          // Cambiar sprite al estado "pressed"
          const pressedLocalId = this.config.pressedGID - tileset.firstgid;
          buttonSprite.setFrame(pressedLocalId);

          // Desbloquear todas las cadenas
          this.unlockAllChains();

          // Reproducir sonido de desbloqueo
          if (this.config.scene.sound.get(this.config.soundKey)) {
            this.config.scene.sound.play(this.config.soundKey, {
              volume: this.config.soundVolume,
            });
          }
        }
      },
      undefined,
      this.config.scene
    );

    // Guardar referencia
    this.buttonSprites.push(buttonSprite);
  }

  /**
   * Crear una cadena individual
   */
  private createChain(obj: any, tileset: Phaser.Tilemaps.Tileset): void {
    // Calcular ID local del tile (GID - firstgid)
    const localId = obj.gid - tileset.firstgid;

    // Crear sprite usando el spritesheet con frames
    const chainSprite = this.config.scene.add.sprite(
      obj.x + 32, // Centrar en X
      obj.y - 32, // Centrar en Y
      this.config.spritesheetKey,
      localId
    );
    chainSprite.setOrigin(0.5, 0.5);
    chainSprite.setDepth(this.config.depth);

    // Añadir física
    this.config.scene.physics.add.existing(chainSprite);
    const chainBody = chainSprite.body as Phaser.Physics.Arcade.Body;
    chainBody.setAllowGravity(false);
    chainBody.setImmovable(true);
    chainBody.setSize(chainSprite.width, chainSprite.height);

    // Configurar colisión con el jugador (inicialmente bloqueando)
    this.config.scene.physics.add.collider(this.config.player, chainSprite);

    // Guardar referencia
    this.chainSprites.push(chainSprite);
  }

  /**
   * Desbloquear todas las cadenas (hacerlas desaparecer con animación)
   */
  private unlockAllChains(): void {
    if (this.isUnlocked) {
      return; // Ya están desbloqueadas
    }

    this.isUnlocked = true;

    this.chainSprites.forEach((chainSprite) => {
      // Desactivar física
      const chainBody = chainSprite.body as Phaser.Physics.Arcade.Body;
      chainBody.enable = false;

      // Animación de desaparición
      this.config.scene.tweens.add({
        targets: chainSprite,
        alpha: 0,
        duration: 300,
        ease: "Power2",
        onComplete: () => {
          chainSprite.destroy();
        },
      });
    });
  }

  /**
   * Destruir el sistema y limpiar recursos
   */
  destroy(): void {
    this.buttonSprites.forEach((sprite) => {
      if (sprite && sprite.active) {
        sprite.destroy();
      }
    });
    this.chainSprites.forEach((sprite) => {
      if (sprite && sprite.active) {
        sprite.destroy();
      }
    });
    this.buttonSprites = [];
    this.chainSprites = [];
  }
}
