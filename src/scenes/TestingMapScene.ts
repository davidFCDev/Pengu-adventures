import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/* START OF COMPILED CODE */

export class TestingMapScene extends BaseGameScene {
  // Propiedades específicas del TestingMap (generadas por el editor)
  private fondoLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    // Configuración específica para TestingMap
    const config: GameSceneConfig = {
      tilemapKey: "TestingMap",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",
      playerStartPosition: { x: 400, y: 900 },
      cameraZoom: 1.0,
      cameraFollow: {
        lerp: { x: 1, y: 1 },
        offset: { x: 0, y: 0 },
      },
    };

    super("TestingMapScene", config);

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  /**
   * Implementación específica para crear el mapa TestingMap
   */
  protected createMap(): void {
    // Crear tilemap
    this.tilemap = this.add.tilemap("TestingMap");

    // Configurar tilesets usando el método helper
    this.setupTilesets();

    // Crear layers estándar usando el método helper
    this.createStandardLayers();

    // Mantener referencia al layer de fondo para compatibilidad
    this.fondoLayer = this.backgroundLayer!;

    // Emitir evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  /** @returns {void} */
  editorCreate() {
    // Mantenido para compatibilidad con el editor de Phaser
    // Pero ahora delegamos a createMap()
    this.createMap();
  }

  /* START-USER-CTR-CODE */
  // Write your code here.

  create() {
    // La clase base maneja toda la lógica de creación
    super.create();

    // Aquí puedes agregar lógica específica del TestingMap si es necesaria
    // Por ejemplo: efectos especiales, NPCs, elementos únicos de este nivel
  }

  // Si necesitas lógica específica de update para este nivel, puedes override:
  // update() {
  //   super.update();
  //   // Lógica específica del TestingMap aquí
  // }

  /* END-USER-CTR-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
