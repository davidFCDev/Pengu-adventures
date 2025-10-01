import GameSettings from "../config/GameSettings";
import { PenguinSprites } from "../objects/player/PenguinSprites";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    // Load Google Font first
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    // ========== PRELOAD GAME ASSETS HERE ==========
    // Cargar el mapa de prueba
    this.load.tilemapTiledJSON("TestingMap", "assets/TestingMap.json");

    // Cargar los tilesets
    this.load.image(
      "spritesheet-tiles-default",
      "assets/spritesheet-tiles-default.png"
    );
    this.load.image(
      "spritesheet-backgrounds-default",
      "assets/spritesheet-backgrounds-default.png"
    );

    // Cargar todos los sprites del pingüino
    PenguinSprites.loadSprites(this);

    // Cargar el spritesheet del fantasma soplando (12 frames)
    this.load.spritesheet(
      "ghost_blowing",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/ghost_blowing-LqyxkcbCRmswFy56C4IKedBSFWaX6n.png",
      {
        frameWidth: 110, // Ajustar según el tamaño real del frame
        frameHeight: 110,
        endFrame: 11, // 12 frames (0-11)
      }
    );

    // Crear una textura simple para partículas de nieve (creada en create)
    // Se crea después de que Phaser esté completamente inicializado

    // Cargar el spritesheet de corazones para el sistema de vidas
    this.load.spritesheet(
      "heart_spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/heart-Yb604s53ChLnxx6liA2W05EYnHKnn9.png?vag4",
      {
        frameWidth: 32,
        frameHeight: 32,
        endFrame: 2, // Solo necesitamos frames 0 (lleno) y 2 (vacío)
      }
    );

    // Cargar el spritesheet de celebración (4 frames de 128x128)
    this.load.spritesheet(
      "celebrate",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/celebrate-icTGklgzJfwuEIAvMbCAcYDel5Nojk.png?6ISy",
      {
        frameWidth: 128,
        frameHeight: 128,
        endFrame: 3, // 4 frames (0-3)
      }
    );

    // ========== MÚSICA DE NIVELES ==========
    // Cargar música del nivel de test
    this.load.audio(
      "level1_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level1-oFuFEHvgIOYOwUItEyjAzmuKezGcyo.mp3"
    );

    // ========== SONIDOS DEL PLAYER ==========
    // Sonido de colisión de bola de nieve (también usado para caminar)
    this.load.audio(
      "snowball_hit_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/throw-dOGOYFxj6vxBWNDwgT3RC7UekmZcjO.mp3?EVjO"
    );

    // Sonido de salto (solo modo normal)
    this.load.audio(
      "jump_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/jump-fZREmg47OmHKs7n50lWiI8IC1gt8EP.mp3?GXA9"
    );

    // Sonido de salto/nado en el agua
    this.load.audio(
      "swim_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/swim-SwpcxfxhmItcxJU2PhvgmOs9QxzlLR.mp3?gcSl"
    );

    // Sonido de daño/hurt cuando perdemos una vida
    this.load.audio(
      "hurt_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/hurt-Nls2Ffjm9810PWTjFhRFDJXiXsY1wM.mp3?NW2H"
    );

    // Sonido de finalizar nivel
    this.load.audio(
      "finish_level_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/finish-level-4pyYbYK1y4fWxi9Si6P8o2YQyjUAjm.mp3?wTty"
    );

    // Sonido de soplido del fantasma
    this.load.audio(
      "blow_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/blow-4zYjtNIREJ7SWiPLYM6lOSwk3thCAi.mp3?IWs8"
    );

    // Handle loading completion
    this.load.on("complete", () => {
      this.loadingComplete();
    });
  }

  create(): void {
    // Crear textura de partículas de nieve si no existe
    if (!this.textures.exists("snow_particle")) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(4, 4, 4); // Círculo blanco
      graphics.generateTexture("snow_particle", 8, 8);
      graphics.destroy();
    }

    // Set black background
    this.cameras.main.setBackgroundColor("#000000");

    // Load Pixelify font and wait for it to load
    if ((window as any).WebFont) {
      (window as any).WebFont.load({
        google: {
          families: ["Pixelify Sans:400,700"],
        },
        active: () => {
          // Font loaded, create content
          this.createStudioBranding();
        },
        inactive: () => {
          // Fallback if font fails to load
          this.createStudioBranding();
        },
      });
    } else {
      // No WebFont available, proceed with fallback
      this.createStudioBranding();
    }
  }

  private createStudioBranding(): void {
    const centerX = GameSettings.canvas.width / 2;
    const centerY = GameSettings.canvas.height / 2;

    // Create overlay div for studio branding
    const gameCanvas = this.sys.game.canvas;
    const gameContainer = gameCanvas.parentElement;

    const overlay = document.createElement("div");
    overlay.id = "studio-overlay";
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #000000;
      z-index: 9999;
      pointer-events: all;
    `;

    // Create studio text element
    const studioText = document.createElement("div");
    studioText.id = "studio-text";
    studioText.style.cssText = `
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: "Pixelify Sans", "Press Start 2P", system-ui, monospace;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 3px 3px 0 #000;
      gap: 6px;
      opacity: 0;
      transform: translateY(8px) scale(0.98);
      transition: opacity 700ms ease, transform 500ms cubic-bezier(0.2, 0.6, 0.2, 1);
      min-height: 80px;
      width: 100%;
    `;

    // Main brand text - HELLBOUND
    const brandMain = document.createElement("div");
    brandMain.style.cssText = `
      font-size: 24px;
      letter-spacing: 3px;
      line-height: 1;
      color: #ffffff;
      position: relative;
      text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000,
        2px 2px #000, -2px 2px #000, 2px -2px #000, -2px -2px #000,
        3px 3px 0 #000;
      margin-bottom: 8px;
    `;
    brandMain.textContent = "HELLBOUND";

    // Green line separator
    const greenLine = document.createElement("div");
    greenLine.style.cssText = `
      width: 160px;
      height: 12px;
      background: linear-gradient(to bottom, #b7ff00 0%, #a0e600 50%, #b7ff00 100%);
      border: 3px solid #000000;
      margin: 8px auto;
      display: block;
      position: relative;
      box-sizing: border-box;
    `;

    // Sub brand text - STUDIOS
    const brandSub = document.createElement("div");
    brandSub.style.cssText = `
      font-size: 14px;
      letter-spacing: 4px;
      color: #b7ff00;
      text-shadow: 3px 3px 0 #000, 0 0 10px rgba(183, 255, 0, 0.3);
      line-height: 1;
    `;
    brandSub.textContent = "STUDIOS";

    // Trademark
    const brandTm = document.createElement("span");
    brandTm.style.cssText = `
      position: absolute;
      top: -6px;
      right: -16px;
      font-size: 9px;
      color: #ffffff;
      text-shadow: 2px 2px 0 #000;
      opacity: 0.9;
    `;
    brandTm.textContent = "™";

    // Assemble elements
    brandMain.appendChild(brandTm);
    studioText.appendChild(brandMain);
    studioText.appendChild(greenLine);
    studioText.appendChild(brandSub);
    overlay.appendChild(studioText);

    // Add to game container
    if (gameContainer) {
      gameContainer.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }

    // Store references
    (this as any).studioOverlay = overlay;
    (this as any).studioText = studioText;

    // Show the studio branding after a short delay
    setTimeout(() => {
      this.showStudioText();
    }, 500);
  }

  private showStudioText(): void {
    const studioText = (this as any).studioText;

    if (!studioText) {
      this.transitionToGame();
      return;
    }

    // Show studio text with CSS transition
    studioText.style.opacity = "1";
    studioText.style.transform = "translateY(0) scale(1)";

    // Hide after delay and transition to game
    setTimeout(() => {
      studioText.style.opacity = "0";
      studioText.style.transform = "translateY(8px) scale(0.98)";

      setTimeout(() => {
        this.transitionToGame();
      }, 600); // Wait for fade out transition
    }, 2000); // Show for 2 seconds
  }

  private transitionToGame(): void {
    // Clean up DOM overlay
    const overlay = (this as any).studioOverlay;

    if (overlay && overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
      (this as any).studioOverlay = null;
      (this as any).studioText = null;
    }

    this.scene.start("TestingMapScene");
  }

  private loadingComplete(): void {
    // Assets loaded, ready to start
  }
}
