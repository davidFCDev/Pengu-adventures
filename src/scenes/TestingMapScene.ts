import { BaseGameScene } from "./BaseGameScene";
import { LevelTypeConfigs } from "./LevelUtils";

export class TestingMapScene extends BaseGameScene {
  constructor() {
    // Usar configuración predefinida para testing
    const config = LevelTypeConfigs.TESTING("TestingMap");
    super("TestingMapScene", config);
  }

  /**
   * Implementación específica para crear el mapa TestingMap
   */
  protected createMap(): void {
    // Crear tilemap
    this.tilemap = this.add.tilemap(this.config.tilemapKey);

    // Configurar tilesets usando el método helper
    this.setupTilesets();

    // Crear layers estándar usando el método helper
    this.createStandardLayers();

    // Emitir evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  create() {
    super.create();
    console.log("🎮 TestingMapScene creado exitosamente!");
  }
}
