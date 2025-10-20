/**
 * AssetLoader - Utility for lazy loading game assets
 * Allows loading assets on-demand instead of all at startup
 */

export class AssetLoader {
  /**
   * Load assets for Level 2
   */
  static loadLevel2Assets(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      // Check if already loaded
      if (scene.cache.tilemap.exists("Level2")) {
        resolve();
        return;
      }

      scene.load.once("complete", () => resolve());

      // Load Level2 tilemap
      scene.load.tilemapTiledJSON(
        "Level2",
        "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level2.json"
      );

      // Load Level2 music
      if (!scene.cache.audio.exists("level2_music")) {
        scene.load.audio(
          "level2_music",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/Level2-0LVHTXGqK32B0P41WqB0n10sKfVHiQ.mp3?UVgv"
        );
      }

      scene.load.start();
    });
  }

  /**
   * Load assets for Level 3
   */
  static loadLevel3Assets(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      if (scene.cache.tilemap.exists("Level3")) {
        resolve();
        return;
      }

      scene.load.once("complete", () => resolve());

      scene.load.tilemapTiledJSON(
        "Level3",
        "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level3.json"
      );

      if (!scene.cache.audio.exists("level3_music")) {
        scene.load.audio(
          "level3_music",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level3-DLjjuoN0wbyyUpLi1eIlS2pRqOWygZ.mp3?TNx1"
        );
      }

      scene.load.start();
    });
  }

  /**
   * Load assets for Level 4
   */
  static loadLevel4Assets(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      if (scene.cache.tilemap.exists("Level4")) {
        resolve();
        return;
      }

      scene.load.once("complete", () => resolve());

      scene.load.tilemapTiledJSON(
        "Level4",
        "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level4.json"
      );

      if (!scene.cache.audio.exists("level4_music")) {
        scene.load.audio(
          "level4_music",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level4-iuK3YADEvREOfYhxREOFsBExNCT7vv.mp3?4xQd"
        );
      }

      scene.load.start();
    });
  }

  /**
   * Load assets for Level 5
   */
  static loadLevel5Assets(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      if (scene.cache.tilemap.exists("Level5")) {
        resolve();
        return;
      }

      scene.load.once("complete", () => resolve());

      scene.load.tilemapTiledJSON(
        "Level5",
        "https://raw.githubusercontent.com/davidFCDev/Pengu-adventures/refs/heads/main/assets/Level5.json"
      );

      if (!scene.cache.audio.exists("level5_music")) {
        scene.load.audio(
          "level5_music",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/level5-8173QPSZmk28WxNRr9LLVuXaseEBm8.mp3?ipax"
        );
      }

      scene.load.start();
    });
  }

  /**
   * Load assets for FirstBoss level
   */
  static loadFirstBossAssets(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      if (scene.cache.tilemap.exists("FirstBoss")) {
        resolve();
        return;
      }

      scene.load.once("complete", () => resolve());

      // Boss tilemap
      scene.load.tilemapTiledJSON(
        "FirstBoss",
        "https://raw.githubusercontent.com/davidFCDev/remix-base-startup/main/assets/FirstBoss.json"
      );

      // Boss spritesheets
      if (!scene.textures.exists("boss-bat-spritesheet")) {
        scene.load.spritesheet(
          "boss-bat-spritesheet",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss_bat-YhgPBVXu7j9tscC446Augx1rAUiz2h.png?XgJC",
          {
            frameWidth: 609,
            frameHeight: 518,
          }
        );
      }

      if (!scene.textures.exists("boss-bat-die-spritesheet")) {
        scene.load.spritesheet(
          "boss-bat-die-spritesheet",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/die_bat-Z60vTPdcbzWxxw04gnjzNmwit9KL86.png?xSuv",
          {
            frameWidth: 609,
            frameHeight: 518,
          }
        );
      }

      if (!scene.textures.exists("confused-status-spritesheet")) {
        scene.load.spritesheet(
          "confused-status-spritesheet",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/confused_status-lDP44E0A9zwjU7uok5OsSUpkpReilW.png?pEz6",
          {
            frameWidth: 670,
            frameHeight: 392,
          }
        );
      }

      if (!scene.textures.exists("roller-snowball")) {
        scene.load.image(
          "roller-snowball",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/roller-snowball-7Qny1WDOwxpF0zGLnHYmgXlKAdrjm0.png?nIAV"
        );
      }

      if (!scene.textures.exists("fondo-boss1")) {
        scene.load.image(
          "fondo-boss1",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/fondo-boss1%20%281%29-U8P7eQTsQxFpS4M0XjRYrsKkw50uRd.png?eKHL"
        );
      }

      // Boss music
      if (!scene.cache.audio.exists("boss_music")) {
        scene.load.audio(
          "boss_music",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss-music-Uc0TBbcOXiNZTFHe8IImIh6vzL17hD.mp3?ZGgU"
        );
      }

      // Boss sounds
      if (!scene.cache.audio.exists("boss_bat_wake")) {
        scene.load.audio(
          "boss_bat_wake",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss_bat-Wni2i2yqMdyNmed5q9T6lOQL5BjO9T.mp3?TCwy"
        );
      }

      if (!scene.cache.audio.exists("boss_confused")) {
        scene.load.audio(
          "boss_confused",
          "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/ea8d3337-dda5-448c-a832-967b4dc39be2/boss-confused-5MnQmN0K0PPmO331Tm915ms3IKHKJR.mp3?KUxB"
        );
      }

      scene.load.start();
    });
  }
}
