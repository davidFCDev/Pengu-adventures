import { Player } from "../objects/player/Player";
import { PlayerStateManager, setupTileMapSystem } from "../systems/tilemap";

/**
 * TEMPLATE DE ESCENA - Copia este archivo para crear nuevas escenas de niveles
 *
 * ✅ Funcionará automáticamente con cualquier mapa que tenga tiles con propiedades:
 *    - collision=true (para colisiones)
 *    - swim=true (para agua con efecto Flappy Bird)
 *    - climb=true (para escaleras)
 *
 * 📋 PASOS PARA USAR:
 * 1. Copia este archivo y renómbralo (ej: Level1Scene.ts)
 * 2. Cambia la clase y key de la escena
 * 3. Cambia 'MiMapa' por el nombre de tu tilemap
 * 4. Cambia 'miLayer' por el nombre de tu layer
 * 5. Ajusta la posición inicial del player
 * 6. ¡Listo! Todo funcionará automáticamente
 */

export class LevelTemplateScene extends Phaser.Scene {
  private player!: Player;
  private playerStateManager!: PlayerStateManager;
  private gameLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: "LevelTemplateScene" });
  }

  preload(): void {
    // Cargar assets del mapa
    this.load.tilemapTiledJSON("MiMapa", "assets/MiMapa.json");
    this.load.image("tileset-tiles", "assets/tileset-tiles.png");
    this.load.image("tileset-backgrounds", "assets/tileset-backgrounds.png");
  }

  create(): void {
    // 1. Crear el mapa base
    this.createMap();

    // 2. Crear el player
    this.createPlayer();

    // 3. 🎯 MAGIA: Configurar sistema automático de tilemap
    //    Esto configura automáticamente:
    //    - Colisiones para tiles con collision=true
    //    - Detección de agua para tiles con swim=true
    //    - Detección de escaleras para tiles con climb=true
    const { stateManager, layer } = setupTileMapSystem(
      this,
      this.player,
      "MiMapa", // ← Cambia por tu tilemap key
      "miLayer" // ← Cambia por tu layer name
    );

    this.playerStateManager = stateManager;
    this.gameLayer = layer;

    // 4. Configurar colisiones físicas
    this.physics.add.collider(this.player, this.gameLayer);

    // 5. Configurar cámara
    this.setupCamera();

    console.log("🎮 Escena configurada con sistema automático de tilemap");
  }

  update(): void {
    if (this.player && this.playerStateManager) {
      // Actualizar player
      this.player.update();

      // 🎯 MAGIA: El sistema se encarga automáticamente de:
      //    - Cambiar a modo nado cuando toca agua
      //    - Cambiar a modo trepar en escaleras
      //    - Volver a modo normal en tierra
      this.playerStateManager.update();
    }
  }

  private createMap(): void {
    // Crear el tilemap y configurar tilesets
    const map = this.add.tilemap("MiMapa");
    map.addTilesetImage("tileset-tiles", "tileset-tiles");
    map.addTilesetImage("tileset-backgrounds", "tileset-backgrounds");

    // Crear layers de fondo
    map.createLayer("fondo", ["tileset-backgrounds"], 0, 0);
    // El layer principal se configurará automáticamente en setupTileMapSystem
  }

  private createPlayer(): void {
    // Crear player en posición inicial
    this.player = new Player(this, 100, 100); // ← Ajusta posición inicial
  }

  private setupCamera(): void {
    if (!this.player) return;

    // Configurar cámara para seguir al player
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, 100);

    // Configurar límites del mundo
    const map = this.add.tilemap("MiMapa");
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}

/**
 * 🎯 EJEMPLO DE USO PARA CREAR UNA NUEVA ESCENA:
 *
 * 1. Crear Level1Scene.ts:
 * ```typescript
 * export class Level1Scene extends Phaser.Scene {
 *   constructor() { super({ key: "Level1Scene" }); }
 *   // ... resto igual pero cambiar 'MiMapa' por 'Level1Map'
 * }
 * ```
 *
 * 2. En main.ts añadir:
 * ```typescript
 * import { Level1Scene } from "./scenes/Level1Scene";
 * scene: [PreloadScene, Level1Scene],
 * ```
 *
 * 3. En PreloadScene cargar el mapa:
 * ```typescript
 * this.load.tilemapTiledJSON("Level1Map", "assets/Level1Map.json");
 * ```
 *
 * ✅ ¡Y ya está! Funciona automáticamente con cualquier mapa.
 */
