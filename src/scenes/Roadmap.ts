// You can write more code here

/* START OF COMPILED CODE */

class Roadmap extends Phaser.Scene {
  constructor() {
    super("Roadmap");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    // image_1 - Fondo responsive (ocupa todo el canvas)
    const background = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "frostland"
    );
    // Escalar la imagen para que cubra todo el canvas manteniendo proporción
    const scaleX = this.cameras.main.width / background.width;
    const scaleY = this.cameras.main.height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // image_2 - Level 1 (desbloqueado por defecto)
    const level1Button = this.add.image(208, 960, "button-2");
    level1Button.scaleX = 0.7;
    level1Button.scaleY = 0.7;

    // image - Level 2
    const level2Button = this.add.image(464, 896, "button-3");
    level2Button.scaleX = 0.7;
    level2Button.scaleY = 0.7;

    // image_3 - Level 3
    const level3Button = this.add.image(256, 752, "button-3");
    level3Button.scaleX = 0.7;
    level3Button.scaleY = 0.7;

    // image_4 - Level 4
    const level4Button = this.add.image(496, 672, "button-3");
    level4Button.scaleX = 0.7;
    level4Button.scaleY = 0.7;

    // image_5 - Level 5
    const level5Button = this.add.image(304, 592, "button-3");
    level5Button.scaleX = 0.7;
    level5Button.scaleY = 0.7;

    // image_6 - Boss Level (Level 6)
    const level6Button = this.add.image(464, 496, "button-3");
    level6Button.scaleX = 0.7;
    level6Button.scaleY = 0.7;

    this.level1Button = level1Button;
    this.level2Button = level2Button;
    this.level3Button = level3Button;
    this.level4Button = level4Button;
    this.level5Button = level5Button;
    this.level6Button = level6Button;

    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

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

  // Estado de los niveles
  private levelsUnlocked: boolean[] = [
    true, // Level 1
    true, // Level 2 - ACTIVADO PARA TESTING
    true, // Level 3 - ACTIVADO PARA TESTING
    true, // Level 4 - ACTIVADO PARA TESTING
    true, // Level 5 - ACTIVADO PARA TESTING
    true, // Level 6 (Boss) - ACTIVADO PARA TESTING
  ];

  // Nivel actualmente seleccionado (null = ninguno)
  private selectedLevel: number | null = null;

  // Música de fondo
  private music!: Phaser.Sound.BaseSound;

  create() {
    this.editorCreate();

    // Crear los botones con sus números
    this.createLevelButtons();

    // Aplicar estado inicial de los botones
    this.updateButtonStates();

    // Reproducir música del Roadmap
    this.music = this.sound.add("roadmap_music", {
      loop: true,
      volume: 0.5,
    });
    this.music.play();
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
          fontFamily: "Bangers",
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
            fontFamily: "Bangers",
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
        scaleX: 0.75,
        scaleY: 0.75,
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
        scaleX: 0.7,
        scaleY: 0.7,
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
   * Iniciar un nivel específico
   */
  private startLevel(levelIndex: number): void {
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

    this.scene.start(sceneKey);
  }

  /**
   * Mostrar modal de confirmación de nivel
   */
  private showLevelModal(levelIndex: number): void {
    const levelNumber = levelIndex + 1;
    const levelName = levelIndex === 5 ? "BOSS" : `Level ${levelNumber}`;

    // Crear overlay oscuro de fondo (responsive - ocupa todo el canvas)
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

    // Fondo del modal (negro suave con borde negro)
    this.modalBackground = this.add.graphics();
    this.modalBackground.fillStyle(0x000000, 0.85); // Negro suave (85% opacidad)
    this.modalBackground.fillRoundedRect(-200, -200, 400, 400, 20);
    this.modalBackground.lineStyle(8, 0x000000, 1); // Borde negro 100%
    this.modalBackground.strokeRoundedRect(-200, -200, 400, 400, 20);
    this.modalContainer.add(this.modalBackground);

    // Título del nivel (blanco - fuente Bangers)
    const titleText = this.add.text(0, -150, levelName, {
      fontFamily: "Bangers",
      fontSize: "56px",
      color: "#ffffff", // Blanco
      padding: { right: 10 }, // Padding para evitar cortes por inclinación
    });
    titleText.setOrigin(0.5, 0.5);
    this.modalContainer.add(titleText);

    // Sección de estadísticas en fila (Mini-Pengus y Coins)
    const statsY = -50;
    const modalWidth = 400;

    // Distribuir en space-evenly: dividir el ancho en 3 partes iguales
    // Los grupos estarán en 1/3 y 2/3 del ancho del modal
    const spacing = modalWidth / 3;
    const leftGroupX = -modalWidth / 2 + spacing; // 1/3 desde la izquierda
    const rightGroupX = -modalWidth / 2 + spacing * 2; // 2/3 desde la izquierda

    // Grupo Mini-Pingu (centrado en leftGroupX)
    const miniPinguIcon = this.add.image(leftGroupX - 30, statsY, "mini-pingu");
    miniPinguIcon.setScale(1.0);
    miniPinguIcon.setOrigin(0.5, 0.5);
    this.modalContainer.add(miniPinguIcon);

    // Mini-Pingu count (blanco - fuente Bangers, a la derecha del icono)
    const miniPinguText = this.add.text(leftGroupX + 10, statsY, "x0", {
      fontFamily: "Bangers",
      fontSize: "36px",
      color: "#ffffff", // Blanco
      padding: { right: 10 }, // Padding para evitar cortes por inclinación
    });
    miniPinguText.setOrigin(0, 0.5);
    this.modalContainer.add(miniPinguText);

    // Grupo Coins (centrado en rightGroupX)
    const coinIcon = this.add.image(
      rightGroupX - 30,
      statsY,
      "PT_TOKEN_MASTER_001"
    );
    coinIcon.setScale(1.4); // Más grande que mini-pingu
    coinIcon.setOrigin(0.5, 0.5);
    this.modalContainer.add(coinIcon);

    // Coin count (blanco - fuente Bangers, a la derecha del icono)
    const coinText = this.add.text(rightGroupX + 10, statsY, "x0", {
      fontFamily: "Bangers",
      fontSize: "36px",
      color: "#ffffff", // Blanco
      padding: { right: 10 }, // Padding para evitar cortes por inclinación
    });
    coinText.setOrigin(0, 0.5);
    this.modalContainer.add(coinText);

    // Botón START (amarillo #FFDE59 con borde negro)
    const startButton = this.add.graphics();
    startButton.fillStyle(0xffde59, 1); // Amarillo #FFDE59
    startButton.fillRoundedRect(-100, 50, 200, 60, 15);
    startButton.lineStyle(6, 0x000000, 1); // Borde negro
    startButton.strokeRoundedRect(-100, 50, 200, 60, 15);
    this.modalContainer.add(startButton);

    // Texto del botón START (negro - fuente Bangers)
    const startText = this.add.text(0, 80, "START", {
      fontFamily: "Bangers",
      fontSize: "40px",
      color: "#000000", // Negro
      padding: { right: 10 }, // Padding para evitar cortes por inclinación
    });
    startText.setOrigin(0.5, 0.5);
    this.modalContainer.add(startText);

    // Hacer el botón START interactivo
    const startButtonHitArea = this.add.rectangle(0, 80, 200, 60);
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
      startButton.fillStyle(0xffd040, 1); // Amarillo más oscuro en hover
      startButton.fillRoundedRect(-100, 50, 200, 60, 15);
      startButton.lineStyle(6, 0x000000, 1); // Borde negro
      startButton.strokeRoundedRect(-100, 50, 200, 60, 15);
    });

    startButtonHitArea.on("pointerout", () => {
      startButton.clear();
      startButton.fillStyle(0xffde59, 1); // Volver al amarillo original
      startButton.fillRoundedRect(-100, 50, 200, 60, 15);
      startButton.lineStyle(6, 0x000000, 1); // Borde negro
      startButton.strokeRoundedRect(-100, 50, 200, 60, 15);
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
    if (nextLevelIndex < this.levelsUnlocked.length) {
      this.levelsUnlocked[nextLevelIndex] = true;
      // TODO: Aquí se integrará el SDK para guardar el progreso
      this.updateButtonStates();
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
export default Roadmap;
