import Phaser from "phaser";
import { PenguinSprites } from "../objects/player/PenguinSprites";
import { PreloadSceneBase } from "./PreloadSceneBase";

// Importar Level1 JSON para bundlearlo con el código
import Level1Data from "../../assets/Level1.json";

export class PreloadScene extends PreloadSceneBase {
  private fontsReady: boolean = false;
  private transitionStarted: boolean = false; // Guard para evitar doble ejecución

  constructor() {
    super("PreloadScene", "Level1");
  }

  init(): void {
    super.init();
    // Reset flags propios (Phaser reutiliza la instancia)
    this.fontsReady = false;
    this.transitionStarted = false;
    // Desbloquear score para permitir restauración desde SDK
    window.__scoreLockedByGame = false;
    // Limpiar nivel guardado previo para re-detectar
    (window as any).__savedLevel = undefined;
    this.checkFonts();
  }

  // =========================================================================
  // loadProjectAssets — encola todos los assets específicos del proyecto
  // =========================================================================
  protected loadProjectAssets(): void {
    // ========== CRITICAL ASSETS ONLY (MainPage, Roadmap, Level1) ==========
    // Level2-5 and FirstBoss are loaded on-demand via AssetLoader utility

    // Cargar Level1 desde el bundle local (sin petición HTTP)
    this.cache.tilemap.add("Level1", {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: Level1Data,
    });
    console.log("✅ Level1 tilemap cargado desde bundle local");

    // Cargar los tilesets como imágenes (necesario para el tilemap) - DESDE VERCEL
    this.load.image(
      "spritesheet-tiles-default",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/spritesheet-tiles-default-VGxRqX4iMQmNE6wqP0jFWEtZxi521V.png?XcMs",
    );
    this.load.image(
      "spritesheet-backgrounds-default",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/spritesheet-backgrounds-default-YVhyThkCAlbUEbQtWieth2aP35NEdu.png?XCQc",
    );

    // Cargar el tileset también como spritesheet para poder acceder a frames individuales
    // (usado por KeySystem, DoorSystem, etc.) - DESDE VERCEL
    this.load.spritesheet(
      "spritesheet-tiles-frames",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/spritesheet-tiles-default-VGxRqX4iMQmNE6wqP0jFWEtZxi521V.png?XcMs",
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );

    // Cargar imagen de coleccionables/tokens - Moneda Pengu
    this.load.image(
      "PT_TOKEN_MASTER_001",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pengu_coin-r3nN1TppT4jbx7JEGzQzuql8jGACq7.png?oCKD",
    );

    // Cargar todos los sprites del pingüino
    PenguinSprites.loadSprites(this);

    // Cargar el spritesheet del pingüino femenino NPC
    this.load.spritesheet(
      "penguin_girl_idle",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/girl-1-sheet-adLnTEUtv7UNjVDnZEKVJ1u6RakxoM.png?nqeI",
      {
        frameWidth: 159,
        frameHeight: 171,
        endFrame: 8, // 9 frames (0-8)
      },
    );

    // Cargar el spritesheet del fantasma soplando (12 frames)
    this.load.spritesheet(
      "ghost_blowing",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/ghost_blowing-LqyxkcbCRmswFy56C4IKedBSFWaX6n.png",
      {
        frameWidth: 110,
        frameHeight: 110,
        endFrame: 11, // 12 frames (0-11)
      },
    );

    // Cargar el spritesheet de corazones para el sistema de vidas
    this.load.spritesheet(
      "heart_spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/heart-Yb604s53ChLnxx6liA2W05EYnHKnn9.png?vag4",
      {
        frameWidth: 32,
        frameHeight: 32,
        endFrame: 2,
      },
    );

    // Cargar imagen de mini-pingüino coleccionable desde URL
    this.load.image(
      "mini-pingu",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/mini-pingu-HWHUQtqEI7XZnAKAhRmOCBTyH4ESAm.png?5ZyM",
    );

    // Cargar el spritesheet de celebración (4 frames de 128x128)
    this.load.spritesheet(
      "celebrate",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/celebrate-icTGklgzJfwuEIAvMbCAcYDel5Nojk.png?6ISy",
      {
        frameWidth: 128,
        frameHeight: 128,
        endFrame: 3,
      },
    );

    // Cargar el spritesheet del pez ángler (16 frames en grid 4x4, 622x451 cada frame)
    this.load.spritesheet(
      "angler_fish_swim",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/angler_fish_swim-ROKFvXFKEyzeSIAJhMeUXYJOo6hMv6.png?5wHZ",
      {
        frameWidth: 622,
        frameHeight: 451,
        endFrame: 15,
      },
    );

    // Cargar el spritesheet del pez ángler idle
    this.load.spritesheet(
      "angler_fish_idle",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/angler_fish_idle-fqfn6cEh6Ryrr4u1qqLxktpn5FbQ0F.png?tLoX",
      {
        frameWidth: 622,
        frameHeight: 451,
        endFrame: 15,
      },
    );

    // Cargar el spritesheet del MediumSlime_Blue (24 frames en grid 6x4, 310x310)
    this.load.spritesheet(
      "MediumSlime_Blue",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/MediumSlime_Blue-u7FN2Asq7pBOwwSxKDSXaANgyt7ZRA.png?nBpS",
      {
        frameWidth: 310,
        frameHeight: 310,
        endFrame: 23,
      },
    );

    // Cargar el spritesheet del Snowman (3100x300, 20 cols x 2 rows = 40 frames, 155x150)
    this.load.spritesheet(
      "snowman-spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/snowman-spritesheet-PtmlhPtEZOqgFKT4znwNuUF8LOxvjn.png?2eg6",
      {
        frameWidth: 155,
        frameHeight: 150,
      },
    );

    // ========== BOSS ENEMIES (LAZY LOADED) ==========
    // Boss assets are loaded on-demand via AssetLoader.loadFirstBossAssets()

    // ========== MAIN PAGE ASSETS ==========
    this.load.image(
      "main-page",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/main-page-wMofn4QjUP95i18k5yE1CnzxXa24du.png?6J2W",
    );

    // ========== ROADMAP (Level Select) ASSETS ==========
    this.load.image(
      "frostland",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/frostland-x6CyuIIlNEH3kZJXLxFbCJT8yCgmje.png?YYUC",
    );
    this.load.image(
      "road-page",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/road-page-1Poplm08pZD29Nirk5BDdeoSd28mE4.png?k297",
    );
    this.load.image(
      "nano-banana-2025-10-16T23-35-20 (1)",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pengu-back-49tBchKjV4BbDdu5GCEgiu2mazavYE.png?VdT5",
    );
    this.load.image(
      "button-1",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/button-1-KYIDtWckRC8p50s6cwACteYAeXs6ih.png?hc3z",
    );
    this.load.image(
      "button-2",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/button-2-d1rIoj5jK8pkehNnqL7vW0vdSDMPjk.png?bJvr",
    );
    this.load.image(
      "button-3",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/button-3-iTQVI1Mfj7vVEmxIiZYDwjnCtLED1A.png?lNhd",
    );
    this.load.image(
      "boss-skull-icon",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/image%20%2812%29-nh4vJjrkmBYT1uWBpTCwCLV0KCz7sN.png?40x2",
    );

    // ========== MÚSICA DE NIVELES ==========
    this.load.audio(
      "level1_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level1-oFuFEHvgIOYOwUItEyjAzmuKezGcyo.mp3",
    );
    this.load.audio(
      "roadmap_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/choose-level-PFlnialE3QOlsC5QiaBn8wi7ncT8jl.mp3?5bct",
    );

    // ========== SONIDOS DEL PLAYER ==========
    this.load.audio(
      "snowball_hit_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/throw-dOGOYFxj6vxBWNDwgT3RC7UekmZcjO.mp3?EVjO",
    );
    this.load.audio(
      "jump_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/jump-fZREmg47OmHKs7n50lWiI8IC1gt8EP.mp3?GXA9",
    );
    this.load.audio(
      "swim_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/swim-SwpcxfxhmItcxJU2PhvgmOs9QxzlLR.mp3?gcSl",
    );
    this.load.audio(
      "hurt_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/hurt-Nls2Ffjm9810PWTjFhRFDJXiXsY1wM.mp3?NW2H",
    );
    this.load.audio(
      "finish_level_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/finish-level-4pyYbYK1y4fWxi9Si6P8o2YQyjUAjm.mp3?wTty",
    );
    this.load.audio(
      "blow_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/blow-4zYjtNIREJ7SWiPLYM6lOSwk3thCAi.mp3?IWs8",
    );

    // ========== SONIDOS DE COLECCIONABLES ==========
    this.load.audio(
      "coin_collect_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pop-aGrlCVlQJeHEptLFGFa8Rrxeh7yTDA.mp3?lewT",
    );
    this.load.audio(
      "minipingu_collect_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/yuhu-y2NRnaCo9kkGxUYapknIPeqNf90F42.mp3?MQ5S",
    );

    // ========== LAZY LOADED MUSIC (Level2-5 and Boss) ==========
    // These are loaded on-demand via AssetLoader utility when level is selected

    // ========== SONIDOS DE PUERTAS ==========
    this.load.audio(
      "door_open_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/door-fGm8Vz3bRA004JBgZzE0w5CHkIXggR.mp3?W5hb",
    );

    // ========== SONIDOS DE CAJAS SMASH ==========
    this.load.audio(
      "rock_smash_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/rock_smash-8evX0vfTxeuibQVesVBjVVbOGAhBaH.mp3?VHea",
    );

    // ========== SONIDOS DE GAME OVER ==========
    this.load.audio(
      "game_over_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/fail-PEUUHmnYdukLaR1Lc66VbEMXV0RJMz.mp3?5I5G",
    );

    // ========== SONIDOS DE ELECTROCUCIÓN ==========
    this.load.audio(
      "electrocute_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/electrocute-ISm1Olyb9dag0f5mlYJh6XPSXCrvdm.mp3?9igL",
    );

    // ========== SONIDOS DE CONGELACIÓN ==========
    this.load.audio(
      "freeze_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/freeze-nDjIVZAKd1MZlmm4VmqC6wG8ys2pj6.mp3?GyOI",
    );

    // ========== SONIDOS DE PUERTAS ==========
    this.load.audio(
      "door_error_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/error-te5U64ggXEevr6c7P2xSohfUNU3HTY.mp3?HuIY",
    );

    // ========== SONIDOS DE BOTONES E INTERACCIONES ==========
    this.load.audio(
      "red_button_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/red-button-fwP061fHrkpUEZoJjPNtbJdcp42Tc8.mp3?fUqR",
    );
    this.load.audio(
      "bounce_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/bounce-NSwv47WHV2Fxf3UhuNSenKcj7zU2tk.mp3?lQZj",
    );

    // ========== SONIDOS DE COLECCIONABLES ==========
    this.load.audio(
      "key_pickup_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/key-8mqVATOCyjy5r0AIOLjOkRhsRn3YiP.mp3?OZOe",
    );
  }

  // =========================================================================
  // onAssetsLoaded — procesar texturas tras la carga (hook de la base)
  // =========================================================================
  protected onAssetsLoaded(): void {
    // Crear textura de partículas de nieve si no existe
    if (!this.textures.exists("snow_particle")) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture("snow_particle", 8, 8);
      graphics.destroy();
    }
  }

  // =========================================================================
  // checkTransition — extiende la base añadiendo la condición de fuentes
  // =========================================================================
  protected checkTransition(): void {
    if (this.animationComplete && this.assetsLoaded && this.fontsReady) {
      this.startTargetLevel();
    }
  }

  /**
   * Determina el nivel a iniciar (guardado o por defecto) y carga sus assets
   */
  private async startTargetLevel(): Promise<void> {
    // Guard: evitar doble ejecución (puede dispararse múltiples veces)
    if (this.transitionStarted) return;
    this.transitionStarted = true;

    // Esperar un momento para dar tiempo al SDK de establecer __savedLevel
    // (el SDK ready() es async y puede no haber resuelto aún)
    let savedLevel = (window as any).__savedLevel;

    if (!savedLevel) {
      // Esperar hasta 1.5s por si el SDK aún no ha respondido
      savedLevel = await this.waitForSavedLevel(1500);
    }

    const validLevels = [
      "Level1",
      "Level2",
      "Level3",
      "Level4",
      "Level5",
      "FirstBoss",
    ];
    const targetLevel =
      savedLevel && validLevels.includes(savedLevel)
        ? savedLevel
        : this.nextSceneKey;

    // Inicializar score acumulado y vidas:
    // - Si es juego nuevo (Level1), empezar desde 0 con 3 vidas
    // - Si es juego guardado, mantener valores restaurados por RemixUtils
    if (targetLevel === "Level1" || targetLevel === this.nextSceneKey) {
      window.__accumulatedScore = 0;
      window.__currentLives = 3;
      console.log("🔄 Juego nuevo: score=0, vidas=3");
    } else {
      // Mantener el score y vidas restaurados por RemixUtils
      window.__accumulatedScore = window.__accumulatedScore || 0;
      window.__currentLives = window.__currentLives || 3;
      console.log(
        `💾 Estado restaurado: score=${window.__accumulatedScore}, vidas=${window.__currentLives}`,
      );
    }

    // Si el nivel destino NO es Level1, cargar sus assets primero
    if (targetLevel !== "Level1") {
      console.log(`📦 Cargando assets de nivel guardado: ${targetLevel}...`);
      try {
        const { AssetLoader } = await import("../utils/AssetLoader");

        // Timeout de 10s para evitar que la carga se quede colgada
        const loadWithTimeout = (loader: Promise<void>) =>
          Promise.race([
            loader,
            new Promise<void>((_, reject) =>
              setTimeout(
                () => reject(new Error("Asset loading timeout (10s)")),
                10000,
              ),
            ),
          ]);

        switch (targetLevel) {
          case "Level2":
            await loadWithTimeout(AssetLoader.loadLevel2Assets(this));
            break;
          case "Level3":
            await loadWithTimeout(AssetLoader.loadLevel3Assets(this));
            break;
          case "Level4":
            await loadWithTimeout(AssetLoader.loadLevel4Assets(this));
            break;
          case "Level5":
            await loadWithTimeout(AssetLoader.loadLevel5Assets(this));
            break;
          case "FirstBoss":
            await loadWithTimeout(AssetLoader.loadFirstBossAssets(this));
            break;
        }
        console.log(`✅ Assets de ${targetLevel} cargados`);
      } catch (error) {
        console.error(
          `❌ Error cargando assets de ${targetLevel}, fallback a Level1:`,
          error,
        );
        window.__accumulatedScore = 0;
        this.scene.start(this.nextSceneKey);
        return;
      }
    }

    // Bloquear el score para que el SDK no lo sobrescriba
    window.__scoreLockedByGame = true;
    console.log(
      `🎮 Iniciando nivel: ${targetLevel} (score: ${window.__accumulatedScore})`,
    );
    this.scene.start(targetLevel);
  }

  /**
   * Espera a que window.__savedLevel esté disponible (con timeout)
   */
  private waitForSavedLevel(timeoutMs: number): Promise<string | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const saved = (window as any).__savedLevel;
        if (saved) {
          clearInterval(checkInterval);
          resolve(saved);
        } else if (Date.now() - startTime >= timeoutMs) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });
  }

  // =========================================================================
  // Carga y verificación de fuentes (específico de este proyecto)
  // =========================================================================
  private async checkFonts(): Promise<void> {
    const fontFamily = "TT-Trailers";
    const heavyVariant = `800 140px "${fontFamily}"`;
    const lightVariant = `800 32px "${fontFamily}"`;

    // Timeout de seguridad: en iOS, document.fonts.ready puede colgarse
    // si Google Fonts u otras fuentes externas no terminan de cargar.
    const FONT_TIMEOUT_MS = 4000;

    const fontLoadWithTimeout = <T>(promise: Promise<T>): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error("Font loading timeout")),
            FONT_TIMEOUT_MS,
          ),
        ),
      ]);

    try {
      if (this.canUseDocumentFonts()) {
        await fontLoadWithTimeout(
          Promise.all([
            document.fonts.ready,
            document.fonts.load(heavyVariant),
            document.fonts.load(lightVariant),
          ]),
        );

        const loadedViaSet =
          document.fonts.check(heavyVariant) ||
          document.fonts.check(lightVariant) ||
          Array.from(document.fonts.values()).some(
            (font) =>
              font.family.includes(fontFamily) && font.status === "loaded",
          );

        if (!loadedViaSet) {
          console.warn(
            "⚠️ TT-Trailers no fue confirmada via FontFaceSet, aplicando fallback",
          );
          await fontLoadWithTimeout(this.loadFontFallback(fontFamily));
        }
      } else {
        await fontLoadWithTimeout(this.loadFontFallback(fontFamily));
      }

      await this.forceFontPaint(fontFamily);
      this.fontsReady = true;
      this.checkTransition(); // Re-evaluar transición tras cargar fuentes
      console.log("✅ TT-Trailers cargada y verificada");
    } catch (error) {
      console.warn(
        "⚠️ Error/timeout al cargar fuentes en PreloadScene:",
        error,
      );
      try {
        await fontLoadWithTimeout(this.loadFontFallback(fontFamily));
        await this.forceFontPaint(fontFamily);
      } catch (fallbackError) {
        console.warn(
          "⚠️ Fallback de fuente también falló, continuando igualmente:",
          fallbackError,
        );
      }
      this.fontsReady = true;
      this.checkTransition();
    }
  }

  private canUseDocumentFonts(): boolean {
    return (
      typeof document !== "undefined" &&
      "fonts" in document &&
      typeof document.fonts?.load === "function"
    );
  }

  private async loadFontFallback(fontFamily: string): Promise<void> {
    if (typeof FontFace === "undefined") {
      return;
    }

    const fontUrl = this.getTTTrailersUrl();
    const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
      weight: "800",
      style: "normal",
    });

    const loadedFace = await fontFace.load();
    if (this.canUseDocumentFonts()) {
      document.fonts.add(loadedFace);
    }
  }

  private async forceFontPaint(fontFamily: string): Promise<void> {
    const tempText = document.createElement("div");
    tempText.style.fontFamily = fontFamily;
    tempText.style.fontSize = "140px";
    tempText.style.fontWeight = "800";
    tempText.style.position = "absolute";
    tempText.style.left = "-9999px";
    tempText.textContent = "I AM PENGU";
    document.body.appendChild(tempText);

    tempText.offsetHeight;
    await new Promise((resolve) => setTimeout(resolve, 50));

    document.body.removeChild(tempText);
  }

  private getTTTrailersUrl(): string {
    return new URL(
      "../../assets/fonts/TT-Trailers-ExtraBold.otf",
      import.meta.url,
    ).href;
  }
}
