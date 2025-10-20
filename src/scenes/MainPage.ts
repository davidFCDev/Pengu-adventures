// You can write more code here

import InstructionsModal from "../objects/ui/InstructionsModal";

/* START OF COMPILED CODE */

class MainPage extends Phaser.Scene {
  constructor() {
    super("MainPage");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

  // Imagen de fondo
  private backgroundImage!: Phaser.GameObjects.Image;

  // Título con letras de colores
  private titleLetters: Phaser.GameObjects.Text[] = [];

  // Botones estilo imagen
  private playButton!: Phaser.GameObjects.Graphics;
  private playText!: Phaser.GameObjects.Text;
  private playHitArea!: Phaser.GameObjects.Rectangle;

  private instructionsButton!: Phaser.GameObjects.Graphics;
  private instructionsText!: Phaser.GameObjects.Text;
  private instructionsHitArea!: Phaser.GameObjects.Rectangle;

  // Modal de instrucciones
  private instructionsModal!: InstructionsModal;

  async create() {
    this.editorCreate();

    // Crear fondo responsive
    this.createBackground();

    // ⏳ IMPORTANTE: Esperar a que las fuentes estén listas (fix para iPhone/Safari)
    try {
      await document.fonts.ready;
      console.log("✅ Fuentes cargadas correctamente");
    } catch (error) {
      console.warn("⚠️ Error al cargar fuentes:", error);
    }

    // Crear título "I AM PENGU" con colores alternados
    this.createTitle();

    // Crear botones estilo imagen
    this.createButtons();

    // Crear modal de instrucciones
    this.instructionsModal = new InstructionsModal(this);
  }

  /**
   * Crear y configurar el fondo responsive
   */
  private createBackground(): void {
    this.backgroundImage = this.add.image(384, 512, "main-page");
    this.backgroundImage.setOrigin(0.5, 0.5);

    // Hacer el fondo responsive
    this.makeBackgroundResponsive();
  }

  /**
   * Hacer que el fondo sea responsive y ocupe todo el height
   */
  private makeBackgroundResponsive(): void {
    const { width, height } = this.cameras.main;

    // Centrar la imagen en el canvas
    this.backgroundImage.setPosition(width / 2, height / 2);

    // Obtener las dimensiones originales de la imagen
    const imageWidth = this.backgroundImage.width;
    const imageHeight = this.backgroundImage.height;

    // Calcular la escala necesaria para cubrir toda la pantalla
    const scaleX = width / imageWidth;
    const scaleY = height / imageHeight;
    // Usar Math.max para cubrir todo el height
    const scale = Math.max(scaleX, scaleY);

    // Aplicar la escala
    this.backgroundImage.setScale(scale);

    // Hacer que la imagen se ajuste si cambia el tamaño de la ventana
    this.scale.on("resize", (gameSize: { width: number; height: number }) => {
      const newScaleX = gameSize.width / imageWidth;
      const newScaleY = gameSize.height / imageHeight;
      const newScale = Math.max(newScaleX, newScaleY);

      this.backgroundImage.setPosition(gameSize.width / 2, gameSize.height / 2);
      this.backgroundImage.setScale(newScale);

      // Reposicionar título y botón
      this.repositionElements(gameSize.width, gameSize.height);
    });
  }

  /**
   * Crear título "I AM PENGU" con letras de colores alternados
   */
  private createTitle(): void {
    const title = "I AM PENGU";
    const colors = ["#FFFFFF", "#4ECDC4", "#FFE66D"]; // Blanco, Azul, Amarillo
    const startX = 384; // Centro horizontal
    const startY = 150; // Posición vertical separada del top
    const letterSpacing = 55; // Aumentado ligeramente para TT-Trailers

    // Calcular offset para centrar el texto
    const totalWidth = (title.length - 1) * letterSpacing;
    let currentX = startX - totalWidth / 2;

    for (let i = 0; i < title.length; i++) {
      const letter = title[i];
      const colorIndex = i % colors.length;
      const color = colors[colorIndex];

      const letterText = this.add.text(currentX, startY, letter, {
        fontFamily: "TT-Trailers",
        fontSize: "140px", // Aumentado para TT-Trailers
        color: color,
        stroke: "#000000",
        strokeThickness: 14,
        shadow: {
          offsetX: 6,
          offsetY: 6,
          color: "#000000",
          blur: 10,
          fill: true,
        },
        padding: { right: 10 },
      });
      letterText.setOrigin(0.5, 0.5);

      this.titleLetters.push(letterText);
      currentX += letterSpacing;
    }
  }

  /**
   * Crear botones estilo imagen (PLAY GAME y INSTRUCTIONS)
   */
  private createButtons(): void {
    const centerX = 384;
    const buttonWidth = 480; // Aumentado de 250 a 480 (casi como el título)
    const buttonHeight = 90; // Aumentado de 80 a 90
    const spacing = 20;
    const bottomMargin = 150; // Margen desde el bottom

    // Calcular posición desde el bottom
    const canvasHeight = this.cameras.main.height;
    const instructionsY = canvasHeight - bottomMargin;
    const playY = instructionsY - buttonHeight - spacing;

    // ===== BOTÓN PLAY GAME (Turquesa #00D4AA) =====
    this.playButton = this.add.graphics();
    this.drawButton(
      this.playButton,
      centerX,
      playY,
      buttonWidth,
      buttonHeight,
      0x00d4aa
    );

    this.playText = this.add.text(centerX, playY, "PLAY GAME", {
      fontFamily: "TT-Trailers",
      fontSize: "52px", // Aumentado de 42px a 52px
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7, // Aumentado de 6 a 7
    });
    this.playText.setOrigin(0.5, 0.5);

    this.playHitArea = this.add.rectangle(
      centerX,
      playY,
      buttonWidth,
      buttonHeight
    );
    this.playHitArea.setInteractive({ useHandCursor: true });

    this.playHitArea.on("pointerdown", () => {
      this.scene.start("Roadmap");
    });

    this.playHitArea.on("pointerover", () => {
      this.playButton.clear();
      this.drawButton(
        this.playButton,
        centerX,
        playY,
        buttonWidth,
        buttonHeight,
        0x00f0c8
      ); // Más claro
      this.playText.setScale(1.05);
    });

    this.playHitArea.on("pointerout", () => {
      this.playButton.clear();
      this.drawButton(
        this.playButton,
        centerX,
        playY,
        buttonWidth,
        buttonHeight,
        0x00d4aa
      ); // Original
      this.playText.setScale(1);
    });

    // ===== BOTÓN INSTRUCTIONS (Amarillo #FFD966) =====
    // Ya calculado arriba: instructionsY

    this.instructionsButton = this.add.graphics();
    this.drawButton(
      this.instructionsButton,
      centerX,
      instructionsY,
      buttonWidth,
      buttonHeight,
      0xffd966
    );

    this.instructionsText = this.add.text(
      centerX,
      instructionsY,
      "INSTRUCTIONS",
      {
        fontFamily: "TT-Trailers",
        fontSize: "50px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 7,
      }
    );
    this.instructionsText.setOrigin(0.5, 0.5);

    this.instructionsHitArea = this.add.rectangle(
      centerX,
      instructionsY,
      buttonWidth,
      buttonHeight
    );
    this.instructionsHitArea.setInteractive({ useHandCursor: true });

    this.instructionsHitArea.on("pointerdown", () => {
      this.instructionsModal.show();
    });

    this.instructionsHitArea.on("pointerover", () => {
      this.instructionsButton.clear();
      this.drawButton(
        this.instructionsButton,
        centerX,
        instructionsY,
        buttonWidth,
        buttonHeight,
        0xffe699
      ); // Más claro
      this.instructionsText.setScale(1.05);
    });

    this.instructionsHitArea.on("pointerout", () => {
      this.instructionsButton.clear();
      this.drawButton(
        this.instructionsButton,
        centerX,
        instructionsY,
        buttonWidth,
        buttonHeight,
        0xffd966
      ); // Original
      this.instructionsText.setScale(1);
    });
  }

  /**
   * Dibujar un botón rectangular con bordes redondeados
   */
  private drawButton(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ): void {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 16);
    graphics.lineStyle(6, 0x000000, 1);
    graphics.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      16
    );
  }

  /**
   * Reposicionar elementos cuando cambia el tamaño de la ventana
   */
  private repositionElements(width: number, height: number): void {
    // Reposicionar título
    const title = "I AM PENGU";
    const letterSpacing = 55;
    const startY = 150;

    const totalWidth = (title.length - 1) * letterSpacing;
    let currentX = width / 2 - totalWidth / 2;

    for (let i = 0; i < this.titleLetters.length; i++) {
      this.titleLetters[i].setPosition(currentX, startY);
      currentX += letterSpacing;
    }

    // Reposicionar botones
    const centerX = width / 2;
    const buttonWidth = 480;
    const buttonHeight = 90;
    const spacing = 20;
    const bottomMargin = 150;

    // Calcular desde el bottom
    const instructionsY = height - bottomMargin;
    const playY = instructionsY - buttonHeight - spacing;

    // PLAY GAME
    this.playButton.setPosition(centerX, playY);
    this.playText.setPosition(centerX, playY);
    this.playHitArea.setPosition(centerX, playY);

    // INSTRUCTIONS
    this.instructionsButton.setPosition(centerX, instructionsY);
    this.instructionsText.setPosition(centerX, instructionsY);
    this.instructionsHitArea.setPosition(centerX, instructionsY);
  } /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

export default MainPage;
