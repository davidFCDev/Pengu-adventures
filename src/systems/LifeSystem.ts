export class LifeSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private hearts: Phaser.GameObjects.Image[] = [];
  private currentLives: number = 3;
  private maxLives: number = 3;
  private headerBackground: Phaser.GameObjects.Rectangle;

  // Contador de monedas debajo del header
  private coinCountContainer?: Phaser.GameObjects.Container;
  private coinIcon?: Phaser.GameObjects.Image;
  private coinCountText?: Phaser.GameObjects.Text;

  // Contador de mini-pingüinos debajo del contador de monedas
  private miniPinguCountContainer?: Phaser.GameObjects.Container;
  private miniPinguIcon?: Phaser.GameObjects.Image;
  private miniPinguCountText?: Phaser.GameObjects.Text;

  // Contador de llaves debajo del contador de mini-pingüinos
  private keyCountContainer?: Phaser.GameObjects.Container;
  private keyIcon?: Phaser.GameObjects.Sprite;
  private keyCountText?: Phaser.GameObjects.Text;

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

    // Crear contador de monedas debajo del header
    this.createCoinCounter();

    // Crear contador de mini-pingüinos
    this.createMiniPinguCounter();

    // Crear contador de llaves
    this.createKeyCounter();

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
  }

  /**
   * Crear contador de monedas debajo del header (esquina superior izquierda)
   */
  private createCoinCounter(): void {
    // Posición debajo del header con margen
    const xPosition = 35; // Margen desde el borde izquierdo
    const yPosition = 115; // Debajo del header (80px + 35px de margen)

    // Crear contenedor para el contador de monedas
    this.coinCountContainer = this.scene.add.container(xPosition, yPosition);
    this.coinCountContainer.setScrollFactor(0);
    this.coinCountContainer.setDepth(1000);

    // Verificar si existe la textura de moneda
    if (this.scene.textures.exists("PT_TOKEN_MASTER_001")) {
      // Icono de moneda
      this.coinIcon = this.scene.add.image(0, 0, "PT_TOKEN_MASTER_001");
      this.coinIcon.setScale(0.025); // Tamaño apropiado
      this.coinCountContainer.add(this.coinIcon);

      // Texto contador "x0"
      this.coinCountText = this.scene.add.text(25, 0, "x0", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
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
   * Crear contador de mini-pingüinos debajo del contador de monedas
   */
  private createMiniPinguCounter(): void {
    // Posición debajo del contador de monedas
    const xPosition = 35;
    const yPosition = 160; // Debajo del contador de monedas (115 + 45)

    // Crear contenedor para el contador de mini-pingüinos
    this.miniPinguCountContainer = this.scene.add.container(
      xPosition,
      yPosition
    );
    this.miniPinguCountContainer.setScrollFactor(0);
    this.miniPinguCountContainer.setDepth(1000);

    // Verificar si existe la textura de mini-pingüino
    if (this.scene.textures.exists("mini-pingu")) {
      // Icono de mini-pingüino
      this.miniPinguIcon = this.scene.add.image(0, 0, "mini-pingu");
      this.miniPinguIcon.setScale(0.5); // Escala pequeña
      this.miniPinguCountContainer.add(this.miniPinguIcon);

      // Texto contador "x0"
      this.miniPinguCountText = this.scene.add.text(25, 0, "x0", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#00D4FF",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      });
      this.miniPinguCountText.setOrigin(0, 0.5);
      this.miniPinguCountContainer.add(this.miniPinguCountText);
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
   * Crear contador de llaves debajo del contador de mini-pingüinos
   */
  private createKeyCounter(): void {
    // Posición debajo del contador de mini-pingüinos
    const xPosition = 35;
    const yPosition = 205; // Debajo del contador de mini-pingüinos (160 + 45)

    // Crear contenedor para el contador de llaves
    this.keyCountContainer = this.scene.add.container(xPosition, yPosition);
    this.keyCountContainer.setScrollFactor(0);
    this.keyCountContainer.setDepth(1000);

    // Verificar si existe el spritesheet con frames
    if (this.scene.textures.exists("spritesheet-tiles-frames")) {
      // Calcular el frame de la llave: fila 12, columna 12
      // El spritesheet tiene tiles de 64x64
      const texture = this.scene.textures.get("spritesheet-tiles-frames");
      const tileWidth = 64;
      const imageWidth = texture.source[0].width;
      const columnsPerRow = Math.floor(imageWidth / tileWidth);

      // Frame index = (fila × columnas_por_fila) + columna
      const keyFrame = 12 * columnsPerRow + 12;

      console.log(
        `🗝️ LifeSystem: Usando frame ${keyFrame} para la llave (${columnsPerRow} columnas por fila)`
      );

      // Crear icono de llave usando el frame calculado del spritesheet
      this.keyIcon = this.scene.add.sprite(
        0,
        0,
        "spritesheet-tiles-frames",
        keyFrame
      );
      this.keyIcon.setScale(0.8); // Escala más grande para mejor visibilidad
      this.keyCountContainer.add(this.keyIcon);

      // Texto contador "x0"
      this.keyCountText = this.scene.add.text(25, 0, "x0", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#FFD700", // Color dorado para las llaves
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
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
