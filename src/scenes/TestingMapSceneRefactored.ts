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
    // testingMap
    this.tilemap = this.add.tilemap("TestingMap");
    this.tilemap.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );
    this.tilemap.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );

    // fondo_1
    this.fondoLayer = this.tilemap.createLayer(
      "fondo",
      ["spritesheet-backgrounds-default"],
      0,
      0
    )!;

    // superficies_1
    this.surfaceLayer = this.tilemap.createLayer(
      "superficies",
      ["spritesheet-tiles-default"],
      0,
      0
    )!;

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
