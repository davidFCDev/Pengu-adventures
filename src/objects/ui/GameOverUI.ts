// GameOverUI.ts - Modal de Game Over con estilo similar a LevelEndUI
import {
  calculateLevelScore,
  type LevelStats,
} from "../../systems/ScoreSystem";

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
    this.setDepth(20000);
    scene.add.existing(this);
  }

  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Fondo oscuro semi-transparente (overlay) - MUCHO MÁS OSCURO
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.85); // Aumentado de 0.7 a 0.85
    this.background.fillRect(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
    );
    this.background.setScrollFactor(0);
    this.background.setDepth(999);
    this.add(this.background);

    // Modal blanco/celeste claro con borde negro - MUCHO MÁS GRANDE
    const modalWidth = 550; // Aumentado de 400 a 550
    const modalHeight = 550; // Aumentado de 400 a 550
    const halfWidth = modalWidth / 2;
    const halfHeight = modalHeight / 2;

    this.modalBackground = this.scene.add.graphics();
    this.modalBackground.fillStyle(0xe8f4f8, 1); // Blanco/celeste claro
    this.modalBackground.fillRoundedRect(
      centerX - halfWidth,
      centerY - halfHeight,
      modalWidth,
      modalHeight,
      25, // Bordes más redondeados
    );
    this.modalBackground.lineStyle(8, 0x000000, 1); // Borde más grueso (de 6 a 8)
    this.modalBackground.strokeRoundedRect(
      centerX - halfWidth,
      centerY - halfHeight,
      modalWidth,
      modalHeight,
      25,
    );
    this.modalBackground.setScrollFactor(0);
    this.modalBackground.setDepth(1000);
    this.add(this.modalBackground);

    // Texto gracioso aleatorio - MUCHO MÁS GRANDE
    this.titleText = this.scene.add.text(centerX, centerY - 70, "", {
      fontFamily: "Fobble",
      fontSize: "60px", // Aumentado de 42px a 60px
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 10, // Aumentado de 8 a 10
      align: "center",
      lineSpacing: 8, // Más espacio entre líneas
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setScrollFactor(0);
    this.titleText.setDepth(1000);
    this.add(this.titleText);

    // Botones más separados y más grandes
    this.createBackButton(centerX - 120, centerY + 130); // Más abajo y más separados
    this.createRetryButton(centerX + 120, centerY + 130);
  }

  private createBackButton(x: number, y: number): void {
    // Botón blanco (secundario) - MUCHO MÁS GRANDE
    const buttonWidth = 200; // Aumentado de 150 a 200
    const buttonHeight = 75; // Aumentado de 60 a 75
    const halfWidth = buttonWidth / 2;
    const halfHeight = buttonHeight / 2;

    this.backButtonGraphics = this.scene.add.graphics();
    this.backButtonGraphics.fillStyle(0xffffff, 1); // Blanco
    this.backButtonGraphics.fillRoundedRect(
      x - halfWidth,
      y - halfHeight,
      buttonWidth,
      buttonHeight,
      15,
    );
    this.backButtonGraphics.lineStyle(6, 0x000000, 1); // Borde más grueso
    this.backButtonGraphics.strokeRoundedRect(
      x - halfWidth,
      y - halfHeight,
      buttonWidth,
      buttonHeight,
      15,
    );
    this.backButtonGraphics.setScrollFactor(0);
    this.backButtonGraphics.setDepth(1001);
    this.add(this.backButtonGraphics);

    // Texto del botón - MUCHO MÁS GRANDE
    this.backButtonText = this.scene.add.text(x, y, "BACK", {
      fontFamily: "Fobble",
      fontSize: "46px", // Aumentado de 32px a 46px
      color: "#2d2d2d", // Gris oscuro
      stroke: "#000000",
      strokeThickness: 5, // Aumentado de 3 a 5
    });
    this.backButtonText.setOrigin(0.5);
    this.backButtonText.setScrollFactor(0);
    this.backButtonText.setDepth(1002);
    this.add(this.backButtonText);

    // Hit area invisible para interactividad
    this.backButtonHitArea = this.scene.add.rectangle(
      x,
      y,
      buttonWidth,
      buttonHeight,
      0x000000,
      0,
    );
    this.backButtonHitArea.setInteractive({ useHandCursor: true });
    this.backButtonHitArea.setScrollFactor(0);
    this.backButtonHitArea.setDepth(1003);
    this.add(this.backButtonHitArea);

    // Efectos hover - blanco/gris
    this.backButtonHitArea.on("pointerover", () => {
      this.backButtonGraphics.clear();
      this.backButtonGraphics.fillStyle(0xf0f0f0, 1); // Gris muy claro en hover
      this.backButtonGraphics.fillRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
      this.backButtonGraphics.lineStyle(6, 0x000000, 1);
      this.backButtonGraphics.strokeRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
      this.backButtonText.setScale(1.05);
    });
    this.backButtonHitArea.on("pointerout", () => {
      this.backButtonGraphics.clear();
      this.backButtonGraphics.fillStyle(0xffffff, 1); // Volver al blanco
      this.backButtonGraphics.fillRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
      this.backButtonGraphics.lineStyle(6, 0x000000, 1);
      this.backButtonGraphics.strokeRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
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
    // Botón amarillo (primario) - MUCHO MÁS GRANDE
    const buttonWidth = 200; // Aumentado de 150 a 200
    const buttonHeight = 75; // Aumentado de 60 a 75
    const halfWidth = buttonWidth / 2;
    const halfHeight = buttonHeight / 2;

    this.retryButtonGraphics = this.scene.add.graphics();
    this.retryButtonGraphics.fillStyle(0xffd966, 1); // Amarillo suave
    this.retryButtonGraphics.fillRoundedRect(
      x - halfWidth,
      y - halfHeight,
      buttonWidth,
      buttonHeight,
      15,
    );
    this.retryButtonGraphics.lineStyle(6, 0x000000, 1); // Borde más grueso
    this.retryButtonGraphics.strokeRoundedRect(
      x - halfWidth,
      y - halfHeight,
      buttonWidth,
      buttonHeight,
      15,
    );
    this.retryButtonGraphics.setScrollFactor(0);
    this.retryButtonGraphics.setDepth(1001);
    this.add(this.retryButtonGraphics);

    // Texto del botón - MUCHO MÁS GRANDE
    this.retryButtonText = this.scene.add.text(x, y, "RETRY", {
      fontFamily: "Fobble",
      fontSize: "46px", // Aumentado de 32px a 46px
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7, // Aumentado de 5 a 7
    });
    this.retryButtonText.setOrigin(0.5);
    this.retryButtonText.setScrollFactor(0);
    this.retryButtonText.setDepth(1002);
    this.add(this.retryButtonText);

    // Hit area invisible para interactividad
    this.retryButtonHitArea = this.scene.add.rectangle(
      x,
      y,
      buttonWidth,
      buttonHeight,
      0x000000,
      0,
    );
    this.retryButtonHitArea.setInteractive({ useHandCursor: true });
    this.retryButtonHitArea.setScrollFactor(0);
    this.retryButtonHitArea.setDepth(1003);
    this.add(this.retryButtonHitArea);

    // Efectos hover - amarillo suave
    this.retryButtonHitArea.on("pointerover", () => {
      this.retryButtonGraphics.clear();
      this.retryButtonGraphics.fillStyle(0xffe699, 1); // Amarillo más claro en hover
      this.retryButtonGraphics.fillRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
      this.retryButtonGraphics.lineStyle(6, 0x000000, 1);
      this.retryButtonGraphics.strokeRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
      this.retryButtonText.setScale(1.05);
    });
    this.retryButtonHitArea.on("pointerout", () => {
      this.retryButtonGraphics.clear();
      this.retryButtonGraphics.fillStyle(0xffd966, 1); // Volver al amarillo suave
      this.retryButtonGraphics.fillRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
      this.retryButtonGraphics.lineStyle(6, 0x000000, 1);
      this.retryButtonGraphics.strokeRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15,
      );
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

  /**
   * Enviar score al SDK cuando pierdes las 3 vidas (sin persistencia)
   */
  private sendScoreToSDK(currentLevelStats?: any): void {
    console.log("🎮 Game Over - Enviando score al SDK...");

    let levelScore = 0;

    // Calcular score del nivel actual si hay stats
    if (currentLevelStats && currentLevelStats.levelNumber) {
      const { levelNumber, accumulatedScore, ...levelStats } =
        currentLevelStats;
      const scoreBreakdown = calculateLevelScore(levelStats as LevelStats);
      levelScore = scoreBreakdown.finalScore;
      console.log("🎯 Score del nivel:", levelScore);
    }

    // Score total = acumulado (niveles anteriores) + score parcial del nivel actual
    const accumulatedScore = currentLevelStats?.accumulatedScore || 0;
    const totalScore = accumulatedScore + levelScore;
    console.log(
      `💰 Score total: ${accumulatedScore} (acumulado) + ${levelScore} (nivel) = ${totalScore}`,
    );

    // Enviar al SDK con gameOver (sin guardar estado)
    setTimeout(() => {
      if (window.FarcadeSDK) {
        try {
          window.FarcadeSDK.singlePlayer.actions.gameOver({
            score: totalScore,
          });
          console.log("✅ Score enviado al SDK:", totalScore);
        } catch (error) {
          console.error("❌ Error al enviar score al SDK:", error);
        }
      } else {
        console.warn("⚠️ SDK no disponible - Score no enviado");
      }
    }, 300);
  }

  public show(currentLevelStats?: any): void {
    // 🎮 ENVÍO AUTOMÁTICO DE SCORE AL PERDER
    // Solo enviamos el score al SDK, NO mostramos ningún modal
    // El SDK mostrará su propia pantalla de "Play Again"
    console.log(
      "🎮 Game Over - Enviando score y esperando pantalla del SDK...",
    );
    this.sendScoreToSDK(currentLevelStats);

    // NO mostrar ningún modal, el SDK maneja la UI
    // La pantalla queda congelada hasta que el SDK muestre su interfaz
  }

  public hide(): void {
    this.setVisible(false);
  }
}
