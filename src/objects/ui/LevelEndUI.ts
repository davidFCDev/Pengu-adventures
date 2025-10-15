/**
 * UI que se muestra cuando el jugador completa el nivel
 */
export class LevelEndUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Rectangle;
  private celebrateSprite!: Phaser.GameObjects.Sprite;
  private buttonGraphics!: Phaser.GameObjects.Graphics;
  private buttonText!: Phaser.GameObjects.Text;
  private buttonHitArea!: Phaser.GameObjects.Rectangle;
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
    // Fondo overlay oscuro
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
    // Contenedor del modal (negro suave con borde negro)
    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0x000000, 0.85); // Negro suave (85% opacidad)
    modalBg.fillRoundedRect(centerX - 200, centerY - 200, 400, 400, 20);
    modalBg.lineStyle(8, 0x000000, 1); // Borde negro 100%
    modalBg.strokeRoundedRect(centerX - 200, centerY - 200, 400, 400, 20);
    modalBg.setScrollFactor(0);
    this.add(modalBg);
    // Sprite de celebración
    this.celebrateSprite = this.scene.add.sprite(
      centerX,
      centerY - 80,
      "celebrate"
    );
    this.celebrateSprite.setScale(1.5);
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
    // Texto "LEVEL COMPLETE!" con fuente Bangers (más separado del sprite)
    const completeText = this.scene.add.text(
      centerX,
      centerY + 50,
      "LEVEL COMPLETE!",
      {
        fontFamily: "Bangers",
        fontSize: "48px",
        color: "#ffffff",
        padding: { right: 10 },
      }
    );
    completeText.setOrigin(0.5, 0.5);
    completeText.setScrollFactor(0);
    this.add(completeText);
    // Botón "Next Level"
    this.createNextButton(centerX, centerY + 140);
  }
  private createNextButton(x: number, y: number): void {
    // Botón amarillo con Graphics (estilo Roadmap)
    this.buttonGraphics = this.scene.add.graphics();
    this.buttonGraphics.fillStyle(0xffde59, 1); // Amarillo #FFDE59
    this.buttonGraphics.fillRoundedRect(x - 100, y - 30, 200, 60, 15);
    this.buttonGraphics.lineStyle(6, 0x000000, 1); // Borde negro
    this.buttonGraphics.strokeRoundedRect(x - 100, y - 30, 200, 60, 15);
    this.buttonGraphics.setScrollFactor(0);
    this.buttonGraphics.setDepth(1001);
    this.add(this.buttonGraphics);

    // Texto del botón con fuente Bangers
    this.buttonText = this.scene.add.text(x, y, "NEXT LEVEL", {
      fontFamily: "Bangers",
      fontSize: "32px",
      color: "#000000", // Negro
      padding: { right: 10 },
    });
    this.buttonText.setOrigin(0.5);
    this.buttonText.setScrollFactor(0);
    this.buttonText.setDepth(1002);
    this.add(this.buttonText);

    // Hit area invisible para interactividad
    this.buttonHitArea = this.scene.add.rectangle(x, y, 200, 60, 0x000000, 0);
    this.buttonHitArea.setInteractive({ useHandCursor: true });
    this.buttonHitArea.setScrollFactor(0);
    this.buttonHitArea.setDepth(1003);
    this.add(this.buttonHitArea);

    // Efectos hover
    this.buttonHitArea.on("pointerover", () => {
      this.buttonGraphics.clear();
      this.buttonGraphics.fillStyle(0xffd040, 1); // Amarillo más oscuro en hover
      this.buttonGraphics.fillRoundedRect(x - 100, y - 30, 200, 60, 15);
      this.buttonGraphics.lineStyle(6, 0x000000, 1);
      this.buttonGraphics.strokeRoundedRect(x - 100, y - 30, 200, 60, 15);
      this.buttonText.setScale(1.05);
    });
    this.buttonHitArea.on("pointerout", () => {
      this.buttonGraphics.clear();
      this.buttonGraphics.fillStyle(0xffde59, 1); // Volver al amarillo original
      this.buttonGraphics.fillRoundedRect(x - 100, y - 30, 200, 60, 15);
      this.buttonGraphics.lineStyle(6, 0x000000, 1);
      this.buttonGraphics.strokeRoundedRect(x - 100, y - 30, 200, 60, 15);
      this.buttonText.setScale(1);
    });
    this.buttonHitArea.on("pointerdown", () => {
      this.buttonText.setScale(0.95);
    });
    this.buttonHitArea.on("pointerup", () => {
      this.buttonText.setScale(1.05);
      this.onNextLevel();
    });
  }
  private onNextLevel(): void {
    // Ocultar UI primero
    this.hide();

    const currentScene = this.scene;
    currentScene.time.delayedCall(200, () => {
      // Obtener el índice del nivel actual
      const sceneKey = currentScene.scene.key;
      const levelIndex = this.getLevelIndexFromSceneKey(sceneKey);

      // Desbloquear el siguiente nivel (sin localStorage por ahora)
      if (levelIndex !== -1 && levelIndex < 5) {
        // 0-4 son Level1-5, 5 es FirstBoss
        console.log(
          `Level ${levelIndex + 1} completed! Next level: ${levelIndex + 2}`
        );
        // TODO: Aquí se integrará el SDK para guardar el progreso
      }

      // Redirigir al Roadmap
      currentScene.scene.start("Roadmap");
    });
  }

  /**
   * Obtiene el índice del nivel (0-5) a partir del scene key
   */
  private getLevelIndexFromSceneKey(sceneKey: string): number {
    const levelMap: { [key: string]: number } = {
      Level1: 0,
      Level2: 1,
      Level3: 2,
      Level4: 3,
      Level5: 4,
      FirstBoss: 5,
    };
    return levelMap[sceneKey] ?? -1;
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
    // Animar elementos del botón con delay
    this.buttonGraphics.setAlpha(0);
    this.buttonText.setScale(0);
    this.buttonHitArea.setAlpha(0);
    this.scene.tweens.add({
      targets: this.buttonGraphics,
      alpha: 1,
      duration: 500,
      delay: 300,
      ease: "Power2",
    });
    this.scene.tweens.add({
      targets: this.buttonText,
      scale: 1,
      duration: 500,
      delay: 300,
      ease: "Back.easeOut",
    });
    this.scene.tweens.add({
      targets: this.buttonHitArea,
      alpha: 1,
      duration: 500,
      delay: 300,
      ease: "Power2",
    });
  }
  public hide(): void {
    this.setVisible(false);
    this.celebrateSprite.stop();
  }
}
