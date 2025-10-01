// No necesitamos importar BaseGameScene específicamente

export enum EnemyState {
  IDLE = "idle",
  MOVING = "moving",
  DEAD = "dead",
}

export class BasicEnemy extends Phaser.Physics.Arcade.Sprite {
  private state: EnemyState = EnemyState.IDLE;
  private pointA: { x: number; y: number };
  private pointB: { x: number; y: number };
  private currentTarget: { x: number; y: number };
  private idleTimer: number = 0;
  private moveSpeed: number = 50;
  private collisionLayer: Phaser.Tilemaps.TilemapLayer;

  // Identificador único para encontrar este enemigo
  public readonly enemyId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
    collisionLayer: Phaser.Tilemaps.TilemapLayer
  ) {
    super(scene, x, y, "");

    this.pointA = pointA;
    this.pointB = pointB;
    this.currentTarget = pointA;
    this.collisionLayer = collisionLayer;
    this.enemyId = `enemy_${Math.random().toString(36).substr(2, 9)}`;

    // Añadir al scene
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    // Añadir referencia personalizada para colisiones
    (this as any).enemyRef = this;

    // Configurar físicas (más grande)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(54, 54); // Hitbox más grande pero un poco menor que el sprite visual
    body.setOffset(5, 5); // Centrar el hitbox
    body.setCollideWorldBounds(true);
    body.setGravityY(800);

    // Configurar colisiones con el tilemap
    scene.physics.add.collider(this as any, collisionLayer);

    // Crear visual del enemigo
    this.createVisual();

    // Iniciar el ciclo
    this.startIdlePhase();

    // Añadir animación de oscilación sutil para efecto cartoon
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createVisual(): void {
    // Verificar si la textura ya existe para evitar recrearla
    if (!this.scene.textures.exists("basicEnemyTexture")) {
      // Crear un enemigo más grande y cartoon
      const graphics = this.scene.add.graphics();

      // Cuerpo principal (círculo rojo más grande)
      graphics.fillStyle(0xff3333);
      graphics.fillCircle(32, 32, 28);

      // Sombra/borde para efecto 3D
      graphics.lineStyle(4, 0xcc0000);
      graphics.strokeCircle(32, 32, 28);

      // Ojos grandes y expresivos (blancos)
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(22, 22, 8);
      graphics.fillCircle(42, 22, 8);

      // Borde de ojos
      graphics.lineStyle(2, 0x000000);
      graphics.strokeCircle(22, 22, 8);
      graphics.strokeCircle(42, 22, 8);

      // Pupilas grandes y animadas
      graphics.fillStyle(0x000000);
      graphics.fillCircle(24, 24, 4);
      graphics.fillCircle(40, 24, 4);

      // Reflejos en los ojos para efecto cartoon
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(26, 22, 2);
      graphics.fillCircle(38, 22, 2);

      // Boca grande y expresiva (sonrisa malvada)
      graphics.lineStyle(3, 0x000000);
      graphics.beginPath();
      graphics.arc(32, 42, 12, 0, Math.PI, false);
      graphics.strokePath();

      // Dientes pequeños para efecto malvado
      graphics.fillStyle(0xffffff);
      graphics.fillRect(28, 42, 3, 4);
      graphics.fillRect(33, 42, 3, 4);
      graphics.fillRect(38, 42, 3, 4);

      // Generar textura más grande
      graphics.generateTexture("basicEnemyTexture", 64, 64);
      graphics.destroy();
    }

    // Aplicar la textura al sprite
    this.setTexture("basicEnemyTexture");
    this.setDisplaySize(64, 64);
  }

  private startIdlePhase(): void {
    this.state = EnemyState.IDLE;
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }
    this.idleTimer = 2000; // 2 segundos
  }

  private startMovingToTarget(): void {
    this.state = EnemyState.MOVING;

    if (this.body) {
      const direction = this.currentTarget.x > this.x ? 1 : -1;
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
    if (this.state === EnemyState.DEAD || !this.body) {
      return;
    }

    switch (this.state) {
      case EnemyState.IDLE:
        this.idleTimer -= delta;
        if (this.idleTimer <= 0) {
          this.startMovingToTarget();
        }
        break;

      case EnemyState.MOVING:
        // Verificar si llegó al objetivo
        const distanceToTarget = Math.abs(this.x - this.currentTarget.x);
        if (distanceToTarget < 10) {
          (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
          this.switchTarget();
          this.startIdlePhase();
        }
        break;
    }
  }

  public takeDamageFromSnowball(): void {
    this.state = EnemyState.DEAD;
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // Efecto de muerte (fade out)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  public damagePlayer(player: any): void {
    // El player pierde una vida
    if (player.takeDamage) {
      player.takeDamage();
    }

    // Repeler al player hacia atrás
    const repelForce = 200;
    const direction = player.x > this.x ? 1 : -1;
    player.body.setVelocityX(direction * repelForce);
  }
}
