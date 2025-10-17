export interface PenguinSpriteConfig {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
}

export class PenguinSprites {
  private static readonly FRAME_SIZE = 128;
  // Nuevo tamaño para el pudgy spritesheet
  private static readonly PUDGY_FRAME_WIDTH = 160;
  private static readonly PUDGY_FRAME_HEIGHT = 174;

  // Configuración de todos los sprites del pingüino
  public static readonly SPRITES: Record<string, PenguinSpriteConfig> = {
    // STANDING separado (160x174, 1 frame)
    STANDING: {
      key: "penguin_standing",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/standing-s7AJ9yM2g2wW2eFB3X1d2357zeh8lO.png?Ux5h",
      frameWidth: this.PUDGY_FRAME_WIDTH,
      frameHeight: this.PUDGY_FRAME_HEIGHT,
      frames: 1,
    },
    // Spritesheet principal pudgy (8 filas x 7 columnas, 160x174 por frame)
    PUDGY_SHEET: {
      key: "pudgy_sheet",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pudgy-spritesheet-NlvUgUWZoqrYGlXpEPKB78nFEXAx6A.png?B9g0",
      frameWidth: this.PUDGY_FRAME_WIDTH,
      frameHeight: this.PUDGY_FRAME_HEIGHT,
      frames: 56, // 8 filas x 7 columnas = 56 frames máximo
    },
    // Sprites de fantasma (no cambian, se mantienen)
    GHOST_IDLE: {
      key: "penguin_ghost_idle",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/ghost_idle-eeJSWcI0C7C6iXLDfgJacJVvWWoMIx.png?SBul",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 4,
    },
    GHOST_BLOWING: {
      key: "penguin_ghost_blowing",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/ghost_blowing-LqyxkcbCRmswFy56C4IKedBSFWaX6n.png?WLI5",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 12,
    },
  };

  /**
   * Carga todos los sprites del pingüino en la escena
   */
  public static loadSprites(scene: Phaser.Scene): void {
    Object.values(this.SPRITES).forEach((sprite) => {
      scene.load.spritesheet(sprite.key, sprite.url, {
        frameWidth: sprite.frameWidth,
        frameHeight: sprite.frameHeight,
      });
    });
  }

  /**
   * Crea todas las animaciones del pingüino
   */
  public static createAnimations(scene: Phaser.Scene): void {
    // Verificar si las animaciones ya existen (solo crear una vez)
    if (scene.anims.exists("penguin_standing")) {
      return;
    }

    // STANDING - Estado natural (1 frame, no animación)
    scene.anims.create({
      key: "penguin_standing",
      frames: scene.anims.generateFrameNumbers("penguin_standing", {
        start: 0,
        end: 0,
      }),
      frameRate: 1,
      repeat: -1,
    });

    // WALK - Caminar normal (6 frames de la fila 0 del pudgy_sheet)
    scene.anims.create({
      key: "penguin_walk",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // CLIMB - Subir escaleras (2 frames de la fila 1 del pudgy_sheet: frames 7-8)
    scene.anims.create({
      key: "penguin_climb",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 7,
        end: 8,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // CRAWL - Arrastrarse agachado (2 frames de la fila 2 del pudgy_sheet: frames 14-15)
    scene.anims.create({
      key: "penguin_crawl",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 14,
        end: 15,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // CROUCH - Transición a agachado (4 frames de la fila 3 del pudgy_sheet: frames 21-24)
    scene.anims.create({
      key: "penguin_crouch",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 21,
        end: 24,
      }),
      frameRate: 12,
      repeat: 0,
    });

    // FALL - Caer (6 frames de la fila 4 del pudgy_sheet: frames 28-33)
    scene.anims.create({
      key: "penguin_fall",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 28,
        end: 33,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // JUMP - Saltar (7 frames de la fila 5 del pudgy_sheet: frames 35-41)
    scene.anims.create({
      key: "penguin_jump",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 35,
        end: 41,
      }),
      frameRate: 12,
      repeat: 0,
    });

    // SWING - Nadar (3 frames de la fila 6 del pudgy_sheet: frames 42-44)
    scene.anims.create({
      key: "penguin_swing",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 42,
        end: 44,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // THROW - Lanzar bola de nieve (5 frames de la fila 7 del pudgy_sheet: frames 49-53)
    scene.anims.create({
      key: "penguin_throw",
      frames: scene.anims.generateFrameNumbers("pudgy_sheet", {
        start: 49,
        end: 53,
      }),
      frameRate: 15,
      repeat: 0,
    });

    // TODO: Animaciones opcionales - ENTER, EXIT, CELEBRATE (si se necesitan más adelante)

    scene.anims.create({
      key: "penguin_ghost_idle",
      frames: scene.anims.generateFrameNumbers("penguin_ghost_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    scene.anims.create({
      key: "penguin_ghost_blowing",
      frames: scene.anims.generateFrameNumbers("penguin_ghost_blowing", {
        start: 0,
        end: 11,
      }),
      frameRate: 16, // Aumentado de 10 a 16 para animación más rápida
      repeat: 0,
    });
  }

  /**
   * Obtiene la configuración de un sprite específico
   */
  public static getSpriteConfig(
    spriteName: string
  ): PenguinSpriteConfig | undefined {
    return this.SPRITES[spriteName];
  }

  /**
   * Obtiene todas las claves de sprites disponibles
   */
  public static getAvailableSprites(): string[] {
    return Object.keys(this.SPRITES);
  }
}
