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
  private ghostImpulse: number = -200; // Impulso hacia arriba como flotando (natural)
  private lastGhostFlappyTime: number = 0;
  private ghostFlappyCooldown: number = 180; // Cooldown para flotar
  private canBlow: boolean = true;
  private blowCooldown: number = 800; // Cooldown para soplar
  private lastBlowTime: number = 0;
  private isPlayingBlow: boolean = false;
  private windParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

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

    // Manejar lanzamiento de bola de nieve
    this.handleThrow();

    // Manejar agacharse
    this.handleCrouch();

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
        !this.isClimbing
      ) {
        this.playAnimation("penguin_walk");
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
        !this.isClimbing
      ) {
        this.playAnimation("penguin_walk");
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
      // En tierra firme
      if (
        (this.cursors.up.isDown ||
          this.wasdKeys.W.isDown ||
          this.jumpKey.isDown) &&
        this.isOnGround &&
        this.canJump
      ) {
        body.setVelocityY(this.jumpVelocity);
        this.canJump = false;
        this.playAnimation("penguin_jump");
        setTimeout(() => {
          this.canJump = true;
        }, 200); // Cooldown del salto
      }

      // Animación de caída - pero cambiar a swim si estamos en agua
      if (body.velocity.y > 50 && !this.isOnGround) {
        if (this.isSwimming) {
          this.playAnimation("penguin_swing");
        } else {
          // Restaurar el cuerpo físico original
          body.setSize(95, 110); // Altura original
          body.setOffset(7, 5); // Offset original
          this.playAnimation("penguin_fall");
        }
      }
    }

    // Actualizar animaciones basadas en el estado
    this.updateAnimations();
  }

  private handleThrow(): void {
    const currentTime = this.scene.time.now;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.throwKey!.isDown) {
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
  }

  private handleCrouch(): void {
    // Detectar si se está presionando DOWN arrow o SHIFT para agacharse
    // SOLO si no está en modo climbing (para no interferir con bajar escaleras)
    const isCrouchPressed =
      this.crouchKey!.isDown ||
      (!this.isClimbing &&
        (this.cursors!.down.isDown || this.wasdKeys!.S.isDown));

    this.isCrouching = isCrouchPressed;

    if (
      this.isCrouching &&
      this.isOnGround &&
      !this.isSwimming &&
      !this.isClimbing
    ) {
      // Reproducir animación de crouch y mantener el último frame
      if (this.currentAnimation !== "penguin_crouch") {
        this.playAnimation("penguin_crouch");

        // Cuando termine la animación, mantener el último frame
        this.once("animationcomplete-penguin_crouch", () => {
          if (this.isCrouching) {
            // Parar en el último frame si aún está agachado
            this.anims.stop();
            this.setFrame(2); // Frame 2 es el último frame de la animación crouch
          }
        });
      }

      // Reducir la velocidad al agacharse
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (Math.abs(body.velocity.x) > 0) {
        body.setVelocityX(body.velocity.x * 0.5);
      }
    } else if (
      !this.isCrouching &&
      this.currentAnimation === "penguin_crouch"
    ) {
      // Si deja de agacharse, volver a la animación normal
      this.playAnimation("penguin_standing");
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

  private updateAnimations(): void {
    // Lógica adicional para animaciones basadas en el estado
    // (Ya se maneja en la lógica de movimiento)
  }

  public setSwimming(swimming: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

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

    // Efecto flash blanco
    this.createHitEffect();

    // Llamar callback si existe (para reducir vidas)
    if (this.onHitCallback) {
      this.onHitCallback();
    }

    // Desactivar invulnerabilidad después del tiempo establecido
    this.scene.time.delayedCall(this.invulnerabilityTime, () => {
      this.isInvulnerable = false;
      this.clearTint(); // Asegurar que no quede tinte
      this.setAlpha(1); // Restaurar alpha completo
    });
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

    // Detectar si se presiona cualquiera de las teclas de flotación
    const isFloatKeyPressed =
      this.cursors!.up.isDown ||
      this.wasdKeys!.W.isDown ||
      this.jumpKey!.isDown;

    if (
      isFloatKeyPressed &&
      currentTime - this.lastGhostFlappyTime > this.ghostFlappyCooldown
    ) {
      // Impulso hacia arriba tipo flotación fantasmal
      body.setVelocityY(this.ghostImpulse);
      this.lastGhostFlappyTime = currentTime;

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

    // ...sin corrección de posición vertical, solo física flotante...
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

    if (isGhost) {
      // Configurar física para modo fantasma (flotante pero con colisiones)
      this.isSwimming = false;
      this.isClimbing = false;

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
}
