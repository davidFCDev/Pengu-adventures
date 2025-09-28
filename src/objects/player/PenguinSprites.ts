export interface PenguinSpriteConfig {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
}

export class PenguinSprites {
  private static readonly FRAME_SIZE = 128;

  // Configuración de todos los sprites del pingüino
  public static readonly SPRITES: Record<string, PenguinSpriteConfig> = {
    STANDING: {
      key: "penguin_standing",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/standing-jx6yiMfuXkZKNDMHBhBEAqcs0DgbM8.png?XwF2",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 1,
    },
    WALK: {
      key: "penguin_walk",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/walk-b6NOFUPWseSAcSqIf7u7nMjBPWXmn0.png?24Oj",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 9,
    },
    ENTER: {
      key: "penguin_enter",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/enter-a7OuomdGZZesPXFiL6TbzREfBQlQho.png?eyNb",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 6,
    },
    EXIT: {
      key: "penguin_exit",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/exit-OWtFKiUrKBHFSO4fP2kn5cqUjMd9US.png?0kL2",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 6,
    },
    JUMP: {
      key: "penguin_jump",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/jump-hzVa5dILfofuaxlZSNsJlAC67fPa6V.png?bYym",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 8,
    },
    SWING: {
      key: "penguin_swing",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/swing-EGTE2T1hDVvchAurU3ikBYgdw0Q7Pe.png?mD0o",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 6,
    },
    CELEBRATE: {
      key: "penguin_celebrate",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/celebrate-icTGklgzJfwuEIAvMbCAcYDel5Nojk.png?6ISy",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 4,
    },
    CLIMB: {
      key: "penguin_climb",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/climb-8vtjna8GiZmJei2G4xGgB6qEn9h33F.png?wEWi",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 6,
    },
    FALL: {
      key: "penguin_fall",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/falling-rV2UZnmxNvIEki2ZPa37y1FIMt5mh5.png?SgpD",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 6,
    },
    CROUCH: {
      key: "penguin_crouch",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/crouch-IAV7t7wd87vVMMygiyTxaGw1BMR23m.png?nJZX",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 3,
    },

    THROW: {
      key: "penguin_throw",
      url: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/throw-HgqwxkKlDK2WCvjBHv3hP0guuKKyeP.png?Zszs",
      frameWidth: this.FRAME_SIZE,
      frameHeight: this.FRAME_SIZE,
      frames: 6,
    },
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

    // WALK - Caminar normal (9 frames)
    scene.anims.create({
      key: "penguin_walk",
      frames: scene.anims.generateFrameNumbers("penguin_walk", {
        start: 0,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // JUMP - Salto normal (8 frames)
    scene.anims.create({
      key: "penguin_jump",
      frames: scene.anims.generateFrameNumbers("penguin_jump", {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: 0,
    });

    // SWING - Movimiento en agua (6 frames)
    scene.anims.create({
      key: "penguin_swing",
      frames: scene.anims.generateFrameNumbers("penguin_swing", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // CLIMB - Escalar (6 frames)
    scene.anims.create({
      key: "penguin_climb",
      frames: scene.anims.generateFrameNumbers("penguin_climb", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // FALL - Caer (6 frames)
    scene.anims.create({
      key: "penguin_fall",
      frames: scene.anims.generateFrameNumbers("penguin_fall", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // THROW - Lanzar bola de nieve (6 frames)
    scene.anims.create({
      key: "penguin_throw",
      frames: scene.anims.generateFrameNumbers("penguin_throw", {
        start: 0,
        end: 5,
      }),
      frameRate: 15, // Aumentar frameRate para animación más rápida y visible
      repeat: 0,
    });

    // CROUCH - Agacharse (3 frames)
    scene.anims.create({
      key: "penguin_crouch",
      frames: scene.anims.generateFrameNumbers("penguin_crouch", {
        start: 0,
        end: 2,
      }),
      frameRate: 6,
      repeat: 0,
    });

    // Animaciones adicionales para funcionalidades futuras
    scene.anims.create({
      key: "penguin_enter",
      frames: scene.anims.generateFrameNumbers("penguin_enter", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: "penguin_exit",
      frames: scene.anims.generateFrameNumbers("penguin_exit", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: "penguin_celebrate",
      frames: scene.anims.generateFrameNumbers("penguin_celebrate", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

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
      frameRate: 10,
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
