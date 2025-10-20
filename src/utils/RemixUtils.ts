// Dev environment info interface
interface DevEnvironmentInfo {
  packageManager: string;
  gameId: string;
  lastUpdated: number;
}

// Function to check if running inside the Remix iframe environment
export function isRemixEnvironment(): boolean {
  try {
    // Check for local development indicators
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0";

    // If we're on localhost, we're in local dev
    if (isLocalhost) {
      return false;
    }

    // Otherwise assume we're in Remix environment (production, staging, or Remix iframe)
    return true;
  } catch (e) {
    // If we can't determine, assume we're in Remix environment for safety
    return true;
  }
}

// Function to get development environment information (only available in dev mode)
export function getDevEnvironmentInfo(): DevEnvironmentInfo | null {
  try {
    const devInfo = (window as any).__remixDevInfo;
    return devInfo || null;
  } catch (e) {
    return null;
  }
}

export async function initializeRemixSDK(game: Phaser.Game): Promise<void> {
  if (!("FarcadeSDK" in window && window.FarcadeSDK)) {
    return;
  }

  // Make the game canvas focusable
  game.canvas.setAttribute("tabindex", "-1");

  // 🎮 Signal ready state and get initial game info (sin bloquear el resto de handlers)
  window.FarcadeSDK.singlePlayer.actions
    .ready()
    .then((gameInfo) => {
      console.log("🎮 RemixUtils: GameInfo recibido:", gameInfo);

      if (gameInfo?.initialGameState?.gameState) {
        console.log("💾 RemixUtils: Encontrado estado inicial guardado");
        (window as any).__initialGameState =
          gameInfo.initialGameState.gameState;

        window.dispatchEvent(
          new CustomEvent("farcade_initial_state_loaded", {
            detail: gameInfo.initialGameState.gameState,
          })
        );
      } else {
        console.log(
          "📊 RemixUtils: No hay estado inicial guardado (nuevo jugador)"
        );
      }
    })
    .catch((error) => {
      console.error("❌ RemixUtils: Error al llamar ready():", error);
    });

  // Set mute/unmute handler
  window.FarcadeSDK.on("toggle_mute", (data: unknown) => {
    if (typeof data === "object" && data !== null && "isMuted" in data) {
      game.sound.mute = (data as { isMuted: boolean }).isMuted;
    }
  });

  // Setup play_again handler
  window.FarcadeSDK.on("play_again", () => {
    setTimeout(() => {
      try {
        game.sound.stopAll();
      } catch (error) {
        console.warn(
          "RemixUtils: error deteniendo audio después de play_again",
          error
        );
      }

      const sceneManager = game.scene;
      const activeScenes = [...sceneManager.getScenes(true)];

      activeScenes.forEach((scene: Phaser.Scene) => {
        if (scene.scene.key !== "Roadmap") {
          try {
            sceneManager.stop(scene.scene.key);
          } catch (stopError) {
            console.warn(
              `RemixUtils: no se pudo detener la escena ${scene.scene.key}`,
              stopError
            );
          }
        }
      });

      try {
        sceneManager.start("Roadmap");
      } catch (startError) {
        console.error(
          "RemixUtils: error al iniciar Roadmap tras play_again",
          startError
        );
        window.location.reload();
        return;
      }

      try {
        game.canvas.focus();
      } catch (focusError) {
        console.warn(
          "RemixUtils: no se pudo devolver el foco al canvas",
          focusError
        );
      }
    }, 0);
  });
}

// Initialize development features (separate from SDK)
export function initializeDevelopment(): void {
  // Listen for dev info messages from the overlay
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "remix_dev_info") {
      (window as any).__remixDevInfo = event.data.data;
    }
  });

  // Load performance monitoring plugin after a short delay to ensure game is ready
  setTimeout(() => {
    loadRemixPerformancePlugin();
  }, 100);
}

// Load and inject the performance monitoring plugin
function loadRemixPerformancePlugin(): void {
  // Only load in development mode
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    // Fetch the plugin code from the .remix directory
    fetch("/.remix/plugins/performance-plugin.js")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Performance plugin not found");
        }
        return response.text();
      })
      .then((pluginCode) => {
        // Execute the plugin code in the game context
        const script = document.createElement("script");
        script.textContent = pluginCode;
        document.head.appendChild(script);

        // The plugin code sets window.RemixPerformancePluginCode as a string
        // We need to evaluate it to actually run the plugin
        if ((window as any).RemixPerformancePluginCode) {
          const pluginScript = document.createElement("script");
          pluginScript.textContent = (window as any).RemixPerformancePluginCode;
          document.head.appendChild(pluginScript);

          // Clean up
          setTimeout(() => {
            if (pluginScript.parentNode) {
              pluginScript.parentNode.removeChild(pluginScript);
            }
          }, 100);
        }

        // Clean up the script element
        setTimeout(() => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }, 100);
      })
      .catch((error) => {
        // Performance plugin loading failed, but this is non-critical
      });
  } catch (error) {
    // Silently fail if plugin loading fails
  }
}

/**
 * Helper function to trigger haptic feedback
 * Can be called from anywhere in the game for important interactions
 * Safely checks if SDK is available before calling
 */
export function triggerHapticFeedback(): void {
  try {
    if (window.FarcadeSDK) {
      window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
    }
  } catch (error) {
    // Silently fail if SDK is not available
    // This is expected in local development
  }
}
