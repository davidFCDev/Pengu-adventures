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
    
    console.log(`🏗️ Creando SnowWall en posición (${x}, ${y})`);

    // Crear el muro visual (2 bloques de 64x64 apilados)
    this.createSnowBlocks();

    // Crear hitbox física para colisión
    this.setupPhysics(surfaceLayer);
    
    console.log(`✅ SnowWall completado, visible: ${this.visible}, depth: ${this.depth}`);
  }

  private createSnowBlocks(): void {
    console.log("🎨 Dibujando bloques de nieve...");
    
    // Bloque inferior (64x64)
    const lowerBlock = this.scene.add.graphics();
    this.drawSnowBlock(lowerBlock, 0, 0);
    this.add(lowerBlock);
    this.snowBlocks.push(lowerBlock);
    console.log("  ✅ Bloque inferior creado");

    // Bloque superior (64x64)
    const upperBlock = this.scene.add.graphics();
    this.drawSnowBlock(upperBlock, 0, -64);
    this.add(upperBlock);
    this.snowBlocks.push(upperBlock);
    console.log("  ✅ Bloque superior creado");
    
    // Agregar texto de debug temporalmente
    const debugText = this.scene.add.text(0, -80, "SNOW WALL", {
      fontSize: "12px",
      color: "#00ff00",
      backgroundColor: "#000000"
    });
    this.add(debugText);
  }

  private drawSnowBlock(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Fondo blanco nieve
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRect(x, y, 64, 64);

    // Sombras y detalles para efecto de nieve
    graphics.fillStyle(0xe8f4f8, 0.6);
    graphics.fillRect(x + 5, y + 5, 54, 10);
    graphics.fillRect(x + 5, y + 25, 30, 15);
    graphics.fillRect(x + 40, y + 45, 20, 15);

    // Borde oscuro para definición
    graphics.lineStyle(2, 0xccddee, 0.8);
    graphics.strokeRect(x, y, 64, 64);

    // Puntos de nieve para textura
    graphics.fillStyle(0xd0e8f0, 0.5);
    for (let i = 0; i < 8; i++) {
      const px = x + Math.random() * 60 + 2;
      const py = y + Math.random() * 60 + 2;
      graphics.fillCircle(px, py, 2);
    }
  }

  private setupPhysics(surfaceLayer: Phaser.Tilemaps.TilemapLayer): void {
    // Crear un sprite invisible para física
    const physicsSprite = this.scene.physics.add.sprite(this.x + 32, this.y - 32, "");
    physicsSprite.setVisible(false);
    physicsSprite.body.setSize(64, 128); // 2 bloques de altura
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

    console.log("❄️ Destruyendo muro de nieve en dirección:", direction);

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
          angle: { min: direction > 0 ? -30 : 150, max: direction > 0 ? 30 : 210 },
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

  public isInRange(playerX: number, playerY: number, range: number = 100): boolean {
    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      this.x + 32,
      this.y - 32
    );
    return distance <= range;
  }

  public getPhysicsSprite(): Phaser.Physics.Arcade.Sprite | undefined {
    return (this as any).physicsSprite;
  }
}
