export class Snowball extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 550; // Aumentado de 400 a 550 para más fuerza
  private lifeTime: number = 3000; // 3 segundos de vida
  private direction: number; // 1 para derecha, -1 para izquierda

  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    // Crear una bola de nieve simple con gráficos
    super(scene, x, y, "");

    this.direction = direction;

    // Crear gráfico de bola de nieve
    this.createSnowballGraphic();

    // Añadir al scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar física
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(24); // Bola de nieve circular más grande (radio 24)
    body.setCollideWorldBounds(false); // Puede salir del mundo
    body.setGravityY(150); // Reducido de 200 a 150 para trayectoria más recta

    // Lanzar la bola de nieve
    this.launch();

    // Autodestruirse después del tiempo de vida
    scene.time.delayedCall(this.lifeTime, () => {
      this.destroy();
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

    // Velocidad inicial hacia arriba reducida para trayectoria más recta
    body.setVelocityY(-80); // Reducido de -150 a -80 para trayectoria más horizontal

    // Crear partículas de nieve que siguen la bola
    this.createSnowParticles();

    // Efecto de rotación
    this.setRotation(0);
    this.scene.add.tween({
      targets: this,
      rotation: this.direction > 0 ? Math.PI * 2 : -Math.PI * 2, // Menos rotación
      duration: this.lifeTime,
      ease: "Linear",
    });
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
      particles.destroy();
    });
  }

  public explode(): void {
    // Efecto visual de explosión (opcional)
    const explosion = this.scene.add.circle(this.x, this.y, 0, 0xffffff, 0.8);

    this.scene.add.tween({
      targets: explosion,
      radius: 20,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        explosion.destroy();
      },
    });

    // Destruir la bola de nieve
    this.destroy();
  }

  // Método para verificar colisiones
  public checkCollisions(
    objects: Phaser.Physics.Arcade.Group | Phaser.GameObjects.GameObject[]
  ): void {
    // Implementar lógica de colisiones específica si es necesario
  }
}
