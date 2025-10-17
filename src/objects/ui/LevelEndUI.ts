import { ScoreManager } from "../../systems/ScoreManager";

/**
 * UI que se muestra cuando el jugador completa el nivel
 */
export class LevelEndUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Rectangle;
  private buttonGraphics!: Phaser.GameObjects.Graphics;
  private buttonText!: Phaser.GameObjects.Text;
  private buttonHitArea!: Phaser.GameObjects.Rectangle;
  private scoreData: any; // Datos del score calculado
  private titleText: string; // Texto del título (customizable)
  private isBossLevel: boolean; // Indica si es el nivel del boss

  constructor(
    scene: Phaser.Scene,
    scoreData?: any,
    titleText?: string,
    isBossLevel: boolean = false
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.scoreData = scoreData || null;
    this.titleText = titleText || "LEVEL COMPLETE!"; // Default o customizado
    this.isBossLevel = isBossLevel; // Guardar flag de boss level

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
      0.65 // Reducido de 0.7 a 0.65
    );
    this.background.setScrollFactor(0);
    this.add(this.background);

    // Contenedor del modal (más grande para el desglose del score)
    const modalWidth = 500; // Aumentado de 400 a 500
    const modalHeight = this.scoreData ? 550 : 400; // Más alto si hay scoreData
    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0x000000, 0.8); // Reducido de 0.85 a 0.8
    modalBg.fillRoundedRect(
      centerX - modalWidth / 2,
      centerY - modalHeight / 2,
      modalWidth,
      modalHeight,
      20
    );
    modalBg.lineStyle(8, 0x000000, 1); // Borde negro 100%
    modalBg.strokeRoundedRect(
      centerX - modalWidth / 2,
      centerY - modalHeight / 2,
      modalWidth,
      modalHeight,
      20
    );
    modalBg.setScrollFactor(0);
    this.add(modalBg);

    // Texto "LEVEL COMPLETE!" (o texto customizado) con fuente Fobble (más arriba sin sprite)
    const completeText = this.scene.add.text(
      centerX,
      centerY - modalHeight / 2 + 80,
      this.titleText,
      {
        fontFamily: "Fobble",
        fontSize: "60px", // Aumentado de 56px a 60px
        color: "#ffffff",
        padding: { right: 10 },
      }
    );
    completeText.setOrigin(0.5, 0.5);
    completeText.setScrollFactor(0);
    this.add(completeText);

    // Mostrar desglose del score si existe
    if (this.scoreData) {
      this.createScoreBreakdown(centerX, centerY - modalHeight / 2 + 140);
    }

    // Botón "Next Level"
    const buttonY = this.scoreData
      ? centerY + modalHeight / 2 - 60
      : centerY + 140;
    this.createNextButton(centerX, buttonY);
  }

  /**
   * Crear desglose visual del score
   */
  private createScoreBreakdown(startX: number, startY: number): void {
    const lineHeight = 36; // Aumentado de 32 a 36
    let currentY = startY;

    // Helper para formatear tiempo
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Helper para formatear multiplicador
    const formatMultiplier = (mult: number): string => {
      return `x${mult.toFixed(1)}`;
    };

    // 1. Monedas (solo mostrar si NO es boss level)
    if (!this.isBossLevel && this.scoreData.coinsCollected !== undefined) {
      const coinsText = this.scene.add.text(
        startX,
        currentY,
        `Coins: ${this.scoreData.coinsCollected}/${this.scoreData.totalCoins}  (+${this.scoreData.coinPoints})`,
        {
          fontFamily: "Fobble",
          fontSize: "36px", // Aumentado de 32px a 36px
          color: "#FFD700", // Dorado para monedas
        }
      );
      coinsText.setOrigin(0.5);
      coinsText.setScrollFactor(0);
      this.add(coinsText);
      currentY += lineHeight;
    }

    // 2. Mini-Pingus (solo mostrar si NO es boss level)
    if (!this.isBossLevel && this.scoreData.miniPingusCollected !== undefined) {
      const pinguText = this.scene.add.text(
        startX,
        currentY,
        `Mini-Pingus: ${this.scoreData.miniPingusCollected}/${this.scoreData.totalMiniPingus}  (+${this.scoreData.miniPinguPoints})`,
        {
          fontFamily: "Fobble",
          fontSize: "36px", // Aumentado de 32px a 36px
          color: "#00D9FF", // Celeste para mini-pingus
        }
      );
      pinguText.setOrigin(0.5);
      pinguText.setScrollFactor(0);
      this.add(pinguText);
      currentY += lineHeight;
    }

    // 3. Tiempo
    if (this.scoreData.timeInSeconds !== undefined) {
      const timeMultiplierText = this.scoreData.timeMultiplier
        ? `  (${formatMultiplier(this.scoreData.timeMultiplier)})`
        : "";
      const timeText = this.scene.add.text(
        startX,
        currentY,
        `Time: ${formatTime(
          this.scoreData.timeInSeconds
        )}${timeMultiplierText}`,
        {
          fontFamily: "Fobble",
          fontSize: "36px", // Aumentado de 32px a 36px
          color: "#FFFFFF",
        }
      );
      timeText.setOrigin(0.5);
      timeText.setScrollFactor(0);
      this.add(timeText);
      currentY += lineHeight;
    }

    // 4. Vidas perdidas
    if (this.scoreData.livesMissed !== undefined) {
      const livesMultiplierText = this.scoreData.livesMultiplier
        ? `  (${formatMultiplier(this.scoreData.livesMultiplier)})`
        : "";
      const livesText = this.scene.add.text(
        startX,
        currentY,
        `Lives Lost: ${this.scoreData.livesMissed}${livesMultiplierText}`,
        {
          fontFamily: "Fobble",
          fontSize: "36px", // Aumentado de 32px a 36px
          color: "#FF6B6B", // Rojo suave para vidas
        }
      );
      livesText.setOrigin(0.5);
      livesText.setScrollFactor(0);
      this.add(livesText);
      currentY += lineHeight + 15; // Aumentado el espacio extra antes del total
    }

    // Línea separadora
    const line = this.scene.add.graphics();
    line.lineStyle(3, 0xffffff, 0.5);
    line.beginPath();
    line.moveTo(startX - 150, currentY);
    line.lineTo(startX + 150, currentY);
    line.strokePath();
    line.setScrollFactor(0);
    this.add(line);
    currentY += 30; // Aumentado de 20 a 30 para más espacio

    // 5. Score Final (más grande y destacado)
    const finalScoreText = this.scene.add.text(
      startX,
      currentY,
      `SCORE: ${this.scoreData.finalScore}`,
      {
        fontFamily: "Fobble",
        fontSize: "52px", // Aumentado de 48px a 52px
        color: "#FFDE59", // Amarillo como los botones
        stroke: "#000000",
        strokeThickness: 4,
      }
    );
    finalScoreText.setOrigin(0.5);
    finalScoreText.setScrollFactor(0);
    this.add(finalScoreText);
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

    // Texto del botón con fuente Bangers (cambia según si es boss level)
    const buttonLabel = this.isBossLevel ? "BACK" : "NEXT LEVEL";
    this.buttonText = this.scene.add.text(x, y, buttonLabel, {
      fontFamily: "Fobble",
      fontSize: "36px", // Aumentado de 32px a 36px
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
    // Guardar score si existe
    if (this.scoreData && this.scoreData.finalScore !== undefined) {
      // Para boss level, usar levelNumber 6 (FirstBoss es el nivel 6)
      const levelNumber = this.isBossLevel ? 6 : this.scoreData.levelNumber;

      ScoreManager.saveScore({
        levelNumber: levelNumber,
        score: this.scoreData.finalScore,
        coinsCollected: this.scoreData.coinsCollected || 0,
        totalCoins: this.scoreData.totalCoins || 0,
        miniPingusCollected: this.scoreData.miniPingusCollected || 0,
        totalMiniPingus: this.scoreData.totalMiniPingus || 0,
        timeInSeconds: this.scoreData.timeInSeconds,
        livesMissed: this.scoreData.livesMissed,
      });

      console.log(
        `✅ Score guardado para nivel ${levelNumber} (Boss: ${this.isBossLevel})`
      );
    }

    // Ocultar UI primero
    this.hide();

    const currentScene = this.scene;
    currentScene.time.delayedCall(200, () => {
      // Si es boss level, siempre volver al Roadmap
      if (this.isBossLevel) {
        console.log("🎯 Boss derrotado! Volviendo al Roadmap...");
        currentScene.scene.start("Roadmap");
        return;
      }

      // Para niveles normales, obtener el índice del nivel actual
      const sceneKey = currentScene.scene.key;
      const levelIndex = this.getLevelIndexFromSceneKey(sceneKey);

      // Desbloquear el siguiente nivel
      if (levelIndex !== -1 && levelIndex < 5) {
        // 0-4 son Level1-5, 5 es FirstBoss
        console.log(
          `Level ${levelIndex + 1} completed! Next level: ${levelIndex + 2}`
        );
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

    // Animar entrada
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: "Power2",
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
  }
}
