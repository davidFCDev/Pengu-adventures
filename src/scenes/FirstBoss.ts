// You can write more code here

/* START OF COMPILED CODE */

import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/**
 * FirstBoss - Nivel del primer jefe (Boss Bat)
 * Este es un nivel especial que solo usa la capa "superficies"
 * y presenta un jefe murciélago con mecánicas especiales
 */
class FirstBoss extends BaseGameScene {
  private firstBoss!: Phaser.Tilemaps.Tilemap;
  private bossBat!: Phaser.GameObjects.Sprite;
  private bossWakeTimer?: Phaser.Time.TimerEvent;

  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "FirstBoss",
      surfaceLayerName: "superficies",
      backgroundLayerName: "", // No hay capa de fondo en tilemap
      objectsLayerName: "", // No hay capa de objetos
      tilesets: [
        {
          name: "spritesheet-backgrounds-default",
          imageKey: "spritesheet-backgrounds-default",
        },
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
      ],
      // El player se buscará automáticamente desde el tilemap
      playerStartPosition: { x: 100, y: 960 }, // Fallback si no se encuentra
      musicKey: "level1_music",
      // Sin sistemas adicionales - solo player vs boss
      enableSpikeBoxes: false,
      enableTemporaryPlatforms: false,
      enableElevators: false,
      enableJumpButtons: false,
      enableRedButtons: false,
      enableSnow: false, // Sin nieve en el nivel del boss
      showUICounters: false, // Sin contadores de monedas, llaves y mini-pingus
      bossName: "BAT BOSS", // Mostrar barra de salud del boss en el header
    };
    super("FirstBoss", config);

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    // Calcular offset para alinear el tilemap en la parte inferior de la pantalla
    // Canvas: 720×1080, Tilemap: 768×1024
    // Offset Y = 1080 - 1024 = 56px (espacio arriba)
    const offsetY = 1080 - 1024; // 56px

    // image_1 - Fondo del nivel (768×1024px, alineado abajo)
    const image_1 = this.add.image(384, offsetY + 512, "fondo-boss1");
    image_1.setOrigin(0.5, 0.5); // Centrado
    image_1.setDepth(-10); // Asegurar que esté detrás de todo

    // firstBoss - Tilemap principal (alineado a la parte inferior)
    const firstBoss = this.add.tilemap("FirstBoss");
    firstBoss.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );
    firstBoss.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );

    // superficies - Layer de colisiones (única capa del nivel)
    const superficies_1 = firstBoss.createLayer(
      "superficies",
      ["spritesheet-tiles-default"],
      0,
      offsetY // Desplazar hacia abajo para alinear con la base de la pantalla
    );

    // Boss Bat - Sprite del jefe (empieza en frame 10 - primer frame de WAKE)
    // Ajustar posición Y con el offset
    const bossBat = this.add.sprite(
      384,
      offsetY + 192,
      "boss-bat-spritesheet",
      10
    );
    bossBat.scaleX = 0.65;
    bossBat.scaleY = 0.65;
    bossBat.setDepth(10); // Por encima del player

    this.firstBoss = firstBoss;
    this.bossBat = bossBat;

    this.events.emit("scene-awake");
  }

  /**
   * Método requerido por BaseGameScene
   * Crear el mapa y asignar los layers
   */
  protected createMap(): void {
    // El mapa ya se creó en editorCreate(), solo asignamos referencias
    this.tilemap = this.firstBoss;

    // El layer de superficies ya fue creado en editorCreate()
    // Solo necesitamos obtener la referencia
    this.surfaceLayer = this.tilemap.getLayer("superficies")!
      .tilemapLayer as Phaser.Tilemaps.TilemapLayer;

    // Habilitar colisiones en el layer de superficies
    if (this.surfaceLayer) {
      this.surfaceLayer.setCollisionByProperty({ collides: true });
      console.log(
        "✅ FirstBoss: Layer de superficies configurado con colisiones"
      );
    }

    // Configurar límites del mundo de físicas alineado con el offset
    const offsetY = 1080 - 1024; // 56px
    this.physics.world.setBounds(0, offsetY, 768, 1024);
  }

  /**
   * Método create principal
   */
  create() {
    console.log("🎮 FirstBoss: Iniciando nivel del jefe...");

    // Llamar al editorCreate primero
    this.editorCreate();

    // Crear animaciones del boss
    this.createBossAnimations();

    // Llamar al create de BaseGameScene para configurar player, cámara, etc.
    super.create();

    // Iniciar la secuencia del boss después de 3 segundos
    this.bossWakeTimer = this.time.delayedCall(3000, () => {
      this.startBossBattle();
    });

    console.log("✅ FirstBoss: Nivel iniciado correctamente");
  }

  /**
   * Crear animaciones del Boss Bat
   */
  private createBossAnimations(): void {
    console.log("🎬 Creando animaciones del Boss Bat...");

    // HURT: frames 0-9 (10 frames)
    if (!this.anims.exists("boss-bat-hurt")) {
      this.anims.create({
        key: "boss-bat-hurt",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: 0,
      });
      console.log("✅ Animación boss-bat-hurt creada");
    }

    // WAKE: frames 10-18 (9 frames)
    if (!this.anims.exists("boss-bat-wake")) {
      this.anims.create({
        key: "boss-bat-wake",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 10,
          end: 18,
        }),
        frameRate: 10,
        repeat: 0,
      });
      console.log("✅ Animación boss-bat-wake creada");
    }

    // FLYING: frames 20-27 (8 frames)
    if (!this.anims.exists("boss-bat-flying")) {
      this.anims.create({
        key: "boss-bat-flying",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 20,
          end: 27,
        }),
        frameRate: 10,
        repeat: -1, // Loop infinito
      });
      console.log("✅ Animación boss-bat-flying creada");
    }
  }

  /**
   * Iniciar la batalla del jefe
   */
  private startBossBattle(): void {
    console.log("⚔️ Iniciando batalla del jefe...");

    // Reproducir animación WAKE
    this.bossBat.play("boss-bat-wake");

    // Cuando termine WAKE, cambiar a FLYING
    this.bossBat.once("animationcomplete", () => {
      console.log("🦇 Boss despierto - Iniciando modo FLYING");
      this.bossBat.play("boss-bat-flying");

      // Aquí comenzará la lógica de batalla
      // TODO: Implementar mecánicas de batalla
    });
  }

  /**
   * Cleanup al destruir la escena
   */
  shutdown(): void {
    // Limpiar el timer si existe
    if (this.bossWakeTimer) {
      this.bossWakeTimer.remove();
      this.bossWakeTimer = undefined;
    }

    super.shutdown();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

export default FirstBoss;
