export enum AquaticEnemyState {
  IDLE = "idle",
  SWIMMING = "swimming",
}

/**
 * Enemigo acuático que se mueve en zonas de agua (swim=true)
 * - Solo aparece en agua
 * - No puede ser atacado (no hay bolas de nieve en agua)
 * - Se mueve más rápido que otros enemigos
 * - Nada por el centro de las zonas de agua
 */
export class AquaticEnemy extends Phaser.Physics.Arcade.Sprite {
  private enemyState: AquaticEnemyState = AquaticEnemyState.IDLE;
  private pointA: { x: number; y: number };
  private pointB: { x: number; y: number };
  private currentTarget: { x: number; y: number };
  private idleTimer: number = 0;
  private moveSpeed: number = 120; // Más rápido que BasicEnemy (50) y FreezableEnemy (80)
  private waterLayer: Phaser.Tilemaps.TilemapLayer;

  // Identificador único
  public readonly enemyId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
    waterLayer: Phaser.Tilemaps.TilemapLayer
  ) {
    super(scene, x, y, "angler_fish_swim");

    this.pointA = pointA;
    this.pointB = pointB;
    this.currentTarget = pointA;
    this.waterLayer = waterLayer;
    this.enemyId = `aquatic_enemy_${Math.random().toString(36).substr(2, 9)}`;

    // Añadir al scene
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    // Crear la animación si no existe
    this.createAnimation();

    // Configurar físicas (sin gravedad, flota en el agua)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(130, 90);
    body.setOffset(30, 40);
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false); // No cae, flota en el agua
    body.setImmovable(false);

    // Ajustar tamaño del sprite más grande (el sprite original es 622x451)
    // Lo escalamos a ~190x138 para que sea más visible y amenazante
    this.setDisplaySize(190, 138);

    // Iniciar el ciclo (startIdlePhase ya reproduce la animación idle)
    this.startIdlePhase();

    // Animación de natación (ondulación vertical suave)
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this,
        y: this.y + 8,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private createAnimation(): void {
    // Crear la animación de natación del pez ángler si no existe
    if (!this.scene.anims.exists("angler_fish_swimming")) {
      this.scene.anims.create({
        key: "angler_fish_swimming",
        frames: this.scene.anims.generateFrameNumbers("angler_fish_swim", {
          start: 0,
          end: 15,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    // Crear la animación de idle del pez ángler si no existe
    if (!this.scene.anims.exists("angler_fish_idle_anim")) {
      this.scene.anims.create({
        key: "angler_fish_idle_anim",
        frames: this.scene.anims.generateFrameNumbers("angler_fish_idle", {
          start: 0,
          end: 15,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  /**
   * No tiene método takeDamageFromSnowball porque no puede ser atacado en el agua
   */

  private startIdlePhase(): void {
    this.enemyState = AquaticEnemyState.IDLE;
    this.idleTimer = 800; // Tiempo de espera más corto (800ms vs 1000ms)

    // Cambiar a la animación idle
    this.play("angler_fish_idle_anim");

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }
  }

  private startSwimming(): void {
    this.enemyState = AquaticEnemyState.SWIMMING;

    // Cambiar a la animación de natación
    this.play("angler_fish_swimming");

    const direction = this.currentTarget.x > this.x ? 1 : -1;
    // Invertir el flip porque el sprite está mirando al lado contrario
    this.setFlipX(direction > 0);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(
        direction * this.moveSpeed
      );
    }
  }

  private switchTarget(): void {
    this.currentTarget =
      this.currentTarget === this.pointA ? this.pointB : this.pointA;
  }

  update(time: number, delta: number): void {
    if (!this.active || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.enemyState) {
      case AquaticEnemyState.IDLE:
        this.idleTimer -= delta;

        if (this.idleTimer <= 0) {
          this.startSwimming();
        }
        break;

      case AquaticEnemyState.SWIMMING:
        // Verificar si llegó al objetivo
        const distanceToTarget = Math.abs(this.x - this.currentTarget.x);
        if (distanceToTarget < 10) {
          body.setVelocityX(0);
          this.switchTarget();
          this.startIdlePhase();
        }
        break;
    }
  }

  /**
   * Método para dañar al player cuando toca al enemigo acuático
   */
  public damagePlayer(player: any): void {
    if (player.takeDamage) {
      player.takeDamage(this.x);
    }
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
