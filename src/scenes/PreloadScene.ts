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
    // Cargar el mapa Level1 desde GitHub
    this.load.tilemapTiledJSON(
      "Level1",
      "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level1.json"
    );

    // Cargar el mapa Level2 desde GitHub
    this.load.tilemapTiledJSON(
      "Level2",
      "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level2.json"
    );

    // Cargar el mapa Level3 (desde GitHub)
    this.load.tilemapTiledJSON(
      "Level3",
      "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level3.json"
    );

    // Cargar el mapa Level4 (desde GitHub)
    this.load.tilemapTiledJSON(
      "Level4",
      "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level4.json"
    );

    // Cargar el mapa Level5 (desde LOCAL - assets)
    this.load.tilemapTiledJSON("Level5", "assets/Level5.json");

    // Cargar el mapa FirstBoss - BOSS LEVEL (desde GitHub raw)
    this.load.tilemapTiledJSON(
      "FirstBoss",
      "https://raw.githubusercontent.com/davidFCDev/remix-base-startup/main/assets/FirstBoss.json"
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

    // ========== BOSS ENEMIES ==========
    // BOSS BAT - Murciélago jefe del FirstBoss
    // Dimensiones totales: 6090x1554 (10 columnas por fila)
    // Frame size: 609x518 cada uno (1554/3 = 518)
    // Fila 1 (frames 0-9): HURT - Cuando recibe daño (10 frames)
    // Fila 2 (frames 10-18): WAKE - Despertar del estado dormido (9 frames)
    // Fila 3 (frames 20-27): FLYING - Estado de vuelo en batalla (8 frames)
    this.load.spritesheet(
      "boss-bat-spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss_bat-YhgPBVXu7j9tscC446Augx1rAUiz2h.png?XgJC",
      {
        frameWidth: 609,
        frameHeight: 518,
      }
    );

    // Cargar spritesheet de muerte del Boss Bat (DIE animation)
    this.load.spritesheet(
      "boss-bat-die-spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/die_bat-Z60vTPdcbzWxxw04gnjzNmwit9KL86.png?xSuv",
      {
        frameWidth: 609,
        frameHeight: 518,
      }
    );

    // Cargar spritesheet de estado confuso (para el boss aturdido)
    this.load.spritesheet(
      "confused-status-spritesheet",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/confused_status-lDP44E0A9zwjU7uok5OsSUpkpReilW.png?pEz6",
      {
        frameWidth: 670, // 10720 / 16 frames = 670px por frame
        frameHeight: 392,
      }
    );

    // Cargar imagen de bola de nieve rodante (FirstBoss)
    this.load.image(
      "roller-snowball",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/roller-snowball-7Qny1WDOwxpF0zGLnHYmgXlKAdrjm0.png?nIAV"
    );

    // Cargar imagen de fondo para FirstBoss (768×1024px - ajustada al tamaño del tilemap)
    this.load.image(
      "fondo-boss1",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/fondo-boss1%20%281%29-U8P7eQTsQxFpS4M0XjRYrsKkw50uRd.png?eKHL"
    );

    // ========== MÚSICA DE NIVELES ==========
    // Cargar música del nivel de test
    this.load.audio(
      "level1_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level1-oFuFEHvgIOYOwUItEyjAzmuKezGcyo.mp3"
    );

    // Cargar música del boss (FirstBoss)
    this.load.audio(
      "boss_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss-music-Uc0TBbcOXiNZTFHe8IImIh6vzL17hD.mp3?ZGgU"
    );

    // ========== SONIDOS DE EFECTOS ==========
    // Sonido de despertar del Boss Bat
    this.load.audio(
      "boss_bat_wake",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss_bat-Wni2i2yqMdyNmed5q9T6lOQL5BjO9T.mp3?TCwy"
    );

    // Sonido de confusión del Boss Bat
    this.load.audio(
      "boss_confused",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss-confused-5MnQmN0K0PPmO331Tm915ms3IKHKJR.mp3?KUxB"
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

    // Música de fondo para Level2
    this.load.audio(
      "level2_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/Level2-0LVHTXGqK32B0P41WqB0n10sKfVHiQ.mp3?UVgv"
    );

    // Música de fondo para Level3
    this.load.audio(
      "level3_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level3-DLjjuoN0wbyyUpLi1eIlS2pRqOWygZ.mp3?TNx1"
    );

    // Música de fondo para Level4
    this.load.audio(
      "level4_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level4-iuK3YADEvREOfYhxREOFsBExNCT7vv.mp3?4xQd"
    );

    // Música de fondo para Level5
    this.load.audio(
      "level5_music",
      "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level5-8173QPSZmk28WxNRr9LLVuXaseEBm8.mp3?ipax"
    );

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

    // Iniciar FirstBoss (BOSS LEVEL) por defecto para testing
    this.scene.start("FirstBoss");
  }

  private loadingComplete(): void {
    // Assets loaded, ready to start
  }
}
