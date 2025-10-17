export enum FreezableEnemyState {
  IDLE = "idle",
  MOVING = "moving",
  FROZEN = "frozen",
}

export class FreezableEnemy extends Phaser.Physics.Arcade.Sprite {
  private enemyState: FreezableEnemyState = FreezableEnemyState.MOVING; // Comienza moviéndose
  private moveDirection: number = 1; // 1 = derecha, -1 = izquierda
  private frozenTimer: number = 0;
  private moveSpeed: number = 80; // Velocidad de patrullaje
  private collisionLayer: Phaser.Tilemaps.TilemapLayer;
  private iceBlock?: Phaser.Physics.Arcade.Image;
  private originalTint: number;

  // Identificador único para encontrar este enemigo
  public readonly enemyId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    collisionLayer: Phaser.Tilemaps.TilemapLayer,
    initialDirection: number = 1 // Dirección inicial (1 o -1)
  ) {
    super(scene, x, y, "MediumSlime_Blue", 0);

    this.moveDirection = initialDirection;
    this.collisionLayer = collisionLayer;
    this.enemyId = `freezable_enemy_${Math.random().toString(36).substr(2, 9)}`;

    // Añadir al scene
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    // Añadir referencia personalizada para colisiones
    (this as any).enemyRef = this;

    // Configurar físicas
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(200, 200); // Ajustar hitbox al tamaño del slime
    body.setOffset(55, 110); // Centrar hitbox (el sprite es 310x310 a escala 0.5)
    body.setCollideWorldBounds(true);
    body.setGravityY(800);

    // Configurar colisiones con el tilemap
    scene.physics.add.collider(this as any, collisionLayer);

    // Configurar sprite
    this.setScale(0.5); // El sprite es grande (310x310), reducir a la mitad
    this.setOrigin(0.5, 0.5);

    // Crear animación WALK si no existe
    this.createWalkAnimation();
    this.originalTint = this.tintTopLeft;

    // Iniciar el movimiento
    this.startMoving();
  }

  private createWalkAnimation(): void {
    // Crear animación WALK solo si no existe
    if (!this.scene.anims.exists("slime_walk")) {
      this.scene.anims.create({
        key: "slime_walk",
        frames: this.scene.anims.generateFrameNumbers("MediumSlime_Blue", {
          start: 0,
          end: 3, // Solo los 4 frames de la primera fila (0-3)
        }),
        frameRate: 8, // Velocidad de la animación
        repeat: -1, // Loop infinito
      });
    }

    // Reproducir la animación
    this.play("slime_walk");
  }

  /**
   * Obtener el bloque de hielo (para configurar colisiones)
   */
  public getIceBlock(): Phaser.Physics.Arcade.Image | undefined {
    return this.iceBlock;
  }

  private createIceBlock(): void {
    if (this.iceBlock) {
      this.iceBlock.destroy();
    }

    // Verificar que la escena está disponible Y que el enemigo está activo
    if (
      !this.scene ||
      !this.scene.add ||
      !this.scene.textures ||
      !this.active
    ) {
      console.error("Scene is not available for creating ice block");
      return;
    }

    // Crear la textura del bloque de hielo si no existe
    if (!this.scene.textures.exists("iceBlockTexture")) {
      const graphics = this.scene.add.graphics();
      graphics.setPosition(0, 0);

      // Bloque de hielo MÁS GRANDE y MÁS VISIBLE (140x140)
      graphics.fillStyle(0x88ccff, 0.7); // Más opaco (0.7 en lugar de 0.4)
      graphics.fillRoundedRect(0, 0, 140, 140, 10);

      // Borde más grueso y visible
      graphics.lineStyle(5, 0xaaddff, 1); // Completamente opaco
      graphics.strokeRoundedRect(0, 0, 140, 140, 10);

      // Más detalles de hielo para mayor visibilidad
      graphics.lineStyle(3, 0xffffff, 0.8);
      graphics.lineBetween(15, 25, 50, 15);
      graphics.lineBetween(80, 20, 125, 40);
      graphics.lineBetween(20, 90, 45, 115);
      graphics.lineBetween(90, 80, 120, 120);

      // Reflejos más grandes y brillantes
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(30, 30, 5);
      graphics.fillCircle(105, 45, 4);
      graphics.fillCircle(40, 100, 4);
      graphics.fillCircle(110, 110, 5);

      // Generar textura más grande
      graphics.generateTexture("iceBlockTexture", 140, 140);
      graphics.destroy();
    }

    // Crear la imagen del bloque de hielo con FÍSICA
    this.iceBlock = this.scene.physics.add.image(
      this.x,
      this.y,
      "iceBlockTexture"
    );

    this.iceBlock.setDepth(this.depth + 1);
    this.iceBlock.setAlpha(0);

    // Usar nextTick para asegurar que el cuerpo físico esté completamente inicializado
    this.scene.time.delayedCall(0, () => {
      // Verificar que el bloque de hielo aún existe y tiene cuerpo físico
      if (!this.iceBlock || !this.iceBlock.body) {
        console.error("Failed to create ice block with physics body");
        return;
      }

      // Configurar física del bloque de hielo
      const iceBody = this.iceBlock.body as Phaser.Physics.Arcade.Body;
      iceBody.setImmovable(true); // No se mueve al chocar
      iceBody.setAllowGravity(false); // No cae por gravedad
      iceBody.setSize(140, 140); // Tamaño de colisión ajustado
    });

    // Animación de aparición (solo si tweens está disponible)
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.iceBlock,
        alpha: 0.9, // MÁS VISIBLE (0.9 en lugar de 1)
        duration: 200,
        ease: "Cubic.easeOut",
      });

      // Efecto de brillo pulsante MÁS VISIBLE
      this.scene.tweens.add({
        targets: this.iceBlock,
        alpha: { from: 0.9, to: 0.75 }, // Rango más visible
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      // Si no hay tweens disponible, solo hacer visible
      this.iceBlock.setAlpha(0.85);
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

  private startMoving(): void {
    this.enemyState = FreezableEnemyState.MOVING;

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.moveDirection * this.moveSpeed);
    }

    // Voltear sprite según dirección
    this.setFlipX(this.moveDirection === -1);

    // Reproducir animación walk
    if (!this.anims.isPlaying || this.anims.currentAnim?.key !== "slime_walk") {
      this.play("slime_walk");
    }
  }

  private changeDirection(): void {
    // Invertir dirección
    this.moveDirection *= -1;
    this.startMoving();
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
      case FreezableEnemyState.MOVING:
        // Verificar colisión con paredes o bordes
        const touchingWall = body.blocked.left || body.blocked.right;

        if (touchingWall) {
          // Colisionó con una pared, cambiar de dirección
          body.setVelocityX(0);
          this.changeDirection();
        }
        break;

      case FreezableEnemyState.FROZEN:
        // Contar tiempo congelado
        this.frozenTimer -= delta;

        // Mantener el bloque de hielo sincronizado con la posición del enemigo
        if (this.iceBlock && this.iceBlock.active) {
          this.iceBlock.setPosition(this.x, this.y);
        }

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

    this.freeze();
  }

  private freeze(): void {
    // Verificar que la escena está disponible
    if (!this.scene || !this.active) {
      return;
    }

    this.enemyState = FreezableEnemyState.FROZEN;
    this.frozenTimer = 5000; // 5 segundos congelado

    // 🔊 Reproducir sonido de congelación
    if (this.scene.sound) {
      this.scene.sound.play("freeze_sound", { volume: 0.5 });
    }

    // Detener movimiento
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }

    // PAUSAR la animación del enemigo
    this.anims.pause();

    // Cambiar tinte a azul claro (efecto congelado)
    this.setTint(0xaaddff);

    // Crear bloque de hielo visual
    this.createIceBlock();

    // Efecto de temblor al congelarse
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
  }

  private unfreeze(): void {
    // Restaurar estado normal
    this.enemyState = FreezableEnemyState.MOVING;
    this.clearTint();

    // Destruir bloque de hielo con animación
    this.destroyIceBlock();

    // REANUDAR la animación del enemigo
    this.anims.resume();

    // Retomar movimiento
    this.startMoving();

    // Efecto visual de descongelamiento
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.55,
      scaleY: 0.55,
      duration: 150,
      yoyo: true,
      ease: "Back.easeOut",
      onComplete: () => {
        this.setScale(0.5); // Restaurar escala original
      },
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
    // ⚠️ CRÍTICO: FreezableEnemy NO debe ser destruido por colisiones
    // Solo puede ser destruido cuando se limpia la escena o explícitamente
    const stack = new Error().stack || "";
    const isFromCollision =
      stack.includes("overlap") || stack.includes("collide");

    if (isFromCollision && !fromScene) {
      // Bloquear destrucción desde colisiones
      return;
    }

    // Limpiar el bloque de hielo si existe
    if (this.iceBlock) {
      this.iceBlock.destroy();
      this.iceBlock = undefined;
    }
    super.destroy(fromScene);
  }
}
