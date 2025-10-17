import { ScoreManager } from "../ScoreManager";
import { LevelConfig } from "./RoadmapConfig";

/**
 * Sistema de Modal para mostrar información de niveles
 * Maneja la creación, animación y cierre del modal
 */
export class RoadmapModal {
  private scene: Phaser.Scene;
  private modalContainer: Phaser.GameObjects.Container | null = null;
  private modalBackground: Phaser.GameObjects.Graphics | null = null;
  private modalOverlay: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Mostrar modal de confirmación de nivel
   */
  public show(levelConfig: LevelConfig, onStart: () => void): void {
    this.createOverlay();
    this.createModalContainer();
    this.createModalContent(levelConfig, onStart);
    this.animateIn();
  }

  /**
   * Crear overlay oscuro de fondo
   */
  private createOverlay(): void {
    this.modalOverlay = this.scene.add.graphics();
    this.modalOverlay.fillStyle(0x000000, 0.65);
    this.modalOverlay.fillRect(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height
    );
    this.modalOverlay.setDepth(1000);
    this.modalOverlay.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height
      ),
      Phaser.Geom.Rectangle.Contains
    );

    // Click fuera del modal para cerrarlo
    this.modalOverlay.on("pointerdown", () => {
      this.close();
    });
  }

  /**
   * Crear contenedor del modal (centrado)
   */
  private createModalContainer(): void {
    this.modalContainer = this.scene.add.container(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2
    );
    this.modalContainer.setDepth(1001);

    // Fondo del modal
    this.modalBackground = this.scene.add.graphics();
    this.modalBackground.fillStyle(0x000000, 0.8);
    this.modalBackground.fillRoundedRect(-225, -260, 450, 520, 20);
    this.modalBackground.lineStyle(8, 0x000000, 1);
    this.modalBackground.strokeRoundedRect(-225, -260, 450, 520, 20);
    this.modalContainer.add(this.modalBackground);
  }

  /**
   * Crear contenido del modal
   */
  private createModalContent(
    levelConfig: LevelConfig,
    onStart: () => void
  ): void {
    if (!this.modalContainer) return;

    // Título
    const titleText = this.scene.add.text(0, -200, levelConfig.displayName, {
      fontFamily: "Fobble",
      fontSize: "60px", // Aumentado de 56px a 60px
      color: "#ffffff",
      padding: { right: 10 },
    });
    titleText.setOrigin(0.5, 0.5);
    this.modalContainer.add(titleText);

    // Subtítulo
    const subtitleText = this.scene.add.text(0, -145, levelConfig.subtitle, {
      fontFamily: "Fobble",
      fontSize: "36px", // Aumentado de 32px a 36px
      color: "#CCCCCC",
      padding: { right: 10 },
    });
    subtitleText.setOrigin(0.5, 0.5);
    this.modalContainer.add(subtitleText);

    // Línea divisoria
    const dividerLine = this.scene.add.graphics();
    dividerLine.lineStyle(3, 0xffffff, 0.5);
    dividerLine.beginPath();
    dividerLine.moveTo(-150, -110);
    dividerLine.lineTo(150, -110);
    dividerLine.strokePath();
    this.modalContainer.add(dividerLine);

    // Obtener datos del mejor run
    const scoreData = ScoreManager.getScore(levelConfig.levelNumber);

    // Mostrar stats si existen
    this.createStatsSection(levelConfig, scoreData);

    // Botón START
    this.createStartButton(onStart);
  }

  /**
   * Crear sección de estadísticas
   */
  private createStatsSection(levelConfig: LevelConfig, scoreData: any): void {
    if (!this.modalContainer) return;

    // Texto "Your Best Run:" o "Not Played Yet"
    const bestRunText = this.scene.add.text(
      0,
      -65,
      scoreData ? "YOUR BEST RUN:" : "NOT PLAYED YET",
      {
        fontFamily: "Fobble",
        fontSize: "36px", // Aumentado de 32px a 36px
        color: scoreData ? "#00D9FF" : "#888888",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    bestRunText.setOrigin(0.5, 0.5);
    this.modalContainer.add(bestRunText);

    // Solo mostrar stats si hay scoreData
    if (scoreData) {
      this.createCollectiblesStats(levelConfig, scoreData);
      this.createLivesStats(scoreData);
      this.createScoreDisplay(scoreData);
    }
  }

  /**
   * Crear stats de coleccionables (Mini-Pingus y Coins)
   */
  private createCollectiblesStats(
    levelConfig: LevelConfig,
    scoreData: any
  ): void {
    if (!this.modalContainer) return;

    const statsY = -5;
    const leftGroupX = -70;
    const rightGroupX = 70;

    // Mini-Pingu
    const miniPinguIcon = this.scene.add.image(
      leftGroupX - 30,
      statsY,
      "mini-pingu"
    );
    miniPinguIcon.setScale(1.0);
    this.modalContainer.add(miniPinguIcon);

    const miniPinguCount = scoreData.miniPingusCollected ?? 0;
    const miniPinguText = this.scene.add.text(
      leftGroupX + 10,
      statsY,
      `${miniPinguCount}/${levelConfig.miniPingus}`,
      {
        fontFamily: "Fobble",
        fontSize: "40px", // Aumentado de 36px a 40px
        color: "#ffffff",
        padding: { right: 10 },
      }
    );
    miniPinguText.setOrigin(0, 0.5);
    this.modalContainer.add(miniPinguText);

    // Coins
    const coinIcon = this.scene.add.image(
      rightGroupX - 30,
      statsY,
      "PT_TOKEN_MASTER_001"
    );
    coinIcon.setScale(1.4);
    this.modalContainer.add(coinIcon);

    const coinCount = scoreData.coinsCollected ?? 0;
    const coinText = this.scene.add.text(
      rightGroupX + 10,
      statsY,
      `${coinCount}/${levelConfig.coins}`,
      {
        fontFamily: "Fobble",
        fontSize: "40px", // Aumentado de 36px a 40px
        color: "#ffffff",
        padding: { right: 10 },
      }
    );
    coinText.setOrigin(0, 0.5);
    this.modalContainer.add(coinText);
  }

  /**
   * Crear visualización de vidas (corazones)
   */
  private createLivesStats(scoreData: any): void {
    if (!this.modalContainer) return;

    const livesY = 55;
    const livesRemaining = 3 - (scoreData.livesMissed ?? 0);
    const heartSpacing = 50;
    const startHeartX = -heartSpacing;

    for (let i = 0; i < 3; i++) {
      const heartX = startHeartX + i * heartSpacing;
      const heartFrame = i < livesRemaining ? 0 : 2;
      const heart = this.scene.add.image(
        heartX,
        livesY,
        "heart_spritesheet",
        heartFrame
      );
      heart.setScale(1.3);
      this.modalContainer.add(heart);
    }
  }

  /**
   * Crear display del score
   */
  private createScoreDisplay(scoreData: any): void {
    if (!this.modalContainer) return;

    const scoreText = this.scene.add.text(0, 130, `SCORE: ${scoreData.score}`, {
      fontFamily: "Fobble",
      fontSize: "52px", // Aumentado de 48px a 52px
      color: "#FFDE59",
      stroke: "#000000",
      strokeThickness: 4,
    });
    scoreText.setOrigin(0.5, 0.5);
    this.modalContainer.add(scoreText);
  }

  /**
   * Crear botón START
   */
  private createStartButton(onStart: () => void): void {
    if (!this.modalContainer) return;

    const startButtonY = 210;

    // Gráfico del botón
    const startButton = this.scene.add.graphics();
    const drawButton = (color: number) => {
      startButton.clear();
      startButton.fillStyle(color, 1);
      startButton.fillRoundedRect(-100, startButtonY - 30, 200, 60, 15);
      startButton.lineStyle(6, 0x000000, 1);
      startButton.strokeRoundedRect(-100, startButtonY - 30, 200, 60, 15);
    };
    drawButton(0xffde59);
    this.modalContainer.add(startButton);

    // Texto del botón
    const startText = this.scene.add.text(0, startButtonY, "START", {
      fontFamily: "Fobble",
      fontSize: "44px", // Aumentado de 40px a 44px
      color: "#000000",
      padding: { right: 10 },
    });
    startText.setOrigin(0.5, 0.5);
    this.modalContainer.add(startText);

    // Área interactiva
    const startButtonHitArea = this.scene.add.rectangle(
      0,
      startButtonY,
      200,
      60
    );
    startButtonHitArea.setInteractive({ useHandCursor: true });
    this.modalContainer.add(startButtonHitArea);

    // Eventos
    startButtonHitArea.on("pointerdown", () => {
      this.close();
      this.scene.time.delayedCall(100, () => {
        onStart();
      });
    });

    startButtonHitArea.on("pointerover", () => drawButton(0xffd040));
    startButtonHitArea.on("pointerout", () => drawButton(0xffde59));
  }

  /**
   * Animar entrada del modal
   */
  private animateIn(): void {
    if (!this.modalContainer) return;

    this.modalContainer.setScale(0.5);
    this.modalContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.modalContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 200,
      ease: "Back.easeOut",
    });
  }

  /**
   * Cerrar el modal con animación
   */
  public close(): void {
    if (!this.modalContainer) return;

    this.scene.tweens.add({
      targets: this.modalContainer,
      scaleX: 0.5,
      scaleY: 0.5,
      alpha: 0,
      duration: 150,
      ease: "Back.easeIn",
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Destruir el modal
   */
  private destroy(): void {
    this.modalContainer?.destroy();
    this.modalOverlay?.destroy();
    this.modalBackground?.destroy();
    this.modalContainer = null;
    this.modalOverlay = null;
    this.modalBackground = null;
  }

  /**
   * Verificar si el modal está activo
   */
  public isActive(): boolean {
    return this.modalContainer !== null;
  }
}
