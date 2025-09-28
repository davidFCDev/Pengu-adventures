export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private jumpKey?: Phaser.Input.Keyboard.Key;
  private isSwimming: boolean = false;
  private isClimbing: boolean = false;
  private swimSpeed: number = 120;
  private flappyImpulse: number = -250; // Impulso más suave y natural
  private walkSpeed: number = 200;
  private climbSpeed: number = 120;
  private jumpVelocity: number = -400;
  private waterDrag: number = 0.8;
  private lastFlappyTime: number = 0;
  private flappyCooldown: number = 200; // Cooldown un poco más largo para evitar spam
  private isOnGround: boolean = false;
  private canJump: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Crear una esfera simple usando graphics
    super(scene, x, y, "");

    // Configurar la apariencia de la esfera
    this.setDisplaySize(32, 32);
    this.setTint(0x00ff00); // Verde por defecto

    // Añadir al scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar física
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setBounce(0.1, 0.1);
    body.setCollideWorldBounds(true);
    body.setDragX(1200); // Drag más alto para parada más rápida
    body.setMaxVelocity(300, 600);

    // Configurar controles
    this.setupControls();

    // Crear la visualización de la esfera
    this.createSphereGraphics();
  }

  private createSphereGraphics(): void {
    // Crear un graphics object para dibujar la esfera
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 16);
    graphics.lineStyle(2, 0x008800, 1);
    graphics.strokeCircle(0, 0, 16);

    // Crear una textura desde el graphics
    graphics.generateTexture("playerSphere", 32, 32);
    graphics.destroy();

    // Aplicar la textura al sprite
    this.setTexture("playerSphere");
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys("W,S,A,D") as any;
      this.jumpKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }
  }

  public update(): void {
    if (!this.cursors || !this.wasdKeys || !this.jumpKey) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = this.isSwimming ? this.swimSpeed : this.walkSpeed;

    // Debug: mostrar información del estado cada cierto tiempo
    if (Math.random() < 0.01) {
      const worldGravity = this.scene.physics.world.gravity.y;
      const bodyGravity = body.gravity.y;
      const effectiveGravity = worldGravity + bodyGravity;

      console.log(
        `🎮 Player: pos(${Math.round(this.x)}, ${Math.round(
          this.y
        )}), vel(${Math.round(body.velocity.x)}, ${Math.round(
          body.velocity.y
        )})`
      );
      console.log(
        `📊 Gravedad: mundo=${worldGravity}, cuerpo=${bodyGravity}, efectiva=${effectiveGravity}, swimming=${this.isSwimming}`
      );
    }

    // Movimiento horizontal
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      body.setVelocityX(speed);
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

        // Efecto visual sutil: parpadeo más suave
        this.setAlpha(0.8);
        this.scene.time.delayedCall(80, () => {
          this.setAlpha(1);
        });
      }

      // Aplicar resistencia horizontal más fuerte para movimiento más controlado
      body.setVelocityX(body.velocity.x * 0.88);

      // Cambiar color cuando está nadando (azul más suave)
      this.setTint(0x4499ff);
    } else if (this.isClimbing) {
      // En escaleras, se puede mover verticalmente
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
        body.setVelocityY(-this.climbSpeed);
      } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
        body.setVelocityY(this.climbSpeed);
      } else {
        // Si no se mueve verticalmente, mantener posición
        body.setVelocityY(0);
      }

      // Cambiar color cuando está trepando
      this.setTint(0xffaa00); // Color naranja para trepar
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
        setTimeout(() => {
          this.canJump = true;
        }, 200); // Cooldown del salto
      }

      // Color normal en tierra
      this.setTint(0x00ff00);
    }

    // Detectar si está en el suelo
    this.isOnGround = body.touching.down || body.blocked.down;
  }

  public setSwimming(swimming: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    this.isSwimming = swimming;

    // Si está nadando, no puede estar trepando
    if (swimming) {
      this.isClimbing = false;
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
    } else if (!this.isSwimming) {
      // Restaurar gravedad normal solo si no está nadando
      body.setGravityY(0);
      body.setDragX(400);
      body.setDragY(0);
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
}
