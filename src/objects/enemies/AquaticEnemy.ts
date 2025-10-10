export enum AquaticEnemyState {
  SWIMMING = "swimming",
}

/**
 * Enemigo acuático que nada horizontalmente en el agua
 * - Solo aparece en agua
 * - No puede ser atacado (inmune a bolas de nieve)
 * - Se mueve horizontalmente hasta colisionar con superficies
 * - Cambia de dirección al colisionar
 * - Electrocuta al jugador con efecto visual espectacular
 */
export class AquaticEnemy extends Phaser.Physics.Arcade.Sprite {
  private enemyState: AquaticEnemyState = AquaticEnemyState.SWIMMING;
  private direction: number = 1; // 1 = derecha, -1 = izquierda
  private moveSpeed: number = 100;
  private surfaceLayer: Phaser.Tilemaps.TilemapLayer;
  private lastElectrocutionTime: number = 0; // Cooldown para efecto de electrocución
  private electrocutionCooldown: number = 1000; // 1 segundo entre electrocuciones
  private lastDirectionChangeTime: number = 0; // Cooldown para cambio de dirección
  private directionChangeCooldown: number = 300; // 300ms entre cambios de dirección

  // Identificador único
  public readonly enemyId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    surfaceLayer: Phaser.Tilemaps.TilemapLayer,
    initialDirection: number = 1
  ) {
    super(scene, x, y, "angler_fish_swim");

    this.surfaceLayer = surfaceLayer;
    this.direction = initialDirection;
    this.enemyId = `aquatic_enemy_${Math.random().toString(36).substr(2, 9)}`;

    // Añadir al scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Crear la animación si no existe
    this.createAnimation();

    // Escalado del sprite (debe ir ANTES de configurar el hitbox)
    this.setDisplaySize(190, 138);

    // Configurar físicas (sin gravedad, flota en el agua)
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Hitbox más grande para cubrir la mayor parte del pez visible
    // Aproximadamente 80% del tamaño visual para mejor jugabilidad
    body.setSize(150, 110); // Antes: 130x90
    body.setOffset(20, 15); // Antes: 30x40 - Centrado mejor
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false); // No cae, flota en el agua
    body.setImmovable(false);

    // Iniciar natación
    this.startSwimming();

    // Animación de ondulación vertical suave
    scene.tweens.add({
      targets: this,
      y: this.y + 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createAnimation(): void {
    // Crear la animación de natación del pez ángler si no existe
    if (!this.scene.anims.exists("angler_fish_swimming")) {
      this.scene.anims.create({
        key: "angler_fish_swimming",
        frames: this.scene.anims.generateFrameNumbers("angler_fish_swim", {
          start: 0,
          end: 15,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  private startSwimming(): void {
    this.enemyState = AquaticEnemyState.SWIMMING;
    this.play("angler_fish_swimming", true);

    // Configurar velocidad y dirección
    this.setFlipX(this.direction > 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.moveSpeed);
  }

  /**
   * Cambiar dirección al colisionar
   */
  public changeDirection(): void {
    const currentTime = this.scene.time.now;

    // Evitar cambios de dirección muy seguidos (cooldown de 300ms)
    if (
      currentTime - this.lastDirectionChangeTime <
      this.directionChangeCooldown
    ) {
      return;
    }

    this.direction *= -1;
    this.setFlipX(this.direction > 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.moveSpeed);

    this.lastDirectionChangeTime = currentTime;
  }

  update(time: number, delta: number): void {
    if (!this.active || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Asegurar que siempre tenga velocidad (prevenir que se quede parado)
    if (Math.abs(body.velocity.x) < 50) {
      body.setVelocityX(this.direction * this.moveSpeed);
    }

    // Verificar colisión con tiles a los lados
    const tileSize = 64;
    const checkX =
      this.direction > 0
        ? this.x + body.width / 2 + 10 // Derecha
        : this.x - body.width / 2 - 10; // Izquierda

    const tile = this.surfaceLayer.getTileAtWorldXY(checkX, this.y);

    if (tile && tile.properties && tile.properties.collision) {
      this.changeDirection();
    }

    // Verificar límites del mundo
    if (body.blocked.left || body.blocked.right) {
      this.changeDirection();
    }
  }

  /**
   * Método para dañar al player cuando toca al enemigo acuático
   * Aplica efecto de electrocución (con cooldown para evitar spam)
   */
  public damagePlayer(player: any): void {
    const currentTime = this.scene.time.now;

    // Verificar cooldown para el efecto visual
    const canElectrocute =
      currentTime - this.lastElectrocutionTime > this.electrocutionCooldown;

    if (player.takeDamage) {
      player.takeDamage(this.x);

      // Aplicar efecto de electrocución solo si ha pasado el cooldown
      if (canElectrocute) {
        this.applyElectrocutionEffect(player);
        this.lastElectrocutionTime = currentTime;
      }
    }
  }

  /**
   * Efecto visual de electrocución
   * - Parpadeo rápido entre blanco y azul eléctrico
   * - Vibración del jugador
   * - Partículas eléctricas alrededor del jugador
   * - Mantiene al jugador en estado SWIM durante todo el efecto
   * - Reproduce sonido de electrocución
   */
  private applyElectrocutionEffect(player: any): void {
    const scene = this.scene;
    const duration = 500; // Duración total del efecto (0.5 segundos)
    const flashInterval = 50; // Intervalo entre parpadeos (muy rápido)
    const shakeIntensity = 3; // Intensidad de la vibración

    // Guardar posición original
    const originalX = player.x;
    const originalY = player.y;

    // Guardar tint original del jugador
    const originalTint = player.tint || 0xffffff;

    // ⚡ Reproducir sonido de electrocución
    if (scene.sound) {
      scene.sound.play("electrocute_sound", { volume: 0.5 });
    }

    // IMPORTANTE: Forzar animación de nado durante la electrocución
    // Guardar la animación actual para restaurarla después
    const currentAnim = player.anims?.currentAnim?.key;

    // Forzar animación de nado (swim)
    if (player.anims && player.anims.getName() !== "penguin_swing") {
      player.anims.play("penguin_swing", true);
    }

    // Crear partículas eléctricas (rayos amarillos/blancos)
    this.createElectricParticles(player);

    // Timer para parpadeos de color
    let flashCount = 0;
    const maxFlashes = Math.floor(duration / flashInterval);

    const flashTimer = scene.time.addEvent({
      delay: flashInterval,
      callback: () => {
        flashCount++;

        // Alternar entre blanco brillante y azul eléctrico
        if (flashCount % 2 === 0) {
          player.setTint(0xffffff); // Blanco brillante
        } else {
          player.setTint(0x0088ff); // Azul eléctrico
        }

        // Vibración (shake) del jugador
        const shakeX =
          originalX + Phaser.Math.Between(-shakeIntensity, shakeIntensity);
        const shakeY =
          originalY + Phaser.Math.Between(-shakeIntensity, shakeIntensity);
        player.setPosition(shakeX, shakeY);

        // Asegurar que sigue en animación de nado
        if (player.anims && player.anims.getName() !== "penguin_swing") {
          player.anims.play("penguin_swing", true);
        }
      },
      repeat: maxFlashes - 1,
      loop: false,
    });

    // Restaurar estado original después del efecto
    scene.time.delayedCall(duration, () => {
      flashTimer.remove();
      player.clearTint();
      player.setTint(originalTint);
      player.setPosition(originalX, originalY);

      // Restaurar la animación original solo si no estamos nadando
      // (si el jugador sigue en agua, debe seguir con swim)
      // El sistema de estados del jugador se encargará de esto automáticamente
    });
  }

  /**
   * Crear partículas eléctricas alrededor del jugador
   */
  private createElectricParticles(player: any): void {
    const scene = this.scene;

    // Crear 8-12 sprites de "rayo" alrededor del jugador
    const particleCount = Phaser.Math.Between(8, 12);
    const particles: Phaser.GameObjects.Graphics[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Crear un gráfico de rayo
      const lightning = scene.add.graphics();
      lightning.lineStyle(2, 0xffff00, 1); // Amarillo brillante

      // Posición aleatoria alrededor del jugador
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = Phaser.Math.Between(20, 40);
      const startX = player.x + Math.cos(angle) * distance;
      const startY = player.y + Math.sin(angle) * distance;

      // Dibujar rayo zigzag
      lightning.beginPath();
      lightning.moveTo(startX, startY);

      const segments = 3;
      for (let j = 0; j < segments; j++) {
        const endX = startX + Phaser.Math.Between(-15, 15);
        const endY = startY + Phaser.Math.Between(-15, 15);
        lightning.lineTo(endX, endY);
      }

      lightning.strokePath();
      lightning.setDepth(player.depth + 1);

      particles.push(lightning);

      // Animación de parpadeo del rayo
      scene.tweens.add({
        targets: lightning,
        alpha: { from: 1, to: 0 },
        duration: 100,
        repeat: 4,
        yoyo: true,
        onComplete: () => {
          lightning.destroy();
        },
      });
    }
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
