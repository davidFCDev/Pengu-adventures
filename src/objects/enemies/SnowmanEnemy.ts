/**
 * SnowmanEnemy - Enemigo estático que lanza bolas de nieve
 *
 * Características:
 * - No se mueve
 * - Inmortal (no puede ser derrotado)
 * - Lanza bolas de nieve periódicamente de forma recta
 * - Las bolas de nieve dañan al jugador y lo empujan
 */

export enum SnowmanEnemyState {
  IDLE = "idle",
  ATTACK = "attack",
}

export class SnowmanEnemy extends Phaser.Physics.Arcade.Sprite {
  private enemyState: SnowmanEnemyState = SnowmanEnemyState.IDLE;
  private attackTimer: number = 0;
  private attackCooldown: number = 3000; // 3 segundos entre ataques
  private snowballSpeed: number = 400; // Velocidad de la bola de nieve
  private facingDirection: number = 1; // 1 = derecha, -1 = izquierda
  private enemyScale: number = 1.0;

  // Identificador único
  public readonly enemyId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    facingDirection: number = -1, // Por defecto mira a la izquierda
    scale: number = 1.0
  ) {
    super(scene, x, y, "snowman-spritesheet", 0);

    this.facingDirection = facingDirection;
    this.enemyScale = scale;
    this.enemyId = `snowman_enemy_${Math.random().toString(36).substr(2, 9)}`;

    // Crear textura de snowball si no existe
    this.createSnowballTexture();

    // Añadir al scene
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    // Añadir referencia personalizada
    (this as any).enemyRef = this;

    // Configurar físicas (ajustadas según la escala)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(120 * scale, 130 * scale); // Ajustar hitbox según escala
    body.setOffset(17 * scale, 20 * scale); // Centrar hitbox según escala
    body.setCollideWorldBounds(true);
    body.setImmovable(true); // El Snowman no se mueve
    body.setAllowGravity(false); // No afectado por gravedad

    // Configurar sprite
    this.setScale(scale);
    this.setOrigin(0.5, 0.5);

    // Establecer dirección visual (NO flip porque por defecto ya mira a la izquierda)
    this.setFlipX(this.facingDirection === 1); // Solo flip si mira a la derecha

    // Crear animaciones
    this.createAnimations();

    // Iniciar en IDLE
    this.playIdleAnimation();

    // Iniciar timer de ataque aleatorio
    this.attackTimer = Phaser.Math.Between(1000, 2000);
  }

  private createSnowballTexture(): void {
    // Solo crear la textura si no existe
    if (!this.scene.textures.exists("snowball")) {
      const graphics = this.scene.add.graphics();

      // Bola principal
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(0, 0, 24);

      // Borde gris para definición
      graphics.lineStyle(4, 0xcccccc);
      graphics.strokeCircle(0, 0, 24);

      // Detalles de nieve
      graphics.fillStyle(0xeeeeee);
      graphics.fillCircle(-8, -6, 4);
      graphics.fillCircle(6, 8, 3);
      graphics.fillCircle(-3, 10, 3);
      graphics.fillCircle(10, -4, 2);
      graphics.fillCircle(-12, 2, 2);

      // Generar textura
      graphics.generateTexture("snowball", 52, 52);
      graphics.destroy();
    }
  }

  private createAnimations(): void {
    // Crear animación IDLE (frames 0-19)
    if (!this.scene.anims.exists("snowman_idle")) {
      this.scene.anims.create({
        key: "snowman_idle",
        frames: this.scene.anims.generateFrameNumbers("snowman-spritesheet", {
          start: 0,
          end: 19,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Crear animación ATTACK (frames 20-26)
    if (!this.scene.anims.exists("snowman_attack")) {
      this.scene.anims.create({
        key: "snowman_attack",
        frames: this.scene.anims.generateFrameNumbers("snowman-spritesheet", {
          start: 20,
          end: 26,
        }),
        frameRate: 12,
        repeat: 0, // Solo una vez
      });
    }
  }

  private playIdleAnimation(): void {
    this.enemyState = SnowmanEnemyState.IDLE;
    this.play("snowman_idle", true);
  }

  private playAttackAnimation(): void {
    this.enemyState = SnowmanEnemyState.ATTACK;
    this.play("snowman_attack", true);

    // Lanzar la bola de nieve en el frame 4 del ataque (mitad de la animación)
    const attackDuration = (7 / 12) * 1000; // 7 frames a 12 fps
    this.scene.time.delayedCall(attackDuration * 0.5, () => {
      this.shootSnowball();
    });

    // Volver a IDLE después del ataque
    this.once("animationcomplete", () => {
      this.playIdleAnimation();
    });
  }

  private shootSnowball(): void {
    // Verificar que la escena sigue activa
    if (!this.scene || !this.active) return;

    // Posición de disparo (frente al Snowman, ajustada por escala)
    const offsetX = (this.facingDirection === 1 ? 60 : -60) * this.enemyScale;
    const snowballX = this.x + offsetX;
    const snowballY = this.y;

    // Crear la bola de nieve usando la misma textura que el player
    const snowball = this.scene.physics.add.sprite(
      snowballX,
      snowballY,
      "snowball"
    );

    // Configurar la bola de nieve del Snowman (MÁS GRANDE que la del player)
    snowball.setDisplaySize(70, 70); // Más grande: 70x70 (player usa 52x52)
    const snowballBody = snowball.body as Phaser.Physics.Arcade.Body;
    snowballBody.setCircle(32); // Radio 32 (player usa 24)
    snowballBody.setAllowGravity(true); // CON gravedad para hacer arco
    snowballBody.setGravityY(300); // Gravedad moderada para arco suave

    // Velocidad horizontal y vertical para crear el arco
    snowballBody.setVelocityX(this.snowballSpeed * this.facingDirection);
    snowballBody.setVelocityY(-250); // Impulso hacia arriba para el arco

    // Añadir propiedad para identificar que es del enemigo
    (snowball as any).isEnemyProjectile = true;
    (snowball as any).damage = 1;
    (snowball as any).knockbackForce = 400;

    // Guardar posición inicial para calcular distancia recorrida
    const startX = snowballX;
    const maxDistance = 500; // Distancia máxima: 500 píxeles

    // Emitir evento para que el ProjectileSystem lo gestione
    this.scene.events.emit("enemySnowballCreated", snowball);

    // Destruir la bola de nieve después de 2 segundos O si recorre más de 500 píxeles
    const checkDistanceTimer = this.scene.time.addEvent({
      delay: 50, // Revisar cada 50ms
      repeat: 40, // 40 repeticiones = 2 segundos
      callback: () => {
        if (!snowball || !snowball.active) {
          checkDistanceTimer.destroy();
          return;
        }

        // Calcular distancia recorrida
        const distanceTraveled = Math.abs(snowball.x - startX);

        // Destruir si excede la distancia máxima
        if (distanceTraveled > maxDistance) {
          snowball.destroy();
          checkDistanceTimer.destroy();
        }
      },
    });

    // Destruir después de 2 segundos como respaldo
    this.scene.time.delayedCall(2000, () => {
      if (snowball && snowball.active) {
        snowball.destroy();
      }
      if (checkDistanceTimer) {
        checkDistanceTimer.destroy();
      }
    });
  }

  update(time: number, delta: number): void {
    // Si está atacando, no hacer nada más
    if (this.enemyState === SnowmanEnemyState.ATTACK) return;

    // Actualizar timer de ataque
    this.attackTimer -= delta;

    if (this.attackTimer <= 0) {
      // Tiempo de atacar
      this.playAttackAnimation();
      // Resetear timer con un valor aleatorio
      this.attackTimer = this.attackCooldown + Phaser.Math.Between(-500, 500);
    }
  }

  /**
   * Obtener el estado actual del enemigo
   */
  public getState(): SnowmanEnemyState {
    return this.enemyState;
  }

  /**
   * Obtener la dirección que enfrenta el enemigo
   */
  public getFacingDirection(): number {
    return this.facingDirection;
  }

  /**
   * Cleanup al destruir
   */
  destroy(fromScene?: boolean): void {
    // Limpiar cualquier timer activo
    if (this.scene && this.scene.time) {
      this.scene.time.removeAllEvents();
    }

    super.destroy(fromScene);
  }
}
