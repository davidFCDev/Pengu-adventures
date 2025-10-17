// You can write more code here

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

  // Botón START
  private startButton!: Phaser.GameObjects.Graphics;
  private startText!: Phaser.GameObjects.Text;

  create() {
    this.editorCreate();

    // Crear fondo responsive
    this.createBackground();

    // Crear título "I AM PENGU" con colores alternados
    this.createTitle();

    // Crear botón START
    this.createStartButton();
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
    const letterSpacing = 50; // Espacio entre letras

    // Calcular offset para centrar el texto
    const totalWidth = (title.length - 1) * letterSpacing;
    let currentX = startX - totalWidth / 2;

    for (let i = 0; i < title.length; i++) {
      const letter = title[i];
      const colorIndex = i % colors.length;
      const color = colors[colorIndex];

      const letterText = this.add.text(currentX, startY, letter, {
        fontFamily: "Fobble",
        fontSize: "130px", // Aumentado de 110px a 130px
        color: color,
        stroke: "#000000",
        strokeThickness: 12,
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
   * Crear botón START en el centro
   */
  private createStartButton(): void {
    const centerX = 384;
    const centerY = 512; // Centro vertical

    // Fondo del botón (amarillo #FFDE59 con borde negro)
    this.startButton = this.add.graphics();
    this.drawStartButton(centerX, centerY, 0xffde59);

    // Texto del botón
    this.startText = this.add.text(centerX, centerY, "START", {
      fontFamily: "Fobble",
      fontSize: "48px", // Reducido de 72px a 48px
      color: "#000000", // Negro
      padding: { right: 10 },
    });
    this.startText.setOrigin(0.5, 0.5);

    // Hacer el botón interactivo (más pequeño)
    const buttonHitArea = this.add.rectangle(centerX, centerY, 200, 70);
    buttonHitArea.setInteractive({ useHandCursor: true });

    // Eventos del botón
    buttonHitArea.on("pointerdown", () => {
      // Ir al Roadmap
      this.scene.start("Roadmap");
    });

    buttonHitArea.on("pointerover", () => {
      // Efecto hover - amarillo más oscuro
      this.startButton.clear();
      this.drawStartButton(centerX, centerY, 0xffd040);
    });

    buttonHitArea.on("pointerout", () => {
      // Volver al amarillo original
      this.startButton.clear();
      this.drawStartButton(centerX, centerY, 0xffde59);
    });
  }

  /**
   * Dibujar el botón START con el color especificado
   */
  private drawStartButton(x: number, y: number, color: number): void {
    this.startButton.fillStyle(color, 1);
    this.startButton.fillRoundedRect(x - 100, y - 35, 200, 70, 15);
    this.startButton.lineStyle(6, 0x000000, 1);
    this.startButton.strokeRoundedRect(x - 100, y - 35, 200, 70, 15);
  }

  /**
   * Reposicionar elementos cuando cambia el tamaño de la ventana
   */
  private repositionElements(width: number, height: number): void {
    // Reposicionar título
    const title = "I AM PENGU";
    const letterSpacing = 50;
    const startY = 150;

    const totalWidth = (title.length - 1) * letterSpacing;
    let currentX = width / 2 - totalWidth / 2;

    for (let i = 0; i < this.titleLetters.length; i++) {
      this.titleLetters[i].setPosition(currentX, startY);
      currentX += letterSpacing;
    }

    // Reposicionar botón START
    const buttonY = height / 2 + 50;
    this.startButton.setPosition(width / 2, buttonY);
    this.startText.setPosition(width / 2, buttonY);
  } /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

export default MainPage;
