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

        // Guardar nivel guardado para que PreloadScene pueda usarlo
        const savedLevel = (gameInfo.initialGameState.gameState as any)
          ?.currentLevel;
        if (savedLevel) {
          (window as any).__savedLevel = savedLevel;
          console.log(
            `📍 RemixUtils: Nivel guardado encontrado: ${savedLevel}`,
          );
        }

        // Restaurar score acumulado si existe Y el juego aún no ha empezado
        const savedAccScore = (gameInfo.initialGameState.gameState as any)
          ?.accumulatedScore;
        if (typeof savedAccScore === "number" && !window.__scoreLockedByGame) {
          window.__accumulatedScore = savedAccScore;
          console.log(
            `💰 RemixUtils: Score acumulado restaurado: ${savedAccScore}`,
          );
        } else if (window.__scoreLockedByGame) {
          console.log(
            `⚠️ RemixUtils: Score NO restaurado (juego ya en progreso)`,
          );
        }

        // Restaurar vidas guardadas si existen
        const savedLives = (gameInfo.initialGameState.gameState as any)?.lives;
        if (
          typeof savedLives === "number" &&
          savedLives >= 1 &&
          savedLives <= 3
        ) {
          window.__currentLives = savedLives;
          console.log(`❤️ RemixUtils: Vidas restauradas: ${savedLives}`);
        }

        window.dispatchEvent(
          new CustomEvent("farcade_initial_state_loaded", {
            detail: gameInfo.initialGameState.gameState,
          }),
        );
      } else {
        console.log(
          "📊 RemixUtils: No hay estado inicial guardado (nuevo jugador)",
        );
      }

      // También verificar gameState directamente del SDK (nueva API 0.3.0)
      // Solo si el juego no ha empezado aún
      if (!window.__scoreLockedByGame) {
        try {
          const sdkGameState = window.FarcadeSDK.gameState;
          if (sdkGameState && (sdkGameState as any).currentLevel) {
            (window as any).__savedLevel = (sdkGameState as any).currentLevel;
            console.log(
              `📍 RemixUtils: Nivel guardado (gameState): ${(sdkGameState as any).currentLevel}`,
            );
          }
          if (
            sdkGameState &&
            typeof (sdkGameState as any).accumulatedScore === "number"
          ) {
            window.__accumulatedScore = (sdkGameState as any).accumulatedScore;
            console.log(
              `💰 RemixUtils: Score acumulado (gameState): ${(sdkGameState as any).accumulatedScore}`,
            );
          }
          if (
            sdkGameState &&
            typeof (sdkGameState as any).lives === "number" &&
            (sdkGameState as any).lives >= 1 &&
            (sdkGameState as any).lives <= 3
          ) {
            window.__currentLives = (sdkGameState as any).lives;
            console.log(
              `❤️ RemixUtils: Vidas restauradas (gameState): ${(sdkGameState as any).lives}`,
            );
          }
        } catch (e) {
          // Ignorar si no está disponible
        }
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

  // Setup play_again handler - reinicia el nivel actual (sin Roadmap)
  window.FarcadeSDK.on("play_again", () => {
    setTimeout(() => {
      try {
        game.sound.stopAll();
      } catch (error) {
        console.warn(
          "RemixUtils: error deteniendo audio después de play_again",
          error,
        );
      }

      const sceneManager = game.scene;
      const activeScenes = [...sceneManager.getScenes(true)];

      // Encontrar la escena de nivel activa para reiniciarla
      const levelScene = activeScenes.find(
        (s: Phaser.Scene) =>
          s.scene.key.startsWith("Level") || s.scene.key === "FirstBoss",
      );
      const targetScene = levelScene?.scene.key;

      // Detener todas las escenas activas
      activeScenes.forEach((scene: Phaser.Scene) => {
        try {
          sceneManager.stop(scene.scene.key);
        } catch (stopError) {
          console.warn(
            `RemixUtils: no se pudo detener la escena ${scene.scene.key}`,
            stopError,
          );
        }
      });

      if (targetScene) {
        // Reiniciar el nivel donde se quedó el jugador
        try {
          sceneManager.start(targetScene);
          console.log(`🔄 play_again: reiniciando ${targetScene}`);
        } catch (startError) {
          console.error(
            `RemixUtils: error al iniciar ${targetScene} tras play_again`,
            startError,
          );
          // Fallback: ir a PreloadScene para carga segura
          try {
            sceneManager.start("PreloadScene");
          } catch {
            window.location.reload();
          }
          return;
        }
      } else {
        // No se encontró escena activa: ir a PreloadScene para carga segura
        console.log(
          "🔄 play_again: sin escena activa, volviendo a PreloadScene",
        );
        try {
          sceneManager.start("PreloadScene");
        } catch {
          window.location.reload();
        }
      }

      try {
        game.canvas.focus();
      } catch (focusError) {
        console.warn(
          "RemixUtils: no se pudo devolver el foco al canvas",
          focusError,
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
