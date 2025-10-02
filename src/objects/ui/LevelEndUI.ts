/**
 * UI que se muestra cuando el jugador completa el nivel
 */
export class LevelEndUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Rectangle;
  private celebrateSprite!: Phaser.GameObjects.Sprite;
  private nextButton!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    // Fijar al centro de la cámara
    this.setScrollFactor(0);
    this.setDepth(1000);

    this.createUI();
    this.setVisible(false);
  }

  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Fondo semi-transparente
    this.background = this.scene.add.rectangle(
      centerX,
      centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.7
    );
    this.background.setScrollFactor(0);
    this.add(this.background);

    // Sprite de celebración (4 frames)
    this.celebrateSprite = this.scene.add.sprite(
      centerX,
      centerY - 80,
      "celebrate"
    );
    this.celebrateSprite.setScale(2);
    this.celebrateSprite.setScrollFactor(0);
    this.add(this.celebrateSprite);

    // Crear animación de celebración si no existe
    if (!this.scene.anims.exists("celebrate_anim")) {
      this.scene.anims.create({
        key: "celebrate_anim",
        frames: this.scene.anims.generateFrameNumbers("celebrate", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: 0, // Solo una vez, se queda en el último frame
      });
    }

    // Botón "Next Level"
    this.createNextButton(centerX, centerY + 80);
  }

  private createNextButton(x: number, y: number): void {
    const buttonContainer = this.scene.add.container(x, y);
    buttonContainer.setScrollFactor(0);

    // Fondo del botón
    const buttonBg = this.scene.add.rectangle(0, 0, 200, 60, 0x4a90e2);
    buttonBg.setStrokeStyle(3, 0xffffff);
    buttonContainer.add(buttonBg);

    // Texto del botón
    const buttonText = this.scene.add.text(0, 0, "Next Level", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    buttonText.setOrigin(0.5);
    buttonContainer.add(buttonText);

    // Hacer interactivo
    buttonBg.setInteractive({ useHandCursor: true });

    // Efectos hover
    buttonBg.on("pointerover", () => {
      console.log("👆 Hover sobre botón Next Level");
      buttonBg.setFillStyle(0x5fa0f2);
      buttonContainer.setScale(1.05);
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x4a90e2);
      buttonContainer.setScale(1);
    });

    buttonBg.on("pointerdown", () => {
      console.log("👆 Click DOWN en botón Next Level");
      buttonContainer.setScale(0.95);
    });

    buttonBg.on("pointerup", () => {
      console.log("👆 Click UP en botón Next Level - Llamando onNextLevel()");
      buttonContainer.setScale(1.05);
      this.onNextLevel();
    });

    this.nextButton = buttonContainer;
    this.add(buttonContainer);
  }

  private onNextLevel(): void {
    console.log("🎮 Reiniciando nivel...");

    // Ocultar UI primero
    this.hide();

    // Reiniciar la escena actual usando el Scene Manager correcto
    const currentScene = this.scene;
    currentScene.time.delayedCall(200, () => {
      // Obtener la clave de la escena actual y reiniciarla
      const sceneKey = currentScene.scene.key;
      console.log("🔄 Reiniciando escena:", sceneKey);
      currentScene.scene.restart();
    });
  }

  public show(): void {
    this.setVisible(true);

    // Reproducir animación de celebración (se queda en el último frame)
    this.celebrateSprite.play("celebrate_anim");

    // Animar entrada
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: "Power2",
    });

    // Animar sprite de celebración desde escala 0 hasta escala normal
    this.celebrateSprite.setScale(0);
    this.scene.tweens.add({
      targets: this.celebrateSprite,
      scale: 1.5, // Escala 1.5 para que se vea bien (128x128 * 1.5 = 192px)
      duration: 600,
      ease: "Back.easeOut",
    });

    // Animar botón con delay
    this.nextButton.setScale(0);
    this.scene.tweens.add({
      targets: this.nextButton,
      scale: 1,
      duration: 500,
      delay: 300,
      ease: "Back.easeOut",
    });
  }

  public hide(): void {
    this.setVisible(false);
    this.celebrateSprite.stop();
  }
}
