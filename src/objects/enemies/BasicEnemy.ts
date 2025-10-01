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
    body.setSize(70, 70); // Hitbox más grande
    body.setOffset(7, 7); // Centrar el hitbox
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
      graphics.fillCircle(42, 42, 36);

      // Sombra/borde para efecto 3D
      graphics.lineStyle(5, 0xcc0000);
      graphics.strokeCircle(42, 42, 36);

      // Ojos grandes y expresivos (blancos)
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(30, 30, 10);
      graphics.fillCircle(54, 30, 10);

      // Borde de ojos
      graphics.lineStyle(2, 0x000000);
      graphics.strokeCircle(30, 30, 10);
      graphics.strokeCircle(54, 30, 10);

      // Pupilas grandes y animadas
      graphics.fillStyle(0x000000);
      graphics.fillCircle(32, 32, 5);
      graphics.fillCircle(52, 32, 5);

      // Reflejos en los ojos para efecto cartoon
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(34, 30, 3);
      graphics.fillCircle(50, 30, 3);

      // Boca grande y expresiva (sonrisa malvada)
      graphics.lineStyle(4, 0x000000);
      graphics.beginPath();
      graphics.arc(42, 54, 16, 0, Math.PI, false);
      graphics.strokePath();

      // Dientes pequeños para efecto malvado
      graphics.fillStyle(0xffffff);
      graphics.fillRect(36, 54, 4, 5);
      graphics.fillRect(42, 54, 4, 5);
      graphics.fillRect(48, 54, 4, 5);

      // Generar textura más grande (84x84)
      graphics.generateTexture("basicEnemyTexture", 84, 84);
      graphics.destroy();
    }

    // Aplicar la textura al sprite (84x84)
    this.setTexture("basicEnemyTexture");
    this.setDisplaySize(84, 84);
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

    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.state) {
      case EnemyState.IDLE:
        this.idleTimer -= delta;
        if (this.idleTimer <= 0) {
          this.startMovingToTarget();
        }
        break;

      case EnemyState.MOVING:
        // Verificar colisión con paredes (tiles con colisión)
        const touchingWall = body.blocked.left || body.blocked.right;

        if (touchingWall) {
          console.log("🧱 Enemigo chocó con pared, cambiando dirección");
          body.setVelocityX(0);
          this.switchTarget();
          this.startIdlePhase();
          break;
        }

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
