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

    console.log(
      "🎯 LevelEndUI creado - isBossLevel:",
      this.isBossLevel,
      "scoreData:",
      this.scoreData
    );

    // Fijar al centro de la cámara
    this.setScrollFactor(0);
    this.setDepth(20000);
    this.createUI();
    this.setVisible(false);
  }
  private createUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Fondo overlay oscuro - estilo Pudgy
    this.background = this.scene.add.rectangle(
      centerX,
      centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.8 // Aumentado de 0.7 a 0.8 para más contraste
    );
    this.background.setScrollFactor(0);
    this.add(this.background);

    // Contenedor del modal (MUCHO MÁS GRANDE) - estilo Pudgy
    const modalWidth = 650; // Aumentado de 500 a 650
    const modalHeight = this.scoreData ? 700 : 550; // Aumentado de 550/400 a 700/550
    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0xe8f4f8, 1); // Blanco/celeste claro (estilo Pudgy)
    modalBg.fillRoundedRect(
      centerX - modalWidth / 2,
      centerY - modalHeight / 2,
      modalWidth,
      modalHeight,
      25 // Bordes más redondeados
    );
    modalBg.lineStyle(8, 0x000000, 1); // Borde más grueso (de 6 a 8)
    modalBg.strokeRoundedRect(
      centerX - modalWidth / 2,
      centerY - modalHeight / 2,
      modalWidth,
      modalHeight,
      25
    );
    modalBg.setScrollFactor(0);
    this.add(modalBg);

    // Texto "LEVEL COMPLETE!" - MUCHO MÁS GRANDE
    const completeText = this.scene.add.text(
      centerX,
      centerY - modalHeight / 2 + 100, // Más espacio desde arriba
      this.titleText,
      {
        fontFamily: "TT-Trailers",
        fontSize: "80px", // Aumentado de 60px a 80px
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 10, // Aumentado de 8 a 10
      }
    );
    completeText.setOrigin(0.5, 0.5);
    completeText.setScrollFactor(0);
    this.add(completeText);

    // Mostrar desglose del score si existe
    if (this.scoreData) {
      this.createScoreBreakdown(centerX, centerY - modalHeight / 2 + 180); // Ajustado
    }

    // Botón "Next Level"
    const buttonY = this.scoreData
      ? centerY + modalHeight / 2 - 80 // Más espacio desde abajo
      : centerY + 180;
    this.createNextButton(centerX, buttonY);
  }

  /**
   * Crear desglose visual del score
   */
  private createScoreBreakdown(startX: number, startY: number): void {
    const lineHeight = 55; // Aumentado de 42 a 55 para más espacio
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

    // 1. Monedas (solo mostrar si NO es boss level) - amarillo dorado con stroke
    console.log(
      "🪙 Verificando monedas - isBossLevel:",
      this.isBossLevel,
      "coinsCollected:",
      this.scoreData.coinsCollected
    );
    if (!this.isBossLevel && this.scoreData.coinsCollected !== undefined) {
      const coinsText = this.scene.add.text(
        startX,
        currentY,
        `Coins: ${this.scoreData.coinsCollected}/${this.scoreData.totalCoins}  (+${this.scoreData.coinPoints})`,
        {
          fontFamily: "TT-Trailers",
          fontSize: "46px", // Aumentado de 36px a 46px
          color: "#FFD700", // Amarillo dorado
          stroke: "#000000",
          strokeThickness: 6, // Aumentado de 5 a 6
        }
      );
      coinsText.setOrigin(0.5);
      coinsText.setScrollFactor(0);
      this.add(coinsText);
      currentY += lineHeight;
    }

    // 2. Mini-Pingus (solo mostrar si NO es boss level) - celeste con stroke
    console.log(
      "🐧 Verificando mini-pingus - isBossLevel:",
      this.isBossLevel,
      "miniPingusCollected:",
      this.scoreData.miniPingusCollected
    );
    if (!this.isBossLevel && this.scoreData.miniPingusCollected !== undefined) {
      const pinguText = this.scene.add.text(
        startX,
        currentY,
        `Mini-Pingus: ${this.scoreData.miniPingusCollected}/${this.scoreData.totalMiniPingus}  (+${this.scoreData.miniPinguPoints})`,
        {
          fontFamily: "TT-Trailers",
          fontSize: "46px", // Aumentado de 36px a 46px
          color: "#00D9FF", // Celeste brillante
          stroke: "#000000",
          strokeThickness: 6, // Aumentado de 5 a 6
        }
      );
      pinguText.setOrigin(0.5);
      pinguText.setScrollFactor(0);
      this.add(pinguText);
      currentY += lineHeight;
    }

    // 3. Tiempo - blanco con stroke
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
          fontFamily: "TT-Trailers",
          fontSize: "46px", // Aumentado de 36px a 46px
          color: "#ffffff", // Blanco
          stroke: "#000000",
          strokeThickness: 6, // Aumentado de 5 a 6
        }
      );
      timeText.setOrigin(0.5);
      timeText.setScrollFactor(0);
      this.add(timeText);
      currentY += lineHeight;
    }

    // 4. Vidas perdidas - rojo suave con stroke
    if (this.scoreData.livesMissed !== undefined) {
      const livesMultiplierText = this.scoreData.livesMultiplier
        ? `  (${formatMultiplier(this.scoreData.livesMultiplier)})`
        : "";
      const livesText = this.scene.add.text(
        startX,
        currentY,
        `Lives Lost: ${this.scoreData.livesMissed}${livesMultiplierText}`,
        {
          fontFamily: "TT-Trailers",
          fontSize: "46px", // Aumentado de 36px a 46px
          color: "#FF6B6B", // Rojo suave
          stroke: "#000000",
          strokeThickness: 6, // Aumentado de 5 a 6
        }
      );
      livesText.setOrigin(0.5);
      livesText.setScrollFactor(0);
      this.add(livesText);
      currentY += lineHeight + 20; // Aumentado de 15 a 20
    }

    // Línea separadora - estilo Pudgy
    const line = this.scene.add.graphics();
    line.lineStyle(4, 0x000000, 0.4); // Más gruesa y visible
    line.beginPath();
    line.moveTo(startX - 200, currentY); // Más larga
    line.lineTo(startX + 200, currentY);
    line.strokePath();
    line.setScrollFactor(0);
    this.add(line);
    currentY += 50; // Aumentado de 40 a 50 para más espacio antes del score

    // 5. Score Final - blanco con stroke negro (estilo Pudgy) - MUY GRANDE
    const finalScoreText = this.scene.add.text(
      startX,
      currentY,
      `SCORE: ${this.scoreData.finalScore}`,
      {
        fontFamily: "TT-Trailers",
        fontSize: "70px", // Aumentado de 52px a 70px
        color: "#ffffff", // Blanco con stroke negro
        stroke: "#000000",
        strokeThickness: 10, // Aumentado de 8 a 10
      }
    );
    finalScoreText.setOrigin(0.5);
    finalScoreText.setScrollFactor(0);
    this.add(finalScoreText);
  }
  private createNextButton(x: number, y: number): void {
    // Botón verde menta (primario) - MUCHO MÁS GRANDE
    const buttonWidth = 280; // Aumentado de 200 a 280
    const buttonHeight = 80; // Aumentado de 60 a 80
    const halfWidth = buttonWidth / 2;
    const halfHeight = buttonHeight / 2;

    this.buttonGraphics = this.scene.add.graphics();
    this.buttonGraphics.fillStyle(0x00d4aa, 1); // Verde menta
    this.buttonGraphics.fillRoundedRect(
      x - halfWidth,
      y - halfHeight,
      buttonWidth,
      buttonHeight,
      15
    );
    this.buttonGraphics.lineStyle(6, 0x000000, 1); // Borde más grueso
    this.buttonGraphics.strokeRoundedRect(
      x - halfWidth,
      y - halfHeight,
      buttonWidth,
      buttonHeight,
      15
    );
    this.buttonGraphics.setScrollFactor(0);
    this.buttonGraphics.setDepth(1001);
    this.add(this.buttonGraphics);

    // Texto del botón - MUCHO MÁS GRANDE
    const buttonLabel = this.isBossLevel ? "BACK" : "NEXT LEVEL";
    this.buttonText = this.scene.add.text(x, y, buttonLabel, {
      fontFamily: "TT-Trailers",
      fontSize: "50px", // Aumentado de 36px a 50px
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7, // Aumentado de 5 a 7
    });
    this.buttonText.setOrigin(0.5);
    this.buttonText.setScrollFactor(0);
    this.buttonText.setDepth(1002);
    this.add(this.buttonText);

    // Hit area invisible para interactividad
    this.buttonHitArea = this.scene.add.rectangle(
      x,
      y,
      buttonWidth,
      buttonHeight,
      0x000000,
      0
    );
    this.buttonHitArea.setInteractive({ useHandCursor: true });
    this.buttonHitArea.setScrollFactor(0);
    this.buttonHitArea.setDepth(1003);
    this.add(this.buttonHitArea);

    // Efectos hover - verde menta
    this.buttonHitArea.on("pointerover", () => {
      this.buttonGraphics.clear();
      this.buttonGraphics.fillStyle(0x00f0c8, 1); // Verde menta más claro en hover
      this.buttonGraphics.fillRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15
      );
      this.buttonGraphics.lineStyle(6, 0x000000, 1);
      this.buttonGraphics.strokeRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15
      );
      this.buttonText.setScale(1.05);
    });
    this.buttonHitArea.on("pointerout", () => {
      this.buttonGraphics.clear();
      this.buttonGraphics.fillStyle(0x00d4aa, 1); // Volver al verde menta
      this.buttonGraphics.fillRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15
      );
      this.buttonGraphics.lineStyle(6, 0x000000, 1);
      this.buttonGraphics.strokeRoundedRect(
        x - halfWidth,
        y - halfHeight,
        buttonWidth,
        buttonHeight,
        15
      );
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

      ScoreManager.saveScore(
        {
          levelNumber: levelNumber,
          score: this.scoreData.finalScore,
          coinsCollected: this.scoreData.coinsCollected || 0,
          totalCoins: this.scoreData.totalCoins || 0,
          miniPingusCollected: this.scoreData.miniPingusCollected || 0,
          totalMiniPingus: this.scoreData.totalMiniPingus || 0,
          timeInSeconds: this.scoreData.timeInSeconds,
          livesMissed: this.scoreData.livesMissed,
        },
        true
      ); // unlockNext: true porque completó el nivel exitosamente

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
