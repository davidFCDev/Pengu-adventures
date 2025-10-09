/**
 * Sistema de monedas coleccionables
 *
 * Este sistema maneja:
 * - Creación de monedas con animaciones
 * - Detección de colisiones con el jugador
 * - Contador de monedas recolectadas
 * - Efectos visuales de recolección
 */

export interface CoinPosition {
  x: number;
  y: number;
}

export interface CoinSystemConfig {
  /** Clave de textura de la moneda */
  textureKey: string;
  /** Escala de las monedas */
  scale?: number;
  /** Profundidad de renderizado */
  depth?: number;
  /** Clave del sonido de recolección (opcional) */
  collectSoundKey?: string;
  /** Volumen del sonido */
  soundVolume?: number;
  /** Duración de la animación de flotación en ms */
  floatDuration?: number;
  /** Distancia de flotación en píxeles */
  floatDistance?: number;
}

export class CoinSystem {
  private scene: Phaser.Scene;
  private coins: Phaser.Physics.Arcade.Group;
  private collectedCoins: number = 0;
  private totalCoins: number = 0;
  private config: Required<CoinSystemConfig>;

  constructor(scene: Phaser.Scene, config: CoinSystemConfig) {
    this.scene = scene;

    // Configuración por defecto
    this.config = {
      textureKey: config.textureKey,
      scale: config.scale ?? 1.0, // Escala por defecto para monedas (50x53px base)
      depth: config.depth ?? 10,
      collectSoundKey: config.collectSoundKey ?? "",
      soundVolume: config.soundVolume ?? 0.3,
      floatDuration: config.floatDuration ?? 1000,
      floatDistance: config.floatDistance ?? 5,
    };

    // Crear grupo de física para las monedas
    this.coins = this.scene.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
  }

  /**
   * Crear monedas en las posiciones especificadas
   */
  createCoins(positions: CoinPosition[]): void {
    this.totalCoins = positions.length;

    positions.forEach((pos) => {
      // Usar add.image() en lugar de add.sprite() ya que PT_TOKEN_MASTER_001 se carga como image
      const coin = this.scene.add.image(
        pos.x,
        pos.y,
        this.config.textureKey
      ) as any;

      coin.setScale(this.config.scale);
      coin.setDepth(this.config.depth);

      // Añadir física
      this.scene.physics.add.existing(coin);
      const body = coin.body as Phaser.Physics.Arcade.Body;
      body.setSize(coin.width, coin.height);
      body.setAllowGravity(false);

      // Añadir al grupo
      this.coins.add(coin);

      // Animación de flotación
      this.scene.tweens.add({
        targets: coin,
        y: pos.y - this.config.floatDistance,
        duration: this.config.floatDuration,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  /**
   * Configurar colisión con el jugador
   */
  setupPlayerCollision(player: Phaser.Physics.Arcade.Sprite): void {
    this.scene.physics.add.overlap(
      player,
      this.coins,
      (player: any, coin: any) => {
        // Verificar que el sprite no haya sido destruido o esté en proceso de recolección
        if (coin && coin.active) {
          this.collectCoin(coin);
        }
      },
      undefined,
      this
    );
  }

  /**
   * Recolectar una moneda
   */
  private collectCoin(coinSprite: Phaser.Physics.Arcade.Sprite): void {
    // Verificar que no se haya recolectado ya (evitar colisiones múltiples)
    if (!coinSprite.active) {
      return;
    }

    // Desactivar inmediatamente para prevenir colisiones múltiples
    coinSprite.setActive(false);
    this.coins.remove(coinSprite, false, false);

    // Incrementar contador
    this.collectedCoins++;

    // Efecto de recolección
    this.scene.tweens.add({
      targets: coinSprite,
      scale: this.config.scale * 2,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        coinSprite.destroy();
      },
    });

    // Reproducir sonido si está configurado
    if (this.config.collectSoundKey) {
      this.scene.sound.play(this.config.collectSoundKey, {
        volume: this.config.soundVolume,
      });
    }

    // Emitir evento para que la escena pueda reaccionar
    this.scene.events.emit("coinCollected", {
      collected: this.collectedCoins,
      total: this.totalCoins,
    });
  }

  /**
   * Obtener el número de monedas recolectadas
   */
  getCollectedCoins(): number {
    return this.collectedCoins;
  }

  /**
   * Obtener el total de monedas
   */
  getTotalCoins(): number {
    return this.totalCoins;
  }

  /**
   * Resetear el contador de monedas
   */
  reset(): void {
    this.collectedCoins = 0;
  }

  /**
   * Destruir el sistema
   */
  destroy(): void {
    this.coins.clear(true, true);
  }

  /**
   * Obtener el grupo de monedas (para uso avanzado)
   */
  getCoinsGroup(): Phaser.Physics.Arcade.Group {
    return this.coins;
  }
}
