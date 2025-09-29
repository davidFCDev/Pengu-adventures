export class Snowball extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 600; // Aumentado para más velocidad
  private lifeTime: number = 4000; // Más tiempo de vida
  private direction: number; // 1 para derecha, -1 para izquierda
  private hasExploded: boolean = false;
  private isDestroyed: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: number,
    collisionLayer?: Phaser.Tilemaps.TilemapLayer
  ) {
    // Crear una bola de nieve simple con gráficos
    super(scene, x, y, "");

    this.direction = direction;

    // Crear gráfico de bola de nieve
    this.createSnowballGraphic();

    // Añadir al scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar física para trayectoria más recta
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(24); // Bola de nieve circular más grande (radio 24)
    body.setCollideWorldBounds(false); // Puede salir del mundo
    body.setGravityY(80); // Mucho menos gravedad para trayectoria más recta

    // Configurar colisiones con tiles si se proporciona el layer
    if (collisionLayer) {
      scene.physics.add.collider(
        this,
        collisionLayer,
        this.handleTileCollision,
        undefined,
        this
      );
    }

    // Lanzar la bola de nieve
    this.launch();

    // Autodestruirse después del tiempo de vida
    scene.time.delayedCall(this.lifeTime, () => {
      if (!this.hasExploded && !this.isDestroyed && this.active) {
        this.explode();
      }
    });
  }

  private createSnowballGraphic(): void {
    // Crear una bola de nieve más grande y detallada
    const graphics = this.scene.add.graphics();

    // Bola principal más grande
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(0, 0, 24); // Más grande: radio 24 en lugar de 16

    // Borde gris para definición
    graphics.lineStyle(4, 0xcccccc);
    graphics.strokeCircle(0, 0, 24);

    // Más detalles de nieve para mayor realismo
    graphics.fillStyle(0xeeeeee);
    graphics.fillCircle(-8, -6, 4);
    graphics.fillCircle(6, 8, 3);
    graphics.fillCircle(-3, 10, 3);
    graphics.fillCircle(10, -4, 2);
    graphics.fillCircle(-12, 2, 2);

    // Generar textura más grande
    graphics.generateTexture("snowball", 52, 52); // 52x52 para la nueva bola
    graphics.destroy();

    // Aplicar la textura al sprite
    this.setTexture("snowball");
    this.setDisplaySize(52, 52);
  }

  private launch(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Velocidad horizontal según la dirección
    body.setVelocityX(this.speed * this.direction);

    // Velocidad inicial hacia arriba muy reducida para trayectoria más recta
    body.setVelocityY(-20); // Mucho menos para trayectoria casi horizontal

    // Crear partículas de nieve que siguen la bola
    this.createSnowParticles();

    // Efecto de rotación
    this.setRotation(0);
    this.scene.add.tween({
      targets: this,
      rotation: this.direction > 0 ? Math.PI * 2 : -Math.PI * 2,
      duration: this.lifeTime,
      ease: "Linear",
    });
  }

  private handleTileCollision(): void {
    if (!this.hasExploded) {
      this.explode();
    }
  }

  private createSnowParticles(): void {
    // Crear sistema de partículas de nieve
    const particles = this.scene.add.particles(this.x, this.y, "snowball", {
      scale: { start: 0.1, end: 0.05 },
      speed: { min: 10, max: 30 },
      lifespan: { min: 200, max: 500 },
      quantity: 2,
      frequency: 50,
      alpha: { start: 0.8, end: 0 },
      tint: [0xffffff, 0xf0f0f0, 0xe0e0e0],
    });

    // Hacer que las partículas sigan la bola de nieve
    particles.startFollow(this);

    // Destruir las partículas cuando se destruya la bola
    this.scene.time.delayedCall(this.lifeTime, () => {
      if (particles && particles.active && !this.isDestroyed) {
        particles.destroy();
      }
    });
  }

  public explode(): void {
    if (this.hasExploded || this.isDestroyed) return;
    this.hasExploded = true;
    this.isDestroyed = true;

    // Crear efecto de explosión con partículas de nieve esparciéndose
    this.createExplosionEffect();

    // Efecto visual de explosión principal - más grande
    const explosion = this.scene.add.circle(this.x, this.y, 0, 0xffffff, 0.9);

    this.scene.add.tween({
      targets: explosion,
      radius: 50,
      alpha: 0,
      duration: 400,
      ease: "Power2",
      onComplete: () => {
        if (explosion && explosion.active) {
          explosion.destroy();
        }
      },
    });

    // Destruir la bola de nieve
    this.destroy();
  }

  private createExplosionEffect(): void {
    // Crear múltiples partículas de nieve que se esparcen en todas las direcciones
    const explosionParticles = this.scene.add.particles(
      this.x,
      this.y,
      "snowball",
      {
        scale: { start: 0.4, end: 0.1 },
        speed: { min: 80, max: 250 },
        lifespan: { min: 400, max: 1000 },
        quantity: 12,
        alpha: { start: 1, end: 0 },
        tint: [0xffffff, 0xf0f0f0, 0xe0e0e0, 0xd0d0d0],
        gravityY: 300, // Las partículas caen
        rotate: { min: 0, max: 360 },
        scaleX: { min: 0.2, max: 0.6 },
        scaleY: { min: 0.2, max: 0.6 },
      }
    );

    // Emitir las partículas una sola vez (explosión)
    explosionParticles.explode();

    // Destruir el sistema de partículas después de un tiempo
    this.scene.time.delayedCall(1200, () => {
      if (explosionParticles && explosionParticles.active) {
        explosionParticles.destroy();
      }
    });

    // Añadir pequeños fragmentos adicionales que rebotan
    this.createBouncingFragments();
  }

  private createBouncingFragments(): void {
    // Crear pequeños fragmentos que rebotan como nieve real
    for (let i = 0; i < 6; i++) {
      const fragment = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(2, 5),
        0xffffff
      );

      // Añadir física a cada fragmento
      this.scene.physics.add.existing(fragment);
      const fragmentBody = fragment.body as Phaser.Physics.Arcade.Body;

      // Velocidades aleatorias para los fragmentos
      fragmentBody.setVelocity(
        Phaser.Math.Between(-200, 200),
        Phaser.Math.Between(-150, -50)
      );

      fragmentBody.setBounce(0.3, 0.3);
      fragmentBody.setGravityY(400);

      // Destruir fragmentos después de un tiempo con fade out
      this.scene.time.delayedCall(800, () => {
        // Verificar que la escena y el fragmento aún existen
        if (this.scene && this.scene.tweens && fragment && fragment.active) {
          this.scene.tweens.add({
            targets: fragment,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              if (fragment && fragment.active) {
                fragment.destroy();
              }
            },
          });
        } else if (fragment && fragment.active) {
          // Si no hay tweens disponibles, destruir directamente
          fragment.destroy();
        }
      });
    }
  }

  // Método para verificar colisiones
  public checkCollisions(
    objects: Phaser.Physics.Arcade.Group | Phaser.GameObjects.GameObject[]
  ): void {
    // Implementar lógica de colisiones específica si es necesario
  }

  destroy(): void {
    this.isDestroyed = true;
    super.destroy();
  }
}
