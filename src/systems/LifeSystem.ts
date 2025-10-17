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

  private showCounters: boolean = true; // Controla si se muestran los contadores

  // Barra de salud del boss
  private bossHealthContainer?: Phaser.GameObjects.Container;
  private bossHealthBarBackground?: Phaser.GameObjects.Graphics;
  private bossHealthBarFill?: Phaser.GameObjects.Graphics;
  private bossHealthBarBorder?: Phaser.GameObjects.Graphics;
  private bossNameText?: Phaser.GameObjects.Text;
  private bossHPText?: Phaser.GameObjects.Text; // Texto "HP"
  private currentBossHealth: number = 1; // TEMPORAL PARA TESTEO - antes era 100
  private maxBossHealth: number = 1; // TEMPORAL PARA TESTEO - antes era 100

  // Botón EXIT (solo visible en niveles normales, no en boss)
  private exitButtonGraphics?: Phaser.GameObjects.Graphics;
  private exitButtonText?: Phaser.GameObjects.Text;
  private exitButtonHitArea?: Phaser.GameObjects.Rectangle;
  private onExitCallback?: () => void; // Callback para manejar el exit desde la escena

  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    showCounters: boolean = true,
    bossName?: string // Nombre del boss para mostrar en el header
  ) {
    this.scene = scene;
    this.showCounters = showCounters;
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

    // Crear los 3 contadores en el header (mini-pingü, monedas, llaves) solo si están habilitados
    if (this.showCounters) {
      this.createMiniPinguCounter();
      this.createCoinCounter();
      this.createKeyCounter();
    }

    // Crear barra de salud del boss si se proporciona un nombre
    if (bossName) {
      this.createBossHealthBar(bossName);
    } else {
      // Solo crear botón EXIT si NO es nivel de boss
      this.createExitButton();
    }

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

      // Texto contador "0" con fuente Fobble
      this.miniPinguCountText = this.scene.add.text(15, 0, "0", {
        fontSize: "38px", // Aumentado de 28px a 38px
        fontFamily: "Fobble",
        color: "#FFD700", // Amarillo dorado
        stroke: "#000000",
        strokeThickness: 6, // Aumentado de 5 a 6
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

      // Texto contador "0" con fuente Fobble
      this.coinCountText = this.scene.add.text(15, 0, "0", {
        fontSize: "38px", // Aumentado de 28px a 38px
        fontFamily: "Fobble",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 6, // Aumentado de 5 a 6
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
      this.coinCountText.setText(`${count}`);
    }
  }

  /**
   * Actualizar el contador de mini-pingüinos
   */
  public updateMiniPinguCount(count: number): void {
    if (this.miniPinguCountText) {
      this.miniPinguCountText.setText(`${count}`);
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

      // Texto contador "0" con fuente Fobble
      this.keyCountText = this.scene.add.text(15, 0, "0", {
        fontSize: "38px", // Aumentado de 28px a 38px
        fontFamily: "Fobble",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 6, // Aumentado de 5 a 6
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
      this.keyCountText.setText(`${count}`);
    }
  }

  /**
   * Crear barra de salud del boss en el header
   */
  private createBossHealthBar(bossName: string): void {
    // Crear contenedor para la barra de salud del boss
    this.bossHealthContainer = this.scene.add.container(
      this.scene.cameras.main.width / 2,
      40 // Centro vertical del header
    );

    // Dimensiones de la barra (reducida para mejor centrado)
    const barWidth = 350; // Reducido de 400 a 350
    const barHeight = 30; // Aumentado de 24 a 30 para más grosor

    // Fondo de la barra (gris oscuro)
    this.bossHealthBarBackground = this.scene.add.graphics();
    this.bossHealthBarBackground.fillStyle(0x3a3a3a, 1);
    this.bossHealthBarBackground.fillRoundedRect(
      -barWidth / 2,
      -barHeight / 2,
      barWidth,
      barHeight,
      8
    );
    this.bossHealthContainer.add(this.bossHealthBarBackground);

    // Barra de salud (rojo/naranja degradado)
    this.bossHealthBarFill = this.scene.add.graphics();
    this.updateBossHealthBar(); // Inicializar con 100%
    this.bossHealthContainer.add(this.bossHealthBarFill);

    // Borde de la barra (cartoon style - negro grueso)
    this.bossHealthBarBorder = this.scene.add.graphics();
    this.bossHealthBarBorder.lineStyle(4, 0x000000, 1);
    this.bossHealthBarBorder.strokeRoundedRect(
      -barWidth / 2,
      -barHeight / 2,
      barWidth,
      barHeight,
      8
    );
    this.bossHealthContainer.add(this.bossHealthBarBorder);

    // Texto "HP" a la izquierda de la barra (alineado desde el borde derecho)
    this.bossHPText = this.scene.add.text(
      -barWidth / 2 - 30, // 30px a la izquierda de la barra
      0,
      "HP",
      {
        fontFamily: "Fobble",
        fontSize: "36px", // Aumentado de 26px a 36px
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 7, // Aumentado de 6 a 7
        fontStyle: "bold",
      }
    );
    this.bossHPText.setOrigin(1, 0.5); // Alineado desde la derecha para mantener distancia con barra
    this.bossHealthContainer.add(this.bossHPText);

    // Texto "BOSS" a la derecha de la barra (alineado desde el borde izquierdo)
    this.bossNameText = this.scene.add.text(
      barWidth / 2 + 30, // Misma distancia que HP (30px)
      0,
      "BOSS",
      {
        fontFamily: "Fobble",
        fontSize: "36px", // Aumentado de 26px a 36px (mismo que HP)
        color: "#ffaa00", // Color naranja/dorado
        stroke: "#000000",
        strokeThickness: 7, // Aumentado de 6 a 7 (mismo que HP)
        fontStyle: "bold",
      }
    );
    this.bossNameText.setOrigin(0, 0.5); // Alineado desde la izquierda para mantener distancia con barra
    this.bossHealthContainer.add(this.bossNameText);

    // Agregar el contenedor al contenedor principal
    this.container.add(this.bossHealthContainer);
  }

  /**
   * Crear botón EXIT (pequeño, rojo, debajo del header a la derecha)
   */
  private createExitButton(): void {
    const buttonWidth = 100;
    const buttonHeight = 40;
    const buttonX = this.scene.cameras.main.width - buttonWidth - 20; // 20px de margen derecho
    const buttonY = 90; // Debajo del header de 80px + 10px de margen

    // Crear Graphics para el botón (rectángulo redondeado rojo)
    this.exitButtonGraphics = this.scene.add.graphics();
    this.exitButtonGraphics.fillStyle(0xcc0000, 1); // Rojo oscuro
    this.exitButtonGraphics.fillRoundedRect(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      8
    );
    // Borde negro
    this.exitButtonGraphics.lineStyle(3, 0x000000, 1);
    this.exitButtonGraphics.strokeRoundedRect(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      8
    );

    // Texto "EXIT" en blanco
    this.exitButtonText = this.scene.add.text(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      "EXIT",
      {
        fontFamily: "Fobble",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        fontStyle: "bold",
      }
    );
    this.exitButtonText.setOrigin(0.5, 0.5);

    // Crear área interactiva (hitbox) - IMPORTANTE: necesita fillColor para ser clickable
    this.exitButtonHitArea = this.scene.add.rectangle(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      0x000000, // Color (invisible porque alpha será 0.01)
      0.01 // Casi invisible pero clickable
    );
    this.exitButtonHitArea.setInteractive({ useHandCursor: true });
    this.exitButtonHitArea.setOrigin(0.5, 0.5);
    this.exitButtonHitArea.setScrollFactor(0); // No se mueve con la cámara
    this.exitButtonHitArea.setDepth(1001); // Por encima del container (1000)

    // Hover effect - rojo más oscuro
    this.exitButtonHitArea.on("pointerover", () => {
      if (this.exitButtonGraphics) {
        this.exitButtonGraphics.clear();
        this.exitButtonGraphics.fillStyle(0x990000, 1); // Rojo más oscuro
        this.exitButtonGraphics.fillRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8
        );
        this.exitButtonGraphics.lineStyle(3, 0x000000, 1);
        this.exitButtonGraphics.strokeRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8
        );
      }
    });

    // Hover out - volver a rojo normal
    this.exitButtonHitArea.on("pointerout", () => {
      if (this.exitButtonGraphics) {
        this.exitButtonGraphics.clear();
        this.exitButtonGraphics.fillStyle(0xcc0000, 1); // Rojo normal
        this.exitButtonGraphics.fillRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8
        );
        this.exitButtonGraphics.lineStyle(3, 0x000000, 1);
        this.exitButtonGraphics.strokeRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8
        );
      }
    });

    // Click event - llamar callback si existe
    this.exitButtonHitArea.on("pointerdown", () => {
      console.log("EXIT button clicked!"); // Debug
      // Efecto de escala al hacer click
      if (this.exitButtonText) {
        this.scene.tweens.add({
          targets: this.exitButtonText,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // Ejecutar callback después de la animación
            if (this.onExitCallback) {
              this.onExitCallback();
            }
          },
        });
      }
    });

    // NO agregar al container, configurar individualmente
    // Graphics
    this.exitButtonGraphics.setScrollFactor(0);
    this.exitButtonGraphics.setDepth(1000);

    // Text
    this.exitButtonText.setScrollFactor(0);
    this.exitButtonText.setDepth(1001);

    // HitArea ya tiene scrollFactor(0) y depth(1001) configurados arriba
  }

  /**
   * Establecer callback para el botón EXIT
   * @param callback Función a ejecutar cuando se presione EXIT
   */
  public setExitCallback(callback: () => void): void {
    this.onExitCallback = callback;
  }

  /**
   * Actualizar la barra de salud del boss visualmente
   */
  private updateBossHealthBar(): void {
    if (!this.bossHealthBarFill) return;

    const barWidth = 350; // Actualizado a 350
    const barHeight = 30; // Actualizado a 30
    const healthPercentage = this.currentBossHealth / this.maxBossHealth;
    const fillWidth = barWidth * healthPercentage;

    // Limpiar y redibujar
    this.bossHealthBarFill.clear();

    // Color según el porcentaje de vida
    let fillColor = 0xff4444; // Rojo
    if (healthPercentage > 0.66) {
      fillColor = 0x44ff44; // Verde
    } else if (healthPercentage > 0.33) {
      fillColor = 0xffaa44; // Naranja
    }

    this.bossHealthBarFill.fillStyle(fillColor, 1);
    this.bossHealthBarFill.fillRoundedRect(
      -barWidth / 2 + 2, // Pequeño offset para no cubrir el borde
      -barHeight / 2 + 2,
      fillWidth - 4,
      barHeight - 4,
      6
    );
  }

  /**
   * Reducir la salud del boss
   */
  public damageBoss(damage: number): void {
    this.currentBossHealth = Math.max(0, this.currentBossHealth - damage);
    this.updateBossHealthBar();
  }

  /**
   * Obtener la salud actual del boss
   */
  public getBossHealth(): number {
    return this.currentBossHealth;
  }

  /**
   * Verificar si el boss está derrotado
   */
  public isBossDefeated(): boolean {
    return this.currentBossHealth <= 0;
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
