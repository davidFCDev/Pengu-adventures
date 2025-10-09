/**
 * SpikeBoxSystem - Sistema reutilizable de cajas con pinchos que se mueven verticalmente
 *
 * ✅ CARACTERÍSTICAS:
 * - Se mueve verticalmente entre paredes con colisión
 * - Movimiento sincronizado de todas las cajas
 * - Efectos visuales: vibración y partículas de impacto
 * - Daño y knockback al jugador
 * - Completamente configurable
 *
 * 🎯 REUTILIZABLE EN CUALQUIER ESCENA:
 * - Solo requiere: Phaser.Scene, Tilemap, SurfaceLayer, y GIDs
 * - Todos los parámetros son opcionales (valores por defecto)
 * - No depende de ninguna implementación específica de escena
 *
 * 📖 USO:
 * ```typescript
 * // En cualquier escena de Phaser:
 * const spikeBoxSystem = new SpikeBoxSystem(this, {
 *   tilemap: this.tilemap,
 *   surfaceLayer: this.surfaceLayer,
 *   spikeBoxTileIds: [287], // GIDs de los tiles en el tilemap
 *   moveInterval: 800,       // Pausa entre movimientos (opcional)
 *   moveSpeed: 250,          // Velocidad (opcional)
 *   damage: 1,               // Daño al jugador (opcional)
 *   knockbackForce: 300,     // Fuerza de repulsión (opcional)
 * });
 *
 * spikeBoxSystem.createSpikeBoxes();
 * spikeBoxSystem.setupPlayerCollision(player);
 * ```
 */

import { Player } from "../objects/player/Player";

export interface SpikeBoxSystemConfig {
  // ========== REQUERIDOS ==========
  tilemap: Phaser.Tilemaps.Tilemap;
  spikeBoxTileIds: number[]; // GIDs de las cajas con pinchos
  surfaceLayer: Phaser.Tilemaps.TilemapLayer; // Layer de superficies para detectar paredes

  // ========== OPCIONALES ==========
  tilesetName?: string; // Nombre del tileset (default: primer tileset del mapa)
  spritesheetKey?: string; // Key del spritesheet (default: "spritesheet-tiles-frames")
  depth?: number; // Profundidad de renderizado (default: 10)
  moveInterval?: number; // Tiempo de pausa entre movimientos en ms (default: 2000)
  moveSpeed?: number; // Velocidad de movimiento en px/s (default: 100)
  damage?: number; // Daño al jugador (default: 1)
  knockbackForce?: number; // Fuerza de repulsión al jugador (default: 300)
}

interface SpikeBox {
  sprite: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;
  direction: "up" | "down"; // Dirección actual de movimiento
  isMoving: boolean;
  isWaiting: boolean; // Estado de espera en la pared
  startY: number; // Posición inicial
  targetY?: number; // Posición objetivo actual
}

export class SpikeBoxSystem {
  private scene: Phaser.Scene;
  private config: Required<SpikeBoxSystemConfig>;
  private spikeBoxes: SpikeBox[] = [];
  private spikeBoxGroup: Phaser.Physics.Arcade.Group;
  private moveTimer?: Phaser.Time.TimerEvent;
  private allBoxesReady: boolean = false;
  private lastSoundTime: number = 0; // Control de cooldown del sonido
  private soundCooldown: number = 150; // Milisegundos entre sonidos (150ms)

  constructor(scene: Phaser.Scene, config: SpikeBoxSystemConfig) {
    this.scene = scene;

    this.config = {
      tilemap: config.tilemap,
      spikeBoxTileIds: config.spikeBoxTileIds,
      surfaceLayer: config.surfaceLayer,
      tilesetName:
        config.tilesetName ??
        config.tilemap.tilesets[0]?.name ??
        "spritesheet-tiles-default",
      spritesheetKey: config.spritesheetKey ?? "spritesheet-tiles-frames",
      depth: config.depth ?? 10,
      moveInterval: config.moveInterval ?? 2000, // 2 segundos por defecto
      moveSpeed: config.moveSpeed ?? 100, // 100 px/s
      damage: config.damage ?? 1,
      knockbackForce: config.knockbackForce ?? 300,
    };

    // Crear grupo de física
    this.spikeBoxGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Configurar colisión con la capa de superficies
    this.scene.physics.add.collider(
      this.spikeBoxGroup,
      this.config.surfaceLayer,
      this.handleWallCollision,
      undefined,
      this
    );
  }

  /**
   * Crear las cajas con pinchos desde el tilemap
   */
  createSpikeBoxes(): void {
    const objectLayers = this.config.tilemap.objects;

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && this.config.spikeBoxTileIds.includes(obj.gid)) {
          this.createSpikeBox(obj);
        }
      });
    });

    // Iniciar el timer de movimiento sincronizado
    if (this.spikeBoxes.length > 0) {
      this.startMovementTimer();
    }
  }

  /**
   * Crear una caja con pinchos individual
   */
  private createSpikeBox(obj: any): void {
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) return;

    const localTileId = obj.gid - tileset.firstgid;

    const sprite = this.scene.add.sprite(
      obj.x,
      obj.y - 32, // Ajuste de posición (Tiled usa bottom-left)
      this.config.spritesheetKey,
      localTileId
    );

    sprite.setOrigin(0.5, 0.5);
    sprite.setDepth(this.config.depth);

    // Añadir física dinámica
    this.scene.physics.add.existing(sprite, false);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(sprite.width, sprite.height);

    // Añadir al grupo
    this.spikeBoxGroup.add(sprite);

    // Determinar dirección inicial (buscar pared más cercana)
    const initialDirection = this.findInitialDirection(obj.x, obj.y - 32);

    // Crear referencia
    const spikeBox: SpikeBox = {
      sprite,
      body,
      direction: initialDirection,
      isMoving: false,
      isWaiting: false,
      startY: obj.y - 32,
    };

    this.spikeBoxes.push(spikeBox);
  }

  /**
   * Determinar dirección inicial basándose en paredes cercanas
   */
  private findInitialDirection(x: number, y: number): "up" | "down" {
    const tileSize = this.config.tilemap.tileWidth;

    // Verificar tile arriba (1 tile arriba del sprite)
    const tileAbove = this.config.surfaceLayer.getTileAtWorldXY(
      x,
      y - tileSize,
      true
    );
    const hasWallAbove = tileAbove?.properties?.collision === true;

    // Si hay pared arriba, empezar yendo hacia abajo
    // Si NO hay pared arriba, empezar yendo hacia arriba
    return hasWallAbove ? "down" : "up";
  }

  /**
   * Iniciar timer de movimiento sincronizado
   */
  private startMovementTimer(): void {
    this.moveTimer = this.scene.time.addEvent({
      delay: this.config.moveInterval,
      callback: () => this.moveAllBoxes(),
      loop: true,
    });

    // Primer movimiento inmediato
    this.scene.time.delayedCall(100, () => this.moveAllBoxes());
  }

  /**
   * Mover todas las cajas al mismo tiempo
   */
  private moveAllBoxes(): void {
    this.spikeBoxes.forEach((box) => {
      this.startBoxMovement(box);
    });
  }

  /**
   * Iniciar movimiento de una caja individual
   */
  private startBoxMovement(box: SpikeBox): void {
    if (box.isMoving || box.isWaiting) return;

    const currentX = box.sprite.x;
    const currentY = box.sprite.y;

    box.isMoving = true;

    // 🚀 Movimiento EXPLOSIVO: aplicar impulso inicial mucho más fuerte
    const baseVelocity =
      box.direction === "down" ? this.config.moveSpeed : -this.config.moveSpeed;
    const explosiveBoost = 1.5; // 50% más rápido al inicio para efecto explosivo

    box.body.setVelocityY(baseVelocity * explosiveBoost);

    // Después de 120ms reducir a velocidad normal (aceleración inicial)
    this.scene.time.delayedCall(120, () => {
      if (box.isMoving && box.body) {
        box.body.setVelocityY(baseVelocity);
      }
    });
  }

  /**
   * Actualizar el sistema (llamar desde update de la escena)
   */
  update(): void {
    // La detección de colisión con paredes se maneja en handleWallCollision
    // No necesitamos verificar manualmente si llegó al destino
  }

  /**
   * Manejar colisión de una caja con una pared
   */
  private handleWallCollision(boxSprite: any, tile: any): void {
    // Buscar la caja correspondiente al sprite
    const box = this.spikeBoxes.find((b) => b.sprite === boxSprite);
    if (!box || !box.isMoving) return;

    // Detener movimiento
    box.body.setVelocityY(0);
    box.isMoving = false;
    box.isWaiting = true;

    // 🔊 REPRODUCIR SONIDO de golpe de roca (con volumen espacial)
    this.playRockSmashSound(box.sprite.x, box.sprite.y);

    // 🎬 EFECTO DE VIBRACIÓN al golpear
    this.createShakeEffect(box.sprite);

    // 💨 CREAR PARTÍCULAS de impacto (humo/polvo)
    this.createImpactParticles(box.sprite.x, box.sprite.y, box.direction);

    // Esperar 2 segundos antes de cambiar dirección
    this.scene.time.delayedCall(this.config.moveInterval, () => {
      // Cambiar dirección después de la espera
      box.direction = box.direction === "down" ? "up" : "down";
      box.isWaiting = false;
    });
  }

  /**
   * Reproducir sonido de golpe de roca con volumen espacial y control de cooldown
   * El volumen se ajusta según la distancia del jugador a la caja
   * Solo permite 1 sonido cada 150ms para evitar saturación cuando hay múltiples cajas
   */
  private playRockSmashSound(boxX: number, boxY: number): void {
    // ⏱️ CONTROL DE COOLDOWN: Evitar múltiples sonidos simultáneos
    const currentTime = this.scene.time.now;
    const timeSinceLastSound = currentTime - this.lastSoundTime;

    if (timeSinceLastSound < this.soundCooldown) {
      return;
    }

    // Verificar que el sonido esté cargado en el cache
    if (!this.scene.cache.audio.exists("rock_smash_sound")) {
      return;
    }

    // Obtener la cámara principal para calcular la distancia
    const camera = this.scene.cameras.main;
    const cameraX = camera.worldView.centerX;
    const cameraY = camera.worldView.centerY;

    // Calcular distancia entre la caja y el centro de la cámara (donde suele estar el jugador)
    const distance = Phaser.Math.Distance.Between(boxX, boxY, cameraX, cameraY);

    // Definir rango de audición
    const maxDistance = 800; // Distancia máxima para escuchar el sonido
    const minDistance = 100; // Distancia mínima (volumen máximo)

    // Si está muy lejos, no reproducir sonido
    if (distance > maxDistance) {
      return;
    }

    // Calcular volumen basado en la distancia (más cerca = más fuerte)
    let volume: number;
    if (distance <= minDistance) {
      volume = 0.7; // Volumen máximo cuando está muy cerca
    } else {
      // Interpolación lineal: de 0.7 a 0.1 según la distancia
      const normalizedDistance =
        (distance - minDistance) / (maxDistance - minDistance);
      volume = 0.7 - normalizedDistance * 0.6; // De 0.7 a 0.1
    }

    // Actualizar el timestamp del último sonido reproducido
    this.lastSoundTime = currentTime;

    // Reproducir sonido con volumen ajustado
    this.scene.sound.play("rock_smash_sound", {
      volume: volume,
    });
  }

  /**
   * Crear efecto de vibración al golpear la pared
   */
  private createShakeEffect(sprite: Phaser.GameObjects.Sprite): void {
    const originalX = sprite.x;
    const originalY = sprite.y;

    // Secuencia de vibraciones rápidas y agresivas
    const shakeStrength = 4; // Intensidad de la vibración
    const shakeDuration = 50; // Duración de cada shake

    this.scene.tweens.add({
      targets: sprite,
      x: [
        originalX - shakeStrength,
        originalX + shakeStrength,
        originalX - shakeStrength * 0.6,
        originalX + shakeStrength * 0.6,
        originalX,
      ],
      y: [
        originalY + shakeStrength * 0.5,
        originalY - shakeStrength * 0.5,
        originalY + shakeStrength * 0.3,
        originalY - shakeStrength * 0.3,
        originalY,
      ],
      duration: shakeDuration * 5,
      ease: "Power2",
    });
  }

  /**
   * Crear partículas de impacto (humo/polvo) cuando golpea la pared
   */
  private createImpactParticles(
    x: number,
    y: number,
    direction: "up" | "down"
  ): void {
    const particleCount = 12; // Más partículas para efecto dramático
    const baseColor = 0xe0e0e0; // Gris claro (polvo/humo)

    // Determinar desde dónde salen las partículas (arriba o abajo de la caja)
    const offsetY = direction === "down" ? 32 : -32; // Mitad del sprite (64/2)
    const impactY = y + offsetY;

    for (let i = 0; i < particleCount; i++) {
      // Variación de color para más realismo (gris claro a blanco)
      const colorVariation = Phaser.Math.Between(0, 40);
      const particleColor =
        baseColor +
        (colorVariation << 16) +
        (colorVariation << 8) +
        colorVariation;

      // Crear partícula (círculo)
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-25, 25), // Dispersión horizontal amplia
        impactY,
        Phaser.Math.Between(3, 6), // Tamaño aleatorio más grande
        particleColor,
        0.9
      );

      particle.setDepth(this.config.depth + 1);

      // Animación: dispersión explosiva en dirección opuesta al movimiento
      const velocityX = Phaser.Math.Between(-120, 120);
      const velocityY =
        direction === "down"
          ? Phaser.Math.Between(-150, -60) // Partículas hacia arriba si golpeó abajo
          : Phaser.Math.Between(60, 150); // Partículas hacia abajo si golpeó arriba

      // Factor de distancia basado en la velocidad
      const distanceFactor = 0.4;

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + velocityX * distanceFactor,
        y: particle.y + velocityY * distanceFactor,
        alpha: 0,
        scale: 0.2,
        duration: 500,
        ease: "Cubic.Out",
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  /**
   * Configurar colisión con el jugador
   * ⚠️ OPCIONAL: Solo llamar si quieres daño/knockback al jugador
   * Si no se llama, las cajas solo se moverán sin interactuar con el jugador
   */
  setupPlayerCollision(player: Player): void {
    if (!player) return;

    this.scene.physics.add.overlap(
      player,
      this.spikeBoxGroup,
      (playerObj, boxObj) => {
        this.handlePlayerCollision(
          playerObj as Player,
          boxObj as Phaser.GameObjects.Sprite
        );
      },
      undefined,
      this
    );
  }

  /**
   * Manejar colisión con el jugador
   */
  private handlePlayerCollision(
    player: Player,
    box: Phaser.GameObjects.Sprite
  ): void {
    // Verificar si el jugador ya está en invulnerabilidad
    if ((player as any).isInvulnerable) return;

    // Quitar vida
    player.takeDamage(this.config.damage);

    // Calcular dirección de knockback (repeler jugador)
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const boxBody = box.body as Phaser.Physics.Arcade.Body;

    const knockbackX =
      playerBody.x < boxBody.x
        ? -this.config.knockbackForce
        : this.config.knockbackForce;
    const knockbackY = -this.config.knockbackForce / 2; // Impulso hacia arriba

    // Aplicar knockback
    playerBody.setVelocity(knockbackX, knockbackY);
  }

  /**
   * Destruir el sistema y liberar recursos
   * ⚠️ IMPORTANTE: Llamar en shutdown() de la escena para evitar memory leaks
   */
  destroy(): void {
    if (this.moveTimer) {
      this.moveTimer.destroy();
    }

    this.spikeBoxes.forEach((box) => {
      box.sprite.destroy();
    });

    this.spikeBoxGroup.clear(true, true);
    this.spikeBoxes = [];
  }

  /**
   * Obtener el grupo de cajas (útil para debug)
   */
  getGroup(): Phaser.Physics.Arcade.Group {
    return this.spikeBoxGroup;
  }
}
