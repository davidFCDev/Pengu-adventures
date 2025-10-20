import GameSettings from "../config/GameSettings";
import { PenguinSprites } from "../objects/player/PenguinSprites";

export class PreloadScene extends Phaser.Scene {
  private progressBarElement?: HTMLElement;
  private assetsLoaded: boolean = false;
  private fontsReady: boolean = false;

  constructor() {
    super({ key: "PreloadScene" });
  }

  init(): void {
    // Crear la pantalla de branding CON la barra de progreso ANTES de cargar assets
    this.cameras.main.setBackgroundColor("#000000");
    this.createStudioBranding();

    // Verificar que las fuentes estén listas
    this.checkFonts();
  }

  private async checkFonts(): Promise<void> {
    const fontFamily = "TT-Trailers";
    const heavyVariant = `800 140px "${fontFamily}"`;
    const lightVariant = `800 32px "${fontFamily}"`;

    try {
      if (this.canUseDocumentFonts()) {
        await Promise.all([
          document.fonts.ready,
          document.fonts.load(heavyVariant),
          document.fonts.load(lightVariant),
        ]);

        const loadedViaSet =
          document.fonts.check(heavyVariant) ||
          document.fonts.check(lightVariant) ||
          Array.from(document.fonts.values()).some(
            (font) =>
              font.family.includes(fontFamily) && font.status === "loaded"
          );

        if (!loadedViaSet) {
          console.warn(
            "⚠️ TT-Trailers no fue confirmada via FontFaceSet, aplicando fallback"
          );
          await this.loadFontFallback(fontFamily);
        }
      } else {
        await this.loadFontFallback(fontFamily);
      }

      await this.forceFontPaint(fontFamily);
      this.fontsReady = true;
      console.log("✅ TT-Trailers cargada y verificada");
    } catch (error) {
      console.warn("⚠️ Error al cargar fuentes en PreloadScene:", error);
      try {
        await this.loadFontFallback(fontFamily);
        await this.forceFontPaint(fontFamily);
      } catch (fallbackError) {
        console.warn(
          "⚠️ Fallback de fuente también falló, continuando igualmente:",
          fallbackError
        );
      }
      this.fontsReady = true; // Continuar de todos modos
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
    return new URL("../../assets/fonts/TT-Trailers-ExtraBold.otf", import.meta.url)
      .href;
  }

  preload(): void {
    // Setup loading progress listeners (la barra ya está creada en init())
    this.load.on("progress", (value: number) => {
      this.updateProgressBar(value);
    });

    // Listener cuando la carga está 100% completa
    this.load.on("complete", () => {
      console.log("✅ Todos los assets cargados al 100%");
      this.assetsLoaded = true;
      this.updateProgressBar(1); // Asegurar que la barra esté al 100%
    });

    // ========== CRITICAL ASSETS ONLY (MainPage, Roadmap, Level1) ==========
    // Level2-5 and FirstBoss are loaded on-demand via AssetLoader utility

    // Cargar SOLO el mapa Level1 desde GitHub (nivel inicial)
    this.load.tilemapTiledJSON(
      "Level1",
      "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level1.json"
    );

    // Cargar los tilesets como imágenes (necesario para el tilemap) - DESDE VERCEL
    this.load.image(
      "spritesheet-tiles-default",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/spritesheet-tiles-default-VGxRqX4iMQmNE6wqP0jFWEtZxi521V.png?XcMs"
    );
    this.load.image(
      "spritesheet-backgrounds-default",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/spritesheet-backgrounds-default-YVhyThkCAlbUEbQtWieth2aP35NEdu.png?XCQc"
    );

    // Cargar el tileset también como spritesheet para poder acceder a frames individuales
    // (usado por KeySystem, DoorSystem, etc.) - DESDE VERCEL
    this.load.spritesheet(
      "spritesheet-tiles-frames",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/spritesheet-tiles-default-VGxRqX4iMQmNE6wqP0jFWEtZxi521V.png?XcMs",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );

    // Cargar imagen de coleccionables/tokens - Moneda Pengu
    this.load.image(
      "PT_TOKEN_MASTER_001",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pengu_coin-r3nN1TppT4jbx7JEGzQzuql8jGACq7.png?oCKD"
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

    // Cargar imagen de mini-pingüino coleccionable desde URL
    this.load.image(
      "mini-pingu",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/mini-pingu-HWHUQtqEI7XZnAKAhRmOCBTyH4ESAm.png?5ZyM"
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

    // Cargar el spritesheet del pez ángler (16 frames en grid 4x4, 622x451 cada frame)
    this.load.spritesheet(
      "angler_fish_swim",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/angler_fish_swim-ROKFvXFKEyzeSIAJhMeUXYJOo6hMv6.png?5wHZ",
      {
        frameWidth: 622,
        frameHeight: 451,
        endFrame: 15, // 16 frames (0-15)
      }
    );

    // Cargar el spritesheet del pez ángler idle (16 frames en grid 4x4, 622x451 cada frame)
    this.load.spritesheet(
      "angler_fish_idle",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/angler_fish_idle-fqfn6cEh6Ryrr4u1qqLxktpn5FbQ0F.png?tLoX",
      {
        frameWidth: 622,
        frameHeight: 451,
        endFrame: 15, // 16 frames (0-15)
      }
    );

    // Cargar el spritesheet del MediumSlime_Blue (24 frames en grid 6x4, 310x310 cada frame)
    this.load.spritesheet(
      "MediumSlime_Blue",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/MediumSlime_Blue-u7FN2Asq7pBOwwSxKDSXaANgyt7ZRA.png?nBpS",
      {
        frameWidth: 310,
        frameHeight: 310,
        endFrame: 23, // 24 frames (0-23) en 6 filas x 4 columnas
      }
    );

    // Cargar el spritesheet del Snowman
    // Dimensiones totales: 3100x300 (20 columnas x 2 filas = 40 frames)
    // Frame size: 155x150 cada uno
    // Fila 1 (frames 0-19): IDLE (20 frames)
    // Fila 2 (frames 20-26): ATTACK (7 frames), resto vacío
    this.load.spritesheet(
      "snowman-spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/snowman-spritesheet-PtmlhPtEZOqgFKT4znwNuUF8LOxvjn.png?2eg6",
      {
        frameWidth: 155,
        frameHeight: 150,
      }
    );

    // ========== BOSS ENEMIES (LAZY LOADED) ==========
    // Boss assets are loaded on-demand via AssetLoader.loadFirstBossAssets()
    // - boss-bat-spritesheet, boss-bat-die-spritesheet
    // - confused-status-spritesheet, roller-snowball, fondo-boss1

    // ========== MAIN PAGE ASSETS ==========
    // Fondo de la página principal
    this.load.image(
      "main-page",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/main-page-wMofn4QjUP95i18k5yE1CnzxXa24du.png?6J2W"
    );

    // ========== ROADMAP (Level Select) ASSETS ==========
    // Fondo de la pantalla de selección de niveles
    this.load.image(
      "frostland",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/frostland-x6CyuIIlNEH3kZJXLxFbCJT8yCgmje.png?YYUC"
    );

    // Nuevo fondo del roadmap
    this.load.image(
      "road-page",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/road-page-1Poplm08pZD29Nirk5BDdeoSd28mE4.png?k297"
    );

    // Pingüino decorativo del roadmap
    this.load.image(
      "nano-banana-2025-10-16T23-35-20 (1)",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pengu-back-49tBchKjV4BbDdu5GCEgiu2mazavYE.png?VdT5"
    );

    // Botón de nivel seleccionado (button-1)
    this.load.image(
      "button-1",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/button-1-KYIDtWckRC8p50s6cwACteYAeXs6ih.png?hc3z"
    );

    // Botón de nivel desbloqueado (button-2)
    this.load.image(
      "button-2",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/button-2-d1rIoj5jK8pkehNnqL7vW0vdSDMPjk.png?bJvr"
    );

    // Botón de nivel bloqueado (button-3)
    this.load.image(
      "button-3",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/button-3-iTQVI1Mfj7vVEmxIiZYDwjnCtLED1A.png?lNhd"
    );

    // Icono de calavera para el nivel Boss
    this.load.image(
      "boss-skull-icon",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/image%20%2812%29-nh4vJjrkmBYT1uWBpTCwCLV0KCz7sN.png?40x2"
    );

    // ========== MÚSICA DE NIVELES ==========
    // Cargar música del nivel de test
    this.load.audio(
      "level1_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level1-oFuFEHvgIOYOwUItEyjAzmuKezGcyo.mp3"
    );

    // Cargar música del Roadmap (selección de nivel)
    this.load.audio(
      "roadmap_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/choose-level-PFlnialE3QOlsC5QiaBn8wi7ncT8jl.mp3?5bct"
    );

    // ========== SONIDOS DE EFECTOS ==========
    // Boss sounds (boss_music, boss_bat_wake, boss_confused) are lazy loaded

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

    // ========== SONIDOS DE COLECCIONABLES ==========
    // Sonido al recoger moneda y llave (pop)
    this.load.audio(
      "coin_collect_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/pop-aGrlCVlQJeHEptLFGFa8Rrxeh7yTDA.mp3?lewT"
    );

    // Sonido al recoger mini-pingüino
    this.load.audio(
      "minipingu_collect_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/yuhu-y2NRnaCo9kkGxUYapknIPeqNf90F42.mp3?MQ5S"
    );

    // ========== MÚSICA DE NIVELES ==========
    // Música de fondo para Level1
    this.load.audio(
      "level1_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level1-V1uFKODckgpJTx5QhnfpfC80ElhEEm.mp3?AAC8"
    );

    // ========== LAZY LOADED MUSIC (Level2-5 and Boss) ==========
    // These are loaded on-demand via AssetLoader utility when level is selected
    // - level2_music, level3_music, level4_music, level5_music
    // - boss_music, boss_bat_wake, boss_confused

    // ========== SONIDOS DE PUERTAS ==========
    // Sonido al abrir/desaparecer puerta con llave
    this.load.audio(
      "door_open_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/door-fGm8Vz3bRA004JBgZzE0w5CHkIXggR.mp3?W5hb"
    );

    // ========== SONIDOS DE CAJAS SMASH ==========
    // Sonido de golpe de roca cuando las cajas smash colisionan
    this.load.audio(
      "rock_smash_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/rock_smash-8evX0vfTxeuibQVesVBjVVbOGAhBaH.mp3?VHea"
    );

    // ========== SONIDOS DE GAME OVER ==========
    // Sonido cuando el jugador pierde las 3 vidas
    this.load.audio(
      "game_over_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/fail-PEUUHmnYdukLaR1Lc66VbEMXV0RJMz.mp3?5I5G"
    );

    // ========== SONIDOS DE ELECTROCUCIÓN ==========
    // Sonido cuando el pez eléctrico electrocuta al jugador
    this.load.audio(
      "electrocute_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/electrocute-ISm1Olyb9dag0f5mlYJh6XPSXCrvdm.mp3?9igL"
    );

    // ========== SONIDOS DE CONGELACIÓN ==========
    // Sonido cuando la bola de nieve congela a un enemigo (Slime)
    this.load.audio(
      "freeze_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/freeze-nDjIVZAKd1MZlmm4VmqC6wG8ys2pj6.mp3?GyOI"
    );

    // ========== SONIDOS DE PUERTAS ==========
    // Sonido cuando intentas abrir una puerta sin tener llave
    this.load.audio(
      "door_error_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/error-te5U64ggXEevr6c7P2xSohfUNU3HTY.mp3?HuIY"
    );

    // ========== SONIDOS DE BOTONES E INTERACCIONES ==========
    // Sonido cuando el jugador activa el botón rojo
    this.load.audio(
      "red_button_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/red-button-fwP061fHrkpUEZoJjPNtbJdcp42Tc8.mp3?fUqR"
    );

    // Sonido cuando el jugador salta sobre el jump button (trampolín)
    this.load.audio(
      "bounce_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/bounce-NSwv47WHV2Fxf3UhuNSenKcj7zU2tk.mp3?lQZj"
    );

    // ========== SONIDOS DE COLECCIONABLES ==========
    // Sonido cuando el jugador recoge una llave
    this.load.audio(
      "key_pickup_sound",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/key-8mqVATOCyjy5r0AIOLjOkRhsRn3YiP.mp3?OZOe"
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

    // La barra ya se creó en init() y se llenó durante preload()
    // Ahora solo esperamos la transición
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

    // Progress bar container (barra de carga estilizada)
    const progressContainer = document.createElement("div");
    progressContainer.style.cssText = `
      width: 200px;
      height: 20px;
      border: 3px solid #000000;
      border-radius: 12px;
      margin: 12px auto;
      display: block;
      position: relative;
      box-sizing: border-box;
      background: #1a1a1a;
      overflow: hidden;
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.5),
        0 0 8px rgba(183, 255, 0, 0.3);
    `;

    // Progress bar fill (se llenará según el progreso)
    const greenLine = document.createElement("div");
    greenLine.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(to bottom, 
        #b7ff00 0%, 
        #a0e600 30%,
        #8fcc00 50%,
        #a0e600 70%,
        #b7ff00 100%
      );
      border-radius: 9px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      box-shadow: 
        0 0 10px rgba(183, 255, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    `;

    progressContainer.appendChild(greenLine);

    // Store reference to progress bar
    this.progressBarElement = greenLine;

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
    studioText.appendChild(progressContainer);
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

    // Show the studio branding IMMEDIATELY (sin delay)
    this.showStudioText();
  }

  private showStudioText(): void {
    const studioText = (this as any).studioText;

    if (!studioText) {
      // Si no hay texto, hacer transición directamente (sin await porque es void)
      this.transitionToGame().catch(console.error);
      return;
    }

    // Show studio text with CSS transition
    studioText.style.opacity = "1";
    studioText.style.transform = "translateY(0) scale(1)";

    // Esperar a que la carga esté completa Y mostrar por mínimo 2 segundos
    this.waitForAssetsAndTransition();
  }

  private waitForAssetsAndTransition(): void {
    const minDisplayTime = 2000; // Mínimo 2 segundos de visualización
    const startTime = Date.now();

    const checkAndTransition = () => {
      const elapsedTime = Date.now() - startTime;

      // Solo hacer transición si:
      // 1. Los assets están cargados (100%)
      // 2. Las fuentes están listas
      // 3. Han pasado al menos 2 segundos
      if (
        this.assetsLoaded &&
        this.fontsReady &&
        elapsedTime >= minDisplayTime
      ) {
        console.log("🎮 Transición a MainPage - Assets, fuentes y tiempo OK");

        const studioText = (this as any).studioText;
        if (studioText) {
          studioText.style.opacity = "0";
          studioText.style.transform = "translateY(8px) scale(0.98)";
        }

        setTimeout(() => {
          this.transitionToGame().catch(console.error);
        }, 600); // Wait for fade out transition
      } else {
        // Mostrar estado de carga en consola
        if (!this.assetsLoaded) console.log("⏳ Esperando assets...");
        if (!this.fontsReady) console.log("⏳ Esperando fuentes...");
        if (elapsedTime < minDisplayTime)
          console.log(
            `⏳ Esperando tiempo mínimo... ${elapsedTime}ms/${minDisplayTime}ms`
          );

        // Revisar cada 100ms
        setTimeout(checkAndTransition, 100);
      }
    };

    checkAndTransition();
  }

  private updateProgressBar(progress: number): void {
    if (this.progressBarElement) {
      // Convert progress (0-1) to percentage
      const percentage = Math.round(progress * 100);
      this.progressBarElement.style.width = `${percentage}%`;

      console.log(`📦 Loading: ${percentage}%`);
    } else {
      console.warn("⚠️ Progress bar element not found!");
    }
  }

  private async transitionToGame(): Promise<void> {
    // Última verificación de fuentes antes de hacer la transición
    try {
      await document.fonts.ready;
      console.log("✅ Verificación final de fuentes OK");
    } catch (error) {
      console.warn("⚠️ Error en verificación final de fuentes:", error);
    }

    // Clean up DOM overlay
    const overlay = (this as any).studioOverlay;

    if (overlay && overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
      (this as any).studioOverlay = null;
      (this as any).studioText = null;
    }

    // Clear progress bar reference
    this.progressBarElement = undefined;

    // Iniciar MainPage (pantalla principal)
    this.scene.start("MainPage");
  }

  private loadingComplete(): void {
    // Assets loaded, ready to start
  }
}
