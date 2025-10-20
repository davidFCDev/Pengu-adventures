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
  private scrollZone?: Phaser.GameObjects.Zone;
  private contentContainer?: Phaser.GameObjects.Container;
  private maskGraphics?: Phaser.GameObjects.Graphics;
  private scrollBar?: Phaser.GameObjects.Graphics;
  private scrollThumb?: Phaser.GameObjects.Graphics;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private scrollStartY: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // Semi-transparent background (overlay) - más oscuro para contraste
    this.background = scene.add.rectangle(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0.7
    );
    this.add(this.background);

    // Main modal - ESTILO PUDGY: Fondo blanco/claro con borde negro grueso
    const modalWidth = 600;
    const modalHeight = 780;
    const modalX = scene.cameras.main.width / 2;
    const modalY = scene.cameras.main.height / 2;

    this.modalBackground = scene.add.graphics();
    // Fondo blanco/celeste claro (estilo Pudgy)
    this.modalBackground.fillStyle(0xe8f4f8, 1);
    this.modalBackground.fillRoundedRect(
      modalX - modalWidth / 2,
      modalY - modalHeight / 2,
      modalWidth,
      modalHeight,
      20
    );
    // Borde negro grueso (estilo Pudgy)
    this.modalBackground.lineStyle(6, 0x000000, 1);
    this.modalBackground.strokeRoundedRect(
      modalX - modalWidth / 2,
      modalY - modalHeight / 2,
      modalWidth,
      modalHeight,
      20
    );
    this.add(this.modalBackground);

    // Title - MAYÚSCULAS con outline negro (estilo Pudgy)
    this.titleText = scene.add.text(
      modalX,
      modalY - modalHeight / 2 + 70,
      "INSTRUCTIONS",
      {
        fontFamily: "TT-Trailers",
        fontSize: "56px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      }
    );
    this.titleText.setOrigin(0.5, 0.5);
    this.add(this.titleText);

    // Área de contenido con scroll
    const contentAreaX = modalX - modalWidth / 2 + 40;
    const contentAreaY = modalY - modalHeight / 2 + 140;
    const contentAreaWidth = modalWidth - 80;
    const contentAreaHeight = modalHeight - 280; // Espacio para título y botón

    // Fondo blanco para el área de contenido (mismo color que el modal)
    const contentBackground = scene.add.graphics();
    contentBackground.fillStyle(0xe8f4f8, 1); // Mismo color que el fondo del modal
    contentBackground.fillRect(
      contentAreaX,
      contentAreaY,
      contentAreaWidth,
      contentAreaHeight
    );
    this.add(contentBackground);

    // Instructions content - MUCHO MÁS GRANDE
    const instructionsContent = `Basic controls:
• arrow keys or wasd - move the penguin
• spacebar - jump
• spacebar (double tap) - double jump
• e or click - throw snowball

Objective:
• collect coins and mini-penguins
• collect keys to open doors
• reach the goal to complete the level

Save your progress:
• your progress is automatically saved
• use "save & exit" on the roadmap when
  you're done playing to submit your final score`;

    this.instructionsText = scene.add.text(
      contentAreaX + 10,
      contentAreaY + 10,
      instructionsContent,
      {
        fontFamily: "TT-Trailers",
        fontSize: "38px", // Aumentado de 34px a 38px para mejor legibilidad
        color: "#2d2d2d",
        align: "left",
        lineSpacing: 16, // Aumentado de 14 a 16
        wordWrap: { width: contentAreaWidth - 40 },
      }
    );
    this.instructionsText.setOrigin(0, 0);
    this.add(this.instructionsText);

    // Crear máscara para el área de scroll (invisible, solo para recortar)
    this.maskGraphics = scene.add.graphics();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(
      contentAreaX,
      contentAreaY,
      contentAreaWidth,
      contentAreaHeight
    );
    this.maskGraphics.setVisible(false); // La máscara no debe ser visible
    const mask = this.maskGraphics.createGeometryMask();
    this.instructionsText.setMask(mask);

    // Zona interactiva para scroll con rueda del ratón
    this.scrollZone = scene.add.zone(
      contentAreaX + contentAreaWidth / 2,
      contentAreaY + contentAreaHeight / 2,
      contentAreaWidth,
      contentAreaHeight
    );
    this.scrollZone.setInteractive();
    this.scrollZone.setScrollFactor(0);
    this.add(this.scrollZone);

    // Scroll con rueda del ratón
    this.scrollZone.on(
      "wheel",
      (pointer: any, deltaX: number, deltaY: number) => {
        const scrollSpeed = 30;
        const newY = this.instructionsText.y - deltaY * scrollSpeed * 0.01;
        const minY =
          contentAreaY +
          10 -
          Math.max(0, this.instructionsText.height - contentAreaHeight + 20);
        const maxY = contentAreaY + 10;
        this.instructionsText.y = Phaser.Math.Clamp(newY, minY, maxY);
        this.updateScrollBar();
      }
    );

    // Scroll táctil (drag)
    this.scrollZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.scrollStartY = this.instructionsText.y;
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaY = pointer.y - this.dragStartY;
        const newY = this.scrollStartY + deltaY;
        const minY =
          contentAreaY +
          10 -
          Math.max(0, this.instructionsText.height - contentAreaHeight + 20);
        const maxY = contentAreaY + 10;
        this.instructionsText.y = Phaser.Math.Clamp(newY, minY, maxY);
        this.updateScrollBar();
      }
    });

    scene.input.on("pointerup", () => {
      this.isDragging = false;
    });

    // Barra de scroll visual (opcional, solo si el contenido es más grande)
    const scrollBarWidth = 8;
    const scrollBarX = contentAreaX + contentAreaWidth + 10;

    this.scrollBar = scene.add.graphics();
    this.scrollBar.fillStyle(0xcccccc, 0.5);
    this.scrollBar.fillRoundedRect(
      scrollBarX,
      contentAreaY,
      scrollBarWidth,
      contentAreaHeight,
      4
    );
    this.add(this.scrollBar);

    this.scrollThumb = scene.add.graphics();
    this.updateScrollBar();
    this.add(this.scrollThumb);

    // "GOT IT!" button - estilo Pudgy (verde menta/turquesa)
    const closeButtonWidth = 180;
    const closeButtonHeight = 55;
    const closeButtonX = modalX;
    const closeButtonY = modalY + modalHeight / 2 - 50;

    this.closeButton = scene.add.graphics();
    // Verde menta/turquesa (estilo Pudgy - botón principal)
    this.closeButton.fillStyle(0x00d4aa, 1);
    this.closeButton.fillRoundedRect(
      closeButtonX - closeButtonWidth / 2,
      closeButtonY - closeButtonHeight / 2,
      closeButtonWidth,
      closeButtonHeight,
      12
    );
    // Borde negro (estilo Pudgy)
    this.closeButton.lineStyle(5, 0x000000, 1);
    this.closeButton.strokeRoundedRect(
      closeButtonX - closeButtonWidth / 2,
      closeButtonY - closeButtonHeight / 2,
      closeButtonWidth,
      closeButtonHeight,
      12
    );
    this.add(this.closeButton);

    this.closeButtonText = scene.add.text(
      closeButtonX,
      closeButtonY,
      "GOT IT!",
      {
        fontFamily: "TT-Trailers",
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
      }
    );
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

    // Hover effect - verde menta más claro
    this.closeButtonHitArea.on("pointerover", () => {
      this.closeButton.clear();
      this.closeButton.fillStyle(0x00f0c8, 1); // Verde menta más claro en hover
      this.closeButton.fillRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        12
      );
      this.closeButton.lineStyle(5, 0x000000, 1);
      this.closeButton.strokeRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        12
      );
    });

    this.closeButtonHitArea.on("pointerout", () => {
      this.closeButton.clear();
      this.closeButton.fillStyle(0x00d4aa, 1); // Verde menta normal
      this.closeButton.fillRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        12
      );
      this.closeButton.lineStyle(5, 0x000000, 1);
      this.closeButton.strokeRoundedRect(
        closeButtonX - closeButtonWidth / 2,
        closeButtonY - closeButtonHeight / 2,
        closeButtonWidth,
        closeButtonHeight,
        12
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
   * Actualizar la posición y tamaño del thumb de la scrollbar
   */
  private updateScrollBar(): void {
    if (!this.scrollThumb || !this.instructionsText || !this.scrollBar) return;

    const modalWidth = 600;
    const modalHeight = 780;
    const modalX = this.scene.cameras.main.width / 2;
    const modalY = this.scene.cameras.main.height / 2;
    const contentAreaX = modalX - modalWidth / 2 + 40;
    const contentAreaY = modalY - modalHeight / 2 + 140;
    const contentAreaWidth = modalWidth - 80;
    const contentAreaHeight = modalHeight - 280;
    const scrollBarWidth = 8;
    const scrollBarX = contentAreaX + contentAreaWidth + 10;

    const contentHeight = this.instructionsText.height;
    const visibleRatio = contentAreaHeight / contentHeight;

    // Solo mostrar scrollbar si el contenido es más grande que el área visible
    if (visibleRatio >= 1) {
      this.scrollBar.setVisible(false);
      this.scrollThumb.setVisible(false);
      return;
    }

    this.scrollBar.setVisible(true);
    this.scrollThumb.setVisible(true);

    const thumbHeight = Math.max(20, contentAreaHeight * visibleRatio);
    const scrollableDistance = contentHeight - contentAreaHeight + 20;
    const currentScroll = contentAreaY + 10 - this.instructionsText.y;
    const scrollProgress =
      scrollableDistance > 0 ? currentScroll / scrollableDistance : 0;
    const thumbY =
      contentAreaY + (contentAreaHeight - thumbHeight) * scrollProgress;

    this.scrollThumb.clear();
    this.scrollThumb.fillStyle(0x666666, 0.8);
    this.scrollThumb.fillRoundedRect(
      scrollBarX,
      thumbY,
      scrollBarWidth,
      thumbHeight,
      4
    );
  }

  /**
   * Mostrar el modal
   */
  public show(): void {
    this.setVisible(true);
    this.setActive(true);

    // Actualizar scrollbar por si acaso
    this.updateScrollBar();

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
