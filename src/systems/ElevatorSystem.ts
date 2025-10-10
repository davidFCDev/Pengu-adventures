/**
 * ElevatorSystem - Sistema reutilizable de plataformas/elevadores que se mueven verticalmente
 *
 * ✅ CARACTERÍSTICAS:
 * - Plataformas de 2 tiles (izquierda + derecha) que se mueven juntas
 * - Se mueve verticalmente entre superficies con colisión
 * - Movimiento suave y sincronizado
 * - El jugador puede saltar sobre ellas (sin daño)
 * - Completamente configurable
 *
 * 🎯 REUTILIZABLE EN CUALQUIER ESCENA:
 * - Solo requiere: Phaser.Scene, Tilemap, SurfaceLayer
 * - Detecta automáticamente los tiles con propiedades "elevator", "left" y "right"
 * - Todos los parámetros son opcionales (valores por defecto)
 *
 * 📖 USO:
 * ```typescript
 * // En cualquier escena de Phaser:
 * const elevatorSystem = new ElevatorSystem(this, {
 *   tilemap: this.tilemap,
 *   surfaceLayer: this.surfaceLayer,
 *   moveInterval: 1000,      // Pausa entre movimientos (opcional)
 *   moveSpeed: 150,          // Velocidad (opcional)
 * });
 *
 * elevatorSystem.createElevators();
 * elevatorSystem.setupPlayerCollision(player);
 * ```
 *
 * 🔧 CONFIGURACIÓN EN TILED:
 * - Tile izquierdo: collision=true, elevator=true, left=true
 * - Tile derecho: collision=true, elevator=true, right=true
 * - Ambos tiles deben estar en la capa "objects"
 */

import { Player } from "../objects/player/Player";

export interface ElevatorSystemConfig {
  // ========== REQUERIDOS ==========
  tilemap: Phaser.Tilemaps.Tilemap;
  surfaceLayer: Phaser.Tilemaps.TilemapLayer; // Layer de superficies para detectar colisiones
  leftTileGID: number; // GID del tile izquierdo del elevador
  rightTileGID: number; // GID del tile derecho del elevador

  // ========== OPCIONALES ==========
  tilesetName?: string; // Nombre del tileset (default: "spritesheet-tiles-default")
  spritesheetKey?: string; // Key del spritesheet (default: "spritesheet-tiles-frames")
  depth?: number; // Profundidad de renderizado (default: 5)
  moveSpeed?: number; // Velocidad de movimiento en px/s (default: 100)
}

interface ElevatorPlatform {
  leftSprite: Phaser.GameObjects.Sprite;
  rightSprite: Phaser.GameObjects.Sprite;
  leftBody: Phaser.Physics.Arcade.Body;
  rightBody: Phaser.Physics.Arcade.Body;
  direction: "up" | "down"; // Dirección actual de movimiento
  isMoving: boolean;
  startY: number; // Posición inicial
  canChangeDirection: boolean; // Cooldown para evitar cambios múltiples
}

export class ElevatorSystem {
  private scene: Phaser.Scene;
  private config: Required<ElevatorSystemConfig>;
  private elevators: ElevatorPlatform[] = [];
  private elevatorGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, config: ElevatorSystemConfig) {
    this.scene = scene;

    this.config = {
      tilemap: config.tilemap,
      surfaceLayer: config.surfaceLayer,
      leftTileGID: config.leftTileGID,
      rightTileGID: config.rightTileGID,
      tilesetName:
        config.tilesetName ??
        config.tilemap.tilesets[0]?.name ??
        "spritesheet-tiles-default",
      spritesheetKey: config.spritesheetKey ?? "spritesheet-tiles-frames",
      depth: config.depth ?? 5,
      moveSpeed: config.moveSpeed ?? 100, // 100 px/s para movimiento suave continuo
    };

    // Crear grupo de física
    this.elevatorGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Configurar colisión con la capa de superficies
    this.scene.physics.add.collider(
      this.elevatorGroup,
      this.config.surfaceLayer,
      (object1, object2) => {
        this.handleWallCollision(
          object1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
          object2 as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      },
      undefined,
      this
    );
  }

  /**
   * Crear elevadores desde el tilemap
   * Busca objetos con los GIDs especificados (como hace TemporaryPlatformSystem)
   */
  createElevators(): void {
    const objectLayers = this.config.tilemap.objects;

    // Buscar objetos por GID (igual que TemporaryPlatformSystem)
    const leftTiles: any[] = [];
    const rightTiles: any[] = [];

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && obj.gid === this.config.leftTileGID) {
          leftTiles.push(obj);
        } else if (obj.gid && obj.gid === this.config.rightTileGID) {
          rightTiles.push(obj);
        }
      });
    });

    console.log(
      `🔍 Encontrados ${
        leftTiles.length + rightTiles.length
      } tiles de elevador (${leftTiles.length} izq con GID ${
        this.config.leftTileGID
      }, ${rightTiles.length} der con GID ${this.config.rightTileGID})`
    );

    if (leftTiles.length === 0 && rightTiles.length === 0) {
      console.warn(
        `⚠️ No se encontraron tiles con GID ${this.config.leftTileGID} (izq) o ${this.config.rightTileGID} (der)`
      );
      return;
    }

    // Emparejar tiles izquierdos y derechos por proximidad
    leftTiles.forEach((leftTile) => {
      // Buscar el tile derecho más cercano horizontalmente
      const rightTile = rightTiles.find((rt) => {
        const sameY = Math.abs(rt.y - leftTile.y) < 5; // Misma Y (tolerancia de 5px)
        const closeX = rt.x > leftTile.x && rt.x - leftTile.x < 100; // A la derecha y cerca
        return sameY && closeX;
      });

      if (rightTile) {
        this.createElevatorPair(leftTile, rightTile);
      } else {
        console.warn(
          `⚠️ Tile elevador izquierdo en (${leftTile.x}, ${leftTile.y}) no tiene pareja derecha cercana`
        );
      }
    });

    if (this.elevators.length === 0) {
      console.warn("⚠️ No se crearon pares de elevadores válidos");
      return;
    }

    console.log(`✅ ${this.elevators.length} elevadores creados`);

    // Iniciar movimiento sincronizado
    this.startSynchronizedMovement();
  }

  /**
   * Crear un par de tiles (izquierda + derecha) como plataforma elevadora
   */
  private createElevatorPair(leftTile: any, rightTile: any): void {
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) {
      console.warn(`Tileset ${this.config.tilesetName} no encontrado`);
      return;
    }

    // Calcular IDs locales de los tiles
    const leftLocalId = leftTile.gid - tileset.firstgid;
    const rightLocalId = rightTile.gid - tileset.firstgid;

    // Crear sprite izquierdo
    const leftSprite = this.scene.add.sprite(
      leftTile.x,
      leftTile.y - 32, // Ajuste de posición (Tiled usa esquina inferior)
      this.config.spritesheetKey,
      leftLocalId
    );
    leftSprite.setOrigin(0.5, 0.5);
    leftSprite.setDepth(this.config.depth);

    // Crear sprite derecho
    const rightSprite = this.scene.add.sprite(
      rightTile.x,
      rightTile.y - 32, // Ajuste de posición (Tiled usa esquina inferior)
      this.config.spritesheetKey,
      rightLocalId
    );
    rightSprite.setOrigin(0.5, 0.5);
    rightSprite.setDepth(this.config.depth);

    // Añadir física a ambos sprites
    this.scene.physics.add.existing(leftSprite);
    this.scene.physics.add.existing(rightSprite);

    const leftBody = leftSprite.body as Phaser.Physics.Arcade.Body;
    const rightBody = rightSprite.body as Phaser.Physics.Arcade.Body;

    // Configurar cuerpos físicos
    leftBody.setAllowGravity(false);
    leftBody.setImmovable(true);
    leftBody.setSize(leftSprite.width, leftSprite.height);
    leftBody.setEnable(true); // Asegurar que la física está habilitada

    rightBody.setAllowGravity(false);
    rightBody.setImmovable(true);
    rightBody.setSize(rightSprite.width, rightSprite.height);
    rightBody.setEnable(true); // Asegurar que la física está habilitada

    // Añadir al grupo
    this.elevatorGroup.add(leftSprite);
    this.elevatorGroup.add(rightSprite);

    // Crear el objeto elevador
    const elevator: ElevatorPlatform = {
      leftSprite,
      rightSprite,
      leftBody,
      rightBody,
      direction: "down", // Comienza bajando
      isMoving: false,
      startY: leftTile.y - 32,
      canChangeDirection: true, // Puede cambiar de dirección al inicio
    };

    this.elevators.push(elevator);
  }

  /**
   * Iniciar movimiento sincronizado de todos los elevadores
   */
  private startSynchronizedMovement(): void {
    // Iniciar movimiento continuo inmediatamente
    this.elevators.forEach((elevator) => {
      this.startElevatorMovement(elevator);
    });
  }

  /**
   * Iniciar movimiento continuo de un elevador
   */
  private startElevatorMovement(elevator: ElevatorPlatform): void {
    elevator.isMoving = true;

    // Configurar velocidad según dirección inicial
    const velocity =
      elevator.direction === "down"
        ? this.config.moveSpeed
        : -this.config.moveSpeed;

    elevator.leftBody.setVelocityY(velocity);
    elevator.rightBody.setVelocityY(velocity);
  }

  /**
   * Actualizar elevadores (llamar desde scene.update)
   * Sincroniza manualmente las posiciones para evitar desincronización
   */
  update(): void {
    this.elevators.forEach((elevator) => {
      // Sincronizar posición Y del sprite derecho con el izquierdo
      // Esto asegura que siempre se muevan juntos
      elevator.rightSprite.y = elevator.leftSprite.y;

      // Asegurar que ambos tengan la misma velocidad
      if (
        Math.abs(elevator.leftBody.velocity.y - elevator.rightBody.velocity.y) >
        0.1
      ) {
        elevator.rightBody.setVelocityY(elevator.leftBody.velocity.y);
      }
    });
  }

  /**
   * Manejar colisión con paredes (techo o suelo) - Cambiar dirección suavemente
   */
  private handleWallCollision(
    elevatorSprite: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    wall: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    // Encontrar el elevador al que pertenece este sprite
    const elevator = this.elevators.find(
      (elev) =>
        elev.leftSprite === elevatorSprite ||
        elev.rightSprite === elevatorSprite
    );

    if (!elevator) return;

    // Solo cambiar dirección si está permitido (evita cambios múltiples)
    if (!elevator.canChangeDirection) return;

    // Bloquear cambios temporalmente
    elevator.canChangeDirection = false;

    // Cambiar dirección inmediatamente sin parar
    elevator.direction = elevator.direction === "down" ? "up" : "down";

    // Invertir velocidad suavemente EN AMBOS SPRITES
    const newVelocity =
      elevator.direction === "down"
        ? this.config.moveSpeed
        : -this.config.moveSpeed;

    elevator.leftBody.setVelocityY(newVelocity);
    elevator.rightBody.setVelocityY(newVelocity);

    // Reactivar cambio de dirección después de 500ms (cuando ya no toca la pared)
    this.scene.time.delayedCall(500, () => {
      elevator.canChangeDirection = true;
    });
  }

  /**
   * Configurar colisión con el jugador
   */
  setupPlayerCollision(player: Player): void {
    if (!player) {
      console.warn("Player no definido para colisión con elevadores");
      return;
    }

    // El jugador puede pararse sobre los elevadores
    this.scene.physics.add.collider(player, this.elevatorGroup);
  }

  /**
   * Destruir el sistema y limpiar recursos
   */
  destroy(): void {
    // Destruir todos los sprites
    this.elevators.forEach((elevator) => {
      if (elevator.leftSprite) {
        elevator.leftSprite.destroy();
      }
      if (elevator.rightSprite) {
        elevator.rightSprite.destroy();
      }
    });

    // Limpiar arrays
    this.elevators = [];

    // Destruir grupo
    if (this.elevatorGroup) {
      this.elevatorGroup.clear(true, true);
      this.elevatorGroup.destroy();
    }
  }
}
