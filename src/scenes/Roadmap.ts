// You can write more code here
import InstructionsModal from "../objects/ui/InstructionsModal";
import { ScoreManager } from "../systems/ScoreManager";

/* START OF COMPILED CODE */

class Roadmap extends Phaser.Scene {
  constructor() {
    super("Roadmap");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    // Fondo del roadmap (será ajustado en create() para ser responsive)
    this.backgroundImage = this.add.image(384, 512, "road-page");
    this.backgroundImage.setOrigin(0.5, 0.5);

    // Título principal "FROSTLAND" (sin subtítulo)
    this.titleText = this.add.text(384, 100, "FROSTLAND", {
      fontFamily: "TT-Trailers",
      fontSize: "120px",
      color: "#FFE66D", // Amarillo
      stroke: "#000000", // Borde negro
      strokeThickness: 12,
      shadow: {
        offsetX: 6,
        offsetY: 6,
        color: "#000000",
        blur: 10,
        fill: true,
      },
      padding: { right: 10 },
    });
    this.titleText.setOrigin(0.5, 0.5);

    // Level 1 Button
    this.level1Button = this.add.image(128, 864, "button-2");
    this.level1Button.scaleX = 0.6;
    this.level1Button.scaleY = 0.6;

    // Level 2 Button
    this.level2Button = this.add.image(592, 752, "button-3");
    this.level2Button.scaleX = 0.6;
    this.level2Button.scaleY = 0.6;

    // Level 3 Button
    this.level3Button = this.add.image(336, 672, "button-3");
    this.level3Button.scaleX = 0.6;
    this.level3Button.scaleY = 0.6;

    // Level 4 Button
    this.level4Button = this.add.image(208, 528, "button-3");
    this.level4Button.scaleX = 0.6;
    this.level4Button.scaleY = 0.6;

    // Level 5 Button
    this.level5Button = this.add.image(576, 464, "button-3");
    this.level5Button.scaleX = 0.6;
    this.level5Button.scaleY = 0.6;

    // Level 6 Button (Boss)
    this.level6Button = this.add.image(336, 384, "button-3");
    this.level6Button.scaleX = 0.6;
    this.level6Button.scaleY = 0.6;

    // Pingüino decorativo
    const penguImage = this.add.image(
      384,
      880,
      "nano-banana-2025-10-16T23-35-20 (1)"
    );
    penguImage.scaleX = 0.9;
    penguImage.scaleY = 0.9;

    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

  // Imagen de fondo
  private backgroundImage!: Phaser.GameObjects.Image;

  // Título
  private titleText!: Phaser.GameObjects.Text;

  // Referencias a los botones de nivel
  private level1Button!: Phaser.GameObjects.Image;
  private level2Button!: Phaser.GameObjects.Image;
  private level3Button!: Phaser.GameObjects.Image;
  private level4Button!: Phaser.GameObjects.Image;
  private level5Button!: Phaser.GameObjects.Image;
  private level6Button!: Phaser.GameObjects.Image;

  // Textos de números de nivel
  private levelNumberTexts: Phaser.GameObjects.Text[] = [];

  // Modal de confirmación de nivel
  private modalContainer: Phaser.GameObjects.Container | null = null;
  private modalBackground: Phaser.GameObjects.Graphics | null = null;
  private modalOverlay: Phaser.GameObjects.Graphics | null = null;

  // Footer con score total y botones
  private footerBackground!: Phaser.GameObjects.Rectangle;
  private totalScoreText!: Phaser.GameObjects.Text;
  private totalScoreNumber!: Phaser.GameObjects.Text; // Número del score en negro
  private exitButtonGraphics!: Phaser.GameObjects.Graphics;
  private exitButtonText!: Phaser.GameObjects.Text;
  private exitButtonHitArea!: Phaser.GameObjects.Rectangle;
  private infoButtonGraphics!: Phaser.GameObjects.Graphics;
  private infoButtonText!: Phaser.GameObjects.Text;
  private infoButtonHitArea!: Phaser.GameObjects.Rectangle;
  private instructionsModal?: any; // Modal de instrucciones

  // NOTA: Estado de niveles desbloqueados ahora se gestiona desde ScoreManager
  // Para compatibilidad temporal durante migración
  private get levelsUnlocked(): boolean[] {
    return ScoreManager.getUnlockedLevelsAsBoolean();
  }

  // Nivel actualmente seleccionado (null = ninguno)
  private selectedLevel: number | null = null;

  // Música de fondo
  private music!: Phaser.Sound.BaseSound;

  // Totales de collectibles por nivel
  private readonly levelTotals = [
    { miniPingus: 3, coins: 29 }, // Level 1
    { miniPingus: 3, coins: 30 }, // Level 2
    { miniPingus: 3, coins: 30 }, // Level 3
    { miniPingus: 3, coins: 30 }, // Level 4
    { miniPingus: 3, coins: 30 }, // Level 5
    { miniPingus: 0, coins: 0 }, // Level 6 (Boss - sin collectibles)
  ];

  create() {
    this.editorCreate();

    // Hacer el fondo responsive
    this.makeBackgroundResponsive();

    // Crear el footer con Total Score y botón Save & Exit
    this.createFooter();

    // Crear los botones con sus números
    this.createLevelButtons();

    // Aplicar estado inicial de los botones
    this.updateButtonStates();

    // Reproducir música del Roadmap
    this.setupRoadmapMusic();

    // Actualizar el Total Score y música cuando se vuelve a esta escena
    this.events.on(
      "wake",
      () => {
        this.updateTotalScore();
        this.setupRoadmapMusic(); // Reiniciar música al volver
      },
      this
    );
  }

  /**
   * Actualizar el texto del Total Score
   */
  private updateTotalScore(): void {
    const totalScore = this.calculateTotalScore();
    this.totalScoreNumber.setText(`${totalScore}`);
    console.log(`📊 Total Score actualizado: ${totalScore}`);
  }

  /**
   * Configurar música del Roadmap (evita duplicación)
   */
  private setupRoadmapMusic(): void {
    // 1. Detener y destruir música anterior si existe
    if (this.music) {
      if (this.music.isPlaying) {
        this.music.stop();
      }
      this.music.destroy();
    }

    // 2. Detener TODAS las instancias de roadmap_music que puedan estar sonando
    this.sound.getAllPlaying().forEach((sound) => {
      if (sound.key === "roadmap_music") {
        sound.stop();
        sound.destroy();
      }
    });

    // 3. Crear y reproducir nueva música
    console.log("🎵 Iniciando música del Roadmap");
    this.music = this.sound.add("roadmap_music", {
      loop: true,
      volume: 0.5,
    });
    this.music.play();
  }

  /**
   * Hacer que el fondo sea responsive y ocupe todo el height
   */
  private makeBackgroundResponsive(): void {
    const { width, height } = this.cameras.main;

    // Centrar la imagen en el canvas
    this.backgroundImage.setPosition(width / 2, height / 2);

    // Obtener las dimensiones originales de la imagen
    const imageWidth = this.backgroundImage.width;
    const imageHeight = this.backgroundImage.height;

    // 🎨 Calcular aspect ratios
    const imageAspect = imageWidth / imageHeight;
    const screenAspect = width / height;

    // 📐 Mantener aspect ratio y hacer zoom para cubrir (como object-fit: cover)
    // Usa la escala que cubra completamente sin estirar
    let scale: number;
    if (screenAspect > imageAspect) {
      // Pantalla más ancha que la imagen: escalar por ancho
      scale = width / imageWidth;
    } else {
      // Pantalla más alta que la imagen: escalar por altura con zoom mínimo
      scale = height / imageHeight;
    }

    // 🔍 Aplicar un zoom adicional del 5% para evitar bordes y cubrir mejor
    scale *= 1.05;

    // Aplicar la escala uniforme (sin estirar)
    this.backgroundImage.setScale(scale);

    // Posicionar título de manera responsive
    this.titleText.setPosition(width / 2, 100);

    // Opcional: Hacer que la imagen se ajuste si cambia el tamaño de la ventana
    this.scale.on("resize", (gameSize: { width: number; height: number }) => {
      const newScreenAspect = gameSize.width / gameSize.height;

      let newScale: number;
      if (newScreenAspect > imageAspect) {
        newScale = gameSize.width / imageWidth;
      } else {
        newScale = gameSize.height / imageHeight;
      }

      // Aplicar zoom del 5%
      newScale *= 1.05;

      this.backgroundImage.setPosition(gameSize.width / 2, gameSize.height / 2);
      this.backgroundImage.setScale(newScale);

      // Reposicionar título
      this.titleText.setPosition(gameSize.width / 2, 100);

      // Reposicionar footer
      this.updateFooterPosition();
    });
  }

  /**
   * Crear footer con Total Score y botón Save & Exit
   */
  private createFooter(): void {
    const { width, height } = this.cameras.main;
    const footerHeight = 80;

    // Fondo claro del footer (estilo Pudgy)
    this.footerBackground = this.add.rectangle(
      width / 2,
      height - footerHeight / 2,
      width,
      footerHeight,
      0xe8f4f8, // Blanco/celeste claro (estilo Pudgy)
      1
    );
    this.footerBackground.setOrigin(0.5, 0.5);
    this.footerBackground.setScrollFactor(0);
    this.footerBackground.setDepth(1000);

    // Borde superior negro (estilo Pudgy)
    const footerBorder = this.add.graphics();
    footerBorder.lineStyle(6, 0x000000, 1);
    footerBorder.beginPath();
    footerBorder.moveTo(0, height - footerHeight);
    footerBorder.lineTo(width, height - footerHeight);
    footerBorder.strokePath();
    footerBorder.setScrollFactor(0);
    footerBorder.setDepth(1000);

    // Calcular Total Score sumando los mejores scores de todos los niveles
    const totalScore = this.calculateTotalScore();

    // Texto "TOTAL SCORE:" a la izquierda (blanco con stroke negro)
    this.totalScoreText = this.add.text(
      30,
      height - footerHeight / 2,
      "TOTAL SCORE: ",
      {
        fontFamily: "TT-Trailers",
        fontSize: "42px",
        color: "#ffffff", // Blanco con stroke negro (estilo Pudgy)
        stroke: "#000000",
        strokeThickness: 8,
      }
    );
    this.totalScoreText.setOrigin(0, 0.5);
    this.totalScoreText.setScrollFactor(0);
    this.totalScoreText.setDepth(1001);

    // Número del score (blanco con stroke negro)
    const textWidth = this.totalScoreText.width;
    this.totalScoreNumber = this.add.text(
      30 + textWidth,
      height - footerHeight / 2,
      `${totalScore}`,
      {
        fontFamily: "TT-Trailers",
        fontSize: "42px",
        color: "#ffffff", // Blanco con stroke negro (estilo Pudgy)
        stroke: "#000000",
        strokeThickness: 8,
      }
    );
    this.totalScoreNumber.setOrigin(0, 0.5);
    this.totalScoreNumber.setScrollFactor(0);
    this.totalScoreNumber.setDepth(1001);

    // Botón HELP a la derecha (antes del Exit)
    const helpButtonWidth = 110;
    const helpButtonHeight = 50;
    const exitButtonWidth = 180;
    const exitButtonX = width - exitButtonWidth / 2 - 30;
    const helpButtonX =
      exitButtonX - exitButtonWidth / 2 - helpButtonWidth / 2 - 15; // 15px de separación
    const helpButtonY = height - footerHeight / 2;

    // Graphics del botón HELP - estilo Pudgy (amarillo suave)
    this.infoButtonGraphics = this.add.graphics();
    this.infoButtonGraphics.fillStyle(0xffd966, 1); // Amarillo suave (estilo Pudgy)
    this.infoButtonGraphics.fillRoundedRect(
      helpButtonX - helpButtonWidth / 2,
      helpButtonY - helpButtonHeight / 2,
      helpButtonWidth,
      helpButtonHeight,
      12
    );
    this.infoButtonGraphics.lineStyle(5, 0x000000, 1); // Borde negro grueso
    this.infoButtonGraphics.strokeRoundedRect(
      helpButtonX - helpButtonWidth / 2,
      helpButtonY - helpButtonHeight / 2,
      helpButtonWidth,
      helpButtonHeight,
      12
    );
    this.infoButtonGraphics.setScrollFactor(0);
    this.infoButtonGraphics.setDepth(1001);

    // Texto "HELP" del botón
    this.infoButtonText = this.add.text(helpButtonX, helpButtonY, "HELP", {
      fontFamily: "TT-Trailers",
      fontSize: "36px",
      color: "#ffffff", // Blanco con stroke negro (estilo Pudgy)
      stroke: "#000000",
      strokeThickness: 5,
      fontStyle: "bold",
    });
    this.infoButtonText.setOrigin(0.5, 0.5);
    this.infoButtonText.setScrollFactor(0);
    this.infoButtonText.setDepth(1002);

    // HitArea del botón HELP
    this.infoButtonHitArea = this.add.rectangle(
      helpButtonX,
      helpButtonY,
      helpButtonWidth,
      helpButtonHeight,
      0x000000,
      0.01
    );
    this.infoButtonHitArea.setInteractive({ useHandCursor: true });
    this.infoButtonHitArea.setScrollFactor(0);
    this.infoButtonHitArea.setDepth(1002);

    // Hover effects del botón HELP - amarillo más claro
    this.infoButtonHitArea.on("pointerover", () => {
      this.infoButtonGraphics.clear();
      this.infoButtonGraphics.fillStyle(0xffe699, 1); // Amarillo más claro en hover
      this.infoButtonGraphics.fillRoundedRect(
        helpButtonX - helpButtonWidth / 2,
        helpButtonY - helpButtonHeight / 2,
        helpButtonWidth,
        helpButtonHeight,
        12
      );
      this.infoButtonGraphics.lineStyle(5, 0x000000, 1);
      this.infoButtonGraphics.strokeRoundedRect(
        helpButtonX - helpButtonWidth / 2,
        helpButtonY - helpButtonHeight / 2,
        helpButtonWidth,
        helpButtonHeight,
        12
      );
      this.infoButtonText.setScale(1.05);
    });

    this.infoButtonHitArea.on("pointerout", () => {
      this.infoButtonGraphics.clear();
      this.infoButtonGraphics.fillStyle(0xffd966, 1); // Amarillo suave normal
      this.infoButtonGraphics.fillRoundedRect(
        helpButtonX - helpButtonWidth / 2,
        helpButtonY - helpButtonHeight / 2,
        helpButtonWidth,
        helpButtonHeight,
        12
      );
      this.infoButtonGraphics.lineStyle(5, 0x000000, 1);
      this.infoButtonGraphics.strokeRoundedRect(
        helpButtonX - helpButtonWidth / 2,
        helpButtonY - helpButtonHeight / 2,
        helpButtonWidth,
        helpButtonHeight,
        12
      );
      this.infoButtonText.setScale(1);
    });

    this.infoButtonHitArea.on("pointerdown", () => {
      this.infoButtonText.setScale(0.95);
    });

    this.infoButtonHitArea.on("pointerup", () => {
      this.infoButtonText.setScale(1.05);
      this.showInstructionsModal();
    });

    // Botón "Save & Exit" a la derecha
    const buttonWidth = exitButtonWidth;
    const buttonHeight = 50;
    const buttonX = exitButtonX;
    const buttonY = helpButtonY;

    // Graphics del botón Save & Exit - estilo Pudgy (verde menta)
    this.exitButtonGraphics = this.add.graphics();
    this.exitButtonGraphics.fillStyle(0x00d4aa, 1); // Verde menta (botón primario)
    this.exitButtonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      12
    );
    this.exitButtonGraphics.lineStyle(5, 0x000000, 1); // Borde negro grueso
    this.exitButtonGraphics.strokeRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      12
    );
    this.exitButtonGraphics.setScrollFactor(0);
    this.exitButtonGraphics.setDepth(1001);

    // Texto del botón
    this.exitButtonText = this.add.text(buttonX, buttonY, "SAVE & EXIT", {
      fontFamily: "TT-Trailers",
      fontSize: "32px",
      color: "#ffffff", // Blanco con stroke negro (estilo Pudgy)
      stroke: "#000000",
      strokeThickness: 5,
    });
    this.exitButtonText.setOrigin(0.5);
    this.exitButtonText.setScrollFactor(0);
    this.exitButtonText.setDepth(1002);

    // Hit area para interactividad
    this.exitButtonHitArea = this.add.rectangle(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      0x000000,
      0
    );
    this.exitButtonHitArea.setInteractive({ useHandCursor: true });
    this.exitButtonHitArea.setScrollFactor(0);
    this.exitButtonHitArea.setDepth(1003);

    // Efectos hover - mantener verde menta
    this.exitButtonHitArea.on("pointerover", () => {
      this.exitButtonGraphics.clear();
      this.exitButtonGraphics.fillStyle(0x00f0c8, 1); // Verde menta más claro
      this.exitButtonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      );
      this.exitButtonGraphics.lineStyle(5, 0x000000, 1);
      this.exitButtonGraphics.strokeRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      );
      this.exitButtonText.setScale(1.05);
    });

    this.exitButtonHitArea.on("pointerout", () => {
      this.exitButtonGraphics.clear();
      this.exitButtonGraphics.fillStyle(0x00d4aa, 1); // Verde menta normal
      this.exitButtonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      );
      this.exitButtonGraphics.lineStyle(5, 0x000000, 1);
      this.exitButtonGraphics.strokeRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      );
      this.exitButtonText.setScale(1);
    });

    this.exitButtonHitArea.on("pointerdown", () => {
      this.exitButtonText.setScale(0.95);
    });

    this.exitButtonHitArea.on("pointerup", () => {
      this.exitButtonText.setScale(1.05);
      this.onSaveAndExit();
    });
  }

  /**
   * Calcular el Total Score sumando los mejores scores de todos los niveles
   */
  private calculateTotalScore(): number {
    let total = 0;
    for (let i = 1; i <= 6; i++) {
      const levelScore = ScoreManager.getScore(i);
      if (levelScore) {
        total += levelScore.score;
      }
    }
    return total;
  }

  /**
   * Actualizar posición del footer en resize
   */
  private updateFooterPosition(): void {
    const { width, height } = this.cameras.main;
    const footerHeight = 80;
    const exitButtonWidth = 180;
    const helpButtonWidth = 110;
    const buttonHeight = 50;

    // Calcular posiciones de botones
    const exitButtonX = width - exitButtonWidth / 2 - 30;
    const helpButtonX =
      exitButtonX - exitButtonWidth / 2 - helpButtonWidth / 2 - 15;
    const buttonY = height - footerHeight / 2;

    // Reposicionar footer background
    this.footerBackground.setPosition(width / 2, height - footerHeight / 2);
    this.footerBackground.setSize(width, footerHeight);

    // Reposicionar texto de Total Score y número
    this.totalScoreText.setPosition(30, height - footerHeight / 2);
    const textWidth = this.totalScoreText.width;
    this.totalScoreNumber.setPosition(
      30 + textWidth,
      height - footerHeight / 2
    );

    // Redibujar botón HELP (amarillo suave - estilo Pudgy)
    this.infoButtonGraphics.clear();
    this.infoButtonGraphics.fillStyle(0xffd966, 1); // Amarillo suave
    this.infoButtonGraphics.fillRoundedRect(
      helpButtonX - helpButtonWidth / 2,
      buttonY - buttonHeight / 2,
      helpButtonWidth,
      buttonHeight,
      12
    );
    this.infoButtonGraphics.lineStyle(5, 0x000000, 1);
    this.infoButtonGraphics.strokeRoundedRect(
      helpButtonX - helpButtonWidth / 2,
      buttonY - buttonHeight / 2,
      helpButtonWidth,
      buttonHeight,
      12
    );
    this.infoButtonText.setPosition(helpButtonX, buttonY);
    this.infoButtonHitArea.setPosition(helpButtonX, buttonY);

    // Redibujar botón SAVE & EXIT (verde menta - estilo Pudgy)
    this.exitButtonGraphics.clear();
    this.exitButtonGraphics.fillStyle(0x00d4aa, 1); // Verde menta
    this.exitButtonGraphics.fillRoundedRect(
      exitButtonX - exitButtonWidth / 2,
      buttonY - buttonHeight / 2,
      exitButtonWidth,
      buttonHeight,
      12
    );
    this.exitButtonGraphics.lineStyle(5, 0x000000, 1);
    this.exitButtonGraphics.strokeRoundedRect(
      exitButtonX - exitButtonWidth / 2,
      buttonY - buttonHeight / 2,
      exitButtonWidth,
      buttonHeight,
      12
    );
    this.exitButtonText.setPosition(exitButtonX, buttonY);
    this.exitButtonHitArea.setPosition(exitButtonX, buttonY);
  }

  /**
   * Guardar scores en el SDK y lanzar el game over
   */
  private onSaveAndExit(): void {
    console.log("💾 Guardando scores y saliendo del juego...");

    // Calcular score total final
    const finalScore = this.calculateTotalScore();

    // Guardar todos los scores en el SDK (ya se hace automáticamente en ScoreManager)
    // Pero podemos forzar una última sincronización si es necesario

    // Llamar al SDK para finalizar el juego
    if (window.FarcadeSDK) {
      try {
        // Enviar el score final al SDK
        window.FarcadeSDK.singlePlayer.actions.gameOver({
          score: finalScore,
        });
        console.log(`✅ Game Over enviado al SDK con score: ${finalScore}`);
      } catch (error) {
        console.error("❌ Error al enviar game over al SDK:", error);
      }
    } else {
      console.warn("⚠️ FarcadeSDK no disponible, simulando game over local");
      // En desarrollo local, podríamos mostrar un modal o volver al MainPage
      alert(`Game Over!\nTotal Score: ${finalScore}`);
    }
  }

  /**
   * Mostrar modal de instrucciones
   */
  private showInstructionsModal(): void {
    console.log("ℹ️ Mostrando instrucciones...");

    // Crear modal si no existe o reutilizar existente
    if (!this.instructionsModal) {
      this.instructionsModal = new InstructionsModal(this);
    }

    // Mostrar el modal inmediatamente
    this.instructionsModal.show();
  }

  /**
   * Crear botones de nivel con números
   */
  private createLevelButtons(): void {
    const buttons = [
      this.level1Button,
      this.level2Button,
      this.level3Button,
      this.level4Button,
      this.level5Button,
      this.level6Button,
    ];

    buttons.forEach((button, index) => {
      const levelNumber = index + 1;

      // Hacer el botón interactivo
      button.setInteractive({ useHandCursor: true });

      // Para el nivel 6 (Boss), mostrar "BOSS" en lugar de número
      if (index === 5) {
        const bossText = this.add.text(button.x, button.y - 80, "BOSS", {
          fontFamily: "TT-Trailers",
          fontSize: "56px",
          color: "#ffffff", // Blanco como los números
          stroke: "#333333", // Negro suave
          strokeThickness: 10,
          shadow: {
            offsetX: 4,
            offsetY: 4,
            color: "#000000",
            blur: 6,
            fill: true,
          },
          padding: { right: 10 },
        });
        bossText.setOrigin(0.5, 0.5);
        this.levelNumberTexts.push(bossText);
      } else {
        // Añadir número encima del botón (estilo cartoon con fuente Bangers)
        const numberText = this.add.text(
          button.x,
          button.y - 80, // Aumentado de -60 a -80 para más separación
          `${levelNumber}`,
          {
            fontFamily: "TT-Trailers",
            fontSize: "72px", // Aumentado para compensar el estilo de Bangers
            color: "#ffffff",
            stroke: "#333333", // Negro suave (no 100% oscuro)
            strokeThickness: 12, // Aumentado de 8px a 12px para efecto más cartoon
            shadow: {
              offsetX: 4,
              offsetY: 4,
              color: "#000000",
              blur: 6,
              fill: true,
            },
            padding: { right: 10 }, // Padding para evitar cortes por inclinación
          }
        );
        numberText.setOrigin(0.5, 0.5);
        this.levelNumberTexts.push(numberText);
      }

      // Eventos del botón
      button.on("pointerdown", () => this.onLevelButtonClick(index));
      button.on("pointerover", () => this.onLevelButtonHover(index));
      button.on("pointerout", () => this.onLevelButtonOut(index));
    });
  }

  /**
   * Click en un botón de nivel
   */
  private onLevelButtonClick(levelIndex: number): void {
    // Si el nivel está bloqueado, no hacer nada
    if (!this.levelsUnlocked[levelIndex]) {
      // Puedes añadir un efecto de "shake" o sonido de error aquí
      console.log(`Level ${levelIndex + 1} is locked!`);
      return;
    }

    // Seleccionar el nivel
    this.selectedLevel = levelIndex;
    this.updateButtonStates();

    // Mostrar modal de confirmación en lugar de iniciar directamente
    this.showLevelModal(levelIndex);
  }

  /**
   * Hover sobre un botón
   */
  private onLevelButtonHover(levelIndex: number): void {
    const button = this.getLevelButton(levelIndex);
    if (this.levelsUnlocked[levelIndex] && this.selectedLevel !== levelIndex) {
      // Efecto de escala al hacer hover
      this.tweens.add({
        targets: button,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 100,
        ease: "Power2",
      });
    }
  }

  /**
   * Salir del hover
   */
  private onLevelButtonOut(levelIndex: number): void {
    const button = this.getLevelButton(levelIndex);
    if (this.levelsUnlocked[levelIndex] && this.selectedLevel !== levelIndex) {
      // Volver a la escala normal
      this.tweens.add({
        targets: button,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: 100,
        ease: "Power2",
      });
    }
  }

  /**
   * Actualizar el estado visual de todos los botones
   */
  private updateButtonStates(): void {
    const buttons = [
      this.level1Button,
      this.level2Button,
      this.level3Button,
      this.level4Button,
      this.level5Button,
      this.level6Button,
    ];

    buttons.forEach((button, index) => {
      if (this.selectedLevel === index) {
        // Botón seleccionado
        button.setTexture("button-1");
      } else if (this.levelsUnlocked[index]) {
        // Botón desbloqueado
        button.setTexture("button-2");
      } else {
        // Botón bloqueado
        button.setTexture("button-3");
      }
    });
  }

  /**
   * Obtener referencia al botón de un nivel
   */
  private getLevelButton(levelIndex: number): Phaser.GameObjects.Image {
    const buttons = [
      this.level1Button,
      this.level2Button,
      this.level3Button,
      this.level4Button,
      this.level5Button,
      this.level6Button,
    ];
    return buttons[levelIndex];
  }

  /**
   * Iniciar un nivel específico (con lazy loading de assets)
   */
  private async startLevel(levelIndex: number): Promise<void> {
    const sceneKeys = [
      "Level1",
      "Level2",
      "Level3",
      "Level4",
      "Level5",
      "FirstBoss",
    ];
    const sceneKey = sceneKeys[levelIndex];

    console.log(`Starting level: ${sceneKey}`);

    // Detener música del Roadmap antes de cambiar de escena
    if (this.music) {
      this.music.stop();
    }

    // Lazy load assets for levels 2-5 and Boss
    if (levelIndex >= 1) {
      const { AssetLoader } = await import("../utils/AssetLoader");

      // Show loading text
      const loadingText = this.add
        .text(384, 512, "Loading...", {
          fontFamily: "Pixelify Sans",
          fontSize: "32px",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      try {
        switch (levelIndex) {
          case 1:
            await AssetLoader.loadLevel2Assets(this);
            break;
          case 2:
            await AssetLoader.loadLevel3Assets(this);
            break;
          case 3:
            await AssetLoader.loadLevel4Assets(this);
            break;
          case 4:
            await AssetLoader.loadLevel5Assets(this);
            break;
          case 5:
            await AssetLoader.loadFirstBossAssets(this);
            break;
        }
      } catch (error) {
        console.error(`Error loading assets for ${sceneKey}:`, error);
      }

      loadingText.destroy();
    }

    this.scene.start(sceneKey);
  }

  /**
   * Mostrar modal de confirmación de nivel
   */
  private showLevelModal(levelIndex: number): void {
    const levelNumber = levelIndex + 1;
    const levelName = levelIndex === 5 ? "BOSS" : `Level ${levelNumber}`;

    // Subtítulos para cada nivel
    const levelSubtitles = [
      "Pengu's Trail",
      "Frozen Falls",
      "Frosty Peaks",
      "Snowcap Valley",
      "Icy Ridge",
      "Crystal Cavern",
    ];
    const subtitle = levelSubtitles[levelIndex];

    // Crear overlay oscuro de fondo (responsive - ocupa todo el canvas) - estilo Pudgy
    this.modalOverlay = this.add.graphics();
    this.modalOverlay.fillStyle(0x000000, 0.7);
    this.modalOverlay.fillRect(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height
    );
    this.modalOverlay.setDepth(1000);
    this.modalOverlay.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height
      ),
      Phaser.Geom.Rectangle.Contains
    );

    // Crear contenedor del modal (centrado en el canvas)
    this.modalContainer = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    this.modalContainer.setDepth(1001);

    // Fondo del modal (blanco/celeste claro con borde negro) - MUCHO MÁS GRANDE
    const modalWidth = 600; // Aumentado de 450 a 600
    const modalHeight = 700; // Aumentado de 520 a 700
    const halfWidth = modalWidth / 2;
    const halfHeight = modalHeight / 2;

    this.modalBackground = this.add.graphics();
    this.modalBackground.fillStyle(0xe8f4f8, 1); // Blanco/celeste claro
    this.modalBackground.fillRoundedRect(
      -halfWidth,
      -halfHeight,
      modalWidth,
      modalHeight,
      25
    ); // Bordes más redondeados
    this.modalBackground.lineStyle(8, 0x000000, 1); // Borde más grueso (de 6 a 8)
    this.modalBackground.strokeRoundedRect(
      -halfWidth,
      -halfHeight,
      modalWidth,
      modalHeight,
      25
    );
    this.modalContainer.add(this.modalBackground);

    // Título del nivel (turquesa con stroke negro) - MÁS GRANDE
    const titleText = this.add.text(0, -280, levelName, {
      // Ajustado posición Y
      fontFamily: "TT-Trailers",
      fontSize: "72px", // Aumentado de 56px a 72px
      color: "#00D4AA", // Turquesa/verde menta
      stroke: "#000000",
      strokeThickness: 10, // Aumentado de 8 a 10
    });
    titleText.setOrigin(0.5, 0.5);
    this.modalContainer.add(titleText);

    // Subtítulo del nivel - MÁS GRANDE
    const subtitleText = this.add.text(0, -195, subtitle, {
      // Ajustado posición Y
      fontFamily: "TT-Trailers",
      fontSize: "36px", // Aumentado de 28px a 36px
      color: "#2d2d2d", // Gris oscuro
    });
    subtitleText.setOrigin(0.5, 0.5);
    this.modalContainer.add(subtitleText);

    // Línea divisoria debajo del subtítulo - MÁS LARGA Y GRUESA
    const dividerLine = this.add.graphics();
    dividerLine.lineStyle(4, 0x000000, 0.4); // Más gruesa y visible
    dividerLine.beginPath();
    dividerLine.moveTo(-220, -150); // Más larga
    dividerLine.lineTo(220, -150); // Ajustado posición Y
    dividerLine.strokePath();
    this.modalContainer.add(dividerLine);

    // Obtener datos del mejor run
    const scoreData = ScoreManager.getScore(levelNumber);

    // Texto "Your Best Run:" o "Not Played Yet" - MÁS GRANDE
    const bestRunText = this.add.text(
      0,
      -95, // Ajustado posición Y
      scoreData ? "YOUR BEST RUN:" : "NOT PLAYED YET",
      {
        fontFamily: "TT-Trailers",
        fontSize: "44px", // Aumentado de 32px a 44px
        color: "#ffffff", // Blanco con stroke negro
        stroke: "#000000",
        strokeThickness: 8, // Aumentado de 6 a 8
      }
    );
    bestRunText.setOrigin(0.5, 0.5);
    this.modalContainer.add(bestRunText);

    // Solo mostrar stats si hay scoreData
    if (scoreData) {
      // Sección de estadísticas en fila - MÁS GRANDE Y SEPARADO
      const statsY = -15; // Ajustado posición Y

      // Más espacio entre mini-pingus y coins
      const leftGroupX = -90; // Posición izquierda para mini-pingu (más separado)
      const rightGroupX = 90; // Posición derecha para coins (más separado)

      // Grupo Mini-Pingu - ÍCONO MÁS GRANDE
      const miniPinguIcon = this.add.image(
        leftGroupX - 35, // Ajustado
        statsY,
        "mini-pingu"
      );
      miniPinguIcon.setScale(1.3); // Aumentado de 1.0 a 1.3
      miniPinguIcon.setOrigin(0.5, 0.5);
      this.modalContainer.add(miniPinguIcon);

      // Mini-Pingu count - TEXTO MÁS GRANDE
      const miniPinguCount = scoreData.miniPingusCollected ?? 0;
      const totalMiniPingus = this.levelTotals[levelIndex].miniPingus;
      const miniPinguText = this.add.text(
        leftGroupX + 15, // Ajustado
        statsY,
        `${miniPinguCount}/${totalMiniPingus}`,
        {
          fontFamily: "TT-Trailers",
          fontSize: "42px", // Aumentado de 32px a 42px
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 6, // Aumentado de 5 a 6
        }
      );
      miniPinguText.setOrigin(0, 0.5);
      this.modalContainer.add(miniPinguText);

      // Grupo Coins - ÍCONO MÁS GRANDE
      const coinIcon = this.add.image(
        rightGroupX - 35, // Ajustado
        statsY,
        "PT_TOKEN_MASTER_001"
      );
      coinIcon.setScale(1.8); // Aumentado de 1.4 a 1.8
      coinIcon.setOrigin(0.5, 0.5);
      this.modalContainer.add(coinIcon);

      // Coin count - TEXTO MÁS GRANDE
      const coinCount = scoreData.coinsCollected ?? 0;
      const totalCoins = this.levelTotals[levelIndex].coins;
      const coinText = this.add.text(
        rightGroupX + 15, // Ajustado
        statsY,
        `${coinCount}/${totalCoins}`,
        {
          fontFamily: "TT-Trailers",
          fontSize: "42px", // Aumentado de 32px a 42px
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 6, // Aumentado de 5 a 6
        }
      );
      coinText.setOrigin(0, 0.5);
      this.modalContainer.add(coinText);

      // Sección de vidas (corazones) - MÁS GRANDE Y SEPARADO
      const livesY = 100; // Ajustado para el nuevo espaciado
      const livesRemaining = 3 - (scoreData.livesMissed ?? 0); // Calcular vidas restantes
      const heartSpacing = 65; // Aumentado de 50 a 65 - Más espacio entre corazones
      const startHeartX = -heartSpacing; // Centrar los 3 corazones

      // Crear 3 corazones - MÁS GRANDES
      for (let i = 0; i < 3; i++) {
        const heartX = startHeartX + i * heartSpacing;
        // Frame 0 = lleno, Frame 2 = vacío (Frame 1 es semi-lleno)
        const heartFrame = i < livesRemaining ? 0 : 2;
        const heart = this.add.image(
          heartX,
          livesY,
          "heart_spritesheet",
          heartFrame
        );
        heart.setScale(1.6); // Aumentado de 1.3 a 1.6
        heart.setOrigin(0.5, 0.5);
        this.modalContainer.add(heart);
      }

      // SCORE del mejor run - MÁS GRANDE
      const scoreText = this.add.text(0, 185, `SCORE: ${scoreData.score}`, {
        // Ajustado posición Y
        fontFamily: "TT-Trailers",
        fontSize: "62px", // Aumentado de 48px a 62px
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 10, // Aumentado de 8 a 10
      });
      scoreText.setOrigin(0.5, 0.5);
      this.modalContainer.add(scoreText);
    }

    // Botón START - MUCHO MÁS GRANDE
    const startButtonY = 280; // Ajustado posición Y
    const buttonWidth = 280; // Aumentado de 200 a 280
    const buttonHeight = 80; // Aumentado de 60 a 80
    const halfButtonWidth = buttonWidth / 2;
    const halfButtonHeight = buttonHeight / 2;

    const startButton = this.add.graphics();
    startButton.fillStyle(0x00d4aa, 1); // Verde menta
    startButton.fillRoundedRect(
      -halfButtonWidth,
      startButtonY - halfButtonHeight,
      buttonWidth,
      buttonHeight,
      15
    ); // Bordes más redondeados
    startButton.lineStyle(6, 0x000000, 1); // Borde más grueso
    startButton.strokeRoundedRect(
      -halfButtonWidth,
      startButtonY - halfButtonHeight,
      buttonWidth,
      buttonHeight,
      15
    );
    this.modalContainer.add(startButton);

    // Texto del botón START - MÁS GRANDE
    const startText = this.add.text(0, startButtonY, "START", {
      fontFamily: "TT-Trailers",
      fontSize: "54px", // Aumentado de 40px a 54px
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 7, // Aumentado de 5 a 7
    });
    startText.setOrigin(0.5, 0.5);
    this.modalContainer.add(startText);

    // Hacer el botón START interactivo
    const startButtonHitArea = this.add.rectangle(
      0,
      startButtonY,
      buttonWidth,
      buttonHeight
    );
    startButtonHitArea.setInteractive({ useHandCursor: true });
    this.modalContainer.add(startButtonHitArea);

    // Eventos del botón START
    startButtonHitArea.on("pointerdown", () => {
      this.closeLevelModal();
      this.time.delayedCall(100, () => {
        this.startLevel(levelIndex);
      });
    });

    startButtonHitArea.on("pointerover", () => {
      startButton.clear();
      startButton.fillStyle(0x00f0c8, 1); // Verde menta más claro en hover
      startButton.fillRoundedRect(
        -halfButtonWidth,
        startButtonY - halfButtonHeight,
        buttonWidth,
        buttonHeight,
        15
      );
      startButton.lineStyle(6, 0x000000, 1); // Borde negro grueso
      startButton.strokeRoundedRect(
        -halfButtonWidth,
        startButtonY - halfButtonHeight,
        buttonWidth,
        buttonHeight,
        15
      );
    });

    startButtonHitArea.on("pointerout", () => {
      startButton.clear();
      startButton.fillStyle(0x00d4aa, 1); // Volver al verde menta
      startButton.fillRoundedRect(
        -halfButtonWidth,
        startButtonY - halfButtonHeight,
        buttonWidth,
        buttonHeight,
        15
      );
      startButton.lineStyle(6, 0x000000, 1); // Borde negro grueso
      startButton.strokeRoundedRect(
        -halfButtonWidth,
        startButtonY - halfButtonHeight,
        buttonWidth,
        buttonHeight,
        15
      );
    });

    // Click fuera del modal para cerrarlo
    this.modalOverlay.on("pointerdown", () => {
      this.closeLevelModal();
    });

    // Animación de aparición del modal
    this.modalContainer.setScale(0.5);
    this.modalContainer.setAlpha(0);
    this.tweens.add({
      targets: this.modalContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 200,
      ease: "Back.easeOut",
    });
  }

  /**
   * Cerrar el modal de confirmación
   */
  private closeLevelModal(): void {
    if (this.modalContainer) {
      this.tweens.add({
        targets: this.modalContainer,
        scaleX: 0.5,
        scaleY: 0.5,
        alpha: 0,
        duration: 150,
        ease: "Back.easeIn",
        onComplete: () => {
          this.modalContainer?.destroy();
          this.modalOverlay?.destroy();
          this.modalBackground?.destroy();
          this.modalContainer = null;
          this.modalOverlay = null;
          this.modalBackground = null;

          // Deseleccionar el nivel
          this.selectedLevel = null;
          this.updateButtonStates();
        },
      });
    }
  }

  /**
   * Desbloquear el siguiente nivel (llamar desde las escenas de nivel al completar)
   */
  public unlockNextLevel(currentLevelIndex: number): void {
    const nextLevelIndex = currentLevelIndex + 1;
    if (nextLevelIndex < 6) {
      // 6 niveles totales (índices 0-5)
      ScoreManager.unlockLevel(nextLevelIndex);
      this.updateButtonStates();
    }
  }

  /**
   * Cleanup cuando se destruye la escena
   */
  shutdown(): void {
    console.log("🔄 Limpiando Roadmap...");

    // Detener música del Roadmap
    if (this.music) {
      if (this.music.isPlaying) {
        this.music.stop();
      }
      this.music.destroy();
    }

    // Detener TODAS las músicas que puedan estar sonando
    this.sound.getAllPlaying().forEach((sound) => {
      if (sound.key === "roadmap_music") {
        sound.stop();
        sound.destroy();
      }
    });

    // Remover listeners
    this.events.removeAllListeners();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
export default Roadmap;
