export class LifeSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private hearts: Phaser.GameObjects.Image[] = [];
  private currentLives: number = 3;
  private maxLives: number = 3;
  private headerBackground: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    this.scene = scene;

    // Crear contenedor principal
    this.container = scene.add.container(x, y);

    // Crear fondo del header
    this.headerBackground = scene.add.rectangle(
      0,
      0,
      scene.cameras.main.width,
      80,
      0x1a1a1a,
      0.9
    );
    this.headerBackground.setOrigin(0, 0);
    this.container.add(this.headerBackground);

    // Crear la textura del corazón si no existe
    this.createHeartTexture();

    // Crear los corazones
    this.createHearts();

    // Mantener el sistema de vidas fijo en la pantalla
    this.container.setScrollFactor(0);
    this.container.setDepth(1000); // Asegurar que esté por encima de todo
  }

  private createHeartTexture(): void {
    // Ya no es necesario cargar la textura aquí,
    // se carga en PreloadScene
    // Este método se mantiene por compatibilidad pero no hace nada
  }

  private createHearts(): void {
    const heartSpacing = 50;
    const startX =
      this.scene.cameras.main.width / 2 -
      (heartSpacing * (this.maxLives - 1)) / 2;
    const heartY = 40;

    // Debug: verificar que la textura esté cargada
    if (!this.scene.textures.exists("heart_spritesheet")) {
      console.error("Heart spritesheet no encontrado!");
      return;
    }

    console.log("Creando corazones con spritesheet real...");

    for (let i = 0; i < this.maxLives; i++) {
      // Usar el spritesheet de corazones, frame 0 (corazón lleno)
      const heart = this.scene.add.image(
        startX + i * heartSpacing,
        heartY,
        "heart_spritesheet",
        0 // Frame 0 = corazón lleno
      );
      heart.setScale(1.5); // Un poco más grande para mejor visibilidad
      this.hearts.push(heart);
      this.container.add(heart);
    }

    console.log(`✅ Creados ${this.hearts.length} corazones con spritesheet`);
  }

  public loseLife(): boolean {
    console.log(
      `💔 LifeSystem.loseLife() llamado. Vidas actuales: ${this.currentLives}`
    );

    if (this.currentLives <= 0) {
      console.log("💀 Ya no hay vidas disponibles");
      return false; // Ya no hay vidas
    }

    this.currentLives--;
    console.log(`💔 Vida perdida. Vidas restantes: ${this.currentLives}`);

    // Animar la pérdida del corazón
    const heartIndex = this.currentLives; // El corazón que se va a vaciar
    if (this.hearts[heartIndex]) {
      const heart = this.hearts[heartIndex];

      // Efecto de parpadeo y escala
      this.scene.tweens.add({
        targets: heart,
        scaleX: 2.0,
        scaleY: 2.0,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          // Cambiar a corazón vacío (frame 2)
          heart.setFrame(2);
          heart.setAlpha(0.8);
          heart.setScale(1.5);

          console.log(`💔 Corazón ${heartIndex} animado como vacío`);
        },
      });
    }

    const hasLivesLeft = this.currentLives > 0;
    console.log(`💔 Retornando hasLivesLeft: ${hasLivesLeft}`);
    return hasLivesLeft;
  }

  public gainLife(): void {
    if (this.currentLives >= this.maxLives) {
      return; // Ya tiene todas las vidas
    }

    const heartIndex = this.currentLives;
    if (this.hearts[heartIndex]) {
      const heart = this.hearts[heartIndex];

      // Restaurar corazón (frame 0 = lleno)
      heart.setFrame(0);
      heart.setAlpha(1);

      // Efecto de recuperación
      this.scene.tweens.add({
        targets: heart,
        scaleX: 2.0,
        scaleY: 2.0,
        duration: 200,
        yoyo: true,
        ease: "Back.easeOut",
        onComplete: () => {
          heart.setScale(1.5);
        },
      });
    }

    this.currentLives++;
  }

  public resetLives(): void {
    this.currentLives = this.maxLives;

    // Restaurar todos los corazones
    this.hearts.forEach((heart) => {
      heart.setFrame(0); // Frame 0 = corazón lleno
      heart.setAlpha(1);
      heart.setScale(1.5);
    });
  }

  /**
   * Resetear vidas inmediatamente, cancelando animaciones pendientes
   */
  public resetLivesImmediate(): void {
    console.log("🔄 Reseteando vidas inmediatamente, cancelando animaciones");

    // Cancelar todos los tweens de los corazones
    this.hearts.forEach((heart) => {
      this.scene.tweens.killTweensOf(heart);
      heart.setFrame(0); // Frame 0 = corazón lleno
      heart.setAlpha(1);
      heart.setScale(1.5);
    });

    this.currentLives = this.maxLives;
    console.log(`✅ Vidas reseteadas inmediatamente a ${this.maxLives}`);
  }

  public getCurrentLives(): number {
    return this.currentLives;
  }

  public getMaxLives(): number {
    return this.maxLives;
  }

  public isGameOver(): boolean {
    const gameOver = this.currentLives <= 0;
    console.log(
      `🎮 isGameOver() llamado: ${gameOver} (vidas: ${this.currentLives})`
    );
    return gameOver;
  }

  public destroy(): void {
    this.container.destroy();
  }

  // Actualizar posición del header cuando cambie el tamaño de la cámara
  public updatePosition(): void {
    this.headerBackground.setSize(this.scene.cameras.main.width, 80);

    // Reposicionar corazones
    const heartSpacing = 50;
    const startX =
      this.scene.cameras.main.width / 2 -
      (heartSpacing * (this.maxLives - 1)) / 2;

    this.hearts.forEach((heart, index) => {
      heart.setPosition(startX + index * heartSpacing, 40);
    });
  }
}
