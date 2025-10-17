import { LevelConfig, RoadmapConfig } from "./RoadmapConfig";

/**
 * Sistema de Botones de Nivel para el Roadmap
 * Maneja la creación, interactividad y estados visuales de los botones
 */
export class RoadmapButtons {
  private scene: Phaser.Scene;
  private buttons: Phaser.GameObjects.Image[] = [];
  private numberTexts: Phaser.GameObjects.Text[] = [];
  private selectedLevel: number | null = null;
  private onLevelClick: (levelIndex: number) => void;

  constructor(scene: Phaser.Scene, onLevelClick: (levelIndex: number) => void) {
    this.scene = scene;
    this.onLevelClick = onLevelClick;
  }

  /**
   * Crear todos los botones de nivel según la configuración
   */
  public createButtons(): void {
    RoadmapConfig.LEVELS.forEach((levelConfig, index) => {
      this.createLevelButton(levelConfig, index);
    });
  }

  /**
   * Crear un botón de nivel individual
   */
  private createLevelButton(levelConfig: LevelConfig, index: number): void {
    // Crear el botón
    const button = this.scene.add.image(
      levelConfig.x,
      levelConfig.y,
      RoadmapConfig.BUTTON_TEXTURES.unlocked
    );
    button.setScale(RoadmapConfig.BUTTON_STYLE.scale);
    button.setInteractive({ useHandCursor: true });
    this.buttons.push(button);

    // Crear número o texto "BOSS"
    this.createLevelNumber(levelConfig, index);

    // Configurar eventos del botón
    this.setupButtonEvents(button, index);
  }

  /**
   * Crear texto de número de nivel o "BOSS"
   */
  private createLevelNumber(levelConfig: LevelConfig, index: number): void {
    const isBoss = levelConfig.levelNumber === 6;
    const displayText = isBoss ? "BOSS" : `${levelConfig.levelNumber}`;
    const fontSize = isBoss
      ? RoadmapConfig.BUTTON_STYLE.bossFontSize
      : RoadmapConfig.BUTTON_STYLE.numberFontSize;

    const numberText = this.scene.add.text(
      levelConfig.x,
      levelConfig.y + RoadmapConfig.BUTTON_STYLE.numberOffsetY,
      displayText,
      {
        fontFamily: "Fobble",
        fontSize: fontSize,
        color: "#ffffff",
        stroke: "#333333",
        strokeThickness: isBoss ? 10 : 12,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000",
          blur: 6,
          fill: true,
        },
        padding: { right: 10 },
      }
    );
    numberText.setOrigin(0.5, 0.5);
    this.numberTexts.push(numberText);
  }

  /**
   * Configurar eventos de un botón
   */
  private setupButtonEvents(
    button: Phaser.GameObjects.Image,
    levelIndex: number
  ): void {
    button.on("pointerdown", () => this.handleClick(levelIndex));
    button.on("pointerover", () => this.handleHover(levelIndex));
    button.on("pointerout", () => this.handleOut(levelIndex));
  }

  /**
   * Manejar click en un botón
   */
  private handleClick(levelIndex: number): void {
    const levelConfig = RoadmapConfig.LEVELS[levelIndex];

    // Si el nivel está bloqueado, no hacer nada
    if (!levelConfig.isUnlocked) {
      console.log(`Level ${levelIndex + 1} is locked!`);
      return;
    }

    // Seleccionar el nivel
    this.selectedLevel = levelIndex;
    this.updateButtonStates();

    // Llamar callback
    this.onLevelClick(levelIndex);
  }

  /**
   * Manejar hover sobre un botón
   */
  private handleHover(levelIndex: number): void {
    const levelConfig = RoadmapConfig.LEVELS[levelIndex];
    const button = this.buttons[levelIndex];

    if (levelConfig.isUnlocked && this.selectedLevel !== levelIndex) {
      this.scene.tweens.add({
        targets: button,
        scaleX: RoadmapConfig.BUTTON_STYLE.scale + 0.05,
        scaleY: RoadmapConfig.BUTTON_STYLE.scale + 0.05,
        duration: 100,
        ease: "Power2",
      });
    }
  }

  /**
   * Manejar salida del hover
   */
  private handleOut(levelIndex: number): void {
    const levelConfig = RoadmapConfig.LEVELS[levelIndex];
    const button = this.buttons[levelIndex];

    if (levelConfig.isUnlocked && this.selectedLevel !== levelIndex) {
      this.scene.tweens.add({
        targets: button,
        scaleX: RoadmapConfig.BUTTON_STYLE.scale,
        scaleY: RoadmapConfig.BUTTON_STYLE.scale,
        duration: 100,
        ease: "Power2",
      });
    }
  }

  /**
   * Actualizar estados visuales de todos los botones
   */
  public updateButtonStates(): void {
    this.buttons.forEach((button, index) => {
      const levelConfig = RoadmapConfig.LEVELS[index];

      if (this.selectedLevel === index) {
        button.setTexture(RoadmapConfig.BUTTON_TEXTURES.selected);
      } else if (levelConfig.isUnlocked) {
        button.setTexture(RoadmapConfig.BUTTON_TEXTURES.unlocked);
      } else {
        button.setTexture(RoadmapConfig.BUTTON_TEXTURES.locked);
      }
    });
  }

  /**
   * Deseleccionar nivel actual
   */
  public deselectLevel(): void {
    this.selectedLevel = null;
    this.updateButtonStates();
  }

  /**
   * Obtener configuración del nivel seleccionado
   */
  public getSelectedLevelConfig(): LevelConfig | null {
    if (this.selectedLevel === null) return null;
    return RoadmapConfig.LEVELS[this.selectedLevel];
  }

  /**
   * Desbloquear el siguiente nivel
   */
  public unlockNextLevel(currentLevelIndex: number): void {
    const nextLevelIndex = currentLevelIndex + 1;
    if (nextLevelIndex < RoadmapConfig.LEVELS.length) {
      RoadmapConfig.LEVELS[nextLevelIndex].isUnlocked = true;
      this.updateButtonStates();
    }
  }
}
