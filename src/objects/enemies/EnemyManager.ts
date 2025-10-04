import { Surface, SurfaceDetector } from "../../systems/SurfaceDetector";
import { BasicEnemy } from "./BasicEnemy";
import { FreezableEnemy } from "./FreezableEnemy";

/**
 * Tipos de enemigos disponibles
 */
export type EnemyType = "basic" | "freezable";

/**
 * Union type para todos los enemigos
 */
export type Enemy = BasicEnemy | FreezableEnemy;
/**
 * Configuración para el sistema de enemigos
 */
export interface EnemySystemConfig {
  maxEnemies?: number; // Máximo de enemigos a crear (default: 8)
  minSurfaceWidth?: number; // Ancho mínimo de superficie en tiles (default: 5)
  patrolMargin?: number; // Margen para patrulla (default: 50)
  safeDistance?: number; // Distancia segura del player (default: 100)
  minPatrolWidth?: number; // Ancho mínimo de patrulla (default: 80)
  enemyTypeRatio?: { basic: number; freezable: number }; // Ratio de tipos de enemigos
}
/**
 * Sistema centralizado para gestión de enemigos
 * Maneja creación, colisiones y ciclo de vida de todos los enemigos
 */
export class EnemySystem {
  private scene: Phaser.Scene;
  private enemies: Enemy[] = [];
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
      enemyTypeRatio: config.enemyTypeRatio ?? { basic: 0.6, freezable: 0.4 },
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
    let enemiesCreated = 0;
    for (const surface of surfaces) {
      // Verificar espacio de patrulla
      const patrolWidth = surface.width - this.config.patrolMargin * 2;
      if (patrolWidth < this.config.minPatrolWidth) {
        continue;
      }
      // Crear enemigo
      const enemy = this.createEnemy(surface);
      if (enemy) {
        this.enemies.push(enemy);
        enemiesCreated++;
        if (enemiesCreated >= this.config.maxEnemies) break;
      }
    }
  }
  /**
   * Crear un enemigo en una superficie específica
   */
  private createEnemy(surface: Surface): Enemy {
    const margin = this.config.patrolMargin;
    const enemyType = this.selectEnemyType();

    const baseParams = {
      x: surface.centerX,
      y: surface.y - 84,
      pointA: { x: surface.startX + margin, y: surface.y - 84 },
      pointB: { x: surface.endX - margin, y: surface.y - 84 },
    };

    if (enemyType === "freezable") {
      return new FreezableEnemy(
        this.scene,
        baseParams.x,
        baseParams.y,
        baseParams.pointA,
        baseParams.pointB,
        this.surfaceLayer
      );
    } else {
      return new BasicEnemy(
        this.scene,
        baseParams.x,
        baseParams.y,
        baseParams.pointA,
        baseParams.pointB,
        this.surfaceLayer
      );
    }
  }

  /**
   * Seleccionar tipo de enemigo basado en el ratio configurado
   */
  private selectEnemyType(): EnemyType {
    const random = Math.random();
    const basicThreshold = this.config.enemyTypeRatio.basic;

    return random < basicThreshold ? "basic" : "freezable";
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
          const hitEnemy = this.findEnemyByPosition(
            (enemyObj as any).x,
            (enemyObj as any).y
          );

          if (hitEnemy) {
            // PRIMERO aplicar daño al enemigo
            hitEnemy.takeDamageFromSnowball();

            // Solo remover del array si es BasicEnemy (muere)
            // FreezableEnemy se congela pero sigue en el juego
            if (hitEnemy instanceof BasicEnemy) {
              this.removeEnemy(hitEnemy);
            }

            // DESPUÉS destruir el proyectil
            projectile.destroy();
          }
        }
      );
    });
  }
  /**
   * Buscar un enemigo por posición
   */
  private findEnemyByPosition(x: number, y: number): Enemy | undefined {
    return this.enemies.find(
      (e) => Math.abs(e.x - x) < 10 && Math.abs(e.y - y) < 10
    );
  }
  /**
   * Remover un enemigo del sistema
   */
  private removeEnemy(enemy: Enemy): void {
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
  getEnemies(): Enemy[] {
    return this.enemies;
  }
  /**
   * Obtener cantidad de enemigos activos
   */
  getEnemyCount(): number {
    return this.enemies.filter((e) => e.active).length;
  }
}
