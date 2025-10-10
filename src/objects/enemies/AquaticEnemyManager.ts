/**
 * AquaticEnemyManager - Sistema reutilizable para gestionar enemigos acuáticos
 *
 * ✅ CARACTERÍSTICAS:
 * - Detección automática desde tilemap (por GID) o configuración manual
 * - Gestiona creación, colisiones y actualización de enemigos acuáticos
 * - Completamente configurable y reutilizable
 *
 * 🎯 REUTILIZABLE EN CUALQUIER ESCENA:
 * - Solo requiere: Phaser.Scene, Player, SurfaceLayer
 * - Puede detectar por GID o usar posiciones manuales
 * - Todos los parámetros son opcionales (valores por defecto)
 *
 * 📖 USO:
 * ```typescript
 * // Opción 1: Detección automática por GID
 * const manager = new AquaticEnemyManager(this, {
 *   player: this.player,
 *   surfaceLayer: this.surfaceLayer,
 *   tilemap: this.tilemap,
 *   aquaticEnemyGID: 123,  // GID del tile del enemigo acuático
 * });
 *
 * // Opción 2: Posiciones manuales
 * const manager = new AquaticEnemyManager(this, {
 *   player: this.player,
 *   surfaceLayer: this.surfaceLayer,
 *   manualPositions: [
 *     { x: 480, y: 2080, direction: 1 },
 *     { x: 2432, y: 1856, direction: -1 },
 *   ]
 * });
 *
 * manager.create();
 * // En update():
 * manager.update();
 * ```
 */

import { Player } from "../player/Player";
import { AquaticEnemy } from "./AquaticEnemy";

export interface AquaticEnemyPosition {
  x: number;
  y: number;
  direction: number; // 1 para derecha, -1 para izquierda
}

export interface AquaticEnemyManagerConfig {
  // ========== REQUERIDOS ==========
  player: Player;
  surfaceLayer: Phaser.Tilemaps.TilemapLayer;

  // ========== OPCIONALES (elegir uno) ==========
  tilemap?: Phaser.Tilemaps.Tilemap; // Para detección automática
  aquaticEnemyGID?: number; // GID del tile del enemigo acuático (requiere tilemap)

  manualPositions?: AquaticEnemyPosition[]; // Posiciones manuales (alternativa a GID)

  // ========== OPCIONALES (configuración) ==========
  damage?: number; // Daño al jugador (default: 1)
  speed?: number; // Velocidad de nado (default: 100)
}

export class AquaticEnemyManager {
  private scene: Phaser.Scene;
  private config: Required<
    Pick<AquaticEnemyManagerConfig, "player" | "surfaceLayer">
  > &
    Partial<AquaticEnemyManagerConfig>;
  private enemies: AquaticEnemy[] = [];
  private enemyGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, config: AquaticEnemyManagerConfig) {
    this.scene = scene;
    this.config = {
      player: config.player,
      surfaceLayer: config.surfaceLayer,
      tilemap: config.tilemap,
      aquaticEnemyGID: config.aquaticEnemyGID,
      manualPositions: config.manualPositions,
      damage: config.damage ?? 1,
      speed: config.speed ?? 100,
    };

    // Crear grupo de física para los enemigos
    this.enemyGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: false,
    });
  }

  /**
   * Crear todos los enemigos acuáticos
   */
  create(): void {
    let positions: AquaticEnemyPosition[] = [];

    // Opción 1: Usar posiciones manuales
    if (this.config.manualPositions && this.config.manualPositions.length > 0) {
      positions = this.config.manualPositions;
      console.log(
        `🐟 Creando ${positions.length} enemigos acuáticos desde posiciones manuales`
      );
    }
    // Opción 2: Detectar desde tilemap por GID
    else if (this.config.tilemap && this.config.aquaticEnemyGID) {
      positions = this.detectFromTilemap();
      console.log(
        `🐟 Detectados ${positions.length} enemigos acuáticos desde tilemap (GID: ${this.config.aquaticEnemyGID})`
      );
    }
    // Sin configuración válida
    else {
      console.warn(
        "⚠️ AquaticEnemyManager: No se proporcionó ni manualPositions ni (tilemap + aquaticEnemyGID)"
      );
      return;
    }

    // Crear cada enemigo
    positions.forEach((pos, index) => {
      this.createEnemy(pos, index);
    });

    // Configurar colisión global UNA SOLA VEZ para TODO el grupo
    this.setupCollisions();

    console.log(`✅ ${this.enemies.length} enemigos acuáticos creados`);
  }

  /**
   * Detectar posiciones de enemigos desde el tilemap
   */
  private detectFromTilemap(): AquaticEnemyPosition[] {
    const positions: AquaticEnemyPosition[] = [];

    if (!this.config.tilemap || !this.config.aquaticEnemyGID) {
      return positions;
    }

    const objectLayers = this.config.tilemap.objects;

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && obj.gid === this.config.aquaticEnemyGID) {
          // Determinar dirección inicial basada en posición (alternando)
          const direction = positions.length % 2 === 0 ? 1 : -1;

          positions.push({
            x: obj.x,
            y: obj.y - 32, // Ajuste de Tiled (usa esquina inferior)
            direction,
          });
        }
      });
    });

    return positions;
  }

  /**
   * Crear un enemigo individual
   */
  private createEnemy(pos: AquaticEnemyPosition, index: number): void {
    const enemy = new AquaticEnemy(
      this.scene,
      pos.x,
      pos.y,
      this.config.surfaceLayer,
      pos.direction
    );

    this.enemies.push(enemy);
    this.enemyGroup.add(enemy);

    // Debug: Verificar hitbox
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    console.log(
      `🐟 Enemigo ${index}: Hitbox ${body.width}x${body.height}, Offset ${body.offset.x}x${body.offset.y}`
    );

    // Configurar colisión con superficies para cambiar dirección
    this.scene.physics.add.collider(
      enemy,
      this.config.surfaceLayer,
      () => {
        enemy.changeDirection();
      },
      undefined,
      this.scene
    );
  }

  /**
   * Configurar colisiones globales (una sola vez para todo el grupo)
   */
  private setupCollisions(): void {
    if (!this.config.player) return;

    // UN SOLO overlap entre el player y TODO el grupo de enemigos
    this.scene.physics.add.overlap(
      this.config.player,
      this.enemyGroup,
      (player, enemySprite) => {
        const aquaticEnemy = enemySprite as AquaticEnemy;
        if (aquaticEnemy && typeof aquaticEnemy.damagePlayer === "function") {
          aquaticEnemy.damagePlayer(player);
        }
      },
      // ProcessCallback: solo procesar si el player NO es invulnerable
      (player: any, enemySprite) => {
        // Verificar que el player no sea invulnerable
        if (player && typeof player.getIsInvulnerable === "function") {
          return !player.getIsInvulnerable();
        }
        return true;
      },
      this.scene
    );
  }

  /**
   * Actualizar todos los enemigos
   */
  update(time?: number, delta?: number): void {
    const currentTime = time ?? this.scene.time.now;
    const currentDelta = delta ?? this.scene.game.loop.delta;

    this.enemies.forEach((enemy) => {
      enemy.update(currentTime, currentDelta);
    });
  }

  /**
   * Obtener todos los enemigos (útil para depuración)
   */
  getEnemies(): AquaticEnemy[] {
    return this.enemies;
  }

  /**
   * Destruir todos los enemigos
   */
  destroy(): void {
    this.enemies.forEach((enemy) => {
      if (enemy && enemy.active) {
        enemy.destroy();
      }
    });
    this.enemies = [];

    // Destruir el grupo de física
    if (this.enemyGroup) {
      this.enemyGroup.clear(true, true);
      this.enemyGroup.destroy();
    }
  }
}
