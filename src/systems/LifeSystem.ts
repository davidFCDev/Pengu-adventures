export class LifeSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private hearts: Phaser.GameObjects.Image[] = [];
  private currentLives: number = 3;
  private maxLives: number = 3;
  private footerBackground: Phaser.GameObjects.Rectangle;
  private footerBorder!: Phaser.GameObjects.Graphics;

  // Altura del footer y posición base
  private readonly FOOTER_HEIGHT = 80;
  private get canvasHeight(): number {
    return this.scene.cameras.main.height;
  }
  private get footerY(): number {
    return this.canvasHeight - this.FOOTER_HEIGHT;
  }

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
  private currentBossHealth: number = 100;
  private maxBossHealth: number = 100;

  // Botón SAVE
  private saveButtonGraphics?: Phaser.GameObjects.Graphics;
  private saveButtonText?: Phaser.GameObjects.Text;
  private saveButtonHitArea?: Phaser.GameObjects.Rectangle;
  private onSaveCallback?: () => void; // Callback para manejar el save desde la escena

  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    showCounters: boolean = true,
    bossName?: string, // Nombre del boss para mostrar en el header
  ) {
    this.scene = scene;
    this.showCounters = showCounters;
    // Crear contenedor principal
    this.container = scene.add.container(x, y);

    // Crear fondo del footer - estilo Pudgy (pegado abajo)
    this.footerBackground = scene.add.rectangle(
      0,
      this.footerY,
      scene.cameras.main.width,
      this.FOOTER_HEIGHT,
      0xe8f4f8, // Blanco/celeste claro (estilo Pudgy)
      1,
    );
    this.footerBackground.setOrigin(0, 0);
    this.container.add(this.footerBackground);

    // Crear borde superior negro del footer - estilo Pudgy
    this.footerBorder = scene.add.graphics();
    this.footerBorder.lineStyle(6, 0x000000, 1);
    this.footerBorder.beginPath();
    this.footerBorder.moveTo(0, this.footerY);
    this.footerBorder.lineTo(scene.cameras.main.width, this.footerY);
    this.footerBorder.strokePath();
    this.footerBorder.setScrollFactor(0);
    this.footerBorder.setDepth(1000);
    this.container.add(this.footerBorder);

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
      // Crear botón SAVE solo si el usuario tiene el item "save-state"
      try {
        const hasSaveItem =
          window.FarcadeSDK &&
          typeof window.FarcadeSDK.hasItem === "function" &&
          window.FarcadeSDK.hasItem("save-state");
        if (hasSaveItem) {
          console.log(
            "✅ Usuario tiene item 'save-state', mostrando botón SAVE",
          );
          this.createSaveButton();
        } else {
          console.log(
            "ℹ️ Usuario NO tiene item 'save-state', botón SAVE oculto",
          );
        }
      } catch (e) {
        console.warn("⚠️ Error al comprobar hasItem('save-state'):", e);
      }
    }

    // Crear los corazones encima del footer
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
   * Crear corazones en columna vertical, lado izquierdo, centrados en pantalla
   */
  private createHearts(): void {
    const heartSpacing = 55; // Espacio vertical entre corazones
    const heartX = 40; // Pegados al lado izquierdo
    const centerY = this.scene.cameras.main.height / 2;
    const startY = centerY - (heartSpacing * (this.maxLives - 1)) / 2;

    // Debug: verificar que la textura esté cargada
    if (!this.scene.textures.exists("heart_spritesheet")) {
      console.error("Heart spritesheet no encontrado!");
      return;
    }

    for (let i = 0; i < this.maxLives; i++) {
      // Usar el spritesheet de corazones, frame 0 (corazón lleno)
      const heart = this.scene.add.image(
        heartX,
        startY + i * heartSpacing,
        "heart_spritesheet",
        0, // Frame 0 = corazón lleno
      );
      heart.setScale(1.8);
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
    const yPosition = this.footerY + 40; // Centro vertical del footer

    // Crear contenedor para el contador de mini-pingüinos (centrado en su posición)
    this.miniPinguCountContainer = this.scene.add.container(
      xPosition,
      yPosition,
    );
    this.miniPinguCountContainer.setScrollFactor(0);
    this.miniPinguCountContainer.setDepth(1000);

    // Verificar si existe la textura de mini-pingüino
    if (this.scene.textures.exists("mini-pingu")) {
      // Icono de mini-pingüino (centrado en el contenedor)
      this.miniPinguIcon = this.scene.add.image(-15, 0, "mini-pingu");
      this.miniPinguIcon.setScale(0.6);
      this.miniPinguCountContainer.add(this.miniPinguIcon);

      // Texto contador "0" con fuente TT-Trailers
      this.miniPinguCountText = this.scene.add.text(15, 0, "0", {
        fontSize: "38px", // Aumentado de 28px a 38px
        fontFamily: "TT-Trailers",
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
    const yPosition = this.footerY + 40; // Centro vertical del footer

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

      // Texto contador "0" con fuente TT-Trailers
      this.coinCountText = this.scene.add.text(15, 0, "0", {
        fontSize: "38px", // Aumentado de 28px a 38px
        fontFamily: "TT-Trailers",
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
    const yPosition = this.footerY + 40; // Centro vertical del footer

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
        keyFrame,
      );
      this.keyIcon.setScale(0.9);
      this.keyCountContainer.add(this.keyIcon);

      // Texto contador "0" con fuente TT-Trailers
      this.keyCountText = this.scene.add.text(15, 0, "0", {
        fontSize: "38px", // Aumentado de 28px a 38px
        fontFamily: "TT-Trailers",
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
      this.footerY + 40, // Centro vertical del footer
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
      8,
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
      8,
    );
    this.bossHealthContainer.add(this.bossHealthBarBorder);

    // Texto "HP" a la izquierda de la barra (alineado desde el borde derecho)
    this.bossHPText = this.scene.add.text(
      -barWidth / 2 - 30, // 30px a la izquierda de la barra
      0,
      "HP",
      {
        fontFamily: "TT-Trailers",
        fontSize: "36px", // Aumentado de 26px a 36px
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 7, // Aumentado de 6 a 7
        fontStyle: "bold",
      },
    );
    this.bossHPText.setOrigin(1, 0.5); // Alineado desde la derecha para mantener distancia con barra
    this.bossHealthContainer.add(this.bossHPText);

    // Texto "BOSS" a la derecha de la barra (alineado desde el borde izquierdo)
    this.bossNameText = this.scene.add.text(
      barWidth / 2 + 30, // Misma distancia que HP (30px)
      0,
      "BOSS",
      {
        fontFamily: "TT-Trailers",
        fontSize: "36px", // Aumentado de 26px a 36px (mismo que HP)
        color: "#ffaa00", // Color naranja/dorado
        stroke: "#000000",
        strokeThickness: 7, // Aumentado de 6 a 7 (mismo que HP)
        fontStyle: "bold",
      },
    );
    this.bossNameText.setOrigin(0, 0.5); // Alineado desde la izquierda para mantener distancia con barra
    this.bossHealthContainer.add(this.bossNameText);

    // Agregar el contenedor al contenedor principal
    this.container.add(this.bossHealthContainer);
  }

  /**
   * Crear botón SAVE (verde, encima del footer a la derecha)
   */
  private createSaveButton(): void {
    const buttonWidth = 140;
    const buttonHeight = 55;
    const buttonX = this.scene.cameras.main.width - buttonWidth - 20; // 20px de margen derecho
    const buttonY = this.footerY - buttonHeight - 10; // Encima del footer + 10px de margen

    // Crear Graphics para el botón (rectángulo redondeado verde)
    this.saveButtonGraphics = this.scene.add.graphics();
    this.saveButtonGraphics.fillStyle(0x2d8b2d, 1); // Verde oscuro
    this.saveButtonGraphics.fillRoundedRect(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      8,
    );
    // Borde negro
    this.saveButtonGraphics.lineStyle(3, 0x000000, 1);
    this.saveButtonGraphics.strokeRoundedRect(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      8,
    );

    // Texto "SAVE" en blanco
    this.saveButtonText = this.scene.add.text(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      "SAVE",
      {
        fontFamily: "TT-Trailers",
        fontSize: "38px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
        fontStyle: "bold",
      },
    );
    this.saveButtonText.setOrigin(0.5, 0.5);

    // Crear área interactiva (hitbox)
    this.saveButtonHitArea = this.scene.add.rectangle(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      0x000000,
      0.01,
    );
    this.saveButtonHitArea.setInteractive({ useHandCursor: true });
    this.saveButtonHitArea.setOrigin(0.5, 0.5);
    this.saveButtonHitArea.setScrollFactor(0);
    this.saveButtonHitArea.setDepth(1001);

    // Hover effect - verde más oscuro
    this.saveButtonHitArea.on("pointerover", () => {
      if (this.saveButtonGraphics) {
        this.saveButtonGraphics.clear();
        this.saveButtonGraphics.fillStyle(0x1e6b1e, 1); // Verde más oscuro
        this.saveButtonGraphics.fillRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8,
        );
        this.saveButtonGraphics.lineStyle(3, 0x000000, 1);
        this.saveButtonGraphics.strokeRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8,
        );
      }
    });

    // Hover out - volver a verde normal
    this.saveButtonHitArea.on("pointerout", () => {
      if (this.saveButtonGraphics) {
        this.saveButtonGraphics.clear();
        this.saveButtonGraphics.fillStyle(0x2d8b2d, 1); // Verde normal
        this.saveButtonGraphics.fillRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8,
        );
        this.saveButtonGraphics.lineStyle(3, 0x000000, 1);
        this.saveButtonGraphics.strokeRoundedRect(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight,
          8,
        );
      }
    });

    // Click event - llamar callback si existe
    this.saveButtonHitArea.on("pointerdown", () => {
      console.log("💾 SAVE button clicked!");
      // Efecto de escala al hacer click
      if (this.saveButtonText) {
        this.scene.tweens.add({
          targets: this.saveButtonText,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // Ejecutar callback después de la animación
            if (this.onSaveCallback) {
              this.onSaveCallback();
            }
          },
        });
      }
    });

    // NO agregar al container, configurar individualmente
    // Graphics
    this.saveButtonGraphics.setScrollFactor(0);
    this.saveButtonGraphics.setDepth(1000);

    // Text
    this.saveButtonText.setScrollFactor(0);
    this.saveButtonText.setDepth(1001);

    // HitArea ya tiene scrollFactor(0) y depth(1001) configurados arriba
  }

  /**
   * Establecer callback para el botón SAVE
   * @param callback Función a ejecutar cuando se presione SAVE
   */
  public setSaveCallback(callback: () => void): void {
    this.onSaveCallback = callback;
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
      6,
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
          heart.setScale(1.8);
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
          heart.setScale(1.8);
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
      heart.setScale(1.8);
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
      heart.setScale(1.8);
    });
    this.currentLives = this.maxLives;
  }
  public getCurrentLives(): number {
    return this.currentLives;
  }

  /**
   * Establecer vidas iniciales (para persistencia entre niveles)
   * Actualiza el estado interno y los corazones visuales
   */
  public setInitialLives(lives: number): void {
    const clampedLives = Math.max(0, Math.min(lives, this.maxLives));
    this.currentLives = clampedLives;
    // Actualizar los corazones visuales
    for (let i = 0; i < this.maxLives; i++) {
      if (this.hearts[i]) {
        if (i < clampedLives) {
          this.hearts[i].setFrame(0); // Lleno
          this.hearts[i].setAlpha(1);
        } else {
          this.hearts[i].setFrame(2); // Vacío
          this.hearts[i].setAlpha(0.8);
        }
        this.hearts[i].setScale(1.8);
      }
    }
    console.log(`❤️ Vidas inicializadas: ${clampedLives}/${this.maxLives}`);
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
  // Actualizar posición del footer cuando cambie el tamaño de la cámara
  public updatePosition(): void {
    this.footerBackground.setPosition(0, this.footerY);
    this.footerBackground.setSize(
      this.scene.cameras.main.width,
      this.FOOTER_HEIGHT,
    );

    // Actualizar borde del footer - estilo Pudgy
    this.footerBorder.clear();
    this.footerBorder.lineStyle(6, 0x000000, 1);
    this.footerBorder.beginPath();
    this.footerBorder.moveTo(0, this.footerY);
    this.footerBorder.lineTo(this.scene.cameras.main.width, this.footerY);
    this.footerBorder.strokePath();

    // Reposicionar corazones (columna izquierda, centrados verticalmente)
    const heartSpacing = 55;
    const heartX = 40;
    const centerY = this.scene.cameras.main.height / 2;
    const startY = centerY - (heartSpacing * (this.maxLives - 1)) / 2;
    this.hearts.forEach((heart, index) => {
      heart.setPosition(heartX, startY + index * heartSpacing);
    });
  }
}
