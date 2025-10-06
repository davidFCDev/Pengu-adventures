import { Surface, SurfaceDetector } from "../../systems/SurfaceDetector";
import { AquaticEnemy } from "./AquaticEnemy";
import { BasicEnemy } from "./BasicEnemy";
import { FreezableEnemy } from "./FreezableEnemy";

/**
 * Tipos de enemigos disponibles
 */
export type EnemyType = "basic" | "freezable" | "aquatic";

/**
 * Union type para todos los enemigos
 */
export type Enemy = BasicEnemy | FreezableEnemy | AquaticEnemy;
/**
 * Configuración para el sistema de enemigos
 */
export interface EnemySystemConfig {
  maxEnemies?: number; // Máximo de enemigos a crear (default: 8)
  minSurfaceWidth?: number; // Ancho mínimo de superficie en tiles (default: 5)
  patrolMargin?: number; // Margen para patrulla (default: 50)
  safeDistance?: number; // Distancia segura del player (default: 100)
  minPatrolWidth?: number; // Ancho mínimo de patrulla (default: 80)
  skipFirstSurfaces?: number; // Número de superficies iniciales a saltar (default: 10)
  enemyTypeRatio?: { basic: number; freezable: number; aquatic: number }; // Ratio de tipos de enemigos
  maxAquaticEnemies?: number; // Máximo de enemigos acuáticos (default: 2)
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
      skipFirstSurfaces: config.skipFirstSurfaces ?? 10,
      enemyTypeRatio: config.enemyTypeRatio ?? {
        basic: 0.5,
        freezable: 0.4,
        aquatic: 0.1,
      },
      maxAquaticEnemies: config.maxAquaticEnemies ?? 2,
    };
  }
  /**
   * Inicializar el sistema: crear enemigos y configurar colisiones
   */
  initialize(playerStartPosition: { x: number; y: number }): void {
    this.createEnemies(playerStartPosition);
    this.createAquaticEnemies(playerStartPosition);
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
    let surfaceIndex = 0;

    for (const surface of surfaces) {
      surfaceIndex++;

      // Saltar las primeras superficies según configuración
      if (surfaceIndex <= this.config.skipFirstSurfaces) {
        continue;
      }

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
        if (enemiesCreated >= this.config.maxEnemies) {
          break;
        }
      }
    }
  }
  /**
   * Crear un enemigo en una superficie específica
   */
  private createEnemy(surface: Surface): Enemy {
    const margin = this.config.patrolMargin;
    // Solo seleccionar entre basic y freezable para superficies terrestres
    const enemyType = this.selectTerrestrialEnemyType();

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
   * Seleccionar tipo de enemigo terrestre (basic o freezable)
   */
  private selectTerrestrialEnemyType(): "basic" | "freezable" {
    const basicRatio = this.config.enemyTypeRatio.basic;
    const freezableRatio = this.config.enemyTypeRatio.freezable;
    const totalTerrestrial = basicRatio + freezableRatio;

    const random = Math.random();
    const basicThreshold = basicRatio / totalTerrestrial;

    return random < basicThreshold ? "basic" : "freezable";
  }

  /**
   * Seleccionar tipo de enemigo basado en el ratio configurado
   */
  private selectEnemyType(): EnemyType {
    const random = Math.random();
    const basicThreshold = this.config.enemyTypeRatio.basic;
    const freezableThreshold =
      basicThreshold + this.config.enemyTypeRatio.freezable;

    if (random < basicThreshold) {
      return "basic";
    } else if (random < freezableThreshold) {
      return "freezable";
    } else {
      return "aquatic";
    }
  }

  /**
   * Crear enemigos acuáticos en zonas de agua
   */
  private createAquaticEnemies(playerStartPosition: {
    x: number;
    y: number;
  }): void {
    const waterZones = this.findWaterZones();

    let aquaticCount = 0;

    for (const zone of waterZones) {
      if (aquaticCount >= this.config.maxAquaticEnemies) {
        break;
      }

      // Verificar distancia segura del player
      const distanceToPlayer = Phaser.Math.Distance.Between(
        zone.centerX,
        zone.centerY,
        playerStartPosition.x,
        playerStartPosition.y
      );

      if (distanceToPlayer < this.config.safeDistance) {
        continue;
      }

      // Crear enemigo acuático en el centro de la zona de agua
      // Usar margen proporcional: 10% del ancho o mínimo 20px
      const margin = Math.max(20, zone.width * 0.1);
      const patrolWidth = zone.width - margin * 2;

      // Solo crear si hay espacio suficiente para patrullar
      if (patrolWidth < 100) {
        continue;
      }

      const enemy = new AquaticEnemy(
        this.scene,
        zone.centerX,
        zone.centerY,
        { x: zone.startX + margin, y: zone.centerY },
        { x: zone.endX - margin, y: zone.centerY },
        this.surfaceLayer
      );

      this.enemies.push(enemy);
      aquaticCount++;
    }
  }

  /**
   * Detectar zonas de agua (tiles con swim=true)
   */
  private findWaterZones(): Array<{
    startX: number;
    endX: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
  }> {
    const zones: Array<{
      startX: number;
      endX: number;
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    }> = [];

    const tilemap = this.surfaceLayer.tilemap;
    const tileWidth = tilemap.tileWidth;
    const tileHeight = tilemap.tileHeight;

    // Usar un set para marcar tiles ya procesados
    const processed = new Set<string>();

    // Escanear el tilemap buscando zonas de agua
    for (let startY = 0; startY < this.surfaceLayer.height; startY++) {
      for (let startX = 0; startX < this.surfaceLayer.width; startX++) {
        const key = `${startX},${startY}`;
        if (processed.has(key)) {
          continue;
        }

        const startTile = this.surfaceLayer.getTileAt(startX, startY);
        if (!startTile || startTile.properties.swim !== true) {
          continue;
        }

        // Encontramos un tile de agua no procesado, expandir zona
        let maxX = startX;
        let maxY = startY;

        // Expandir horizontalmente hasta encontrar el límite
        while (maxX + 1 < this.surfaceLayer.width) {
          const tile = this.surfaceLayer.getTileAt(maxX + 1, startY);
          if (!tile || tile.properties.swim !== true) {
            break;
          }
          maxX++;
        }

        // Expandir verticalmente hasta encontrar el límite
        while (maxY + 1 < this.surfaceLayer.height) {
          let validRow = true;
          for (let x = startX; x <= maxX; x++) {
            const tile = this.surfaceLayer.getTileAt(x, maxY + 1);
            if (!tile || tile.properties.swim !== true) {
              validRow = false;
              break;
            }
          }
          if (!validRow) {
            break;
          }
          maxY++;
        }

        // Marcar todos los tiles de esta zona como procesados
        for (let y = startY; y <= maxY; y++) {
          for (let x = startX; x <= maxX; x++) {
            processed.add(`${x},${y}`);
          }
        }

        // Calcular coordenadas del mundo
        const worldStartX = startX * tileWidth;
        const worldEndX = (maxX + 1) * tileWidth;
        const worldStartY = startY * tileHeight;
        const worldEndY = (maxY + 1) * tileHeight;

        zones.push({
          startX: worldStartX,
          endX: worldEndX,
          centerX: (worldStartX + worldEndX) / 2,
          centerY: (worldStartY + worldEndY) / 2,
          width: worldEndX - worldStartX,
          height: worldEndY - worldStartY,
        });
      }
    }

    return zones;
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
   * Updated: 2025-10-04 - Fixed collision handling for FreezableEnemy
   */
  setupProjectileCollisions(
    projectileGroup: Phaser.Physics.Arcade.Group
  ): void {
    // NO crear un overlap por cada enemigo - eso causa múltiples callbacks
    // En su lugar, usar overlap con callback que maneje la lógica

    // Guardar referencia para poder remover colisiones viejas
    if ((this as any).projectileColliders) {
      (this as any).projectileColliders.forEach((collider: any) =>
        collider.destroy()
      );
    }
    (this as any).projectileColliders = [];

    // Crear overlap para cada enemigo individualmente
    // pero evitando procesamiento múltiple
    this.enemies.forEach((enemy) => {
      const collider = this.scene.physics.add.overlap(
        projectileGroup,
        enemy as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        (obj1, obj2) => {
          // COLLISION CALLBACK: obj1 = projectile, obj2 = enemy
          // PERO por alguna razón Phaser puede invertirlos, así que detectamos cuál es cuál
          const isObj1Enemy = (obj1 as any).enemyId !== undefined;
          const proj = (isObj1Enemy ? obj2 : obj1) as any;
          const hitEnemy = (isObj1Enemy ? obj1 : obj2) as any;

          // Aplicar daño al enemigo
          if (hitEnemy.takeDamageFromSnowball) {
            hitEnemy.takeDamageFromSnowball();
          }

          // Solo remover del array si es BasicEnemy (muere)
          if (hitEnemy instanceof BasicEnemy) {
            this.removeEnemy(hitEnemy);
          }

          // Destruir el proyectil
          proj.destroy();

          // Limpiar marca después de un frame
          this.scene.time.delayedCall(50, () => {
            if (hitEnemy && hitEnemy.active) {
              hitEnemy.justHit = false;
            }
          });
        },
        (obj1, obj2) => {
          // PROCESS CALLBACK: Decide si la colisión debe procesarse
          // Detectar cuál es el enemigo y cuál el proyectil
          const isObj1Enemy = (obj1 as any).enemyId !== undefined;
          const proj = (isObj1Enemy ? obj2 : obj1) as any;
          const hitEnemy = (isObj1Enemy ? obj1 : obj2) as any;

          // Verificar que ambos objetos aún existen y están activos
          if (!proj || !proj.active || !hitEnemy || !hitEnemy.active) {
            return false; // No procesar
          }

          // Verificar que no se ha procesado ya esta colisión
          if (proj.justHit || hitEnemy.justHit) {
            return false; // No procesar
          }

          // Marcar como procesado temporalmente
          proj.justHit = true;
          hitEnemy.justHit = true;

          return true; // Sí, procesar esta colisión
        },
        this
      );

      (this as any).projectileColliders.push(collider);
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

      // Solo destruir si es BasicEnemy (muere)
      // FreezableEnemy NO debe ser destruido, solo congelado
      if (enemy instanceof BasicEnemy) {
        enemy.destroy();
      }
    }
  }

  /**
   * Actualizar todos los enemigos
   */
  update(time: number, delta: number): void {
    this.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(time, delta);

        // Configurar colisión con bloques de hielo de FreezableEnemy
        if (enemy instanceof FreezableEnemy) {
          const iceBlock = (enemy as FreezableEnemy).getIceBlock();
          if (iceBlock && iceBlock.active) {
            // Asegurar que el bloque de hielo tiene colisión con el player
            // Solo crear el collider una vez
            if (!(iceBlock as any).hasPlayerCollider) {
              this.scene.physics.add.collider(this.player, iceBlock);
              (iceBlock as any).hasPlayerCollider = true;
            }
          }
        }
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
