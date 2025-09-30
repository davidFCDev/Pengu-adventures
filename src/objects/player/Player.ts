import { Snowball } from "./Snowball";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private jumpKey?: Phaser.Input.Keyboard.Key;
  private throwKey?: Phaser.Input.Keyboard.Key;
  private crouchKey?: Phaser.Input.Keyboard.Key;
  private isSwimming: boolean = false;
  private isClimbing: boolean = false;
  private swimSpeed: number = 200; // Aumentado de 160 a 200 para nado más rápido
  private flappyImpulse: number = -350; // Impulso más fuerte para salir del agua
  private walkSpeed: number = 280; // Aumentado de 200 a 280
  private climbSpeed: number = 150; // Aumentado de 120 a 150
  private jumpVelocity: number = -500; // Salto más potente
  private waterDrag: number = 0.8;
  private lastFlappyTime: number = 0;
  private flappyCooldown: number = 200; // Cooldown un poco más largo para evitar spam
  private isOnGround: boolean = false;
  private canJump: boolean = true;
  private isCrouching: boolean = false;
  private canThrow: boolean = true;
  private throwCooldown: number = 500;
  private lastThrowTime: number = 0;
  private currentAnimation: string = "";
  private isFacingRight: boolean = true;
  private collider?: Phaser.Physics.Arcade.Collider;
  private isPlayingThrow: boolean = false;
  private isInvulnerable: boolean = false;
  private invulnerabilityTime: number = 2000; // 2 segundos de invulnerabilidad
  private onHitCallback?: () => void;
  private isGhost: boolean = false;
  private ghostSpeed: number = 180; // Velocidad en modo fantasma
  private ghostImpulse: number = -400; // Impulso hacia arriba más potente
  private lastGhostFlappyTime: number = 0;
  private ghostFlappyCooldown: number = 180; // Cooldown para flotar
  private ghostJumpsRemaining: number = 3; // Saltos restantes en modo fantasma
  private maxGhostJumps: number = 3; // Máximo de saltos consecutivos en modo fantasma
  private wasOnGroundLastFrame: boolean = false; // Para detectar cuando toca el suelo
  private hasTouchedGroundSinceLastModeChange: boolean = true; // 🔒 Anti-exploit de saltos infinitos
  private canBlow: boolean = true;
  private blowCooldown: number = 800; // Cooldown para soplar
  private lastBlowTime: number = 0;
  private isPlayingBlow: boolean = false;
  private windParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private activeTimers: Phaser.Time.TimerEvent[] = []; // Track de timers activos
  private snowParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private isWalkingOnSnow: boolean = false;
  private lastWalkParticleTime: number = 0;
  private walkParticleCooldown: number = 200; // Cooldown más largo para simular pasos reales
  private isLeftFootStep: boolean = true; // Alternar entre pie izquierdo y derecho

  // Sonidos del player
  private jumpSound?: Phaser.Sound.BaseSound;
  private swimSound?: Phaser.Sound.BaseSound;
  private hurtSound?: Phaser.Sound.BaseSound;
  private blowSound?: Phaser.Sound.BaseSound;
  private lastWalkSoundTime: number = 0;
  private walkSoundCooldown: number = 300; // Cooldown para evitar spam del sonido de caminar
  private wasThrowKeyDown: boolean = false; // Para detectar tap en lugar de hold
  private isPlayingAppearing: boolean = false; // Flag para la animación de aparición
  private appearingSprite?: Phaser.GameObjects.Sprite; // Sprite separado para la aparición

  constructor(scene: Phaser.Scene, x: number, y: number, texture?: string) {
    // Crear el sprite con la textura del pingüino parado
    super(scene, x, y, texture || "penguin_standing");

    // Tamaño del sprite un poco más pequeño (110x110)
    this.setDisplaySize(110, 110);

    // Añadir al scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar física
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setBounce(0.1, 0.1);
    body.setCollideWorldBounds(true);
    body.setDragX(1200); // Drag más alto para parada más rápida
    body.setMaxVelocity(300, 600);

    // Ajustar el cuerpo de colisión compensando el margen inferior del sprite
    body.setSize(95, 110); // Cuerpo un poco menos ajustado
    body.setOffset(7, 5); // Offset más moderado para contacto natural con el suelo

    // Crear textura para partículas de nieve si no existe
    this.createSnowParticleTexture();

    // Configurar controles
    this.setupControls();

    // Inicializar sonidos
    this.setupSounds();

    // Iniciar con la animación de parado
    this.playAnimation("penguin_standing");
  }

  private createSnowParticleTexture(): void {
    // Crear textura para partículas de nieve si no existe
    if (!this.scene.textures.exists("snow_particle")) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffffff, 0.9); // Blanco semi-transparente
      graphics.fillCircle(3, 3, 3); // Círculo pequeño de 3px de radio
      graphics.generateTexture("snow_particle", 6, 6);
      graphics.destroy();
    }
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys("W,S,A,D") as any;
      this.jumpKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.throwKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );
      this.crouchKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SHIFT
      );
    }
  }

  private setupSounds(): void {
    // Configurar sonidos con volumen bajo y suave
    this.jumpSound = this.scene.sound.add("jump_sound", { volume: 0.25 });
    this.swimSound = this.scene.sound.add("swim_sound", { volume: 0.3 });
    this.hurtSound = this.scene.sound.add("hurt_sound", { volume: 0.35 });
    this.blowSound = this.scene.sound.add("blow_sound", { volume: 0.5 });
  }

  private playWalkSound(): void {
    const currentTime = this.scene.time.now;

    // Usar el mismo sonido que la bola de nieve para caminar
    // Cooldown para evitar spam del sonido de caminar
    if (currentTime - this.lastWalkSoundTime > this.walkSoundCooldown) {
      // Reproducir el sonido de la bola de nieve como sonido de pasos
      this.scene.sound.play("snowball_hit_sound", { volume: 0.4 });
      this.lastWalkSoundTime = currentTime;
    }
  }

  /**
   * Posiciona al player en la posición de inicio basada en el tile con start=true
   */
  public setStartPosition(tilemapLayer: Phaser.Tilemaps.TilemapLayer): void {
    const tilemap = tilemapLayer.tilemap;

    // Buscar el tile con start=true
    let startTile: Phaser.Tilemaps.Tile | null = null;

    tilemap.forEachTile(
      (tile: Phaser.Tilemaps.Tile) => {
        if (tile.properties && Object.keys(tile.properties).length > 0) {
          // Buscar start (puede ser string "true" en lugar de boolean true)
          if (
            tile.properties.start === true ||
            tile.properties.start === "true"
          ) {
            startTile = tile;
          }
        }
      },
      this.scene,
      0,
      0,
      tilemap.width,
      tilemap.height,
      undefined,
      tilemapLayer
    );

    if (!startTile) {
      return;
    }

    // Calcular la posición un tile (64px) a la derecha del tile de inicio
    const targetX = (startTile as any).getCenterX() + 64;
    const targetY = (startTile as any).pixelY - this.height / 2;

    this.setPosition(targetX, targetY);

    // Resetear la velocidad para que no caiga desde arriba
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  private playAnimation(animationKey: string): void {
    // No cambiar animación si está ejecutando THROW o BLOW, excepto para animaciones especiales
    const isSpecialAnimation =
      animationKey === "penguin_climb" || animationKey === "penguin_swing";

    if (
      !isSpecialAnimation &&
      ((this.isPlayingThrow && animationKey !== "penguin_throw") ||
        (this.isPlayingBlow && animationKey !== "penguin_ghost_blowing"))
    ) {
      return;
    }

    if (this.currentAnimation !== animationKey) {
      this.currentAnimation = animationKey;
      this.play(animationKey);
    }
  }

  public update(): void {
    if (
      !this.cursors ||
      !this.wasdKeys ||
      !this.jumpKey ||
      !this.throwKey ||
      !this.crouchKey
    )
      return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = this.isSwimming ? this.swimSpeed : this.walkSpeed;

    // Detectar si está en el suelo
    this.isOnGround = body.touching.down || body.blocked.down;

    // 🔒 ANTI-EXPLOIT: Marcar que tocó el suelo (para prevenir exploit de cambio de modo)
    if (this.isOnGround && !this.wasOnGroundLastFrame) {
      this.hasTouchedGroundSinceLastModeChange = true;
    }

    // Sistema de saltos limitados en modo fantasma
    if (this.isGhost) {
      // Si toca el suelo y no tocaba en el frame anterior, reiniciar saltos
      // PERO solo si realmente ha tocado el suelo desde el último cambio de modo
      if (
        this.isOnGround &&
        !this.wasOnGroundLastFrame &&
        this.hasTouchedGroundSinceLastModeChange
      ) {
        this.ghostJumpsRemaining = this.maxGhostJumps;
        console.log(
          "👻🦘 Saltos fantasma reseteados al tocar suelo:",
          this.ghostJumpsRemaining
        );
      }
      // Nota: wasOnGroundLastFrame se actualiza al final del método update
    }

    // Manejar lanzamiento de bola de nieve
    this.handleThrow();

    // Manejar agacharse
    this.handleCrouch();

    // 🐛 FIX: Limpiar animación de caída cuando toca el suelo DESPUÉS de handleCrouch
    if (this.isOnGround && !this.wasOnGroundLastFrame) {
      console.log(
        "🔥 DEBUG: Acabamos de aterrizar! Frame actual:",
        this.frame.name
      );
      console.log("🔥 Animación actual:", this.anims.currentAnim?.key);
      console.log("🔥 isCrouching:", this.isCrouching);

      // El problema es que el frame visual puede quedarse "colgado" independientemente de la animación
      // Forzar el frame correcto inmediatamente al aterrizar
      if (this.isCrouching) {
        console.log("🔥 FORZANDO frame y animación de crouch");
        this.anims.stop(); // Parar cualquier animación actual
        this.playAnimation("penguin_crouch");
        // Cuando termine la animación, mantener el último frame
        this.once("animationcomplete-penguin_crouch", () => {
          this.anims.stop();
          this.setFrame(2); // Frame 2 es el último frame de la animación crouch
          this.updateCrouchHitbox(true);
        });
      } else {
        console.log("🔥 FORZANDO frame y animación idle");
        this.anims.stop(); // Parar cualquier animación actual
        this.playAnimation("penguin_idle");
      }
    }

    // Debug: mostrar información del estado cada cierto tiempo

    // Movimiento horizontal y animaciones
    const isMovingLeft = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const isMovingRight = this.cursors.right.isDown || this.wasdKeys.D.isDown;

    // Ajustar velocidad según el modo
    const currentSpeed = this.isGhost ? this.ghostSpeed : speed;

    if (isMovingLeft) {
      body.setVelocityX(-currentSpeed);
      this.isFacingRight = false;
      this.setFlipX(true);
      if (this.isGhost) {
        this.playAnimation("penguin_ghost_idle");
      } else if (
        !this.isCrouching &&
        this.isOnGround &&
        !this.isSwimming &&
        !this.isClimbing &&
        Math.abs(body.velocity.y) < 10 // 🐛 FIX: No caminar si está saltando/cayendo
      ) {
        this.playAnimation("penguin_walk");
        // Crear partículas de nieve al caminar
        this.createSnowWalkEffect();
        // Reproducir sonido de caminar
        this.playWalkSound();
      }
    } else if (isMovingRight) {
      body.setVelocityX(currentSpeed);
      this.isFacingRight = true;
      this.setFlipX(false);
      if (this.isGhost) {
        this.playAnimation("penguin_ghost_idle");
      } else if (
        !this.isCrouching &&
        this.isOnGround &&
        !this.isSwimming &&
        !this.isClimbing &&
        Math.abs(body.velocity.y) < 10 // 🐛 FIX: No caminar si está saltando/cayendo
      ) {
        this.playAnimation("penguin_walk");
        // Crear partículas de nieve al caminar
        this.createSnowWalkEffect();
        // Reproducir sonido de caminar
        this.playWalkSound();
      }
    } else {
      if (!this.isGhost) {
        body.setVelocityX(0);
      }
      if (this.isGhost) {
        this.playAnimation("penguin_ghost_idle");
      } else if (
        !this.isCrouching &&
        this.isOnGround &&
        !this.isSwimming &&
        !this.isClimbing
      ) {
        this.playAnimation("penguin_standing");
      }
    }

    // Salto / Nado / Trepado / Fantasma
    if (this.isGhost) {
      // Modo fantasma: movimiento flotante similar al agua pero en el aire
      this.handleGhostMovement(body);
    } else if (this.isSwimming) {
      // Estilo Flappy Bird: impulsos hacia arriba, gravedad constante hacia abajo
      const currentTime = this.scene.time.now;

      // Detectar si se presiona cualquiera de las teclas de nado
      const isSwimKeyPressed =
        this.cursors.up.isDown || this.wasdKeys.W.isDown || this.jumpKey.isDown;

      if (
        isSwimKeyPressed &&
        currentTime - this.lastFlappyTime > this.flappyCooldown
      ) {
        // Impulso hacia arriba tipo Flappy Bird
        body.setVelocityY(this.flappyImpulse);
        this.lastFlappyTime = currentTime;
        // Animación de nado
        this.playAnimation("penguin_swing");
        // Reproducir sonido de nado
        if (this.swimSound) {
          this.swimSound.play();
        }
      }
    } else if (this.isClimbing) {
      // Modo escalada: movimiento vertical controlado
      const isMovingUp = this.cursors.up.isDown || this.wasdKeys.W.isDown;
      const isMovingDown = this.cursors.down.isDown || this.wasdKeys.S.isDown;

      if (isMovingUp) {
        body.setVelocityY(-this.climbSpeed);
        // Mantener animación de escalada
        this.playAnimation("penguin_climb");
      } else if (isMovingDown) {
        body.setVelocityY(this.climbSpeed);
        // Mantener animación de escalada
        this.playAnimation("penguin_climb");
      } else {
        // Si no se mueve verticalmente, detener movimiento vertical
        body.setVelocityY(0);
        // Mantener animación de escalada pero más lenta o pausa
        this.playAnimation("penguin_climb");
      }
    } else {
      // En tierra firme - solo SPACE para saltar
      if (this.jumpKey.isDown && this.isOnGround && this.canJump) {
        body.setVelocityY(this.jumpVelocity);
        this.canJump = false;
        this.playAnimation("penguin_jump");
        // Reproducir sonido de salto
        if (!this.isGhost && this.jumpSound) {
          // Modo normal: sonido de salto
          this.jumpSound.play();
        } else if (this.isGhost && this.swimSound) {
          // Modo fantasma: sonido de nadar
          this.swimSound.play();
        }
        setTimeout(() => {
          this.canJump = true;
        }, 200); // Cooldown del salto
      }

      // 🐛 FIX: Mantener animación de salto si está subiendo rápidamente
      if (body.velocity.y < -200 && !this.isOnGround) {
        this.playAnimation("penguin_jump");
      }

      // Animación de caída - pero cambiar a swim si estamos en agua
      // 🏃‍♂️ NO interferir si está en modo CRAWL
      if (body.velocity.y > 50 && !this.isOnGround && !this.isCrouching) {
        if (this.isSwimming) {
          this.playAnimation("penguin_swing");
        } else {
          // Restaurar el cuerpo físico original SOLO si no está en CRAWL
          body.setSize(95, 110); // Altura original
          body.setOffset(7, 5); // Offset original
          this.playAnimation("penguin_fall");
        }
      }
    }

    // Actualizar animaciones basadas en el estado
    this.updateAnimations();

    // Actualizar estado del frame anterior (DEBE ser al final del update)
    this.wasOnGroundLastFrame = this.isOnGround;
  }

  private handleThrow(): void {
    const currentTime = this.scene.time.now;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Detectar tap de la tecla E (presionada ahora pero no estaba presionada antes)
    const isThrowKeyJustPressed =
      this.throwKey!.isDown && !this.wasThrowKeyDown;

    if (isThrowKeyJustPressed) {
      if (this.isGhost) {
        // BLOW: Solo en parado, ni volando, ni saltando, ni cayendo ni en el agua
        const canUseBlow =
          this.canBlow &&
          currentTime - this.lastBlowTime > this.blowCooldown &&
          this.isOnGround && // Debe estar en el suelo
          !this.isSwimming && // No en agua
          !this.isClimbing && // No escalando
          Math.abs(body.velocity.x) < 10 && // No moviéndose horizontalmente (casi parado)
          Math.abs(body.velocity.y) < 10; // No moviéndose verticalmente (no saltando/cayendo)

        if (canUseBlow) {
          this.blowWind();
          this.lastBlowTime = currentTime;
          this.canBlow = false;

          // Cooldown para el siguiente soplido
          this.scene.time.delayedCall(this.blowCooldown, () => {
            this.canBlow = true;
          });
        }
      } else {
        // SNOWBALL: No la podemos usar nadando, pero si andando, saltando
        const canUseSnowball =
          this.canThrow &&
          currentTime - this.lastThrowTime > this.throwCooldown &&
          !this.isSwimming && // No en agua
          !this.isClimbing; // No escalando

        if (canUseSnowball) {
          this.throwSnowball();
          this.lastThrowTime = currentTime;
          this.canThrow = false;

          // Cooldown para el siguiente lanzamiento
          this.scene.time.delayedCall(this.throwCooldown, () => {
            this.canThrow = true;
          });
        }
      }
    }

    // Actualizar estado de la tecla para el próximo frame
    this.wasThrowKeyDown = this.throwKey!.isDown;
  }

  private handleCrouch(): void {
    // Detectar si se está presionando DOWN arrow o SHIFT para agacharse
    // SOLO si no está en modo climbing (para no interferir con bajar escaleras)
    const isCrouchPressed =
      this.crouchKey!.isDown ||
      (!this.isClimbing &&
        (this.cursors!.down.isDown || this.wasdKeys!.S.isDown));

    const wasCrouching = this.isCrouching;
    this.isCrouching = isCrouchPressed;

    if (
      this.isCrouching &&
      this.isOnGround &&
      !this.isSwimming &&
      !this.isClimbing
    ) {
      // Solo iniciar animación si no estaba agachado antes
      if (!wasCrouching) {
        this.playAnimation("penguin_crouch");

        // Cuando termine la animación, mantener el último frame
        this.once("animationcomplete-penguin_crouch", () => {
          // Parar en el último frame
          this.anims.stop();
          this.setFrame(2); // Frame 2 es el último frame de la animación crouch

          // 🏃‍♂️ ALTURA REDUCIDA: Cambiar hitbox a 32px de altura cuando está en CRAWL
          this.updateCrouchHitbox(true);
        });
      }

      // Reducir la velocidad al agacharse
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (Math.abs(body.velocity.x) > 0) {
        body.setVelocityX(body.velocity.x * 0.5);
      }
    } else if (!this.isCrouching && wasCrouching) {
      // Solo cuando deja de agacharse (cambio de estado)
      this.playAnimation("penguin_standing");

      // 🏃‍♂️ ALTURA NORMAL: Restaurar hitbox normal de 64px
      this.updateCrouchHitbox(false);
    }
  }

  /**
   * Actualizar hitbox del jugador para el sistema CRAWL
   * 🏃‍♂️ Cuando está agachado: altura reducida, cuando está normal: altura original
   */
  private updateCrouchHitbox(isCrawling: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (isCrawling) {
      // Reducir altura a la mitad manteniendo los pies en el suelo
      const originalHeight = 110;
      const crouchHeight = 55; // Mitad de la altura original
      const heightDifference = originalHeight - crouchHeight;

      body.setSize(95, crouchHeight); // Ancho original, altura reducida
      body.setOffset(7, 5 + heightDifference); // Mover el hitbox hacia arriba para que los pies queden igual

      console.log("🏃‍♂️ CRAWL activado: Altura hitbox = 55px");
    } else {
      // Restaurar configuración original del constructor
      body.setSize(95, 110);
      body.setOffset(7, 5);

      console.log("🏃‍♂️ CRAWL desactivado: Altura hitbox = 110px");
    }
  }

  private throwSnowball(): void {
    // Activar bandera para proteger la animación THROW
    this.isPlayingThrow = true;

    // Forzar la animación THROW sin verificaciones
    this.currentAnimation = "penguin_throw";
    this.play("penguin_throw");

    // Escuchar cuando termine la animación THROW
    this.once("animationcomplete-penguin_throw", () => {
      this.isPlayingThrow = false;
    });

    // Crear la bola de nieve con un pequeño retraso para sincronizar con la animación
    // La bola aparece cuando el pingüino está en medio del lanzamiento
    this.scene.time.delayedCall(300, () => {
      const direction = this.isFacingRight ? 1 : -1;
      const offsetX = direction * 35; // Offset ajustado para la bola más grande

      // Intentar obtener el layer de superficie para colisiones
      let collisionLayer: Phaser.Tilemaps.TilemapLayer | undefined;

      // Buscar el layer de superficie en la escena
      const baseScene = this.scene as any;
      if (baseScene.surfaceLayer) {
        collisionLayer = baseScene.surfaceLayer;
      }

      const snowball = new Snowball(
        this.scene,
        this.x + offsetX,
        this.y - 15, // Ajustado para la nueva bola más grande
        direction,
        collisionLayer
      );
    });
  }

  private blowWind(): void {
    // Activar bandera para proteger la animación BLOW
    this.isPlayingBlow = true;

    // Reproducir sonido de soplido
    if (this.blowSound) {
      this.blowSound.play();
    }

    // Forzar la animación BLOW sin verificaciones
    this.currentAnimation = "penguin_ghost_blowing";
    this.play("penguin_ghost_blowing");

    // Escuchar cuando termine la animación
    this.once("animationcomplete-penguin_ghost_blowing", () => {
      this.isPlayingBlow = false;
    });

    // Crear efecto de viento con partículas después de un retraso más corto
    this.scene.time.delayedCall(250, () => {
      this.createWindEffect();
    });
  }

  private createWindEffect(): void {
    const direction = this.isFacingRight ? 1 : -1;
    const startX = this.x + direction * 60; // Posición inicial del viento
    const startY = this.y - 10;

    // Crear sistema de partículas para el efecto de viento con nieve
    const windParticles = this.scene.add.particles(
      startX,
      startY,
      "snow_particle",
      {
        scale: { start: 1.5, end: 0.5 }, // Escala de las partículas de nieve
        alpha: { start: 0.9, end: 0 },
        speed: { min: 450, max: 650 }, // Velocidad aún más alta para efecto más rápido
        angle: direction > 0 ? { min: -10, max: 10 } : { min: 170, max: 190 }, // Dirección del viento
        lifespan: 700, // Reducido de 1000 a 700ms
        quantity: 4, // Aumentado para más intensidad en menos tiempo
        frequency: 25, // Frecuencia aún más rápida
        emitZone: {
          type: "edge",
          source: new Phaser.Geom.Rectangle(-15, -25, 30, 50), // Zona de emisión más vertical
          quantity: 15,
        },
        gravityY: -50, // Gravedad negativa para simular viento hacia arriba
      }
    );

    // Destruir el emisor después de 800ms (más rápido)
    this.scene.time.delayedCall(800, () => {
      windParticles.destroy();
    });

    // Efecto de sonido del viento (opcional)
    // this.scene.sound.play('wind_sound', { volume: 0.3 });
  }

  /**
   * Reproducir animación de aparición
   */
  private playAppearingAnimation(): void {
    if (this.isPlayingAppearing) {
      return; // Ya se está reproduciendo
    }

    this.isPlayingAppearing = true;

    // Crear sprite temporal para la animación de aparición
    this.appearingSprite = this.scene.add.sprite(this.x, this.y, "appearing");
    this.appearingSprite.setOrigin(0.5, 0.5);
    this.appearingSprite.setDepth(this.depth + 1); // Encima del player

    // Hacer invisible al player temporalmente
    this.setVisible(false);

    // Reproducir la animación
    this.appearingSprite.play("appearing");

    // Cuando termine la animación
    this.appearingSprite.once("animationcomplete-appearing", () => {
      // Destruir el sprite temporal
      if (this.appearingSprite) {
        this.appearingSprite.destroy();
        this.appearingSprite = undefined;
      }

      // Hacer visible al player de nuevo
      this.setVisible(true);
      this.isPlayingAppearing = false;
    });
  }

  /**
   * Crear efecto de partículas de nieve al caminar - más realista
   */
  private createSnowWalkEffect(): void {
    const currentTime = this.scene.time.now;

    // Cooldown para evitar spam de partículas
    if (currentTime - this.lastWalkParticleTime < this.walkParticleCooldown) {
      return;
    }

    this.lastWalkParticleTime = currentTime;

    // Determinar posición del pie que está tocando el suelo
    // Alternar entre pie izquierdo y derecho para más realismo
    const baseFootOffsetX = this.isFacingRight ? -15 : 15; // Pie trasero base
    const footVariation = this.isLeftFootStep ? -3 : 3; // Separación entre pies
    const footX = this.x + baseFootOffsetX + footVariation;
    const footY = this.y + 45; // Justo en el nivel del suelo

    // Alternar pie para el próximo paso
    this.isLeftFootStep = !this.isLeftFootStep;

    // EFECTO 1: Salpicadura inicial de nieve (como si pisara)
    const splashParticles = this.scene.add.particles(
      footX,
      footY,
      "snow_particle",
      {
        speed: { min: 40, max: 120 },
        scale: { min: 0.4, max: 1.2 },
        alpha: { start: 0.9, end: 0.1 },
        lifespan: { min: 400, max: 800 },
        quantity: { min: 8, max: 12 },
        // Ángulo en forma de abanico hacia atrás y a los lados
        angle: this.isFacingRight
          ? { min: 135, max: 225 } // Hacia la izquierda si mira derecha
          : { min: -45, max: 45 }, // Hacia la derecha si mira izquierda
        gravityY: 200, // Gravedad más fuerte para que caigan naturalmente
        // Sin emitZone específica, usará la posición base
      }
    );

    // EFECTO 2: Polvo/nieve que se levanta (más sutil)
    const dustParticles = this.scene.add.particles(
      footX,
      footY - 5,
      "snow_particle",
      {
        speed: { min: 15, max: 40 },
        scale: { min: 0.2, max: 0.6 },
        alpha: { start: 0.6, end: 0 },
        lifespan: { min: 600, max: 1000 },
        quantity: { min: 4, max: 7 },
        angle: { min: -30, max: 30 }, // Hacia arriba
        gravityY: -50, // Gravedad negativa para que floten un poco
        // Sin emitZone específica, usará la posición base
      }
    );

    // EFECTO 3: Rastro de nieve que cae del pie (acumulación)
    const trailParticles = this.scene.add.particles(
      footX,
      footY - 10,
      "snow_particle",
      {
        speed: { min: 5, max: 25 },
        scale: { min: 0.3, max: 0.8 },
        alpha: { start: 0.7, end: 0.2 },
        lifespan: { min: 800, max: 1200 },
        quantity: { min: 3, max: 5 },
        angle: { min: 80, max: 100 }, // Hacia abajo principalmente
        gravityY: 150,
        // Sin emitZone específica, usará la posición base
      }
    );

    // Destruir los emisores después de tiempos diferentes para más realismo
    this.scene.time.delayedCall(150, () => {
      splashParticles.destroy();
    });

    this.scene.time.delayedCall(300, () => {
      dustParticles.destroy();
    });

    this.scene.time.delayedCall(500, () => {
      trailParticles.destroy();
    });
  }

  private updateAnimations(): void {
    // Lógica adicional para animaciones basadas en el estado
    // (Ya se maneja en la lógica de movimiento)
  }

  public setSwimming(swimming: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Si está en modo fantasma y toca el agua, pierde una vida
    if (swimming && this.isGhost) {
      this.handleGhostWaterContact();
      return; // No procesar natación en modo fantasma
    }

    this.isSwimming = swimming;

    // Si está nadando, no puede estar trepando
    if (swimming) {
      this.isClimbing = false;

      // Reactivar colisiones cuando entra al agua (por si venía de climbing)
      if (this.collider) {
        this.collider.active = true;
      }
    }

    if (swimming) {
      // Gravedad más natural en agua:
      // La gravedad global es 800, usar -400 para gravedad efectiva de 400 (más realista)
      body.setGravityY(-400); // Gravedad efectiva de 400 - más natural que 200
      body.setDragX(150); // Más resistencia horizontal para control
      body.setDragY(150); // Más resistencia vertical - movimiento más suave
      body.setMaxVelocity(200, 300); // Velocidades más controladas
    } else if (!this.isClimbing) {
      // Restaurar gravedad normal (usar la gravedad global completa)
      body.setGravityY(0);
      body.setDragX(400);
      body.setDragY(0);
      body.setMaxVelocity(300, 600); // Velocidades normales

      // Asegurar que las colisiones estén activas en tierra normal
      if (this.collider) {
        this.collider.active = true;
      }
    }
  }

  public setClimbing(climbing: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    this.isClimbing = climbing;

    // Si está trepando, no puede estar nadando
    if (climbing) {
      this.isSwimming = false;
    }

    if (climbing) {
      // Anular la gravedad cuando está trepando
      body.setGravityY(-800); // Contrarrestar la gravedad global
      body.setDragX(200);
      body.setDragY(400); // Mayor resistencia vertical para control preciso

      // Desactivar colisiones para poder atravesar plataformas
      if (this.collider) {
        this.collider.active = false;
      }

      // Activar animación de escalada
      this.playAnimation("penguin_climb");
    } else if (!this.isSwimming) {
      // Restaurar gravedad normal solo si no está nadando
      body.setGravityY(0);
      body.setDragX(400);
      body.setDragY(0);

      // Reactivar colisiones cuando ya no está trepando
      if (this.collider) {
        this.collider.active = true;
      }
    }
  }

  public getIsSwimming(): boolean {
    return this.isSwimming;
  }

  public getIsClimbing(): boolean {
    return this.isClimbing;
  }

  public getIsOnGround(): boolean {
    return this.isOnGround;
  }

  public getCursors(): Phaser.Types.Input.Keyboard.CursorKeys | undefined {
    return this.cursors;
  }

  public getWasdKeys(): any {
    return this.wasdKeys;
  }

  public setCollider(collider: Phaser.Physics.Arcade.Collider): void {
    this.collider = collider;
  }

  /**
   * Método llamado cuando el player recibe daño
   */
  public hit(): void {
    if (this.isInvulnerable) return;

    // Activar invulnerabilidad
    this.isInvulnerable = true;

    // Reproducir sonido de daño
    if (this.hurtSound) {
      this.hurtSound.play();
    }

    // Efecto flash blanco
    this.createHitEffect();

    // Llamar callback si existe (para reducir vidas)
    if (this.onHitCallback) {
      this.onHitCallback();
    }

    // Desactivar invulnerabilidad después del tiempo establecido
    const invulnTimer = this.scene.time.delayedCall(
      this.invulnerabilityTime,
      () => {
        this.isInvulnerable = false;
        this.clearTint(); // Asegurar que no quede tinte
        this.setAlpha(1); // Restaurar alpha completo
      }
    );
    this.addTrackedTimer(invulnTimer);
  }

  /**
   * Crear efecto visual de flash blanco cuando recibe daño
   */
  private createHitEffect(): void {
    // Flash blanco inmediato
    this.setTint(0xffffff);

    // Parpadeo durante el período de invulnerabilidad
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(this.invulnerabilityTime / 300), // Parpadea durante la invulnerabilidad
      onComplete: () => {
        this.setAlpha(1);
        this.clearTint();
      },
    });

    // Pequeño empujón hacia atrás
    const body = this.body as Phaser.Physics.Arcade.Body;
    const knockbackForce = this.isFacingRight ? -150 : 150;
    body.setVelocityX(knockbackForce);
    body.setVelocityY(-100);
  }

  /**
   * Establecer callback para cuando el player recibe daño
   */
  public setOnHitCallback(callback: () => void): void {
    this.onHitCallback = callback;
  }

  /**
   * Verificar si el player es invulnerable
   */
  public getIsInvulnerable(): boolean {
    return this.isInvulnerable;
  }

  /**
   * Manejar movimiento en modo fantasma
   */
  private handleGhostMovement(body: Phaser.Physics.Arcade.Body): void {
    const currentTime = this.scene.time.now;

    // Solo SPACE para saltos fantasma - tap normal
    const isJumpKeyPressed = this.jumpKey!.isDown;

    // Sistema de salto fantasma simple (tap)
    if (
      isJumpKeyPressed &&
      this.ghostJumpsRemaining > 0 &&
      currentTime - this.lastGhostFlappyTime > this.ghostFlappyCooldown
    ) {
      // Aplicar impulso fijo
      body.setVelocityY(this.ghostImpulse);
      this.lastGhostFlappyTime = currentTime;

      // Reproducir sonido de nadar para salto fantasma
      if (this.swimSound) {
        this.swimSound.play();
      }

      // Consumir un salto fantasma
      this.ghostJumpsRemaining--;

      // Animación de fantasma flotando
      this.playAnimation("penguin_ghost_idle");
    }

    // En modo fantasma, aplicar resistencia suave
    if (
      !(
        this.cursors!.left.isDown ||
        this.wasdKeys!.A.isDown ||
        this.cursors!.right.isDown ||
        this.wasdKeys!.D.isDown
      )
    ) {
      body.setVelocityX(body.velocity.x * 0.88); // Resistencia suave
    }

    // Animación flotante constante cuando no se mueve
    if (Math.abs(body.velocity.x) < 10 && Math.abs(body.velocity.y) < 10) {
      this.playAnimation("penguin_ghost_idle");
    }
  }

  /**
   * Cambiar al modo fantasma
   */
  public setGhostMode(isGhost: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isGhost = isGhost;

    // 🔒 ANTI-EXPLOIT: Marcar cambio de modo
    this.hasTouchedGroundSinceLastModeChange = this.isOnGround;

    if (isGhost) {
      // Configurar física para modo fantasma (flotante pero con colisiones)
      this.isSwimming = false;
      this.isClimbing = false;

      // 🔒 ANTI-EXPLOIT: Solo resetear saltos si está en el suelo Y ha tocado suelo desde último cambio
      if (this.isOnGround && this.hasTouchedGroundSinceLastModeChange) {
        this.ghostJumpsRemaining = this.maxGhostJumps;
        console.log(
          "👻🦘 Saltos fantasma reseteados (en suelo):",
          this.ghostJumpsRemaining
        );
      } else {
        console.log(
          "🚫 No se resetean saltos fantasma - jugador en el aire o cambio reciente de modo"
        );
      }
      this.wasOnGroundLastFrame = this.isOnGround;

      // Gravedad reducida pero presente para efecto flotante natural
      body.setGravityY(-400); // Gravedad efectiva de 400 (flotante con peso natural)
      body.setDragX(120); // Resistencia horizontal suave
      body.setDragY(60); // Resistencia vertical moderada
      body.setMaxVelocity(this.ghostSpeed, 350); // Velocidades controladas

      // Efecto visual fantasmal
      this.setAlpha(0.8); // Ligeramente transparente
      this.setTint(0xddddff); // Tinte azul pálido

      // MANTENER colisiones activas (el fantasma tiene físicas normales pero flota)
      // Las colisiones permanecen activas para interactuar con el mundo

      console.log("👻 Player convertido a modo fantasma (con colisiones)");
    } else {
      // Restaurar modo normal
      body.setGravityY(0);
      body.setDragX(400);
      body.setDragY(0);
      body.setMaxVelocity(300, 600);

      // Restaurar apariencia normal
      this.setAlpha(1);
      this.clearTint();

      // Las colisiones ya estaban activas, no necesitamos reactivarlas

      console.log("🐧 Player vuelto a modo normal");
    }
  }

  /**
   * Verificar si está en modo fantasma
   */
  public getIsGhost(): boolean {
    return this.isGhost;
  }

  /**
   * Verificar si está en modo CRAWL (agachado con hitbox reducida)
   */
  public getIsCrawling(): boolean {
    return (
      this.isCrouching &&
      this.currentAnimation === "penguin_crouch" &&
      this.frame.name === "2"
    );
  }

  /**
   * Obtener saltos fantasma restantes
   */
  public getGhostJumpsRemaining(): number {
    return this.ghostJumpsRemaining;
  }

  /**
   * Obtener máximo de saltos fantasma
   */
  public getMaxGhostJumps(): number {
    return this.maxGhostJumps;
  }

  /**
   * Añadir timer a la lista de tracking
   */
  private addTrackedTimer(timer: Phaser.Time.TimerEvent): void {
    this.activeTimers.push(timer);
  }

  /**
   * Cancelar todos los timers activos del player
   */
  private cancelAllPlayerTimers(): void {
    console.log(`⏹️ Cancelando ${this.activeTimers.length} timers del player`);

    this.activeTimers.forEach((timer) => {
      if (timer && !timer.hasDispatched) {
        timer.destroy();
      }
    });

    this.activeTimers = [];
    console.log("✅ Todos los timers del player cancelados");
  }

  /**
   * Resetear completamente el jugador para reinicio de nivel
   */
  public resetForRestart(): void {
    console.log("🔄 Reseteando player para reinicio de nivel");

    // Cancelar todos los timers pendientes del jugador
    this.cancelAllPlayerTimers();

    // Resetear estado de invulnerabilidad
    this.isInvulnerable = false;

    // Resetear saltos fantasma
    this.ghostJumpsRemaining = this.maxGhostJumps;

    // Limpiar efectos visuales
    this.clearTint();
    this.setAlpha(1);
    this.setScale(1);

    // Resetear estados de movimiento
    this.isSwimming = false;
    this.isClimbing = false;
    this.isCrouching = false;

    // Resetear hitbox a tamaño normal
    this.updateCrouchHitbox(false);

    console.log("✅ Player reseteado completamente");
  }

  /**
   * Manejar contacto del fantasma con el agua
   */
  private handleGhostWaterContact(): void {
    // Evitar múltiples activaciones
    if (this.isInvulnerable) return;

    console.log("👻💧 Fantasma tocó el agua - iniciando secuencia");

    // Hacer al jugador invulnerable temporalmente
    this.isInvulnerable = true;

    // Crear efecto de parpadeo igual que cuando pierde vida normal
    this.createHitEffect();

    // 1. Encontrar y mover a superficie más cercana inmediatamente
    const moveTimer = this.scene.time.delayedCall(50, () => {
      console.log("👻🏃 Moviendo fantasma a superficie más cercana");
      this.moveToNearestSurface();

      // Asegurar que sigue en modo fantasma después de mover
      this.ensureGhostMode();

      // 3. Quitar una vida pero mantener modo fantasma
      if (this.onHitCallback) {
        this.onHitCallback();
      }

      // Restaurar invulnerabilidad después de un tiempo
      const invulnTimer = this.scene.time.delayedCall(1000, () => {
        this.isInvulnerable = false;
        console.log("👻✅ Fantasma listo para otra interacción");
      });
      this.addTrackedTimer(invulnTimer);
    });
    this.addTrackedTimer(moveTimer);
  }

  /**
   * Asegurar que el jugador permanezca en modo fantasma
   */
  private ensureGhostMode(): void {
    if (!this.isGhost) {
      console.log("👻🔄 Reactivando modo fantasma");
      this.setGhostMode(true);
    }

    // 🔒 ANTI-EXPLOIT: Solo resetear saltos si está en el suelo Y ha tocado suelo desde último cambio
    if (this.isOnGround && this.hasTouchedGroundSinceLastModeChange) {
      this.ghostJumpsRemaining = this.maxGhostJumps;
      console.log(
        "👻🦘 Saltos fantasma reseteados (en suelo):",
        this.ghostJumpsRemaining
      );
    } else {
      console.log(
        "🚫 No se resetean saltos fantasma - jugador en el aire o cambio reciente de modo"
      );
    }
  }

  /**
   * Mover al jugador a la superficie más cercana
   */
  private moveToNearestSurface(): void {
    console.log("👻🏊 Iniciando moveToNearestSurface");

    const tilemap = (this.scene as any).tilemap;
    const surfaceLayer = (this.scene as any).surfaceLayer;

    console.log("👻🗺️ Tilemap:", !!tilemap, "SurfaceLayer:", !!surfaceLayer);

    if (!tilemap || !surfaceLayer) {
      console.log(
        "👻❌ No hay tilemap o surfaceLayer, usando posición de inicio"
      );
      // Fallback: mover a posición de inicio del nivel
      const startPos = this.findStartPosition(tilemap, surfaceLayer);
      this.setPosition(startPos.x, startPos.y);
      return;
    }

    // Convertir posición actual a coordenadas de tile
    const currentTileX = Math.floor(this.x / tilemap.tileWidth);
    const currentTileY = Math.floor(this.y / tilemap.tileHeight);

    console.log(`👻📍 Posición actual del jugador: (${this.x}, ${this.y})`);
    console.log(
      `👻📍 Posición actual en tiles: (${currentTileX}, ${currentTileY})`
    );

    let bestPosition = this.findBestSurfacePosition(
      tilemap,
      surfaceLayer,
      currentTileX,
      currentTileY
    );

    if (bestPosition) {
      console.log(
        `👻✅ Moviendo a superficie encontrada: (${bestPosition.x}, ${bestPosition.y})`
      );
      this.setPosition(bestPosition.x, bestPosition.y);
      // Asegurar que el jugador esté completamente fuera del agua
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      
      // Reproducir animación de aparición cuando el fantasma reaparece
      this.playAppearingAnimation();
    } else {
      console.log("👻❌ No se encontró superficie, usando posición de inicio");
      // Si todo falla, usar la posición de inicio del nivel
      const startPos = this.findStartPosition(tilemap, surfaceLayer);
      this.setPosition(startPos.x, startPos.y);
      
      // También reproducir la animación en el fallback
      this.playAppearingAnimation();
    }
  }

  /**
   * Encontrar la mejor posición de superficie cercana
   */
  private findBestSurfacePosition(
    tilemap: Phaser.Tilemaps.Tilemap,
    surfaceLayer: Phaser.Tilemaps.TilemapLayer,
    currentTileX: number,
    currentTileY: number
  ): { x: number; y: number } | null {
    console.log(
      `👻🔍 Buscando superficie desde tile (${currentTileX}, ${currentTileY})`
    );

    // PASO 1: Buscar primero hacia los lados en el mismo nivel (prioridad alta)
    console.log("👻🔍 PASO 1: Buscando horizontalmente en el mismo nivel");
    for (let dx = 1; dx <= 8; dx++) {
      // Buscar a la izquierda y derecha
      for (const direction of [-1, 1]) {
        const checkX = currentTileX + dx * direction;
        const checkY = currentTileY;

        const tile = tilemap.getTileAt(checkX, checkY, false, surfaceLayer);
        if (tile && this.isSafeSurface(tile)) {
          const result = this.checkSurfaceWithSpace(
            tilemap,
            surfaceLayer,
            checkX,
            checkY
          );
          if (result) return result;
        }
      }
    }

    // PASO 2: Buscar en líneas horizontales hacia abajo (segunda prioridad)
    console.log("👻🔍 PASO 2: Buscando horizontalmente hacia abajo");
    for (let dy = 1; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const checkX = currentTileX + dx;
        const checkY = currentTileY + dy;

        const tile = tilemap.getTileAt(checkX, checkY, false, surfaceLayer);
        if (tile && this.isSafeSurface(tile)) {
          const result = this.checkSurfaceWithSpace(
            tilemap,
            surfaceLayer,
            checkX,
            checkY
          );
          if (result) return result;
        }
      }
    }

    // PASO 3: Búsqueda radial completa como último recurso
    console.log("👻🔍 PASO 3: Búsqueda radial completa");
    for (let radius = 1; radius <= 10; radius++) {
      const directions = 16;

      for (let i = 0; i < directions; i++) {
        const angle = (i * 360) / directions;
        const dx = Math.round(Math.cos((angle * Math.PI) / 180) * radius);
        const dy = Math.round(Math.sin((angle * Math.PI) / 180) * radius);

        const checkX = currentTileX + dx;
        const checkY = currentTileY + dy;

        const tile = tilemap.getTileAt(checkX, checkY, false, surfaceLayer);

        if (tile && this.isSafeSurface(tile)) {
          const result = this.checkSurfaceWithSpace(
            tilemap,
            surfaceLayer,
            checkX,
            checkY
          );
          if (result) return result;
        }
      }
    }

    console.log("👻❌ No se encontró superficie segura");
    return null;
  }

  /**
   * Verificar superficie con espacio libre encima
   */
  private checkSurfaceWithSpace(
    tilemap: Phaser.Tilemaps.Tilemap,
    surfaceLayer: Phaser.Tilemaps.TilemapLayer,
    tileX: number,
    tileY: number
  ): { x: number; y: number } | null {
    // Verificar que hay espacio libre encima para pararse
    const tileAbove = tilemap.getTileAt(tileX, tileY - 1, false, surfaceLayer);
    const tileAbove2 = tilemap.getTileAt(tileX, tileY - 2, false, surfaceLayer);

    // Verificar que hay al menos 2 tiles de altura libre encima
    const hasSpaceAbove =
      (!tileAbove || !this.isSolidTile(tileAbove)) &&
      (!tileAbove2 || !this.isSolidTile(tileAbove2));

    if (hasSpaceAbove) {
      console.log(`👻✅ Superficie CON ESPACIO en (${tileX}, ${tileY})`);

      const worldX = tileX * tilemap.tileWidth + tilemap.tileWidth / 2;
      const worldY = tileY * tilemap.tileHeight - 50; // Un poco encima del tile

      console.log(`👻📍 Posición calculada: (${worldX}, ${worldY})`);
      return { x: worldX, y: worldY };
    } else {
      console.log(
        `👻⚠️ Superficie en (${tileX}, ${tileY}) NO tiene espacio libre encima`
      );
      return null;
    }
  }

  /**
   * Verificar si una superficie es segura (no agua, sólida)
   */
  private isSafeSurface(tile: Phaser.Tilemaps.Tile): boolean {
    if (!tile) return false;

    // Verificar que NO sea agua
    const isWater = tile.properties && (tile.properties as any).water === true;
    if (isWater) {
      return false;
    }

    // Verificar que SÍ sea sólido (collision o cross)
    const isSolid =
      tile.properties &&
      ((tile.properties as any).collision === true ||
        (tile.properties as any).cross === true);

    console.log(
      `👻🧪 Tile (${tile.x}, ${tile.y}): agua=${isWater}, sólido=${isSolid}`
    );
    return isSolid;
  }

  /**
   * Calcular una posición segura encima de un tile
   */
  private calculateSafePosition(
    tilemap: Phaser.Tilemaps.Tilemap,
    tileX: number,
    tileY: number
  ): { x: number; y: number } | null {
    // Verificar que hay espacio libre encima del tile
    const tileAbove = tilemap.getTileAt(
      tileX,
      tileY - 1,
      false,
      (this.scene as any).surfaceLayer
    );
    const tileAbove2 = tilemap.getTileAt(
      tileX,
      tileY - 2,
      false,
      (this.scene as any).surfaceLayer
    );

    // Asegurar que hay al menos 2 tiles de espacio libre encima
    if (
      (tileAbove && this.isSolidTile(tileAbove)) ||
      (tileAbove2 && this.isSolidTile(tileAbove2))
    ) {
      return null; // No hay espacio suficiente
    }

    const worldX = tileX * tilemap.tileWidth + tilemap.tileWidth / 2;
    const worldY = tileY * tilemap.tileHeight - 40; // Posicionar encima del tile

    return { x: worldX, y: worldY };
  }

  /**
   * Encontrar la posición de inicio del nivel
   */
  private findStartPosition(
    tilemap: Phaser.Tilemaps.Tilemap,
    surfaceLayer: Phaser.Tilemaps.TilemapLayer
  ): { x: number; y: number } {
    // Buscar tile con propiedad start=true
    let startPosition: { x: number; y: number } | null = null;

    surfaceLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (
        tile &&
        tile.properties &&
        (tile.properties as any).start === true &&
        !startPosition
      ) {
        const worldX = tile.x * tilemap.tileWidth + tilemap.tileWidth / 2;
        const worldY = tile.y * tilemap.tileHeight - 32;
        startPosition = { x: worldX, y: worldY };
      }
    });

    if (startPosition) {
      return startPosition;
    }

    // Fallback final
    return { x: 400, y: 400 };
  }

  /**
   * Verificar si un tile es agua
   */
  private isWaterTile(tile: Phaser.Tilemaps.Tile): boolean {
    return tile.properties && (tile.properties as any).water === true;
  }

  /**
   * Verificar si un tile es sólido (tiene colisión)
   */
  private isSolidTile(tile: Phaser.Tilemaps.Tile): boolean {
    return (
      tile.properties &&
      ((tile.properties as any).collision === true ||
        (tile.properties as any).cross === true)
    );
  }

  /**
   * Reproducir animación de aparición (público para llamar desde escenas)
   */
  public playAppearing(): void {
    this.playAppearingAnimation();
  }
}
