/**
 * Sistema de Plataformas Temporales
 * Gestiona plataformas que desaparecen cuando el jugador las pisa
 */

export interface TemporaryPlatformConfig {
  /** GID del tile de la plataforma temporal en el tilemap */
  temporaryPlatformGID: number;

  /** Tiempo antes de desaparecer después de pisar (ms) */
  disappearDelay?: number;

  /** Duración de la animación de desaparición (ms) */
  disappearDuration?: number;

  /** Tiempo que permanece invisible (ms) */
  invisibleDuration?: number;

  /** Duración de la animación de reaparición (ms) */
  reappearDuration?: number;

  /** Duración del parpadeo individual (ms) */
  blinkDuration?: number;

  /** Número de parpadeos de advertencia */
  blinkRepeat?: number;

  /** Alpha durante el parpadeo (0-1) */
  blinkAlpha?: number;
}

interface PlatformState {
  isVisible: boolean;
  timer?: Phaser.Time.TimerEvent;
  sprite: Phaser.GameObjects.Sprite;
  blinkTween?: Phaser.Tweens.Tween;
}

export class TemporaryPlatformSystem {
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap;
  private player: Phaser.Physics.Arcade.Sprite;
  private config: Required<TemporaryPlatformConfig>;

  private platformStates: Map<string, PlatformState> = new Map();
  private detectionTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    player: Phaser.Physics.Arcade.Sprite,
    config: TemporaryPlatformConfig
  ) {
    this.scene = scene;
    this.tilemap = tilemap;
    this.player = player;

    // Valores por defecto
    this.config = {
      temporaryPlatformGID: config.temporaryPlatformGID,
      disappearDelay: config.disappearDelay ?? 1000,
      disappearDuration: config.disappearDuration ?? 300,
      invisibleDuration: config.invisibleDuration ?? 4000,
      reappearDuration: config.reappearDuration ?? 300,
      blinkDuration: config.blinkDuration ?? 150,
      blinkRepeat: config.blinkRepeat ?? 5,
      blinkAlpha: config.blinkAlpha ?? 0.3,
    };

    this.createPlatforms();
    this.setupDetection();
  }

  /**
   * Crear todas las plataformas temporales del tilemap
   */
  private createPlatforms(): void {
    const objectLayers = this.tilemap.objects;

    let found = 0;
    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && obj.gid === this.config.temporaryPlatformGID) {
          found++;
          this.createPlatform(obj);
        }
      });
    });

    if (found === 0) {
      console.warn(
        `⚠️ No se encontraron plataformas temporales con GID ${this.config.temporaryPlatformGID}`
      );
      return;
    }
  }

  /**
   * Crear una plataforma individual
   */
  private createPlatform(obj: any): void {
    const tileset = this.tilemap.getTileset("spritesheet-tiles-default");
    if (!tileset) {
      console.warn("Tileset no encontrado");
      return;
    }

    const localTileId = obj.gid - tileset.firstgid;

    const sprite = this.scene.add.sprite(
      obj.x + 32, // Centrar en X (mitad del objeto 64x64)
      obj.y - 32, // Centrar en Y (mitad del objeto 64x64)
      "spritesheet-tiles-frames",
      localTileId
    );

    sprite.setOrigin(0.5, 0.5);
    sprite.setDepth(10);

    // Añadir física estática
    this.scene.physics.add.existing(sprite, true);
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(sprite.width, sprite.height);

    // Configurar colisión con el player
    this.scene.physics.add.collider(this.player, sprite);

    const key = `${obj.x}_${obj.y}`;
    this.platformStates.set(key, {
      isVisible: true,
      sprite: sprite,
    });
  }

  /**
   * Configurar detección de cuando el player pisa una plataforma
   */
  private setupDetection(): void {
    this.detectionTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => this.checkPlayerOnPlatforms(),
      loop: true,
    });
  }

  /**
   * Verificar si el player está sobre alguna plataforma
   */
  private checkPlayerOnPlatforms(): void {
    if (!this.player || !this.player.body) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Verificar si está agachado (modo crouch/crawl)
    // Usamos una verificación más amplia que solo el frame específico
    const isCrouching =
      (this.player as any).isCrouching === true ||
      (this.player as any).currentAnimation === "penguin_crouch";

    this.platformStates.forEach((state, key) => {
      if (!state.sprite || !state.isVisible) return;

      const sprite = state.sprite;

      // Posiciones del jugador
      const playerBottom = this.player.y + playerBody.height / 2;
      const playerLeft = this.player.x - playerBody.width / 2;
      const playerRight = this.player.x + playerBody.width / 2;

      // Posiciones de la plataforma
      const platformTop = sprite.y - sprite.height / 2;
      const platformBottom = sprite.y + sprite.height / 2;
      const platformLeft = sprite.x - sprite.width / 2;
      const platformRight = sprite.x + sprite.width / 2;

      // ✅ El jugador debe estar ENCIMA (parte inferior cerca de la parte superior)
      // Rango ampliado para acomodar la hitbox reducida en CRAWL (32px en lugar de 64px)
      // Cuando está agachado, el playerBottom puede estar hasta ~24px por encima de la plataforma
      const isOnTopOfPlatform =
        playerBottom >= platformTop - 26 && playerBottom <= platformTop + 12;

      // Alineación horizontal: el jugador debe estar sobre la plataforma
      const isHorizontallyAligned =
        playerRight > platformLeft + 4 && playerLeft < platformRight - 4;

      // ✅ Condiciones para activar:
      // 1. Aterrizando: Cayendo y tocando el suelo (blocked.down)
      const isLanding = playerBody.blocked.down && isOnTopOfPlatform;

      // 2. Agachado: Cuando el jugador está en crouch/crawl sobre la plataforma
      const isCrouchingOnPlatform = isCrouching && isOnTopOfPlatform;

      const isOnPlatform =
        isHorizontallyAligned && (isLanding || isCrouchingOnPlatform);

      if (isOnPlatform && !state.timer) {
        this.activatePlatform(state, sprite);
      }
    });
  }

  /**
   * Activar la secuencia de desaparición de una plataforma
   */
  private activatePlatform(
    state: PlatformState,
    sprite: Phaser.GameObjects.Sprite
  ): void {
    // Efecto de parpadeo inmediato para advertir
    state.blinkTween = this.scene.tweens.add({
      targets: sprite,
      alpha: this.config.blinkAlpha,
      duration: this.config.blinkDuration,
      yoyo: true,
      repeat: this.config.blinkRepeat,
      ease: "Sine.easeInOut",
    });

    // Iniciar secuencia de desaparición
    state.timer = this.scene.time.delayedCall(
      this.config.disappearDelay,
      () => {
        this.disappearPlatform(state, sprite);
      }
    );
  }

  /**
   * Hacer desaparecer la plataforma
   */
  private disappearPlatform(
    state: PlatformState,
    sprite: Phaser.GameObjects.Sprite
  ): void {
    // Detener el parpadeo si aún está activo
    if (state.blinkTween && state.blinkTween.isPlaying()) {
      state.blinkTween.stop();
    }

    state.isVisible = false;

    const spriteBody = sprite.body as Phaser.Physics.Arcade.StaticBody;

    // Animar desaparición
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      duration: this.config.disappearDuration,
      ease: "Power2",
      onComplete: () => {
        sprite.setVisible(false);
        if (spriteBody) {
          spriteBody.checkCollision.none = true;
        }
      },
    });

    // Programar reaparición
    this.scene.time.delayedCall(this.config.invisibleDuration, () => {
      this.reappearPlatform(state, sprite);
    });
  }

  /**
   * Hacer reaparecer la plataforma
   */
  private reappearPlatform(
    state: PlatformState,
    sprite: Phaser.GameObjects.Sprite
  ): void {
    state.isVisible = true;
    state.timer = undefined;

    const spriteBody = sprite.body as Phaser.Physics.Arcade.StaticBody;

    sprite.setVisible(true);
    if (spriteBody) {
      spriteBody.checkCollision.none = false;
      spriteBody.checkCollision.up = true;
      spriteBody.checkCollision.down = true;
      spriteBody.checkCollision.left = true;
      spriteBody.checkCollision.right = true;
    }

    this.scene.tweens.add({
      targets: sprite,
      alpha: 1,
      duration: this.config.reappearDuration,
      ease: "Power2",
    });
  }

  /**
   * Destruir el sistema y limpiar recursos
   */
  destroy(): void {
    // Cancelar el timer de detección
    if (this.detectionTimer) {
      this.detectionTimer.destroy();
      this.detectionTimer = undefined;
    }

    // Destruir todas las plataformas
    this.platformStates.forEach((state) => {
      if (state.timer) {
        state.timer.destroy();
      }
      if (state.blinkTween) {
        state.blinkTween.stop();
      }
      if (state.sprite && state.sprite.active) {
        state.sprite.destroy();
      }
    });

    this.platformStates.clear();
  }
}
