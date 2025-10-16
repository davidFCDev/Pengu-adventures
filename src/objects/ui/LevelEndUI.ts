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

  constructor(scene: Phaser.Scene, scoreData?: any) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.scoreData = scoreData || null;

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

    // Contenedor del modal (más grande para el desglose del score)
    const modalHeight = this.scoreData ? 550 : 400; // Más alto si hay scoreData
    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0x000000, 0.85); // Negro suave (85% opacidad)
    modalBg.fillRoundedRect(
      centerX - 200,
      centerY - modalHeight / 2,
      400,
      modalHeight,
      20
    );
    modalBg.lineStyle(8, 0x000000, 1); // Borde negro 100%
    modalBg.strokeRoundedRect(
      centerX - 200,
      centerY - modalHeight / 2,
      400,
      modalHeight,
      20
    );
    modalBg.setScrollFactor(0);
    this.add(modalBg);

    // Texto "LEVEL COMPLETE!" con fuente Bangers (más arriba sin sprite)
    const completeText = this.scene.add.text(
      centerX,
      centerY - modalHeight / 2 + 80,
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

    // 1. Monedas
    if (this.scoreData.coinsCollected !== undefined) {
      const coinsText = this.scene.add.text(
        startX,
        currentY,
        `Coins: ${this.scoreData.coinsCollected}/${this.scoreData.totalCoins}  (+${this.scoreData.coinPoints})`,
        {
          fontFamily: "Bangers",
          fontSize: "28px", // Aumentado de 24px a 28px
          color: "#FFD700", // Dorado para monedas
        }
      );
      coinsText.setOrigin(0.5);
      coinsText.setScrollFactor(0);
      this.add(coinsText);
      currentY += lineHeight;
    }

    // 2. Mini-Pingus
    if (this.scoreData.miniPingusCollected !== undefined) {
      const pinguText = this.scene.add.text(
        startX,
        currentY,
        `Mini-Pingus: ${this.scoreData.miniPingusCollected}/${this.scoreData.totalMiniPingus}  (+${this.scoreData.miniPinguPoints})`,
        {
          fontFamily: "Bangers",
          fontSize: "28px", // Aumentado de 24px a 28px
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
      const timeText = this.scene.add.text(
        startX,
        currentY,
        `Time: ${formatTime(this.scoreData.timeInSeconds)}  (${formatMultiplier(
          this.scoreData.timeMultiplier
        )})`,
        {
          fontFamily: "Bangers",
          fontSize: "28px", // Aumentado de 24px a 28px
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
      const livesText = this.scene.add.text(
        startX,
        currentY,
        `Lives Lost: ${this.scoreData.livesMissed}  (${formatMultiplier(
          this.scoreData.livesMultiplier
        )})`,
        {
          fontFamily: "Bangers",
          fontSize: "28px", // Aumentado de 24px a 28px
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
        fontFamily: "Bangers",
        fontSize: "44px", // Aumentado de 40px a 44px
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
    // Guardar score si existe
    if (this.scoreData && this.scoreData.finalScore !== undefined) {
      ScoreManager.saveScore({
        levelNumber: this.scoreData.levelNumber,
        score: this.scoreData.finalScore,
        coinsCollected: this.scoreData.coinsCollected,
        totalCoins: this.scoreData.totalCoins,
        miniPingusCollected: this.scoreData.miniPingusCollected,
        totalMiniPingus: this.scoreData.totalMiniPingus,
        timeInSeconds: this.scoreData.timeInSeconds,
        livesMissed: this.scoreData.livesMissed,
      });
    }

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
