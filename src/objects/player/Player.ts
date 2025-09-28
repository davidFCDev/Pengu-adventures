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

    // Configurar controles
    this.setupControls();

    // Iniciar con la animación de parado
    this.playAnimation("penguin_standing");
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys("W,S,A,D") as any;
      this.jumpKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.throwKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.X
      );
      this.crouchKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SHIFT
      );
    }
  }

  private playAnimation(animationKey: string): void {
    // No cambiar animación si está ejecutando THROW
    if (this.isPlayingThrow && animationKey !== "penguin_throw") {
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

    if (isMovingLeft) {
      body.setVelocityX(-speed);
      this.isFacingRight = false;
      this.setFlipX(true);
      if (
        !this.isCrouching &&
        this.isOnGround &&
        !this.isSwimming &&
        !this.isClimbing
      ) {
        this.playAnimation("penguin_walk");
      }
    } else if (isMovingRight) {
      body.setVelocityX(speed);
      this.isFacingRight = true;
      this.setFlipX(false);
      if (
        !this.isCrouching &&
        this.isOnGround &&
        !this.isSwimming &&
        !this.isClimbing
      ) {
        this.playAnimation("penguin_walk");
      }
    } else {
      body.setVelocityX(0);
      if (
        !this.isCrouching &&
        this.isOnGround &&
        !this.isSwimming &&
        !this.isClimbing
      ) {
        this.playAnimation("penguin_standing");
      }
    }

    // Salto / Nado / Trepado
    if (this.isSwimming) {
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

      // En el agua, aplicar resistencia solo si no hay input horizontal
      if (
        !(
          this.cursors.left.isDown ||
          this.wasdKeys.A.isDown ||
          this.cursors.right.isDown ||
          this.wasdKeys.D.isDown
        )
      ) {
        body.setVelocityX(body.velocity.x * 0.85);
      }
    } else if (this.isClimbing) {
      // En escaleras, se puede mover verticalmente
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
        body.setVelocityY(-this.climbSpeed);
        this.playAnimation("penguin_climb");
      } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
        body.setVelocityY(this.climbSpeed);
        this.playAnimation("penguin_climb");
      } else {
        // Si no se mueve verticalmente, mantener posición
        body.setVelocityY(0);
        this.playAnimation("penguin_standing");
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
          this.playAnimation("penguin_fall");
        }
      }
    }

    // Actualizar animaciones basadas en el estado
    this.updateAnimations();
  }

  private handleThrow(): void {
    const currentTime = this.scene.time.now;

    if (
      this.throwKey!.isDown &&
      this.canThrow &&
      currentTime - this.lastThrowTime > this.throwCooldown
    ) {
      this.throwSnowball();
      this.lastThrowTime = currentTime;
      this.canThrow = false;

      // Cooldown para el siguiente lanzamiento
      this.scene.time.delayedCall(this.throwCooldown, () => {
        this.canThrow = true;
      });
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

      const snowball = new Snowball(
        this.scene,
        this.x + offsetX,
        this.y - 15, // Ajustado para la nueva bola más grande
        direction
      );
    });
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
}
