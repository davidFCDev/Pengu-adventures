// GameOverUI.ts - Modal de Game Over con estilo similar a LevelEndUI
export default class GameOverUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Graphics;
  private modalBackground!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;

  // Elementos del botón "Volver"
  private backButtonGraphics!: Phaser.GameObjects.Graphics;
  private backButtonText!: Phaser.GameObjects.Text;
  private backButtonHitArea!: Phaser.GameObjects.Rectangle;

  // Elementos del botón "Reintentar"
  private retryButtonGraphics!: Phaser.GameObjects.Graphics;
  private retryButtonText!: Phaser.GameObjects.Text;
  private retryButtonHitArea!: Phaser.GameObjects.Rectangle;

  // Textos graciosos aleatorios en inglés
  private readonly funnyMessages = [
    "OOPS! PENGU SLIPPED!",
    "ICE IS SLIPPERY!",
    "PENGU NEEDS PRACTICE!",
    "WINTER IS TOUGH!",
    "TRY AGAIN, CHAMP!",
    "PENGU GOT FROZEN!",
    "SNOW PROBLEM!",
    "CHILL OUT AND RETRY!",
    "PENGU'S BAD DAY!",
    "NOT YOUR BEST RUN!",
    "FISH ESCAPED!",
    "TOO COLD OUT THERE!",
    "PENGU IS DIZZY!",
    "BELLY SLIDE FAILED!",
  ];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.createUI();
    this.setVisible(false);
    this.setScrollFactor(0);
    this.setDepth(1000);
    scene.add.existing(this);
  }

  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Fondo negro con 85% opacidad
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.85);
    this.background.fillRect(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height
    );
    this.background.setScrollFactor(0);
    this.background.setDepth(999);
    this.add(this.background);

    // Modal negro con borde negro 100%
    this.modalBackground = this.scene.add.graphics();
    this.modalBackground.fillStyle(0x000000, 0.85);
    this.modalBackground.fillRoundedRect(
      centerX - 200,
      centerY - 200,
      400,
      400,
      20
    );
    this.modalBackground.lineStyle(8, 0x000000, 1);
    this.modalBackground.strokeRoundedRect(
      centerX - 200,
      centerY - 200,
      400,
      400,
      20
    );
    this.modalBackground.setScrollFactor(0);
    this.modalBackground.setDepth(1000);
    this.add(this.modalBackground);

    // Texto gracioso aleatorio - se actualizará en show()
    this.titleText = this.scene.add.text(centerX, centerY - 50, "", {
      fontFamily: "Fobble",
      fontSize: "42px",
      color: "#FFFFFF",
      align: "center",
      lineSpacing: 5,
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setScrollFactor(0);
    this.titleText.setDepth(1000);
    this.add(this.titleText);

    // Botón "VOLVER" (izquierda)
    this.createBackButton(centerX - 90, centerY + 100);

    // Botón "REINTENTAR" (derecha)
    this.createRetryButton(centerX + 90, centerY + 100);
  }

  private createBackButton(x: number, y: number): void {
    // Botón con Graphics (estilo Roadmap) - Gris para "volver"
    this.backButtonGraphics = this.scene.add.graphics();
    this.backButtonGraphics.fillStyle(0x888888, 1); // Gris
    this.backButtonGraphics.fillRoundedRect(x - 75, y - 30, 150, 60, 15);
    this.backButtonGraphics.lineStyle(6, 0x000000, 1); // Borde negro
    this.backButtonGraphics.strokeRoundedRect(x - 75, y - 30, 150, 60, 15);
    this.backButtonGraphics.setScrollFactor(0);
    this.backButtonGraphics.setDepth(1001);
    this.add(this.backButtonGraphics);

    // Texto del botón con fuente Bangers
    this.backButtonText = this.scene.add.text(x, y, "BACK", {
      fontFamily: "Fobble",
      fontSize: "32px", // Aumentado de 28px a 32px
      color: "#FFFFFF", // Blanco
      padding: { right: 10 },
    });
    this.backButtonText.setOrigin(0.5);
    this.backButtonText.setScrollFactor(0);
    this.backButtonText.setDepth(1002);
    this.add(this.backButtonText);

    // Hit area invisible para interactividad
    this.backButtonHitArea = this.scene.add.rectangle(
      x,
      y,
      150,
      60,
      0x000000,
      0
    );
    this.backButtonHitArea.setInteractive({ useHandCursor: true });
    this.backButtonHitArea.setScrollFactor(0);
    this.backButtonHitArea.setDepth(1003);
    this.add(this.backButtonHitArea);

    // Efectos hover
    this.backButtonHitArea.on("pointerover", () => {
      this.backButtonGraphics.clear();
      this.backButtonGraphics.fillStyle(0x666666, 1); // Gris más oscuro en hover
      this.backButtonGraphics.fillRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.backButtonGraphics.lineStyle(6, 0x000000, 1);
      this.backButtonGraphics.strokeRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.backButtonText.setScale(1.05);
    });
    this.backButtonHitArea.on("pointerout", () => {
      this.backButtonGraphics.clear();
      this.backButtonGraphics.fillStyle(0x888888, 1); // Volver al gris original
      this.backButtonGraphics.fillRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.backButtonGraphics.lineStyle(6, 0x000000, 1);
      this.backButtonGraphics.strokeRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.backButtonText.setScale(1);
    });
    this.backButtonHitArea.on("pointerdown", () => {
      this.backButtonText.setScale(0.95);
    });
    this.backButtonHitArea.on("pointerup", () => {
      this.backButtonText.setScale(1.05);
      this.onBackToRoadmap();
    });
  }

  private createRetryButton(x: number, y: number): void {
    // Botón amarillo con Graphics (estilo Roadmap)
    this.retryButtonGraphics = this.scene.add.graphics();
    this.retryButtonGraphics.fillStyle(0xffde59, 1); // Amarillo #FFDE59
    this.retryButtonGraphics.fillRoundedRect(x - 75, y - 30, 150, 60, 15);
    this.retryButtonGraphics.lineStyle(6, 0x000000, 1); // Borde negro
    this.retryButtonGraphics.strokeRoundedRect(x - 75, y - 30, 150, 60, 15);
    this.retryButtonGraphics.setScrollFactor(0);
    this.retryButtonGraphics.setDepth(1001);
    this.add(this.retryButtonGraphics);

    // Texto del botón con fuente Bangers
    this.retryButtonText = this.scene.add.text(x, y, "RETRY", {
      fontFamily: "Fobble",
      fontSize: "32px", // Aumentado de 28px a 32px
      color: "#000000", // Negro
      padding: { right: 10 },
    });
    this.retryButtonText.setOrigin(0.5);
    this.retryButtonText.setScrollFactor(0);
    this.retryButtonText.setDepth(1002);
    this.add(this.retryButtonText);

    // Hit area invisible para interactividad
    this.retryButtonHitArea = this.scene.add.rectangle(
      x,
      y,
      150,
      60,
      0x000000,
      0
    );
    this.retryButtonHitArea.setInteractive({ useHandCursor: true });
    this.retryButtonHitArea.setScrollFactor(0);
    this.retryButtonHitArea.setDepth(1003);
    this.add(this.retryButtonHitArea);

    // Efectos hover
    this.retryButtonHitArea.on("pointerover", () => {
      this.retryButtonGraphics.clear();
      this.retryButtonGraphics.fillStyle(0xffd040, 1); // Amarillo más oscuro en hover
      this.retryButtonGraphics.fillRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.retryButtonGraphics.lineStyle(6, 0x000000, 1);
      this.retryButtonGraphics.strokeRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.retryButtonText.setScale(1.05);
    });
    this.retryButtonHitArea.on("pointerout", () => {
      this.retryButtonGraphics.clear();
      this.retryButtonGraphics.fillStyle(0xffde59, 1); // Volver al amarillo original
      this.retryButtonGraphics.fillRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.retryButtonGraphics.lineStyle(6, 0x000000, 1);
      this.retryButtonGraphics.strokeRoundedRect(x - 75, y - 30, 150, 60, 15);
      this.retryButtonText.setScale(1);
    });
    this.retryButtonHitArea.on("pointerdown", () => {
      this.retryButtonText.setScale(0.95);
    });
    this.retryButtonHitArea.on("pointerup", () => {
      this.retryButtonText.setScale(1.05);
      this.onRetry();
    });
  }

  private onBackToRoadmap(): void {
    console.log("🏔️ Volviendo al Roadmap...");
    // Detener música del nivel si existe
    this.scene.sound.stopAll();
    // Volver al Roadmap
    this.scene.scene.start("Roadmap");
  }

  private onRetry(): void {
    console.log("🔄 Reintentando el nivel...");
    // Detener música del nivel si existe
    this.scene.sound.stopAll();
    // Reiniciar la escena actual
    this.scene.scene.restart();
  }

  public show(): void {
    this.setVisible(true);
    this.setAlpha(0);

    // Seleccionar mensaje gracioso aleatorio
    const randomMessage =
      this.funnyMessages[Math.floor(Math.random() * this.funnyMessages.length)];
    this.titleText.setText(randomMessage);

    // Fade in del fondo y modal
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: "Power2",
    });
    // Animar texto del título
    this.titleText.setAlpha(0);
    this.scene.tweens.add({
      targets: this.titleText,
      alpha: 1,
      duration: 500,
      delay: 200,
      ease: "Power2",
    });
    // Animar botón "Volver"
    this.backButtonGraphics.setAlpha(0);
    this.backButtonText.setScale(0);
    this.backButtonHitArea.setAlpha(0);
    this.scene.tweens.add({
      targets: this.backButtonGraphics,
      alpha: 1,
      duration: 500,
      delay: 400,
      ease: "Power2",
    });
    this.scene.tweens.add({
      targets: this.backButtonText,
      scale: 1,
      duration: 500,
      delay: 400,
      ease: "Back.easeOut",
    });
    this.scene.tweens.add({
      targets: this.backButtonHitArea,
      alpha: 1,
      duration: 500,
      delay: 400,
      ease: "Power2",
    });
    // Animar botón "Reintentar"
    this.retryButtonGraphics.setAlpha(0);
    this.retryButtonText.setScale(0);
    this.retryButtonHitArea.setAlpha(0);
    this.scene.tweens.add({
      targets: this.retryButtonGraphics,
      alpha: 1,
      duration: 500,
      delay: 400,
      ease: "Power2",
    });
    this.scene.tweens.add({
      targets: this.retryButtonText,
      scale: 1,
      duration: 500,
      delay: 400,
      ease: "Back.easeOut",
    });
    this.scene.tweens.add({
      targets: this.retryButtonHitArea,
      alpha: 1,
      duration: 500,
      delay: 400,
      ease: "Power2",
    });
  }

  public hide(): void {
    this.setVisible(false);
  }
}
