import { MobileControlsSystem } from "../../systems/MobileControlsSystem";
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

  // Sistema de controles móviles
  private mobileControls?: MobileControlsSystem;
  private wasButtonAPressed: boolean = false; // Para detectar tap del botón A (saltar)
  private wasButtonBPressed: boolean = false; // Para detectar tap del botón B (lanzar)
  private isSwimming: boolean = false;
  private isClimbing: boolean = false;
  private swimSpeed: number = 200; // Aumentado de 160 a 200 para nado más rápido
  private flappyImpulse: number = -350; // Impulso más fuerte para salir del agua
  private walkSpeed: number = 280; // Aumentado de 200 a 280
  private climbSpeed: number = 150; // Aumentado de 120 a 150
  private jumpVelocity: number = -500; // Salto más potente
  private doubleJumpVelocity: number = -380; // Segundo salto un poco más fuerte
  private waterDrag: number = 0.8;
  private lastFlappyTime: number = 0;
  private flappyCooldown: number = 200; // Cooldown un poco más largo para evitar spam
  private isOnGround: boolean = false;
  private canJump: boolean = true;
  private hasDoubleJump: boolean = false; // Si ya usó el doble salto
  private wasJumpPressed: boolean = false; // Para detectar nuevo tap de salto
  private lastJumpTime: number = 0; // Timestamp del último salto
  private minJumpDelay: number = 150; // Mínimo 150ms entre saltos para evitar doble tap accidental
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
  private wasJumpKeyDown: boolean = false; // Para detectar cuando se suelta y presiona la tecla
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
  private isControlsActive: boolean = true; // Controla si el jugador puede moverse
  // Sonidos del player
  private jumpSound?: Phaser.Sound.BaseSound;
  private swimSound?: Phaser.Sound.BaseSound;
  private hurtSound?: Phaser.Sound.BaseSound;
  private blowSound?: Phaser.Sound.BaseSound;
  private lastWalkSoundTime: number = 0;
  private walkSoundCooldown: number = 300; // Cooldown para evitar spam del sonido de caminar
  private wasThrowKeyDown: boolean = false; // Para detectar tap en lugar de hold

  // Sistema de SLEEP
  private isSleeping: boolean = false;
  private lastInputTime: number = 0;
  private sleepDelay: number = 5000; // 5 segundos de inactividad
  private sleepZzz?: Phaser.GameObjects.Text;
  private zzZTimer?: Phaser.Time.TimerEvent;
  private isFirstUpdate: boolean = true; // Para inicializar el timer en el primer update

  constructor(scene: Phaser.Scene, x: number, y: number, texture?: string) {
    // Crear el sprite con la textura del pingüino parado
    super(scene, x, y, texture || "penguin_standing");
    // Tamaño del sprite reducido (160x174 original)
    this.setDisplaySize(110, 120); // Reducido ~15% de 130x142, mantiene proporción

    // Añadir al scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar física
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setBounce(0.1, 0.1);
    body.setCollideWorldBounds(true);
    body.setDragX(1200); // Drag más alto para parada más rápida
    body.setMaxVelocity(300, 600);

    // 🎯 Mantener origin en 0.5, 0.5 (centrado) como funcionaba con el sprite original
    this.setOrigin(0.5, 0.5);

    // Hitbox ajustada para colisión perfecta con el suelo
    body.setSize(95, 115); // Hitbox grande
    body.setOffset(17, 53); // Offset para que los pies toquen el suelo correctamente

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

    // Inicializar controles móviles
    this.mobileControls = new MobileControlsSystem(this.scene);
  }
  private setupSounds(): void {
    // Configurar sonidos con volumen bajo y suave
    this.jumpSound = this.scene.sound.add("jump_sound", { volume: 0.1 });
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
    // 🐛 DEBUG: Log cuando se intenta reproducir CROUCH desde cualquier parte
    if (animationKey === "penguin_crouch") {
      const stack = new Error().stack;
      console.log("🎯 INTENTO DE REPRODUCIR CROUCH:", {
        currentAnimation: this.currentAnimation,
        newAnimation: animationKey,
        isPlayingCrouch:
          this.anims.isPlaying && this.currentAnimation === "penguin_crouch",
        callStack: stack?.split("\n").slice(1, 4).join("\n"), // Mostrar las primeras 3 líneas del stack
      });
    }

    // No cambiar animación si está ejecutando THROW o BLOW, excepto para animaciones especiales
    const isSpecialAnimation =
      animationKey === "penguin_climb" || animationKey === "penguin_swing";

    // 🏃‍♂️ PROTEGER animación CROUCH cuando está en transición inicial (primera vez agachándose)
    // Esto previene que se interrumpa antes de completarse
    if (
      this.currentAnimation === "penguin_crouch" &&
      this.anims.isPlaying &&
      animationKey !== "penguin_crouch"
    ) {
      return; // No interrumpir crouch mientras se está reproduciendo
    }

    if (
      !isSpecialAnimation &&
      ((this.isPlayingThrow && animationKey !== "penguin_throw") ||
        (this.isPlayingBlow && animationKey !== "penguin_ghost_blowing"))
    ) {
      return;
    }

    // 🏊 FIX: Si está nadando, proteger la animación de natación
    // No permitir que se cambie a standing u otras animaciones terrestres
    if (this.isSwimming && this.currentAnimation === "penguin_swing") {
      // Solo permitir cambiar a penguin_swing de nuevo (mismo estado)
      // Esto evita que otras animaciones la interrumpan mientras nada
      if (animationKey !== "penguin_swing") {
        return;
      }
    }

    if (this.currentAnimation !== animationKey) {
      this.currentAnimation = animationKey;
      this.play(animationKey);
    }
  }
  public update(): void {
    // Si los controles están desactivados (ej. fin de nivel o modo cinemático), no procesar nada
    const isCinematicMode = this.getData("cinematicMode");
    if (!this.isControlsActive || isCinematicMode) {
      return;
    }

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

    // 💤 SISTEMA DE SLEEP: Detectar inactividad
    const currentTime = this.scene.time.now;

    // Inicializar lastInputTime en el primer update (cuando el jugador realmente está en el nivel)
    if (this.isFirstUpdate) {
      this.lastInputTime = currentTime;
      this.isFirstUpdate = false;
    }

    // Detectar si hay input del usuario
    if (this.hasUserInput()) {
      this.lastInputTime = currentTime;

      // Si estaba durmiendo, despertar
      if (this.isSleeping) {
        this.wakeUp();
      }
    }

    // Si está durmiendo, actualizar posición de ZzZ y no procesar más lógica
    if (this.isSleeping) {
      this.updateSleepZzz();
      body.setVelocityX(0); // No moverse mientras duerme
      return; // No procesar más lógica de movimiento
    }

    // Si no hay input por 5 segundos y está en el suelo sin moverse, dormir
    if (
      currentTime - this.lastInputTime > this.sleepDelay &&
      this.isOnGround &&
      Math.abs(body.velocity.x) < 10 && // Velocidad casi 0
      !this.isSwimming &&
      !this.isClimbing &&
      !this.isCrouching &&
      !this.isGhost
    ) {
      this.startSleep();
      return;
    }

    //  ANTI-EXPLOIT: Marcar que tocó el suelo (para prevenir exploit de cambio de modo)
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
      }
      // Nota: wasOnGroundLastFrame se actualiza al final del método update
    }
    // Manejar lanzamiento de bola de nieve
    this.handleThrow();
    // Manejar agacharse
    this.handleCrouch();
    // 🐛 FIX: Limpiar animación de caída cuando toca el suelo DESPUÉS de handleCrouch
    if (this.isOnGround && !this.wasOnGroundLastFrame) {
      // Resetear banderas de throw y blow al aterrizar para evitar quedarse clavado
      if (this.isPlayingThrow) {
        this.isPlayingThrow = false;
      }
      if (this.isPlayingBlow) {
        this.isPlayingBlow = false;
      }
      // El problema es que el frame visual puede quedarse "colgado" independientemente de la animación
      // Forzar el frame correcto inmediatamente al aterrizar
      if (this.isCrouching) {
        this.anims.stop(); // Parar cualquier animación actual
        // Forzar la animación crouch directamente sin pasar por playAnimation
        this.currentAnimation = "penguin_crouch";
        this.play("penguin_crouch");
        // Cuando termine la animación, mantener el último frame
        this.once("animationcomplete-penguin_crouch", () => {
          this.anims.stop();
          this.setFrame(24); // Frame 24 es el último frame de la animación crouch (nuevo sprite)
          this.updateCrouchHitbox(true);
        });
      } else {
        this.anims.stop(); // Parar cualquier animación actual
        // Si está nadando, mantener animación de nado
        if (this.isSwimming) {
          this.currentAnimation = "penguin_swing";
          this.play("penguin_swing");
        } else {
          // Forzar la animación standing directamente sin pasar por playAnimation
          // para evitar que isPlayingThrow bloquee el cambio
          this.currentAnimation = "penguin_standing";
          this.play("penguin_standing");
        }
      }
    }
    // Debug: mostrar información del estado cada cierto tiempo
    // Movimiento horizontal y animaciones
    // Combinar input de teclado y joystick móvil
    const keyboardLeft = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const keyboardRight = this.cursors.right.isDown || this.wasdKeys.D.isDown;
    const joystickLeft =
      this.mobileControls && this.mobileControls.joystickDirection.x < -0.2; // Más sensible horizontalmente
    const joystickRight =
      this.mobileControls && this.mobileControls.joystickDirection.x > 0.2; // Más sensible horizontalmente

    const isMovingLeft = keyboardLeft || joystickLeft;
    const isMovingRight = keyboardRight || joystickRight;
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
        // Crear partículas de nieve al caminar
        this.createSnowWalkEffect();
        // Reproducir sonido de caminar
        this.playWalkSound();
      }
      // 🏃‍♂️ Si está agachado y moviéndose, mantener CRAWL al girar
      else if (
        this.isCrouching &&
        this.isOnGround &&
        this.currentAnimation === "penguin_crawl"
      ) {
        // Al girar en CRAWL, asegurar que la animación se reinicia para evitar frame estático
        const isActuallyMoving =
          Math.abs(body.velocity.x) > 10 &&
          (body.blocked.none || (!body.blocked.left && !body.blocked.right));

        if (isActuallyMoving) {
          // Reiniciar animación CRAWL al cambiar dirección
          if (!this.anims.isPlaying || this.anims.isPaused) {
            this.playAnimation("penguin_crawl");
          }
        }
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
        // Crear partículas de nieve al caminar
        this.createSnowWalkEffect();
        // Reproducir sonido de caminar
        this.playWalkSound();
      }
      // 🏃‍♂️ Si está agachado y moviéndose, mantener CRAWL al girar
      else if (
        this.isCrouching &&
        this.isOnGround &&
        this.currentAnimation === "penguin_crawl"
      ) {
        // Al girar en CRAWL, asegurar que la animación se reinicia para evitar frame estático
        const isActuallyMoving =
          Math.abs(body.velocity.x) > 10 &&
          (body.blocked.none || (!body.blocked.left && !body.blocked.right));

        if (isActuallyMoving) {
          // Reiniciar animación CRAWL al cambiar dirección
          if (!this.anims.isPlaying || this.anims.isPaused) {
            this.playAnimation("penguin_crawl");
          }
        }
      }
    } else {
      if (!this.isGhost) {
        body.setVelocityX(0);
      }
      if (this.isGhost) {
        this.playAnimation("penguin_ghost_idle");
      } else if (this.isSwimming) {
        // Si está nadando, mantener la animación de nado aunque esté parado
        this.playAnimation("penguin_swing");
      } else if (!this.isCrouching && this.isOnGround && !this.isClimbing) {
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
      // Detectar si se presiona cualquiera de las teclas de nado (teclado o botón móvil)
      const mobileJump =
        this.mobileControls && this.mobileControls.buttonAPressed;
      const isSwimKeyPressed =
        this.cursors.up.isDown ||
        this.wasdKeys.W.isDown ||
        this.jumpKey.isDown ||
        mobileJump;
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
      const keyboardUp = this.cursors.up.isDown || this.wasdKeys.W.isDown;
      const keyboardDown = this.cursors.down.isDown || this.wasdKeys.S.isDown;

      const joystickUp =
        this.mobileControls && this.mobileControls.joystickDirection.y < -0.5;
      const joystickDown =
        this.mobileControls && this.mobileControls.joystickDirection.y > 0.5;

      const isMovingUp = keyboardUp || joystickUp;
      const isMovingDown = keyboardDown || joystickDown;

      if (isMovingUp) {
        body.setVelocityY(-this.climbSpeed);
        if (this.anims.isPaused) {
          this.anims.resume();
        }
        this.playAnimation("penguin_climb");
      } else if (isMovingDown) {
        body.setVelocityY(this.climbSpeed);
        if (this.anims.isPaused) {
          this.anims.resume();
        }
        this.playAnimation("penguin_climb");
      } else {
        // Si no se mueve verticalmente, quedarse estático en la escalera
        body.setVelocityY(0);

        // Detener la animación en el frame actual para quedarse estático
        if (
          this.anims.isPlaying &&
          this.anims.currentAnim?.key === "penguin_climb"
        ) {
          this.anims.pause();
        } else if (
          !this.anims.isPlaying ||
          this.currentAnimation !== "penguin_climb"
        ) {
          this.playAnimation("penguin_climb");
          this.anims.pause();
        }
      }
    } else {
      // En tierra firme - sistema de salto y doble salto

      // Resetear AMBOS saltos cuando toca el suelo
      if (this.isOnGround) {
        this.hasDoubleJump = false; // Resetear doble salto
        this.canJump = true; // Permitir saltar de nuevo
      }

      // Detectar si la tecla de salto fue presionada (nuevo tap) - teclado o móvil
      const mobileJumpJustPressed =
        this.mobileControls &&
        this.mobileControls.buttonAPressed &&
        !this.wasButtonAPressed;
      const jumpJustPressed =
        (this.jumpKey.isDown && !this.wasJumpPressed) || mobileJumpJustPressed;
      const currentTime = this.scene.time.now;
      const enoughTimePassed =
        currentTime - this.lastJumpTime > this.minJumpDelay;

      // Primer salto (desde el suelo)
      // ❌ NO permitir saltar si está en estado CRAWL (agachado)
      if (
        jumpJustPressed &&
        this.isOnGround &&
        this.canJump &&
        enoughTimePassed &&
        !this.isCrouching // ← NUEVO: Bloquear salto en CRAWL
      ) {
        body.setVelocityY(this.jumpVelocity);
        this.canJump = false;
        this.hasDoubleJump = false; // Resetear el doble salto al saltar
        this.lastJumpTime = currentTime; // Registrar tiempo del salto
        this.playAnimation("penguin_jump");

        // Reproducir sonido de salto
        if (!this.isGhost && this.jumpSound) {
          this.jumpSound.play();
        } else if (this.isGhost && this.swimSound) {
          this.swimSound.play();
        }

        setTimeout(() => {
          this.canJump = true;
        }, 200); // Cooldown del salto
      }
      // Doble salto (en el aire) - detectar nuevo tap mientras está en el aire
      // ❌ NO permitir doble salto si está en estado CRAWL
      else if (
        jumpJustPressed &&
        !this.isOnGround &&
        !this.hasDoubleJump &&
        enoughTimePassed &&
        !this.isCrouching // ← NUEVO: Bloquear doble salto en CRAWL
      ) {
        body.setVelocityY(this.doubleJumpVelocity); // Salto más pequeño
        this.hasDoubleJump = true; // Marcar que ya usó el doble salto
        this.lastJumpTime = currentTime; // Registrar tiempo del segundo salto
        this.playAnimation("penguin_jump");

        // Reproducir sonido de salto
        if (!this.isGhost && this.jumpSound) {
          this.jumpSound.play();
        }
      }

      // Actualizar estado de la tecla de salto para el próximo frame
      this.wasJumpPressed = this.jumpKey.isDown;
      if (this.mobileControls) {
        this.wasButtonAPressed = this.mobileControls.buttonAPressed;
      }

      // 🐛 FIX: Mantener animación de salto si está subiendo rápidamente
      if (body.velocity.y < -200 && !this.isOnGround) {
        this.playAnimation("penguin_jump");
      }
      // Animación de caída - pero cambiar a swim si estamos en agua
      // 🏃‍♂️ NO interferir si está en modo CRAWL
      // ⛔ IMPORTANTE: Solo activar FALL si está en el aire Y no está agachado
      if (
        body.velocity.y > 50 &&
        !this.isOnGround &&
        !this.isCrouching &&
        !this.isSwimming
      ) {
        // Restaurar el cuerpo físico original SOLO si no está en CRAWL
        body.setSize(95, 115); // Hitbox original
        body.setOffset(17, 53); // Offset original (27 + 26)
        this.playAnimation("penguin_fall");
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
    // Detectar tap de la tecla E o botón B móvil (presionada ahora pero no estaba presionada antes)
    const mobileThrowJustPressed =
      this.mobileControls &&
      this.mobileControls.buttonBPressed &&
      !this.wasButtonBPressed;
    const isThrowKeyJustPressed =
      (this.throwKey!.isDown && !this.wasThrowKeyDown) ||
      mobileThrowJustPressed;
    if (isThrowKeyJustPressed) {
      if (this.isGhost) {
        // BLOW: Se puede usar en movimiento, solo requiere cooldown (como snowball)
        const canUseBlow =
          this.canBlow &&
          currentTime - this.lastBlowTime > this.blowCooldown &&
          !this.isSwimming && // No en agua
          !this.isClimbing; // No escalando
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
        // SNOWBALL: No la podemos usar nadando, escalando, agachado o gateando
        const canUseSnowball =
          this.canThrow &&
          currentTime - this.lastThrowTime > this.throwCooldown &&
          !this.isSwimming && // No en agua
          !this.isClimbing && // No escalando
          !this.isCrouching && // No agachado (crouch/crawl)
          this.currentAnimation !== "penguin_crawl"; // No gateando
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
    if (this.mobileControls) {
      this.wasButtonBPressed = this.mobileControls.buttonBPressed;
    }
  }
  private handleCrouch(): void {
    // 🪜 PRIORIDAD: Si estamos escalando, NO procesar crouch en absoluto
    // (isClimbing ya está actualizado porque playerStateManager.update() se ejecuta primero)
    if (this.isClimbing) {
      this.isCrouching = false;
      return;
    }

    // 🎯 CROUCH mientras te mueves: Permitir agacharse con DOWN/S incluso si te mueves
    // PERO: No activar si SOLO empujas contra una pared (sin DOWN)
    const keyboardLeft = this.cursors!.left.isDown || this.wasdKeys!.A.isDown;
    const keyboardRight = this.cursors!.right.isDown || this.wasdKeys!.D.isDown;
    const keyboardDown = this.cursors!.down.isDown || this.wasdKeys!.S.isDown;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // CROUCH si:
    // 1. Se presiona DOWN/S o SHIFT (crouchKey) - puede estar moviéndose
    // 2. NO se está escalando (ya verificado arriba)
    const keyboardCrouch = this.crouchKey!.isDown || keyboardDown;

    // Para joystick: Permitir movimiento lateral mientras se agacha
    // Solo verificar que haya suficiente presión hacia abajo
    const joystickCrouch =
      this.mobileControls && this.mobileControls.joystickDirection.y > 0.5; // Presión vertical hacia abajo

    const isCrouchPressed = keyboardCrouch || joystickCrouch;
    const wasCrouching = this.isCrouching;

    // ✅ LÓGICA DE CROUCH CON DETECCIÓN DE TECHO
    // Solo verificar techo cuando intenta LEVANTARSE desde CRAWL
    const wantsToStand = !isCrouchPressed && wasCrouching && this.isOnGround;

    if (wantsToStand) {
      // 🏠 Está agachado e intenta levantarse: verificar si hay espacio
      const hasCeilingAbove = this.checkCeilingCollision();

      if (hasCeilingAbove) {
        // ❌ HAY TECHO: No puede levantarse, mantener agachado
        this.isCrouching = true;
      } else {
        // ✅ NO HAY TECHO: Puede levantarse normalmente
        this.isCrouching = false;
      }
    } else {
      // ✅ Lógica normal: agacharse solo con input explícito + en el suelo
      // NO se activa automáticamente por techo ni en el aire
      this.isCrouching = !!(isCrouchPressed && this.isOnGround);
    }

    if (
      this.isCrouching &&
      this.isOnGround &&
      !this.isSwimming &&
      !this.isClimbing
    ) {
      // Solo iniciar animación si no estaba agachado antes
      if (!wasCrouching) {
        // 🎬 SIEMPRE reproducir la animación crouch primero (incluso en movimiento)
        this.playAnimation("penguin_crouch");
        // Cuando termine la animación crouch, cambiar a crawl si se está moviendo
        this.once("animationcomplete-penguin_crouch", () => {
          // 🏃‍♂️ ALTURA REDUCIDA: Cambiar hitbox cuando está en CRAWL
          this.updateCrouchHitbox(true);
          // Si se está moviendo Y presionando agacharse, reproducir animación crawl
          const body = this.body as Phaser.Physics.Arcade.Body;
          const hasVelocity = Math.abs(body.velocity.x) > 10;

          // Detectar si está empujando una pared en la dirección del movimiento
          const isPushingWall =
            (body.velocity.x > 10 && body.blocked.right) || // Empujando pared derecha
            (body.velocity.x < -10 && body.blocked.left); // Empujando pared izquierda

          const isActuallyMoving = hasVelocity && !isPushingWall;

          if (isActuallyMoving && isCrouchPressed) {
            this.playAnimation("penguin_crawl");
          } else {
            // Si está quieto o empujando pared, quedarse en el último frame de crouch
            this.anims.stop();
            this.setFrame(24); // Frame 24 es el último frame de la animación crouch
          }
        });
      } else {
        // Si ya está agachado, mostrar crawl si se mueve o standing si está quieto
        const body = this.body as Phaser.Physics.Arcade.Body;

        // 🚫 NO activar CRAWL si está empujando una pared
        // Verificar que realmente se está moviendo (no solo tiene velocidad por input)
        const hasVelocity = Math.abs(body.velocity.x) > 10;

        // Detectar si está empujando una pared en la dirección del movimiento
        const isPushingWall =
          (body.velocity.x > 10 && body.blocked.right) || // Empujando pared derecha
          (body.velocity.x < -10 && body.blocked.left); // Empujando pared izquierda

        const isActuallyMoving = hasVelocity && !isPushingWall;

        if (isPushingWall && isCrouchPressed) {
          // 🚫 Si está empujando pared, mostrar animación WALK normal (no CRAWL ni CROUCH)
          this.playAnimation("penguin_walk");
        } else if (isActuallyMoving && isCrouchPressed) {
          // Solo CRAWL si presiona agacharse Y se está moviendo libremente
          // 🏃‍♂️ Mantener animación CRAWL activa mientras se mueve agachado
          if (this.currentAnimation !== "penguin_crawl") {
            // Iniciar CRAWL si no está activo
            this.updateCrouchHitbox(true);
            this.playAnimation("penguin_crawl");
          }
          // Si ya está en CRAWL, asegurar que la animación está reproduciéndose (no parada)
          else if (!this.anims.isPlaying) {
            this.playAnimation("penguin_crawl");
          }
        } else if (!hasVelocity) {
          // Solo mantener frame estático si está completamente quieto (sin velocity)
          if (this.currentAnimation === "penguin_crawl") {
            this.anims.stop();
            this.setFrame(24); // Último frame de crouch para estar quieto agachado
          }
        }
      }
      // Reducir la velocidad al agacharse
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (Math.abs(body.velocity.x) > 0) {
        body.setVelocityX(body.velocity.x * 0.5);
      }
    } else if (!this.isCrouching && wasCrouching) {
      // Solo cuando deja de agacharse (cambio de estado)
      // Si está nadando, mantener animación de nado
      if (this.isSwimming) {
        this.playAnimation("penguin_swing");
      } else {
        this.playAnimation("penguin_standing");
      }
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
      const originalHeight = 115;
      const crouchHeight = 58; // Aproximadamente mitad de la altura
      const heightDifference = originalHeight - crouchHeight;
      body.setSize(95, crouchHeight); // Ancho igual, altura reducida
      body.setOffset(17, 53 + heightDifference); // Mover el hitbox hacia arriba para que los pies queden igual
    } else {
      // Restaurar configuración original del constructor
      body.setSize(95, 115);
      body.setOffset(17, 53); // 27 + 26 = 53
    }
  }

  /**
   * 🏠 Verificar si hay un techo (tile con colisión) encima del jugador
   * Detecta si el jugador puede levantarse o debe permanecer agachado
   */
  private checkCeilingCollision(): boolean {
    const surfaceLayer = (this.scene as any).surfaceLayer;
    if (!surfaceLayer) return false;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // 🎯 FIX: Solo detectar techo ARRIBA, no paredes laterales
    // Calcular la posición donde estaría la cabeza si se levanta (altura normal)
    const normalHeight = 110;
    const headY = this.y - normalHeight / 2; // Parte superior del hitbox normal

    // 🔍 IMPORTANTE: Usar solo puntos que estén dentro del ancho del cuerpo actual
    // para evitar detectar paredes laterales como techos
    const bodyWidth = 40; // Ancho del cuerpo del jugador
    const checkPoints = [
      { x: this.x - bodyWidth / 3, y: headY }, // Izquierda (dentro del cuerpo)
      { x: this.x, y: headY }, // Centro
      { x: this.x + bodyWidth / 3, y: headY }, // Derecha (dentro del cuerpo)
    ];

    // 🐛 DEBUG: Registrar cuando se detecta techo
    let ceilingDetected = false;
    let detectionDetails: any[] = [];

    for (const point of checkPoints) {
      const tile = surfaceLayer.getTileAtWorldXY(point.x, point.y, true);
      if (tile && tile.properties?.collision === true) {
        ceilingDetected = true;
        detectionDetails.push({
          tileX: tile.x,
          tileY: tile.y,
          pointX: point.x.toFixed(0),
          pointY: point.y.toFixed(0),
          playerY: this.y.toFixed(0),
        });
      }
    }

    // Log solo cuando se detecta techo
    if (ceilingDetected) {
      console.log("🏠 TECHO DETECTADO:", {
        playerPos: { x: this.x.toFixed(0), y: this.y.toFixed(0) },
        headY: headY.toFixed(0),
        checkPoints: detectionDetails,
        bodyBlocked: {
          up: body.blocked.up,
          left: body.blocked.left,
          right: body.blocked.right,
        },
      });
    }

    return ceilingDetected;
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
    // Seguridad: resetear la bandera después de un tiempo máximo
    // La animación de throw no debería durar más de 500ms
    this.scene.time.delayedCall(500, () => {
      if (this.isPlayingThrow) {
        this.isPlayingThrow = false;
      }
    });
    // Crear la bola de nieve con un pequeño retraso para sincronizar con la animación
    // La bola aparece cuando el pingüino está en medio del lanzamiento
    this.scene.time.delayedCall(300, () => {
      const direction = this.isFacingRight ? 1 : -1;
      const offsetX = direction * 30; // Reducido de 50 a 30 para estar más cerca del player
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
        this.y - 20, // Reducido de -30 a -20 para estar más cerca verticalmente
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
    // Notificar a la escena sobre el soplido (para destruir muros de nieve)
    this.scene.events.emit("playerBlowing");
    // Escuchar cuando termine la animación
    this.once("animationcomplete-penguin_ghost_blowing", () => {
      this.isPlayingBlow = false;
    });
    // Seguridad: resetear la bandera después de un tiempo máximo
    this.scene.time.delayedCall(600, () => {
      if (this.isPlayingBlow) {
        this.isPlayingBlow = false;
      }
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
   * Crear efecto de burbujas de humo/polvo de nieve al caminar
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

    // EFECTO 1: Burbujas de humo/polvo que flotan hacia arriba
    const smokeParticles = this.scene.add.particles(
      footX,
      footY - 5,
      "snow_particle",
      {
        speed: { min: 20, max: 50 },
        scale: { start: 0.4, end: 1.8 }, // Empiezan pequeñas y se expanden como burbujas
        alpha: { start: 0.7, end: 0 }, // Se desvanecen gradualmente
        lifespan: { min: 600, max: 1000 },
        quantity: { min: 4, max: 6 },
        angle: { min: -60, max: -120 }, // Hacia arriba con variación
        gravityY: -80, // Flotan hacia arriba
        frequency: -1, // Solo emite una vez
        tint: [0xffffff, 0xe8f4ff, 0xd0e8ff], // Tonos blancos/azulados
        rotate: { min: 0, max: 360 }, // Rotación para efecto de humo
        emitting: false,
      }
    );

    // EFECTO 2: Pequeñas partículas de polvo que se dispersan lateralmente
    const dustParticles = this.scene.add.particles(
      footX,
      footY,
      "snow_particle",
      {
        speed: { min: 30, max: 80 },
        scale: { start: 0.3, end: 0.8 }, // Crecen ligeramente
        alpha: { start: 0.6, end: 0 },
        lifespan: { min: 400, max: 700 },
        quantity: { min: 5, max: 8 },
        // Se dispersan hacia los lados y ligeramente hacia arriba
        angle: this.isFacingRight
          ? { min: 120, max: 180 } // Hacia atrás-izquierda si mira derecha
          : { min: 0, max: 60 }, // Hacia atrás-derecha si mira izquierda
        gravityY: -30, // Ligeramente hacia arriba
        frequency: -1,
        tint: [0xffffff, 0xf5f5f5, 0xe0e0e0],
        emitting: false,
      }
    );

    // EFECTO 3: Burbujas de nieve que flotan y se expanden suavemente
    const bubbleParticles = this.scene.add.particles(
      footX,
      footY - 8,
      "snow_particle",
      {
        speed: { min: 10, max: 30 },
        scale: { start: 0.5, end: 2.2 }, // Se expanden como burbujas grandes
        alpha: { start: 0.5, end: 0 }, // Muy translúcidas
        lifespan: { min: 800, max: 1200 },
        quantity: { min: 2, max: 4 },
        angle: { min: -80, max: -100 }, // Mayormente hacia arriba
        gravityY: -60, // Flotan suavemente
        frequency: -1,
        tint: [0xffffff, 0xf0f8ff],
        rotate: { min: -180, max: 180 }, // Rotación lenta
        emitting: false,
      }
    );

    // Emitir las partículas una sola vez
    smokeParticles.explode();
    dustParticles.explode();
    bubbleParticles.explode();

    // Destruir los emisores después de que terminen
    this.scene.time.delayedCall(1300, () => {
      smokeParticles.destroy();
      dustParticles.destroy();
      bubbleParticles.destroy();
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

    const wasSwimming = this.isSwimming;
    this.isSwimming = swimming;

    // Si está nadando, no puede estar trepando
    if (swimming) {
      this.isClimbing = false;
      // Reactivar colisiones cuando entra al agua (por si venía de climbing)
      if (this.collider) {
        this.collider.active = true;
      }

      // Cambiar INMEDIATAMENTE a animación de nado al entrar al agua
      if (!wasSwimming) {
        this.playAnimation("penguin_swing");
      }
    } else if (wasSwimming) {
      // Al salir del agua, dar un impulso hacia arriba para asegurar buena salida
      body.setVelocityY(-350); // Impulso de salida del agua

      // Cambiar INMEDIATAMENTE a standing o la animación que corresponda
      if (this.isOnGround) {
        this.playAnimation("penguin_standing");
      } else {
        // Al salir del agua, usar animación de salto
        this.playAnimation("penguin_jump");
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
   * Método llamado cuando el player recibe daño de un enemigo
   * Incluye repeler y llamar a hit()
   */
  public takeDamage(enemyX?: number): void {
    if (this.isInvulnerable) return;
    // Llamar a hit para aplicar daño, sonido y efectos visuales
    this.hit();
    // Repeler al player hacia atrás si se proporciona la posición del enemigo
    if (enemyX !== undefined) {
      const repelForce = 300;
      const direction = this.x > enemyX ? 1 : -1;
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).setVelocityX(
          direction * repelForce
        );
        (this.body as Phaser.Physics.Arcade.Body).setVelocityY(-200); // Pequeño salto hacia arriba
      }
    }
  }
  /**
   * Manejar movimiento en modo fantasma
   */
  private handleGhostMovement(body: Phaser.Physics.Arcade.Body): void {
    const currentTime = this.scene.time.now;
    // Solo SPACE para saltos fantasma - tap normal
    const isJumpKeyPressed = this.jumpKey!.isDown;
    // Detectar cuando se suelta la tecla de salto
    if (!isJumpKeyPressed && this.wasJumpKeyDown) {
      this.wasJumpKeyDown = false;
    }
    // Sistema de salto fantasma simple (tap) - requiere que se suelte y presione la tecla
    if (
      isJumpKeyPressed &&
      !this.wasJumpKeyDown && // Nueva condición: solo si la tecla no estaba presionada antes
      this.ghostJumpsRemaining > 0 &&
      currentTime - this.lastGhostFlappyTime > this.ghostFlappyCooldown
    ) {
      // Aplicar impulso fijo
      body.setVelocityY(this.ghostImpulse);
      this.lastGhostFlappyTime = currentTime;
      this.wasJumpKeyDown = true; // Marcar tecla como presionada
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
      } else {
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
   * Activar o desactivar los controles del jugador
   * @param active - true para activar controles, false para desactivarlos
   */
  public setControlsActive(active: boolean): void {
    this.isControlsActive = active;

    // Si se desactivan los controles, detener el movimiento
    if (!active && this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
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
    this.activeTimers.forEach((timer) => {
      if (timer && !timer.hasDispatched) {
        timer.destroy();
      }
    });
    this.activeTimers = [];
  }
  /**
   * Resetear completamente el jugador para reinicio de nivel
   */
  public resetForRestart(): void {
    // Cancelar todos los timers pendientes del jugador
    this.cancelAllPlayerTimers();
    // Resetear estado de invulnerabilidad
    this.isInvulnerable = false;
    // Resetear saltos fantasma
    this.ghostJumpsRemaining = this.maxGhostJumps;
    // Resetear doble salto
    this.hasDoubleJump = false;
    this.wasJumpPressed = false;
    // Reactivar controles del jugador
    this.isControlsActive = true;
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
  }
  /**
   * Manejar contacto del fantasma con el agua
   */
  private handleGhostWaterContact(): void {
    // Evitar múltiples activaciones
    if (this.isInvulnerable) return;
    // Hacer al jugador invulnerable temporalmente
    this.isInvulnerable = true;
    // Crear efecto de parpadeo igual que cuando pierde vida normal
    this.createHitEffect();
    // 1. Encontrar y mover a superficie más cercana inmediatamente
    const moveTimer = this.scene.time.delayedCall(50, () => {
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
      this.setGhostMode(true);
    }
    // 🔒 ANTI-EXPLOIT: Solo resetear saltos si está en el suelo Y ha tocado suelo desde último cambio
    if (this.isOnGround && this.hasTouchedGroundSinceLastModeChange) {
      this.ghostJumpsRemaining = this.maxGhostJumps;
    } else {
    }
  }
  /**
   * Mover al jugador a la superficie más cercana
   */
  private moveToNearestSurface(): void {
    const tilemap = (this.scene as any).tilemap;
    const surfaceLayer = (this.scene as any).surfaceLayer;
    if (!tilemap || !surfaceLayer) {
      // Fallback: mover a posición de inicio del nivel
      const startPos = this.findStartPosition(tilemap, surfaceLayer);
      this.setPosition(startPos.x, startPos.y);
      return;
    }
    // Convertir posición actual a coordenadas de tile
    const currentTileX = Math.floor(this.x / tilemap.tileWidth);
    const currentTileY = Math.floor(this.y / tilemap.tileHeight);
    let bestPosition = this.findBestSurfacePosition(
      tilemap,
      surfaceLayer,
      currentTileX,
      currentTileY
    );
    if (bestPosition) {
      this.setPosition(bestPosition.x, bestPosition.y);
      // Asegurar que el jugador esté completamente fuera del agua
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    } else {
      // Si todo falla, usar la posición de inicio del nivel
      const startPos = this.findStartPosition(tilemap, surfaceLayer);
      this.setPosition(startPos.x, startPos.y);
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
    // PASO 1: Buscar primero hacia los lados en el mismo nivel (prioridad alta)
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
      const worldX = tileX * tilemap.tileWidth + tilemap.tileWidth / 2;
      const worldY = tileY * tilemap.tileHeight - 50; // Un poco encima del tile
      return { x: worldX, y: worldY };
    } else {
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
   * Muestra u oculta los controles móviles
   */
  public setMobileControlsVisible(visible: boolean): void {
    if (this.mobileControls) {
      this.mobileControls.setVisible(visible);
    }
  }

  /**
   * Activar estado de sleep (dormido)
   */
  private startSleep(): void {
    if (this.isSleeping) return;

    this.isSleeping = true;
    this.playAnimation("penguin_sleep");

    // Crear texto de ZzZ flotante
    this.createSleepZzz();
  }

  /**
   * Despertar del estado de sleep
   */
  private wakeUp(): void {
    if (!this.isSleeping) return;

    this.isSleeping = false;
    this.playAnimation("penguin_standing");

    // Eliminar ZzZ
    if (this.sleepZzz) {
      this.sleepZzz.destroy();
      this.sleepZzz = undefined;
    }

    if (this.zzZTimer) {
      this.zzZTimer.destroy();
      this.zzZTimer = undefined;
    }
  }

  /**
   * Crear efecto visual de ZzZ sobre el pingüino
   */
  private createSleepZzz(): void {
    // Eliminar ZzZ anterior si existe
    if (this.sleepZzz) {
      this.sleepZzz.destroy();
    }
    if (this.zzZTimer) {
      this.zzZTimer.destroy();
    }

    // Crear texto inicial
    this.sleepZzz = this.scene.add.text(this.x, this.y - 80, "z", {
      fontFamily: "Arial",
      fontSize: "32px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.sleepZzz.setOrigin(0.5, 0.5);
    this.sleepZzz.setDepth(this.depth + 1);

    // Animación de las ZzZ (alternar entre z, zZ, zzZ)
    let zzZState = 0;
    const zzZTexts = ["z", "zZ", "zzZ"];

    this.zzZTimer = this.scene.time.addEvent({
      delay: 600,
      callback: () => {
        if (this.sleepZzz && this.isSleeping) {
          zzZState = (zzZState + 1) % zzZTexts.length;
          this.sleepZzz.setText(zzZTexts[zzZState]);

          // Animar ZzZ flotando hacia arriba
          this.scene.tweens.add({
            targets: this.sleepZzz,
            y: this.y - 80 - 15,
            alpha: 0.3,
            duration: 600,
            ease: "Sine.easeOut",
            onComplete: () => {
              if (this.sleepZzz) {
                this.sleepZzz.setY(this.y - 80);
                this.sleepZzz.setAlpha(1);
              }
            },
          });
        }
      },
      loop: true,
    });

    // Agregar a la lista de timers activos
    this.activeTimers.push(this.zzZTimer);
  }

  /**
   * Actualizar posición de ZzZ cuando el jugador se mueve
   */
  private updateSleepZzz(): void {
    if (this.sleepZzz && this.isSleeping) {
      // Mantener ZzZ sobre el pingüino
      this.sleepZzz.setX(this.x);
      // No actualizar Y porque está animándose
    }
  }

  /**
   * Detectar si hay input del usuario (teclado, mouse, joystick)
   */
  private hasUserInput(): boolean {
    if (!this.cursors || !this.wasdKeys) return false;

    // Detectar input de teclado
    const keyboardInput =
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown ||
      this.cursors.down.isDown ||
      this.wasdKeys.W.isDown ||
      this.wasdKeys.A.isDown ||
      this.wasdKeys.S.isDown ||
      this.wasdKeys.D.isDown ||
      this.jumpKey?.isDown ||
      this.throwKey?.isDown ||
      this.crouchKey?.isDown;

    // Detectar input de joystick/botones móviles
    const mobileInput =
      this.mobileControls &&
      (this.mobileControls.joystickDirection.x !== 0 ||
        this.mobileControls.joystickDirection.y !== 0 ||
        this.mobileControls.buttonAPressed ||
        this.mobileControls.buttonBPressed);

    return keyboardInput || mobileInput || false;
  }

  /**
   * Limpia los recursos del player
   */
  public destroy(fromScene?: boolean): void {
    // Limpiar sistema de sleep
    if (this.sleepZzz) {
      this.sleepZzz.destroy();
      this.sleepZzz = undefined;
    }
    if (this.zzZTimer) {
      this.zzZTimer.destroy();
      this.zzZTimer = undefined;
    }

    // Limpiar controles móviles
    if (this.mobileControls) {
      this.mobileControls.destroy();
    }

    // Limpiar timers activos
    this.activeTimers.forEach((timer) => {
      if (timer) {
        timer.destroy();
      }
    });
    this.activeTimers = [];

    // Llamar al destroy del padre
    super.destroy(fromScene);
  }
}
