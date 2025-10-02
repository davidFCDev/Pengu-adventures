import { Surface, SurfaceDetector } from "../../systems/SurfaceDetector";
import { BasicEnemy } from "./BasicEnemy";

/**
 * Configuración para el sistema de enemigos
 */
export interface EnemySystemConfig {
  maxEnemies?: number; // Máximo de enemigos a crear (default: 8)
  minSurfaceWidth?: number; // Ancho mínimo de superficie en tiles (default: 5)
  patrolMargin?: number; // Margen para patrulla (default: 50)
  safeDistance?: number; // Distancia segura del player (default: 100)
  minPatrolWidth?: number; // Ancho mínimo de patrulla (default: 80)
}

/**
 * Sistema centralizado para gestión de enemigos
 * Maneja creación, colisiones y ciclo de vida de todos los enemigos
 */
export class EnemySystem {
  private scene: Phaser.Scene;
  private enemies: BasicEnemy[] = [];
  private surfaceLayer: Phaser.Tilemaps.TilemapLayer;
  private player: Phaser.Physics.Arcade.Sprite;
  private config: Required<EnemySystemConfig>;

  constructor(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    surfaceLayer: Phaser.Tilemaps.TilemapLayer,
    config: EnemySystemConfig = {}
  ) {
    this.scene = scene;
    this.player = player;
    this.surfaceLayer = surfaceLayer;

    // Configuración con valores por defecto
    this.config = {
      maxEnemies: config.maxEnemies ?? 8,
      minSurfaceWidth: config.minSurfaceWidth ?? 5,
      patrolMargin: config.patrolMargin ?? 50,
      safeDistance: config.safeDistance ?? 100,
      minPatrolWidth: config.minPatrolWidth ?? 80,
    };
  }

  /**
   * Inicializar el sistema: crear enemigos y configurar colisiones
   */
  initialize(playerStartPosition: { x: number; y: number }): void {
    this.createEnemies(playerStartPosition);
    this.setupCollisions();
  }

  /**
   * Crear enemigos automáticamente en superficies válidas
   */
  private createEnemies(playerStartPosition: { x: number; y: number }): void {
    // Detectar superficies válidas
    const surfaces = SurfaceDetector.findValidSurfaces(this.surfaceLayer, {
      minTilesWidth: this.config.minSurfaceWidth,
      excludeAreas: [
        {
          x: playerStartPosition.x,
          y: playerStartPosition.y,
          radius: this.config.safeDistance,
        },
      ],
    });

    console.log("🎯 Superficies válidas encontradas:", surfaces.length);

    let enemiesCreated = 0;

    for (const surface of surfaces) {
      // Verificar espacio de patrulla
      const patrolWidth = surface.width - this.config.patrolMargin * 2;

      if (patrolWidth < this.config.minPatrolWidth) {
        console.log(
          `⚠️ Superficie rechazada: patrulla insuficiente (${patrolWidth}px < ${this.config.minPatrolWidth}px)`
        );
        continue;
      }

      // Crear enemigo
      const enemy = this.createEnemy(surface);
      if (enemy) {
        this.enemies.push(enemy);
        enemiesCreated++;

        console.log(`🔴 Enemigo ${enemiesCreated} creado en:`, {
          x: surface.centerX,
          y: surface.y - 84,
          patrol: `${surface.startX + this.config.patrolMargin} -> ${
            surface.endX - this.config.patrolMargin
          }`,
        });

        if (enemiesCreated >= this.config.maxEnemies) break;
      }
    }

    console.log(`✅ Total enemigos creados: ${enemiesCreated}`);
  }

  /**
   * Crear un enemigo en una superficie específica
   */
  private createEnemy(surface: Surface): BasicEnemy {
    const margin = this.config.patrolMargin;

    return new BasicEnemy(
      this.scene,
      surface.centerX,
      surface.y - 84, // Ajuste para altura del enemigo
      { x: surface.startX + margin, y: surface.y - 84 },
      { x: surface.endX - margin, y: surface.y - 84 },
      this.surfaceLayer
    );
  }

  /**
   * Configurar colisiones entre enemigos y player
   */
  private setupCollisions(): void {
    this.enemies.forEach((enemy) => {
      // Colisión player-enemigo (daño al player)
      this.scene.physics.add.overlap(
        this.player,
        enemy as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        (player, enemyObj) => {
          const hitEnemy = this.findEnemyByPosition(
            (enemyObj as any).x,
            (enemyObj as any).y
          );
          if (hitEnemy) {
            console.log("💢 Player tocó enemigo!");
            hitEnemy.damagePlayer(player);
          }
        }
      );
    });
  }

  /**
   * Configurar colisiones con proyectiles (snowballs)
   */
  setupProjectileCollisions(
    projectileGroup: Phaser.Physics.Arcade.Group
  ): void {
    this.enemies.forEach((enemy) => {
      this.scene.physics.add.overlap(
        projectileGroup,
        enemy as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        (projectile, enemyObj) => {
          console.log("💥 Proyectil golpeó enemigo!");
          projectile.destroy();

          const hitEnemy = this.findEnemyByPosition(
            (enemyObj as any).x,
            (enemyObj as any).y
          );

          if (hitEnemy) {
            console.log("🎯 Enemigo encontrado, aplicando daño...");
            hitEnemy.takeDamageFromSnowball();
            this.removeEnemy(hitEnemy);
          }
        }
      );
    });
  }

  /**
   * Buscar un enemigo por posición
   */
  private findEnemyByPosition(x: number, y: number): BasicEnemy | undefined {
    return this.enemies.find(
      (e) => Math.abs(e.x - x) < 10 && Math.abs(e.y - y) < 10
    );
  }

  /**
   * Remover un enemigo del sistema
   */
  private removeEnemy(enemy: BasicEnemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * Actualizar todos los enemigos
   */
  update(time: number, delta: number): void {
    this.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });
  }

  /**
   * Destruir el sistema y todos los enemigos
   */
  destroy(): void {
    this.enemies.forEach((enemy) => {
      if (enemy && enemy.destroy) {
        enemy.destroy();
      }
    });
    this.enemies = [];
  }

  /**
   * Obtener todos los enemigos activos
   */
  getEnemies(): BasicEnemy[] {
    return this.enemies;
  }

  /**
   * Obtener cantidad de enemigos activos
   */
  getEnemyCount(): number {
    return this.enemies.filter((e) => e.active).length;
  }
}
