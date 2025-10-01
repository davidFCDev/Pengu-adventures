import { BasicEnemy } from "../objects/enemies/BasicEnemy";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/* START OF COMPILED CODE */

export class TestingMapScene extends BaseGameScene {
  // Propiedades específicas del TestingMap (generadas por el editor)
  private fondoLayer!: Phaser.Tilemaps.TilemapLayer;
  private enemies: BasicEnemy[] = [];
  private snowballGroup!: Phaser.Physics.Arcade.Group;

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
      musicKey: "level1_music", // Música de fondo para el nivel de prueba
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

    // Crear grupo para snowballs
    this.snowballGroup = this.physics.add.group();

    // Escuchar cuando se crean snowballs
    this.events.on("snowballCreated", (snowball: any) => {
      console.log(
        "Snowball creada, velocidad inicial:",
        snowball.body?.velocity
      );

      // Guardar la velocidad actual antes de añadir al grupo
      const currentVelocityX = snowball.body?.velocity.x || 0;
      const currentVelocityY = snowball.body?.velocity.y || 0;

      // Añadir al grupo
      this.snowballGroup.add(snowball);

      // Restaurar la velocidad inmediatamente después
      if (snowball.body) {
        snowball.body.setVelocity(currentVelocityX, currentVelocityY);
        console.log(
          "Snowball añadida al grupo, velocidad restaurada:",
          snowball.body.velocity
        );
      }
    });

    // Crear enemigos específicos para este nivel
    this.createEnemies();

    // Configurar colisiones con el player
    this.setupEnemyCollisions();

    // Interceptar la creación de snowballs para añadirlas al grupo
    this.setupSnowballInterception();
  }

  private createEnemies(): void {
    // Encontrar superficies válidas automáticamente
    const validSurfaces = this.findValidSurfaces();
    console.log("🎯 Superficies válidas encontradas:", validSurfaces.length);
    console.log("📍 Lista de superficies:", validSurfaces);

    // Crear enemigos en diferentes superficies (evitando el área del player)
    const playerStartX = this.config.playerStartPosition.x;
    const safeDistance = 100; // Distancia mínima del player

    let enemiesCreated = 0;
    let surfacesEvaluated = 0;

    for (let i = 0; i < validSurfaces.length; i++) {
      const surface = validSurfaces[i];
      surfacesEvaluated++;

      console.log(`🔍 Evaluando superficie ${i}:`, {
        centerX: surface.centerX,
        playerStartX,
        distance: Math.abs(surface.centerX - playerStartX),
        width: surface.endX - surface.startX,
      });

      // Verificar que hay suficiente espacio para patrulla después de márgenes
      const margin = 50; // Margen reducido para más flexibilidad
      const patrolWidth = surface.endX - margin - (surface.startX + margin);

      if (patrolWidth < 80) {
        // Espacio mínimo reducido
        console.log(
          `⚠️ Superficie ${i} rechazada: no hay suficiente espacio de patrulla (${patrolWidth}px < 80px)`
        );
        continue;
      }

      // Evitar solo la superficie inmediata del inicio del player
      if (Math.abs(surface.centerX - playerStartX) < safeDistance) {
        console.log(
          `❌ Superficie ${i} rechazada: muy cerca del player (${Math.abs(
            surface.centerX - playerStartX
          )}px < ${safeDistance}px)`
        );
        continue;
      }

      console.log(
        `✅ Superficie ${i} ACEPTADA: espacio de patrulla = ${patrolWidth}px`
      );

      const enemy = new BasicEnemy(
        this,
        surface.centerX, // x inicial (centro de la superficie)
        surface.y - 84, // y inicial (ajustado para enemigo de 84x84)
        { x: surface.startX + margin, y: surface.y - 84 }, // punto A
        { x: surface.endX - margin, y: surface.y - 84 }, // punto B
        this.surfaceLayer! // layer de colisión
      );

      this.enemies.push(enemy);
      enemiesCreated++;

      console.log(`🔴 Enemigo ${enemiesCreated} creado en superficie:`, {
        center: surface.centerX,
        y: surface.y - 84,
        width: surface.endX - surface.startX,
        patrol: `${surface.startX + margin} -> ${surface.endX - margin}`,
      });

      if (enemiesCreated >= 8) break; // Máximo 8 enemigos
    }

    console.log(
      `\n📊 Resumen: ${surfacesEvaluated} superficies evaluadas, ${enemiesCreated} enemigos creados`
    );

    console.log(`\n✅ Total de enemigos creados: ${enemiesCreated}`);
  }

  private findValidSurfaces(): Array<{
    startX: number;
    endX: number;
    centerX: number;
    y: number;
  }> {
    const surfaces: Array<{
      startX: number;
      endX: number;
      centerX: number;
      y: number;
    }> = [];
    const tileSize = 32;
    // Mínimo 5 tiles de ancho (160px mínimo) - reducido para encontrar más superficies
    const minSurfaceWidth = 5;

    if (!this.surfaceLayer) {
      console.log("❌ No hay surfaceLayer disponible");
      return surfaces;
    }

    console.log(
      `🔍 Buscando superficies en mapa de ${this.surfaceLayer.width}x${this.surfaceLayer.height} tiles...`
    );

    // Recorrer el mapa buscando superficies horizontales
    for (let y = 0; y < this.surfaceLayer.height; y++) {
      let surfaceStart = -1;

      for (let x = 0; x < this.surfaceLayer.width; x++) {
        const tile = this.surfaceLayer.getTileAt(x, y);
        const hasCollision =
          tile && tile.properties && tile.properties.collision === true;

        if (hasCollision) {
          if (surfaceStart === -1) {
            surfaceStart = x;
          }
        } else {
          // Fin de superficie
          if (surfaceStart !== -1) {
            const surfaceWidth = x - surfaceStart;
            if (surfaceWidth >= minSurfaceWidth) {
              const startX = surfaceStart * tileSize;
              const endX = x * tileSize;
              const centerX = (startX + endX) / 2;
              const surfaceY = y * tileSize;

              console.log(
                `✅ Superficie encontrada: width=${surfaceWidth} tiles (${
                  surfaceWidth * tileSize
                }px), y=${y}, x=${surfaceStart}-${x}`
              );

              surfaces.push({
                startX,
                endX,
                centerX,
                y: surfaceY,
              });
            } else {
              console.log(
                `❌ Superficie rechazada: width=${surfaceWidth} tiles < ${minSurfaceWidth} tiles mínimo`
              );
            }
            surfaceStart = -1;
          }
        }
      }

      // Verificar superficie al final de la fila
      if (surfaceStart !== -1) {
        const surfaceWidth = this.surfaceLayer.width - surfaceStart;
        if (surfaceWidth >= minSurfaceWidth) {
          const startX = surfaceStart * tileSize;
          const endX = this.surfaceLayer.width * tileSize;
          const centerX = (startX + endX) / 2;
          const surfaceY = y * tileSize;

          console.log(
            `✅ Superficie final encontrada: width=${surfaceWidth} tiles (${
              surfaceWidth * tileSize
            }px), y=${y}`
          );

          surfaces.push({
            startX,
            endX,
            centerX,
            y: surfaceY,
          });
        } else {
          console.log(
            `❌ Superficie final rechazada: width=${surfaceWidth} tiles < ${minSurfaceWidth} tiles mínimo`
          );
        }
      }
    }

    return surfaces;
  }

  private setupEnemyCollisions(): void {
    // Colisión player-enemigo (daño al player) - usar overlap para evitar físicas extrañas
    this.enemies.forEach((enemy) => {
      this.physics.add.overlap(
        this.player!,
        enemy as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        (player, enemyObj) => {
          // Buscar el enemigo real
          const hitEnemy = this.enemies.find(
            (e) =>
              Math.abs(e.x - (enemyObj as any).x) < 10 &&
              Math.abs(e.y - (enemyObj as any).y) < 10
          );
          if (hitEnemy) {
            console.log("💢 Player tocó enemigo!");
            hitEnemy.damagePlayer(player);
          }
        }
      );
    });

    // Configurar colisiones snowball-enemigo después de un delay menor
    this.time.delayedCall(100, () => {
      this.setupSnowballEnemyCollisions();
    });
  }

  private setupSnowballEnemyCollisions(): void {
    this.enemies.forEach((enemy, index) => {
      // Colisión snowball-enemigo (muerte del enemigo)
      this.physics.add.overlap(
        this.snowballGroup,
        enemy as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        (snowball, enemyObj) => {
          console.log("💥 Snowball golpeó enemigo!");
          snowball.destroy();

          // Buscar el enemigo en nuestro array por posición
          const hitEnemy = this.enemies.find(
            (e) =>
              Math.abs(e.x - (enemyObj as any).x) < 10 &&
              Math.abs(e.y - (enemyObj as any).y) < 10
          );

          if (hitEnemy) {
            console.log("🎯 Enemigo encontrado, aplicando daño...");
            hitEnemy.takeDamageFromSnowball();
            // Remover del array
            const enemyIndex = this.enemies.indexOf(hitEnemy);
            if (enemyIndex > -1) {
              this.enemies.splice(enemyIndex, 1);
            }
          }
        }
      );
    });
  }

  private setupSnowballInterception(): void {
    // Escuchar eventos del scene para cuando se crean snowballs
    // Por ahora, vamos a usar un polling simple en el update
    // para detectar snowballs nuevas
  }

  update() {
    super.update();

    // Actualizar enemigos
    this.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(this.time.now, this.game.loop.delta);
      }
    });
  }

  /* END-USER-CTR-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
