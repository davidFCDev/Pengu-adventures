import { initializeSDKMock } from "../.remix/mocks/RemixSDKMock";
import GameSettings from "./config/GameSettings";
import { Level1 } from "./scenes/Level1";
import { Level2 } from "./scenes/Level2";
import { Level3 } from "./scenes/Level3";
import { Level4 } from "./scenes/Level4";
import { PreloadScene } from "./scenes/PreloadScene";
import { initializeDevelopment, initializeRemixSDK } from "./utils/RemixUtils";

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL, // Using WebGL for shader support
  width: GameSettings.canvas.width,
  height: GameSettings.canvas.height,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GameSettings.canvas.width,
    height: GameSettings.canvas.height,
  },
  backgroundColor: "#1a1a1a",
  // Scene order: PreloadScene -> Level1 -> Level2 -> Level3 -> Level4
  scene: [PreloadScene, Level1, Level2, Level3, Level4],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
    },
  },
  // Target frame rate
  fps: {
    target: 60,
  },
  // Additional WebGL settings
  pixelArt: false,
  antialias: true,
  // Preserve drawing buffer for underglow effect
  render: {
    preserveDrawingBuffer: true,
  },
};

// Initialize the application
async function initializeApp() {
  // Initialize SDK mock in development
  if (process.env.NODE_ENV !== "production") {
    await initializeSDKMock();
  }

  // Create the game instance
  const game = new Phaser.Game(config);

  // Expose game globally for performance plugin
  (window as any).game = game;

  // Initialize Remix SDK and development features
  game.events.once("ready", () => {
    initializeRemixSDK(game);

    // Initialize development features (only active in dev mode)
    if (process.env.NODE_ENV !== "production") {
      initializeDevelopment();
    }
  });
}

// Start the application
initializeApp().catch(console.error);
