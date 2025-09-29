import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/**
 * TEMPLATE PARA CREAR NUEVOS NIVELES
 *
 * 📋 INSTRUCCIONES DE USO:
 * 1. Copiar este archivo como "MiNuevoNivel.ts"
 * 2. Renombrar la clase "LevelTemplate" a "MiNuevoNivel"
 * 3. Cambiar "mi_mapa" por el nombre de tu tilemap JSON
 * 4. Ajustar configuración según necesidades del nivel
 * 5. Cargar tilemap en PreloadScene
 * 6. Registrar escena en main.ts
 *
 * ✅ CARACTERÍSTICAS AUTOMÁTICAS:
 * - Detección de tiles especiales (agua, escaleras, spikes)
 * - Sistema de vidas y colisiones
 * - Posicionamiento automático del player
 * - Cámara inteligente con seguimiento
 * - Todos los estados del player (nado, escalada, fantasma)
 */
export class LevelTemplate extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      // 🗺️ CONFIGURACIÓN BÁSICA (OBLIGATORIA)
      tilemapKey: "mi_mapa", // ← Cambiar por tu tilemap
      surfaceLayerName: "superficies", // ← Layer de colisiones principales

      // 🎨 CONFIGURACIÓN OPCIONAL
      backgroundLayerName: "fondo", // ← Layer decorativo de fondo
      objectsLayerName: "objects", // ← Layer de spikes/objetos
      playerStartPosition: { x: 400, y: 900 }, // ← Fallback si no hay start=true

      // 📹 CONFIGURACIÓN DE CÁMARA
      cameraZoom: 1.0, // ← Zoom del nivel (0.5-2.0)
      cameraFollow: {
        lerp: { x: 1, y: 1 }, // ← Seguimiento (0-1, más bajo = más suave)
        offset: { x: 0, y: 0 }, // ← Desplazamiento de cámara
      },

      // 🖼️ TILESETS PERSONALIZADOS (Opcional)
      // tilesets: [
      //   { name: "mi-tileset", imageKey: "mi_tileset_imagen" }
      // ]
    };

    super("LevelTemplate", config);
  }

  /**
   * Crear el mapa específico de este nivel
   */
  protected createMap(): void {
    // 1. Crear tilemap
    this.tilemap = this.add.tilemap("mi_mapa");

    // 2. Configurar tilesets automáticamente
    this.setupTilesets();

    // 3. Crear layers estándar automáticamente
    this.createStandardLayers();

    // 4. Evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  /**
   * Lógica específica del nivel (Opcional)
   */
  create() {
    // ⚠️ SIEMPRE llamar super.create() primero
    super.create();

    // 🎵 MÚSICA DEL NIVEL
    // this.sound.play('mi_nivel_musica', { loop: true, volume: 0.5 });

    // 🌟 EFECTOS VISUALES
    // const particles = this.add.particles(0, 0, 'particula', {
    //   speed: { min: 50, max: 100 },
    //   lifespan: 2000,
    //   frequency: 500
    // });

    // 🚪 ELEMENTOS INTERACTIVOS
    // const portal = this.add.sprite(1200, 300, 'portal');
    // this.physics.add.existing(portal, true);
    // this.physics.add.overlap(this.player, portal, () => {
    //   this.scene.start('SiguienteNivel');
    // });

    // 💬 DIÁLOGOS O TUTORIALES
    // this.showWelcomeMessage();
  }

  /**
   * Update específico del nivel (Opcional)
   */
  // update() {
  //   super.update();
  //   // Lógica específica de update del nivel aquí
  // }

  /**
   * Ejemplo de método específico del nivel
   */
  // private showWelcomeMessage(): void {
  //   const welcomeText = this.add.text(400, 100, '¡Bienvenido al nuevo nivel!', {
  //     fontSize: '32px',
  //     color: '#ffffff',
  //     backgroundColor: '#000000',
  //     padding: { x: 20, y: 10 }
  //   });
  //   welcomeText.setOrigin(0.5);
  //   welcomeText.setScrollFactor(0); // Fijo en pantalla
  //
  //   // Hacer que desaparezca después de 3 segundos
  //   this.time.delayedCall(3000, () => {
  //     welcomeText.destroy();
  //   });
  // }
}

/* 
📋 CHECKLIST ANTES DE USAR:

□ Crear mapa en Tiled con layers: fondo, superficies, objects
□ Añadir tile con propiedad start=true donde aparecerá el player
□ Exportar mapa como JSON a /assets/
□ Cargar tilemap en PreloadScene:
  this.load.tilemapTiledJSON("mi_mapa", "assets/mi_mapa.json");
□ Renombrar clase LevelTemplate y configurar tilemapKey
□ Registrar escena en main.ts o donde configures Phaser
□ Probar que player aparece y mecánicas funcionan

🎯 PROPIEDADES DE TILES SOPORTADAS:
- start=true        : Posición inicial del player  
- water=true        : Activa modo nado automático
- ladder=true       : Activa modo escalada con ↑/↓
- collision=true    : Bloquea el paso del player
- kill=true         : Spikes que quitan vida (requiere collision=true)

🎮 CONTROLES AUTOMÁTICOS:
- Flechas/WASD      : Movimiento
- Espacio           : Saltar/Impulso en agua/Flotar fantasma
- E                 : Lanzar snowball/Soplar viento fantasma
- Shift             : Agacharse
- Botón 👻          : Toggle modo fantasma (debug)

🎉 ¡LISTO PARA CREAR NIVELES!
*/
