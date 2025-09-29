import { BaseGameScene } from "./BaseGameScene";
import { createLevelConfig, StartPositions } from "./LevelUtils";

/**
 * 🎮 Template para nuevos niveles - Copia este archivo para crear nuevos niveles
 *
 * ✅ PASOS RÁPIDOS PARA CREAR UN NUEVO NIVEL:
 * 1. Copia este archivo y renómbralo (ej: Level1Scene.ts)
 * 2. Cambia el nombre de la clase (ej: Level1Scene)
 * 3. Elige una configuración predefinida O personaliza la configuración
 * 4. Agrega tu lógica específica en create() si es necesaria
 * 5. Agrega el nivel al PreloadScene
 */

export class LevelTemplateSceneNew extends BaseGameScene {
  constructor() {
    // 🚀 OPCIÓN 1: CONFIGURACIONES PREDEFINIDAS (RECOMENDADO)
    // Descomenta una de las siguientes líneas según el tipo de nivel:

    // const config = LevelTypeConfigs.TESTING("NombreDeTuMapa");        // Para testing/debug
    // const config = LevelTypeConfigs.PLATFORMER("NombreDeTuMapa");     // Nivel de plataformas
    // const config = LevelTypeConfigs.VERTICAL("NombreDeTuMapa");       // Nivel vertical
    // const config = LevelTypeConfigs.EXPLORATION("NombreDeTuMapa");    // Nivel de exploración

    // 🎯 OPCIÓN 2: CONFIGURACIÓN PERSONALIZADA CON HELPERS
    const config = createLevelConfig("NombreDeTuMapa", {
      // Nombres de layers (opcional, usa valores por defecto si no se especifica)
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",

      // Posición inicial (opcional, usa predefinidas)
      startPosition: StartPositions.DEFAULT, // o { x: 400, y: 900 }

      // Configuración de cámara (opcional)
      cameraPreset: "NORMAL", // "NORMAL", "SMOOTH", "PLATFORMER", "VERTICAL_FIXED"
      cameraZoom: 1.0,

      // Tilesets personalizados (opcional)
      // customTilesets: [
      //   { name: "mi-tileset", imageKey: "mi-tileset-key" }
      // ]
    });

    super("LevelTemplateSceneNew", config);
  }

  /**
   * 🗺️ Implementación específica para crear el mapa
   * Este método es requerido por BaseGameScene
   */
  protected createMap(): void {
    // Crear tilemap
    this.tilemap = this.add.tilemap(this.config.tilemapKey);

    // Configurar tilesets usando el método helper de la clase base
    this.setupTilesets();

    // Crear layers estándar usando el método helper de la clase base
    this.createStandardLayers();

    // 🎪 AQUÍ PUEDES AGREGAR LAYERS ADICIONALES ESPECÍFICOS DE TU NIVEL
    // Ejemplo:
    // this.decoracionLayer = this.tilemap.createLayer("decoracion", "mi-tileset")!;

    // Emitir evento para compatibilidad con editores
    this.events.emit("scene-awake");
  }

  /**
   * 🎮 Método principal de creación del nivel
   */
  create() {
    // ✅ La clase base maneja TODA la lógica estándar:
    // - Creación del mapa y layers
    // - Creación del jugador
    // - Configuración de físicas y colisiones
    // - Sistema de vida
    // - Configuración de cámara
    // - Sistema de tiles especiales (agua, escaleras, spikes)
    super.create();

    // 🎯 AQUÍ AGREGA LÓGICA ESPECÍFICA DE TU NIVEL
    // Ejemplos:
    // - NPCs únicos
    // - Efectos especiales
    // - Elementos interactivos
    // - Música de fondo específica
    // - Condiciones de victoria

    console.log(`🎮 ${this.constructor.name} creado exitosamente!`);
  }

  /**
   * 🔄 Override del update si necesitas lógica específica del nivel
   * (Descomenta solo si es necesario)
   */
  // update() {
  //   // Ejecutar lógica base primero
  //   super.update();
  //
  //   // Tu lógica específica aquí
  //   // Ejemplo: verificar condiciones de victoria, elementos especiales, etc.
  // }

  /**
   * 🎯 Métodos helper específicos del nivel
   */

  // Ejemplo: Sistema de checkpoints
  // private setupCheckpoints(): void {
  //   // Implementar checkpoints específicos del nivel
  // }

  // Ejemplo: Elementos interactivos
  // private setupInteractiveElements(): void {
  //   // Configurar elementos únicos del nivel
  // }

  // Ejemplo: Condiciones de victoria
  // private checkVictoryCondition(): boolean {
  //   // Verificar si el jugador completó el nivel
  //   return false;
  // }

  // Ejemplo: Efectos ambientales
  // private setupAmbientEffects(): void {
  //   // Configurar efectos de partículas, sonidos ambientales, etc.
  // }
}

/*
📋 CHECKLIST SIMPLIFICADO PARA NUEVOS NIVELES:

✅ CONFIGURACIÓN BÁSICA (3 pasos):
- [ ] Cambiar nombre de clase (LevelTemplateSceneNew → TuNivel)
- [ ] Actualizar tilemapKey en la configuración
- [ ] Elegir configuración predefinida o personalizar

✅ ASSETS (2 pasos):
- [ ] Agregar tilemap (.json) a assets/
- [ ] Cargar assets en PreloadScene

✅ DONE! 🎉
- ✅ Sistema de colisiones automático
- ✅ Tiles especiales (agua, escaleras, spikes) automático  
- ✅ Sistema de vida automático
- ✅ Todas las mecánicas del jugador automáticas
- ✅ Configuración de cámara automática

🚀 CONFIGURACIONES PREDEFINIDAS DISPONIBLES:
- LevelTypeConfigs.TESTING()     → Para niveles de prueba
- LevelTypeConfigs.PLATFORMER()  → Para plataformas horizontales  
- LevelTypeConfigs.VERTICAL()    → Para niveles verticales
- LevelTypeConfigs.EXPLORATION() → Para mapas grandes de exploración

💡 HELPERS DISPONIBLES:
- StartPositions: DEFAULT, TOP_LEFT, CENTER, BOTTOM_CENTER
- CameraPresets: NORMAL, SMOOTH, PLATFORMER, VERTICAL_FIXED
- createLevelConfig(): Función helper para configuración personalizada
*/
