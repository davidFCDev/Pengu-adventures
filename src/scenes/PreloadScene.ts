import GameSettings from "../config/GameSettings";

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
    // Add your game assets loading here as needed

    // Handle loading completion
    this.load.on("complete", () => {
      this.loadingComplete();
    });
  }

  create(): void {
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
      console.warn("⚠️ Studio text element not found, proceeding to game");
      this.transitionToGame();
      return;
    }

    // Show studio text with CSS transition
    studioText.style.opacity = "1";
    studioText.style.transform = "translateY(0) scale(1)";

    console.log("📝 HELLBOUND STUDIOS text shown");

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

    console.log("🎮 Transitioning to GameScene");
    this.scene.start("GameScene");
  }

  private loadingComplete(): void {
    // Assets loaded, ready to start
    console.log("✅ Assets loading completed");
  }
}
