/**
 * Muro de nieve destructible que bloquea el paso
 * Solo se puede destruir con el soplido del fantasma
 */
export class SnowWall extends Phaser.GameObjects.Container {
  private snowBlocks: Phaser.GameObjects.Graphics[] = [];
  private isDestroyed: boolean = false;
  private collider?: Phaser.Physics.Arcade.Collider;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    surfaceLayer: Phaser.Tilemaps.TilemapLayer
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    // Asegurar que el container sea visible
    this.setDepth(50); // Por encima del mapa pero por debajo del player
    this.setVisible(true);
    // Crear el muro visual (2 bloques de 64x64 apilados)
    this.createSnowBlocks();
    // Crear hitbox física para colisión
    this.setupPhysics(surfaceLayer);
  }
  private createSnowBlocks(): void {
    // Crear una única acumulación de nieve redondeada
    const snowMound = this.scene.add.graphics();
    this.drawSnowMound(snowMound, 0, 0);
    this.add(snowMound);
    this.snowBlocks.push(snowMound);
  }
  private drawSnowMound(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    const width = 64;
    const baseHeight = 50; // Altura base más baja
    const topHeight = 25; // Altura adicional en el pico

    // Crear forma de montículo usando path con curvas suaves
    graphics.fillStyle(0xffffff, 0.95);
    graphics.beginPath();

    // Base
    graphics.moveTo(x, y);

    // Crear forma de montículo con múltiples puntos para suavidad
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x + t * width;

      // Función seno para crear forma redondeada natural
      const heightMultiplier = Math.sin(t * Math.PI);
      const py =
        y -
        (baseHeight * heightMultiplier +
          topHeight * Math.pow(heightMultiplier, 2));

      graphics.lineTo(px, py);
    }

    graphics.lineTo(x + width, y);
    graphics.closePath();
    graphics.fillPath();

    // Sombra en el lado derecho
    graphics.fillStyle(0xe0e8f0, 0.6);
    graphics.beginPath();
    graphics.moveTo(x + width * 0.5, y - baseHeight * 0.8);
    for (let i = 10; i <= segments; i++) {
      const t = i / segments;
      const px = x + t * width;
      const heightMultiplier = Math.sin(t * Math.PI);
      const py =
        y -
        (baseHeight * heightMultiplier +
          topHeight * Math.pow(heightMultiplier, 2));
      graphics.lineTo(px, py);
    }
    graphics.lineTo(x + width, y);
    graphics.lineTo(x + width * 0.5, y);
    graphics.closePath();
    graphics.fillPath();

    // Highlight en el lado izquierdo
    graphics.fillStyle(0xffffff, 0.4);
    graphics.beginPath();
    graphics.moveTo(x, y);
    for (let i = 0; i <= 10; i++) {
      const t = i / segments;
      const px = x + t * width;
      const heightMultiplier = Math.sin(t * Math.PI);
      const py =
        y -
        (baseHeight * heightMultiplier +
          topHeight * Math.pow(heightMultiplier, 2));
      graphics.lineTo(px, py);
    }
    graphics.lineTo(x + width * 0.5, y - baseHeight * 0.8);
    graphics.lineTo(x + width * 0.5, y);
    graphics.closePath();
    graphics.fillPath();

    // Contorno superior
    graphics.lineStyle(2, 0xd0e8f0, 0.7);
    graphics.beginPath();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x + t * width;
      const heightMultiplier = Math.sin(t * Math.PI);
      const py =
        y -
        (baseHeight * heightMultiplier +
          topHeight * Math.pow(heightMultiplier, 2));
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    graphics.strokePath();

    // Detalles de nieve - pequeños círculos
    graphics.fillStyle(0xf0f5f8, 0.8);
    graphics.fillCircle(x + width * 0.25, y - baseHeight * 0.6, 6);
    graphics.fillCircle(
      x + width * 0.5,
      y - (baseHeight + topHeight) * 0.85,
      8
    );
    graphics.fillCircle(x + width * 0.75, y - baseHeight * 0.5, 5);

    // Textura de nieve
    graphics.fillStyle(0xd5e5ef, 0.5);
    for (let i = 0; i < 12; i++) {
      const t = Math.random();
      const px = x + t * width;
      const heightMultiplier = Math.sin(t * Math.PI);
      const maxHeight =
        baseHeight * heightMultiplier +
        topHeight * Math.pow(heightMultiplier, 2);
      const py = y - Math.random() * maxHeight * 0.8;
      graphics.fillCircle(px, py, 1.5);
    }
  }
  private setupPhysics(surfaceLayer: Phaser.Tilemaps.TilemapLayer): void {
    // Crear un sprite invisible para física
    const physicsSprite = this.scene.physics.add.sprite(
      this.x + 32,
      this.y - 37, // Ajustado para la nueva altura de ~75px
      ""
    );
    physicsSprite.setVisible(false);
    physicsSprite.body.setSize(64, 75); // Altura reducida a 75px para coincidir con el montículo
    physicsSprite.body.setImmovable(true);
    physicsSprite.body.moves = false;
    (physicsSprite as any).isSnowWall = true;
    (physicsSprite as any).snowWallRef = this;
    // Guardar referencia para colisiones
    (this as any).physicsSprite = physicsSprite;
  }
  /**
   * Destruye el muro con una animación de dispersión
   * @param direction Dirección del soplido (-1 izquierda, 1 derecha)
   */
  public destroyWall(direction: number = 1): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    // Sonido de destrucción
    this.scene.sound.play("blow_sound", { volume: 0.3 });
    // Animar cada bloque dispersándose
    this.snowBlocks.forEach((block, index) => {
      // Partículas de nieve dispersándose
      const particles = this.scene.add.particles(
        this.x + block.x + 32,
        this.y + block.y + 32,
        "snow_particle",
        {
          speed: { min: 100, max: 300 },
          angle: {
            min: direction > 0 ? -30 : 150,
            max: direction > 0 ? 30 : 210,
          },
          scale: { start: 1, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 800,
          quantity: 20,
        }
      );
      // Fade out del bloque
      this.scene.tweens.add({
        targets: block,
        alpha: 0,
        x: block.x + direction * 100,
        y: block.y - 50,
        duration: 600,
        delay: index * 100,
        ease: "Cubic.easeOut",
        onComplete: () => {
          block.destroy();
          particles.destroy();
        },
      });
    });
    // Destruir física después de la animación
    setTimeout(() => {
      if ((this as any).physicsSprite) {
        (this as any).physicsSprite.destroy();
      }
      super.destroy();
    }, 800);
  }
  public isInRange(
    playerX: number,
    playerY: number,
    range: number = 100
  ): boolean {
    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      this.x + 32,
      this.y - 37 // Ajustado para la nueva altura de ~75px
    );
    return distance <= range;
  }
  public getPhysicsSprite(): Phaser.Physics.Arcade.Sprite | undefined {
    return (this as any).physicsSprite;
  }
}
