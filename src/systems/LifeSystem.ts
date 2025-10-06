export class LifeSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private hearts: Phaser.GameObjects.Image[] = [];
  private currentLives: number = 3;
  private maxLives: number = 3;
  private headerBackground: Phaser.GameObjects.Rectangle;

  // Contadores en el header
  private miniPinguCountContainer?: Phaser.GameObjects.Container;
  private miniPinguIcon?: Phaser.GameObjects.Image;
  private miniPinguCountText?: Phaser.GameObjects.Text;

  private coinCountContainer?: Phaser.GameObjects.Container;
  private coinIcon?: Phaser.GameObjects.Image;
  private coinCountText?: Phaser.GameObjects.Text;

  private keyCountContainer?: Phaser.GameObjects.Container;
  private keyIcon?: Phaser.GameObjects.Sprite;
  private keyCountText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    this.scene = scene;
    // Crear contenedor principal
    this.container = scene.add.container(x, y);
    // Crear fondo del header (más oscuro)
    this.headerBackground = scene.add.rectangle(
      0,
      0,
      scene.cameras.main.width,
      80,
      0x0d0d0d, // Oscuro
      0.95
    );
    this.headerBackground.setOrigin(0, 0);
    this.container.add(this.headerBackground);

    // Crear la textura del corazón si no existe
    this.createHeartTexture();

    // Crear los 3 contadores en el header (mini-pingü, monedas, llaves)
    this.createMiniPinguCounter();
    this.createCoinCounter();
    this.createKeyCounter();

    // Crear los corazones FUERA del header (debajo del header, centrados)
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

  /**
   * Crear corazones FUERA del header, debajo y centrados
   */
  private createHearts(): void {
    const heartSpacing = 45; // Espacio entre corazones
    const startX =
      this.scene.cameras.main.width / 2 -
      (heartSpacing * (this.maxLives - 1)) / 2;
    const heartY = 110; // Debajo del header (header = 80px alto)

    // Debug: verificar que la textura esté cargada
    if (!this.scene.textures.exists("heart_spritesheet")) {
      console.error("Heart spritesheet no encontrado!");
      return;
    }

    for (let i = 0; i < this.maxLives; i++) {
      // Usar el spritesheet de corazones, frame 0 (corazón lleno)
      const heart = this.scene.add.image(
        startX + i * heartSpacing,
        heartY,
        "heart_spritesheet",
        0 // Frame 0 = corazón lleno
      );
      heart.setScale(1.3); // Reducido ligeramente (antes 1.5)
      this.hearts.push(heart);
      this.container.add(heart);
    }
  }

  /**
   * Crear contador de mini-pingüinos en el header (izquierda)
   */
  private createMiniPinguCounter(): void {
    // Posición izquierda con espaciado equilibrado (evenly)
    const headerWidth = this.scene.cameras.main.width;
    const xPosition = headerWidth * 0.25; // 25% del ancho
    const yPosition = 40; // Centro vertical del header

    // Crear contenedor para el contador de mini-pingüinos (centrado en su posición)
    this.miniPinguCountContainer = this.scene.add.container(
      xPosition,
      yPosition
    );
    this.miniPinguCountContainer.setScrollFactor(0);
    this.miniPinguCountContainer.setDepth(1000);

    // Verificar si existe la textura de mini-pingüino
    if (this.scene.textures.exists("mini-pingu")) {
      // Icono de mini-pingüino (centrado en el contenedor)
      this.miniPinguIcon = this.scene.add.image(-15, 0, "mini-pingu");
      this.miniPinguIcon.setScale(0.6);
      this.miniPinguCountContainer.add(this.miniPinguIcon);

      // Texto contador "x0" con fuente Pixelify Sans
      this.miniPinguCountText = this.scene.add.text(15, 0, "x0", {
        fontSize: "28px",
        fontFamily: "Pixelify Sans",
        color: "#FFD700", // Amarillo dorado
        stroke: "#000000",
        strokeThickness: 5,
      });
      this.miniPinguCountText.setOrigin(0, 0.5);
      this.miniPinguCountContainer.add(this.miniPinguCountText);
    }
  }

  /**
   * Crear contador de monedas en el header (centro)
   */
  private createCoinCounter(): void {
    // Posición central con espaciado equilibrado (evenly)
    const headerWidth = this.scene.cameras.main.width;
    const xPosition = headerWidth * 0.5; // 50% del ancho (centro exacto)
    const yPosition = 40; // Centro vertical del header

    // Crear contenedor para el contador de monedas (centrado en su posición)
    this.coinCountContainer = this.scene.add.container(xPosition, yPosition);
    this.coinCountContainer.setScrollFactor(0);
    this.coinCountContainer.setDepth(1000);

    // Verificar si existe la textura de moneda
    if (this.scene.textures.exists("PT_TOKEN_MASTER_001")) {
      // Icono de moneda (centrado en el contenedor)
      this.coinIcon = this.scene.add.image(-15, 0, "PT_TOKEN_MASTER_001");
      this.coinIcon.setScale(0.8); // Aumentado para que se vea bien en el header
      this.coinCountContainer.add(this.coinIcon);

      // Texto contador "x0" con fuente Pixelify Sans
      this.coinCountText = this.scene.add.text(15, 0, "x0", {
        fontSize: "28px",
        fontFamily: "Pixelify Sans",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 5,
      });
      this.coinCountText.setOrigin(0, 0.5);
      this.coinCountContainer.add(this.coinCountText);
    }
  }

  /**
   * Actualizar el contador de monedas
   */
  public updateCoinCount(count: number): void {
    if (this.coinCountText) {
      this.coinCountText.setText(`x${count}`);
    }
  }

  /**
   * Actualizar el contador de mini-pingüinos
   */
  public updateMiniPinguCount(count: number): void {
    if (this.miniPinguCountText) {
      this.miniPinguCountText.setText(`x${count}`);
    }
  }

  /**
   * Crear contador de llaves en el header (derecha)
   */
  private createKeyCounter(): void {
    // Posición derecha con espaciado equilibrado (evenly)
    const headerWidth = this.scene.cameras.main.width;
    const xPosition = headerWidth * 0.75; // 75% del ancho
    const yPosition = 40; // Centro vertical del header

    // Crear contenedor para el contador de llaves (centrado en su posición)
    this.keyCountContainer = this.scene.add.container(xPosition, yPosition);
    this.keyCountContainer.setScrollFactor(0);
    this.keyCountContainer.setDepth(1000);

    // Verificar si existe el spritesheet con frames
    if (this.scene.textures.exists("spritesheet-tiles-frames")) {
      // Calcular el frame de la llave: fila 12, columna 12
      const texture = this.scene.textures.get("spritesheet-tiles-frames");
      const tileWidth = 64;
      const imageWidth = texture.source[0].width;
      const columnsPerRow = Math.floor(imageWidth / tileWidth);
      const keyFrame = 12 * columnsPerRow + 12;

      // Crear icono de llave (centrado en el contenedor)
      this.keyIcon = this.scene.add.sprite(
        -15,
        0,
        "spritesheet-tiles-frames",
        keyFrame
      );
      this.keyIcon.setScale(0.9);
      this.keyCountContainer.add(this.keyIcon);

      // Texto contador "x0" con fuente Pixelify Sans
      this.keyCountText = this.scene.add.text(15, 0, "x0", {
        fontSize: "28px",
        fontFamily: "Pixelify Sans",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 5,
      });
      this.keyCountText.setOrigin(0, 0.5);
      this.keyCountContainer.add(this.keyCountText);
    }
  }

  /**
   * Actualizar el contador de llaves
   */
  public updateKeyCount(count: number): void {
    if (this.keyCountText) {
      this.keyCountText.setText(`x${count}`);
    }
  }

  public loseLife(): boolean {
    if (this.currentLives <= 0) {
      return false; // Ya no hay vidas
    }
    this.currentLives--;
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
        },
      });
    }
    const hasLivesLeft = this.currentLives > 0;
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
    // Cancelar todos los tweens de los corazones
    this.hearts.forEach((heart) => {
      this.scene.tweens.killTweensOf(heart);
      heart.setFrame(0); // Frame 0 = corazón lleno
      heart.setAlpha(1);
      heart.setScale(1.5);
    });
    this.currentLives = this.maxLives;
  }
  public getCurrentLives(): number {
    return this.currentLives;
  }
  public getMaxLives(): number {
    return this.maxLives;
  }
  public isGameOver(): boolean {
    const gameOver = this.currentLives <= 0;
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
