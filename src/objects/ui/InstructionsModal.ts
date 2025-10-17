/**
 * Instructions modal for the game
 * Shows basic controls and how to save progress
 */
export default class InstructionsModal extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private modalBackground: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private instructionsText: Phaser.GameObjects.Text;
  private closeButton: Phaser.GameObjects.Graphics;
  private closeButtonText: Phaser.GameObjects.Text;
  private closeButtonHitArea: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // Semi-transparent background (overlay)
    this.background = scene.add.rectangle(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0.8
    );
    this.add(this.background);

    // Main modal (dark background like other modals)
    const modalWidth = 600;
    const modalHeight = 700; // Increased from 620 to 700 for better spacing
    const modalX = scene.cameras.main.width / 2;
    const modalY = scene.cameras.main.height / 2;

    this.modalBackground = scene.add.graphics();
    this.modalBackground.fillStyle(0x1a1a1a, 1); // Dark background
    this.modalBackground.fillRoundedRect(
      modalX - modalWidth / 2,
      modalY - modalHeight / 2,
      modalWidth,
      modalHeight,
      16
    );
    // White border
    this.modalBackground.lineStyle(4, 0xffffff, 1);
    this.modalBackground.strokeRoundedRect(
      modalX - modalWidth / 2,
      modalY - modalHeight / 2,
      modalWidth,
      modalHeight,
      16
    );
    this.add(this.modalBackground);

    // Title
    this.titleText = scene.add.text(
      modalX,
      modalY - modalHeight / 2 + 60,
      "INSTRUCTIONS",
      {
        fontFamily: "Fobble",
        fontSize: "52px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
        fontStyle: "bold",
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
    this.add(this.titleText);

    // Instructions content
    const instructionsContent = `BASIC CONTROLS:

• ARROW KEYS or WASD - Move the penguin
• SPACEBAR - Jump
• SPACEBAR (double tap) - Double jump
• E or CLICK - Throw snowball

OBJECTIVE:
• Collect coins and mini-penguins
• Collect keys to open doors
• Reach the goal to complete the level

SAVE YOUR PROGRESS:
• Your progress is automatically saved
• Use "Save & Exit" on the Roadmap when
  you're done playing to submit your final score`;

    this.instructionsText = scene.add.text(
      modalX,
      modalY + 20,
      instructionsContent,
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
        align: "left",
        lineSpacing: 10,
      }
    );
    this.instructionsText.setOrigin(0.5, 0.5);
    this.add(this.instructionsText);

    // "Close" button
    const closeButtonWidth = 120;
    const closeButtonHeight = 45;
    const closeButtonX = modalX;
    const closeButtonY = modalY + modalHeight / 2 - 40;

    this.closeButton = scene.add.graphics();
    this.closeButton.fillStyle(0x00aa00, 1); // Green
    this.closeButton.fillRoundedRect(
      closeButtonX - closeButtonWidth / 2,
      closeButtonY - closeButtonHeight / 2,
      closeButtonWidth,
      closeButtonHeight,
      8
    );
    this.closeButton.lineStyle(3, 0x000000, 1);
    this.closeButton.strokeRoundedRect(
      closeButtonX - closeButtonWidth / 2,
      closeButtonY - closeButtonHeight / 2,
      closeButtonWidth,
      closeButtonHeight,
      8
    );
    this.add(this.closeButton);

    this.closeButtonText = scene.add.text(closeButtonX, closeButtonY, "CLOSE", {
      fontFamily: "Fobble",
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      fontStyle: "bold",
    });
    this.closeButtonText.setOrigin(0.5, 0.5);
    this.add(this.closeButtonText);

    // Interactive area for close button
    this.closeButtonHitArea = scene.add.rectangle(
      closeButtonX,
      closeButtonY,
      closeButtonWidth,
      closeButtonHeight,
      0x000000,
      0.01
    );
    this.closeButtonHitArea.setInteractive({ useHandCursor: true });
    this.closeButtonHitArea.setOrigin(0.5, 0.5);
    this.add(this.closeButtonHitArea);

    // Hover effect
    this.closeButtonHitArea.on("pointerover", () => {
      this.closeButton.clear();
      this.closeButton.fillStyle(0x008800, 1); // Darker green
      this.closeButton.fillRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        8
      );
      this.closeButton.lineStyle(3, 0x000000, 1);
      this.closeButton.strokeRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        8
      );
    });

    this.closeButtonHitArea.on("pointerout", () => {
      this.closeButton.clear();
      this.closeButton.fillStyle(0x00aa00, 1); // Normal green
      this.closeButton.fillRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        8
      );
      this.closeButton.lineStyle(3, 0x000000, 1);
      this.closeButton.strokeRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        8
      );
    });

    // Click event
    this.closeButtonHitArea.on("pointerdown", () => {
      scene.tweens.add({
        targets: this.closeButtonText,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.hide();
        },
      });
    });

    // Configurar profundidad y scrollFactor
    this.setScrollFactor(0);
    this.setDepth(2000); // Por encima de todo

    // Inicialmente oculto
    this.setVisible(false);
    this.setActive(false);

    // Agregar a la escena
    scene.add.existing(this);
  }

  /**
   * Mostrar el modal
   */
  public show(): void {
    this.setVisible(true);
    this.setActive(true);

    // Animación de entrada (fade in + escala)
    this.setAlpha(0);
    this.setScale(0.8);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Back.easeOut",
    });
  }

  /**
   * Ocultar el modal
   */
  public hide(): void {
    // Animación de salida (fade out + escala)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 150,
      ease: "Back.easeIn",
      onComplete: () => {
        this.setVisible(false);
        this.setActive(false);
      },
    });
  }
}
