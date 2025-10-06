/**
 * Sistema de mini-pingüinos coleccionables
 *
 * Este sistema maneja:
 * - Creación de mini-pingüinos con animaciones
 * - Detección de colisiones con el jugador
 * - Contador de mini-pingüinos recolectados
 * - Efectos visuales de recolección
 */

export interface MiniPinguPosition {
  x: number;
  y: number;
}

export interface MiniPinguSystemConfig {
  /** Clave de textura del mini-pingüino */
  textureKey: string;
  /** Escala de los mini-pingüinos */
  scale?: number;
  /** Profundidad de renderizado */
  depth?: number;
  /** Clave del sonido de recolección (opcional) */
  collectSoundKey?: string;
  /** Volumen del sonido */
  soundVolume?: number;
  /** Duración de la animación de rebote en ms */
  bounceDuration?: number;
  /** Distancia de rebote en píxeles */
  bounceDistance?: number;
}

export class MiniPinguSystem {
  private scene: Phaser.Scene;
  private miniPingus: Phaser.Physics.Arcade.Group;
  private collectedMiniPingus: number = 0;
  private totalMiniPingus: number = 0;
  private config: Required<MiniPinguSystemConfig>;

  constructor(scene: Phaser.Scene, config: MiniPinguSystemConfig) {
    this.scene = scene;

    // Configuración por defecto
    this.config = {
      textureKey: config.textureKey,
      scale: config.scale ?? 1.0,
      depth: config.depth ?? 10,
      collectSoundKey: config.collectSoundKey ?? "",
      soundVolume: config.soundVolume ?? 0.3,
      bounceDuration: config.bounceDuration ?? 800,
      bounceDistance: config.bounceDistance ?? 10,
    };

    // Crear grupo de física para los mini-pingüinos
    this.miniPingus = this.scene.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
  }

  /**
   * Crear mini-pingüinos en las posiciones especificadas
   */
  createMiniPingus(positions: MiniPinguPosition[]): void {
    this.totalMiniPingus = positions.length;

    // Verificar que la textura existe
    if (!this.scene.textures.exists(this.config.textureKey)) {
      console.error(
        `❌ Textura "${this.config.textureKey}" no encontrada para MiniPinguSystem`
      );
      return;
    }

    positions.forEach((pos) => {
      const miniPingu = this.scene.add.sprite(
        pos.x,
        pos.y,
        this.config.textureKey
      );

      miniPingu.setScale(this.config.scale);
      miniPingu.setDepth(this.config.depth);

      // Añadir física
      this.scene.physics.add.existing(miniPingu);
      const body = miniPingu.body as Phaser.Physics.Arcade.Body;
      body.setSize(miniPingu.width * 0.8, miniPingu.height * 0.8);
      body.setAllowGravity(false);

      // Añadir al grupo
      this.miniPingus.add(miniPingu);

      // Animación de rebote (más enérgica que las monedas)
      this.scene.tweens.add({
        targets: miniPingu,
        y: pos.y - this.config.bounceDistance,
        duration: this.config.bounceDuration,
        yoyo: true,
        repeat: -1,
        ease: "Bounce.easeOut",
      });
    });
  }

  /**
   * Configurar colisión con el jugador
   */
  setupPlayerCollision(player: Phaser.Physics.Arcade.Sprite): void {
    this.scene.physics.add.overlap(
      player,
      this.miniPingus,
      (player: any, miniPingu: any) => {
        // Verificar que el sprite no haya sido destruido o esté en proceso de recolección
        if (miniPingu && miniPingu.active) {
          this.collectMiniPingu(miniPingu);
        }
      },
      undefined,
      this
    );
  }

  /**
   * Recolectar un mini-pingüino
   */
  private collectMiniPingu(
    miniPinguSprite: Phaser.Physics.Arcade.Sprite
  ): void {
    // Verificar que no se haya recolectado ya (evitar colisiones múltiples)
    if (!miniPinguSprite.active) {
      return;
    }

    // Desactivar inmediatamente para prevenir colisiones múltiples
    miniPinguSprite.setActive(false);
    this.miniPingus.remove(miniPinguSprite, false, false);

    // Incrementar contador
    this.collectedMiniPingus++;

    // Efecto de recolección (salto hacia arriba y fade out)
    this.scene.tweens.add({
      targets: miniPinguSprite,
      y: miniPinguSprite.y - 50,
      scale: this.config.scale * 1.5,
      alpha: 0,
      duration: 400,
      ease: "Back.easeOut",
      onComplete: () => {
        miniPinguSprite.destroy();
      },
    });

    // Reproducir sonido si está configurado
    if (this.config.collectSoundKey) {
      this.scene.sound.play(this.config.collectSoundKey, {
        volume: this.config.soundVolume,
      });
    }

    // Emitir evento para que la escena pueda reaccionar
    this.scene.events.emit("miniPinguCollected", {
      collected: this.collectedMiniPingus,
      total: this.totalMiniPingus,
    });
  }

  /**
   * Obtener el número de mini-pingüinos recolectados
   */
  getCollectedMiniPingus(): number {
    return this.collectedMiniPingus;
  }

  /**
   * Obtener el total de mini-pingüinos en el nivel
   */
  getTotalMiniPingus(): number {
    return this.totalMiniPingus;
  }

  /**
   * Resetear el contador
   */
  reset(): void {
    this.collectedMiniPingus = 0;
  }

  /**
   * Destruir el sistema y todos los mini-pingüinos
   */
  destroy(): void {
    this.miniPingus.clear(true, true);
  }
}
