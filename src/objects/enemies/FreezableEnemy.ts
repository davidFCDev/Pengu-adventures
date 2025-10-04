export enum FreezableEnemyState {
  IDLE = "idle",
  MOVING = "moving",
  FROZEN = "frozen",
}

export class FreezableEnemy extends Phaser.Physics.Arcade.Sprite {
  private enemyState: FreezableEnemyState = FreezableEnemyState.IDLE;
  private pointA: { x: number; y: number };
  private pointB: { x: number; y: number };
  private currentTarget: { x: number; y: number };
  private idleTimer: number = 0;
  private frozenTimer: number = 0;
  private moveSpeed: number = 80; // Más rápido que BasicEnemy (80 vs 50)
  private collisionLayer: Phaser.Tilemaps.TilemapLayer;
  private iceBlock?: Phaser.GameObjects.Image;
  private originalTint: number;

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
    this.enemyId = `freezable_enemy_${Math.random().toString(36).substr(2, 9)}`;

    // Añadir al scene
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    // Añadir referencia personalizada para colisiones
    (this as any).enemyRef = this;

    // Configurar físicas (igual que BasicEnemy)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(70, 70);
    body.setOffset(7, 7);
    body.setCollideWorldBounds(true);
    body.setGravityY(800);

    // Configurar colisiones con el tilemap
    scene.physics.add.collider(this as any, collisionLayer);

    // Crear visual del enemigo
    this.createVisual();
    this.originalTint = this.tintTopLeft;

    // Iniciar el ciclo
    this.startIdlePhase();

    // Añadir animación de oscilación sutil para efecto cartoon
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this,
        scaleY: 0.95,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private createVisual(): void {
    // Crear una textura única para este enemigo (azul en lugar de rojo)
    if (!this.scene.textures.exists("freezableEnemyTexture")) {
      const graphics = this.scene.add.graphics();

      // Cuerpo principal (círculo azul)
      graphics.fillStyle(0x3366ff);
      graphics.fillCircle(42, 42, 36);

      // Sombra/borde para efecto 3D
      graphics.lineStyle(5, 0x0033cc);
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

      // Reflejos en los ojos
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(34, 30, 3);
      graphics.fillCircle(50, 30, 3);

      // Boca enojada (curva inversa)
      graphics.lineStyle(4, 0x000000);
      graphics.beginPath();
      graphics.arc(42, 62, 12, Math.PI, 0, false);
      graphics.strokePath();

      // Cuernos pequeños para diferenciarlo
      graphics.fillStyle(0x1a1aff);
      graphics.beginPath();
      graphics.moveTo(20, 15);
      graphics.lineTo(15, 5);
      graphics.lineTo(25, 10);
      graphics.closePath();
      graphics.fillPath();

      graphics.beginPath();
      graphics.moveTo(64, 15);
      graphics.lineTo(69, 5);
      graphics.lineTo(59, 10);
      graphics.closePath();
      graphics.fillPath();

      // Generar textura
      graphics.generateTexture("freezableEnemyTexture", 84, 84);
      graphics.destroy();
    }

    // Aplicar la textura al sprite
    this.setTexture("freezableEnemyTexture");
    this.setDisplaySize(84, 84);
  }

  private createIceBlock(): void {
    if (this.iceBlock) {
      this.iceBlock.destroy();
    }

    // Verificar que la escena está disponible Y que el enemigo está activo
    if (!this.scene || !this.scene.add || !this.scene.textures || !this.active) {
      console.error("Scene is not available for creating ice block");
      return;
    }

    // Crear la textura del bloque de hielo si no existe
    if (!this.scene.textures.exists("iceBlockTexture")) {
      const graphics = this.scene.add.graphics();
      graphics.setPosition(0, 0);

      // Bloque de hielo con efecto cristalino (100x100)
      graphics.fillStyle(0x88ccff, 0.4);
      graphics.fillRoundedRect(0, 0, 100, 100, 8);

      graphics.lineStyle(4, 0xaaddff, 0.8);
      graphics.strokeRoundedRect(0, 0, 100, 100, 8);

      graphics.lineStyle(2, 0xffffff, 0.6);
      graphics.lineBetween(10, 20, 40, 10);
      graphics.lineBetween(60, 15, 90, 30);
      graphics.lineBetween(15, 70, 35, 85);
      graphics.lineBetween(70, 60, 85, 90);

      graphics.fillStyle(0xffffff, 0.8);
      graphics.fillCircle(25, 25, 3);
      graphics.fillCircle(75, 35, 2);
      graphics.fillCircle(30, 75, 2);
      graphics.fillCircle(80, 80, 3);

      graphics.generateTexture("iceBlockTexture", 100, 100);
      graphics.destroy();
    }

    // Crear la imagen del bloque de hielo
    this.iceBlock = this.scene.add.image(this.x, this.y, "iceBlockTexture");
    this.iceBlock.setDepth(this.depth + 1);
    this.iceBlock.setAlpha(0);

    // Animación de aparición (solo si tweens está disponible)
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.iceBlock,
        alpha: 1,
        duration: 200,
        ease: "Cubic.easeOut",
      });

      // Efecto de brillo pulsante
      this.scene.tweens.add({
        targets: this.iceBlock,
        alpha: 0.7,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      // Si no hay tweens disponible, solo hacer visible
      this.iceBlock.setAlpha(0.7);
    }
  }

  private destroyIceBlock(): void {
    if (this.iceBlock) {
      // Verificar que la escena está disponible
      if (!this.scene || !this.scene.tweens) {
        // Si no hay escena, destruir directamente
        this.iceBlock.destroy();
        this.iceBlock = undefined;
        return;
      }

      // Animación de rotura
      this.scene.tweens.add({
        targets: this.iceBlock,
        alpha: 0,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        ease: "Back.easeIn",
        onComplete: () => {
          if (this.iceBlock) {
            this.iceBlock.destroy();
            this.iceBlock = undefined;
          }
        },
      });

      // Partículas de hielo rompiéndose
      this.createIceBreakParticles();
    }
  }

  private createIceBreakParticles(): void {
    // Verificar que la escena está disponible
    if (!this.scene || !this.scene.add || !this.scene.tweens) {
      return;
    }

    // Crear pequeñas partículas de hielo rompiéndose
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.graphics();
      particle.fillStyle(0xaaddff, 0.8);
      particle.fillRect(0, 0, 4, 4);
      particle.generateTexture("iceParticle" + i, 4, 4);
      particle.destroy();

      const sprite = this.scene.add.sprite(this.x, this.y, "iceParticle" + i);
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 100 + Math.random() * 50;

      this.scene.tweens.add({
        targets: sprite,
        x: sprite.x + Math.cos(angle) * 30,
        y: sprite.y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 400,
        ease: "Cubic.easeOut",
        onComplete: () => sprite.destroy(),
      });
    }
  }

  private startIdlePhase(): void {
    this.enemyState = FreezableEnemyState.IDLE;
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }
    this.idleTimer = 1000; // 1 segundo (más rápido que BasicEnemy)
  }

  private startMovingToTarget(): void {
    this.enemyState = FreezableEnemyState.MOVING;

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
    if (!this.body) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Actualizar posición del bloque de hielo si está congelado
    if (this.enemyState === FreezableEnemyState.FROZEN && this.iceBlock) {
      this.iceBlock.setPosition(this.x, this.y);
    }

    switch (this.enemyState) {
      case FreezableEnemyState.IDLE:
        this.idleTimer -= delta;
        if (this.idleTimer <= 0) {
          this.startMovingToTarget();
        }
        break;

      case FreezableEnemyState.MOVING:
        // Verificar colisión con paredes
        const touchingWall = body.blocked.left || body.blocked.right;

        if (touchingWall) {
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

      case FreezableEnemyState.FROZEN:
        // Contar tiempo congelado
        this.frozenTimer -= delta;

        if (this.frozenTimer <= 0) {
          // Descongelar
          this.unfreeze();
        }
        break;
    }
  }

  public takeDamageFromSnowball(): void {
    // Este enemigo NO muere, se congela
    if (this.enemyState === FreezableEnemyState.FROZEN) {
      return; // Ya está congelado
    }

    // Debug: verificar estado antes de congelar
    console.log("FreezableEnemy takeDamageFromSnowball:", {
      hasScene: !!this.scene,
      isActive: this.active,
      state: this.enemyState,
      enemyId: this.enemyId
    });

    this.freeze();
  }

  private freeze(): void {
    // Debug detallado
    console.log("Attempting to freeze enemy:", {
      hasScene: !!this.scene,
      sceneType: this.scene ? typeof this.scene : 'undefined',
      isActive: this.active,
      hasBody: !!this.body,
      enemyId: this.enemyId
    });

    // Verificar que la escena está disponible
    if (!this.scene) {
      console.error("Cannot freeze enemy: scene is null/undefined", {
        enemyId: this.enemyId,
        isActive: this.active
      });
      return;
    }

    if (!this.active) {
      console.warn("Cannot freeze enemy: enemy is inactive", {
        enemyId: this.enemyId
      });
      return;
    }

    this.enemyState = FreezableEnemyState.FROZEN;
    this.frozenTimer = 5000; // 5 segundos congelado

    // Detener movimiento
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }

    // Cambiar tinte a azul claro (efecto congelado)
    this.setTint(0xaaddff);

    console.log("About to create ice block...");

    // Crear bloque de hielo visual
    this.createIceBlock();

    console.log("Ice block created, adding shake tween...");

    // Efecto de temblor al congelarse (solo si la escena está disponible)
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this,
        x: this.x + 2,
        duration: 50,
        yoyo: true,
        repeat: 5,
        ease: "Sine.easeInOut",
      });
    }

    console.log("Freeze complete!");
  }

  private unfreeze(): void {
    // Restaurar estado normal
    this.enemyState = FreezableEnemyState.IDLE;
    this.clearTint();

    // Destruir bloque de hielo con animación
    this.destroyIceBlock();

    // Resetear idle timer para que espere antes de moverse
    this.idleTimer = 1000;

    // Efecto visual de descongelamiento
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  public damagePlayer(player: any): void {
    // Solo daña si NO está congelado
    if (this.enemyState !== FreezableEnemyState.FROZEN) {
      if (player.takeDamage) {
        player.takeDamage(this.x);
      }
    }
  }

  destroy(fromScene?: boolean): void {
    // Limpiar el bloque de hielo si existe
    if (this.iceBlock) {
      this.iceBlock.destroy();
      this.iceBlock = undefined;
    }
    super.destroy(fromScene);
  }
}
