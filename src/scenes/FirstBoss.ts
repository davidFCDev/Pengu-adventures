// You can write more code here

/* START OF COMPILED CODE */

import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

/**
 * FirstBoss - Nivel del primer jefe (Boss Bat)
 * Este es un nivel especial que solo usa la capa "superficies"
 * y presenta un jefe murciélago con mecánicas especiales
 */
class FirstBoss extends BaseGameScene {
  private firstBoss!: Phaser.Tilemaps.Tilemap;
  private bossBat!: Phaser.GameObjects.Sprite;
  private confusedSprite?: Phaser.GameObjects.Sprite; // Sprite de confusión sobre el boss
  private bossWakeTimer?: Phaser.Time.TimerEvent;

  // Propiedades de movimiento del boss
  private bossSpeed: number = 100; // Velocidad de movimiento horizontal
  private bossDirection: number = 1; // 1 = derecha, -1 = izquierda
  private bossMinX: number = 100; // Límite izquierdo
  private bossMaxX: number = 668; // Límite derecho (768 - 100)
  private bossIsActive: boolean = false; // Si el boss está en modo batalla

  // Propiedades del ataque de caída en picado
  private bossAttackTimer?: Phaser.Time.TimerEvent;
  private isAttacking: boolean = false; // Si está ejecutando el ataque
  private attackSpeed: number = 600; // Velocidad de caída en picado
  private bossOriginalY: number = 0; // Posición Y original para volver
  private attackTargetX: number = 0; // Posición X objetivo del ataque
  private hasHitPlayer: boolean = false; // Si ya golpeó al jugador en este ataque
  private isStunned: boolean = false; // Si el boss está aturdido
  private stunnedTimer?: Phaser.Time.TimerEvent; // Timer de aturdimiento

  // Propiedades del ataque de gotas ácidas
  private acidDropTimer?: Phaser.Time.TimerEvent; // Timer para soltar gotas
  private acidDrops!: Phaser.Physics.Arcade.Group; // Grupo de gotas

  // Propiedades de la bola de nieve rodante
  private rollingSnowball?: Phaser.Physics.Arcade.Sprite; // Bola de nieve activa
  private snowballTimer?: Phaser.Time.TimerEvent; // Timer para iniciar bolas de nieve
  private snowballParticles?: Phaser.GameObjects.Particles.ParticleEmitter; // Partículas de nieve
  private hasSnowballStarted: boolean = false; // Si ya se activó el sistema
  private battleStartTime: number = 0; // Tiempo de inicio de la batalla
  private snowballSpeed: number = 150; // Velocidad inicial de las bolas

  // Propiedades de audio
  private bossMusic?: Phaser.Sound.BaseSound; // Música del boss
  private bossWakeSound?: Phaser.Sound.BaseSound; // Sonido de despertar del boss
  private bossConfusedSound?: Phaser.Sound.BaseSound; // Sonido de confusión del boss

  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "FirstBoss",
      surfaceLayerName: "superficies",
      backgroundLayerName: "", // No hay capa de fondo en tilemap
      objectsLayerName: "", // No hay capa de objetos
      tilesets: [
        {
          name: "spritesheet-backgrounds-default",
          imageKey: "spritesheet-backgrounds-default",
        },
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
      ],
      // El player se buscará automáticamente desde el tilemap
      playerStartPosition: { x: 100, y: 960 }, // Fallback si no se encuentra
      musicKey: "", // Sin música automática - la música del boss se inicia manualmente
      // Sin sistemas adicionales - solo player vs boss
      enableSpikeBoxes: false,
      enableTemporaryPlatforms: false,
      enableElevators: false,
      enableJumpButtons: false,
      enableRedButtons: false,
      enableSnow: false, // Sin nieve en el nivel del boss
      showUICounters: false, // Sin contadores de monedas, llaves y mini-pingus
      bossName: "BAT BOSS", // Mostrar barra de salud del boss en el header
    };
    super("FirstBoss", config);

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {
    // Calcular offset para alinear el tilemap en la parte inferior de la pantalla
    // Canvas: 720×1080, Tilemap: 768×1024
    // Offset Y = 1080 - 1024 = 56px (espacio arriba)
    const offsetY = 1080 - 1024; // 56px

    // image_1 - Fondo del nivel (768×1024px, alineado abajo)
    const image_1 = this.add.image(384, offsetY + 512, "fondo-boss1");
    image_1.setOrigin(0.5, 0.5); // Centrado
    image_1.setDepth(-10); // Asegurar que esté detrás de todo

    // firstBoss - Tilemap principal (alineado a la parte inferior)
    const firstBoss = this.add.tilemap("FirstBoss");
    firstBoss.addTilesetImage(
      "spritesheet-backgrounds-default",
      "spritesheet-backgrounds-default"
    );
    firstBoss.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default"
    );

    // superficies - Layer de colisiones (única capa del nivel)
    const superficies_1 = firstBoss.createLayer(
      "superficies",
      ["spritesheet-tiles-default"],
      0,
      offsetY // Desplazar hacia abajo para alinear con la base de la pantalla
    );

    // Boss Bat - Sprite del jefe (empieza en frame 10 - primer frame de WAKE)
    // Ajustar posición Y con el offset
    const bossBat = this.add.sprite(
      384,
      offsetY + 192,
      "boss-bat-spritesheet",
      10
    );
    bossBat.scaleX = 0.65;
    bossBat.scaleY = 0.65;
    bossBat.setDepth(10); // Por encima del player

    this.firstBoss = firstBoss;
    this.bossBat = bossBat;

    this.events.emit("scene-awake");
  }

  /**
   * Método requerido por BaseGameScene
   * Crear el mapa y asignar los layers
   */
  protected createMap(): void {
    // El mapa ya se creó en editorCreate(), solo asignamos referencias
    this.tilemap = this.firstBoss;

    // El layer de superficies ya fue creado en editorCreate()
    // Solo necesitamos obtener la referencia
    this.surfaceLayer = this.tilemap.getLayer("superficies")!
      .tilemapLayer as Phaser.Tilemaps.TilemapLayer;

    // Habilitar colisiones en el layer de superficies
    if (this.surfaceLayer) {
      this.surfaceLayer.setCollisionByProperty({ collides: true });
      console.log(
        "✅ FirstBoss: Layer de superficies configurado con colisiones"
      );
    }

    // Configurar límites del mundo de físicas alineado con el offset
    const offsetY = 1080 - 1024; // 56px
    this.physics.world.setBounds(0, offsetY, 768, 1024);
  }

  /**
   * Método create principal
   */
  create() {
    console.log("🎮 FirstBoss: Iniciando nivel del jefe...");

    // Llamar al editorCreate primero
    this.editorCreate();

    // Crear animaciones del boss
    this.createBossAnimations();

    // Inicializar grupo de gotas ácidas
    this.acidDrops = this.physics.add.group();

    // Llamar al create de BaseGameScene para configurar player, cámara, etc.
    super.create();

    // Configurar colisiones de gotas ácidas con el suelo
    this.physics.add.collider(this.acidDrops, this.surfaceLayer!, (drop) => {
      const acidDrop = drop as Phaser.Physics.Arcade.Sprite;
      // Efecto de explosión en el suelo
      this.createAcidSplash(acidDrop.x, acidDrop.y);
      acidDrop.destroy();
    });

    // Configurar colisión de gotas con el jugador
    this.physics.add.overlap(this.acidDrops, this.player, (player, drop) => {
      const acidDrop = drop as Phaser.Physics.Arcade.Sprite;
      if (!acidDrop.active) return;
      console.log("💥 Jugador golpeado por gota ácida");

      // Efecto de explosión en el jugador
      this.createAcidSplash(acidDrop.x, acidDrop.y, true);

      this.player.takeDamage(acidDrop.x);
      acidDrop.destroy();
    });

    // Iniciar la secuencia del boss después de mostrar advertencia
    this.bossWakeTimer = this.time.delayedCall(1000, () => {
      this.showWarningMessage();
    });

    console.log("✅ FirstBoss: Nivel iniciado correctamente");
  }

  /**
   * Crear animaciones del Boss Bat
   */
  private createBossAnimations(): void {
    console.log("🎬 Creando animaciones del Boss Bat...");

    // HURT: frames 0-9 (10 frames)
    // Dividir en dos partes: caída (0-4) y recuperación (5-9)

    // HURT FALL: frames 0-4 (caída al suelo)
    if (!this.anims.exists("boss-bat-hurt-fall")) {
      this.anims.create({
        key: "boss-bat-hurt-fall",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
        repeat: 0,
      });
      console.log("✅ Animación boss-bat-hurt-fall creada (frames 0-4)");
    }

    // HURT RECOVER: frames 5-9 (recuperación)
    if (!this.anims.exists("boss-bat-hurt-recover")) {
      this.anims.create({
        key: "boss-bat-hurt-recover",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 5,
          end: 9,
        }),
        frameRate: 10,
        repeat: 0,
      });
      console.log("✅ Animación boss-bat-hurt-recover creada (frames 5-9)");
    }

    // HURT completa: frames 0-9 (para cuando recibe daño del jugador)
    if (!this.anims.exists("boss-bat-hurt")) {
      this.anims.create({
        key: "boss-bat-hurt",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: 0,
      });
      console.log("✅ Animación boss-bat-hurt creada");
    }

    // WAKE: frames 10-18 (9 frames)
    if (!this.anims.exists("boss-bat-wake")) {
      this.anims.create({
        key: "boss-bat-wake",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 10,
          end: 18,
        }),
        frameRate: 10,
        repeat: 0,
      });
      console.log("✅ Animación boss-bat-wake creada");
    }

    // FLYING: frames 20-27 (8 frames)
    if (!this.anims.exists("boss-bat-flying")) {
      this.anims.create({
        key: "boss-bat-flying",
        frames: this.anims.generateFrameNumbers("boss-bat-spritesheet", {
          start: 20,
          end: 27,
        }),
        frameRate: 10,
        repeat: -1, // Loop infinito
      });
      console.log("✅ Animación boss-bat-flying creada");
    }

    // CONFUSED: frames 0-15 (16 frames)
    if (!this.anims.exists("confused-status")) {
      this.anims.create({
        key: "confused-status",
        frames: this.anims.generateFrameNumbers("confused-status-spritesheet", {
          start: 0,
          end: 15,
        }),
        frameRate: 8,
        repeat: -1, // Loop infinito mientras está confuso
      });
      console.log("✅ Animación confused-status creada");
    }

    // DIE: frames 0-3 (4 frames) - Animación de muerte del boss
    if (!this.anims.exists("boss-bat-die")) {
      this.anims.create({
        key: "boss-bat-die",
        frames: this.anims.generateFrameNumbers("boss-bat-die-spritesheet", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: 0, // Solo se reproduce una vez
      });
      console.log("✅ Animación boss-bat-die creada (4 frames)");
    }
  }

  /**
   * Mostrar mensaje de advertencia antes de la batalla
   */
  private showWarningMessage(): void {
    console.log("⚠️ Mostrando mensaje de advertencia");

    // Crear texto "DANGER!" parpadeante centrado en la pantalla
    const dangerText = this.add.text(
      384, // Centro X (768/2)
      540, // Centro Y (1080/2)
      "DANGER!",
      {
        fontFamily: "Arial Black",
        fontSize: "80px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 8,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000",
          blur: 8,
          fill: true,
        },
      }
    );
    dangerText.setOrigin(0.5);
    dangerText.setDepth(1000);

    // Efecto de parpadeo
    this.tweens.add({
      targets: dangerText,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 5, // Parpadea 6 veces
    });

    // Después de 2 segundos, desvanecer y iniciar la batalla
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: dangerText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          dangerText.destroy();
          // Iniciar la batalla del boss
          this.startBossBattle();
        },
      });
    });
  }

  /**
   * Iniciar la batalla del jefe
   */
  private startBossBattle(): void {
    console.log("⚔️ Iniciando batalla del jefe...");
    console.log("🦇 Boss Bat:", this.bossBat);
    console.log("🦇 Boss posición:", this.bossBat?.x, this.bossBat?.y);

    // Guardar tiempo de inicio de la batalla
    this.battleStartTime = this.time.now;

    // Guardar la posición Y original del boss
    this.bossOriginalY = this.bossBat.y;
    console.log("💾 Posición Y original guardada:", this.bossOriginalY);

    // Reproducir animación WAKE
    this.bossBat.play("boss-bat-wake");
    console.log("▶️ Reproduciendo animación WAKE");

    // 🔊 Reproducir sonido de despertar del boss un poco después de iniciar la animación
    this.time.delayedCall(200, () => {
      this.bossWakeSound = this.sound.add("boss_bat_wake");
      this.bossWakeSound.play();
      console.log("🔊 Reproduciendo sonido de despertar del boss");
    });

    // Cuando termine WAKE, cambiar a FLYING
    this.bossBat.once("animationcomplete", () => {
      console.log("🦇 Boss despierto - Iniciando modo FLYING");

      // Cambiar a animación FLYING
      this.bossBat.play("boss-bat-flying");

      // 🎵 Iniciar música del boss después del sonido
      // Esperamos 500ms para que el sonido comience antes de la música
      this.time.delayedCall(500, () => {
        this.bossMusic = this.sound.add("boss_music", {
          loop: true,
          volume: 0.6,
        });
        this.bossMusic.play();
        console.log("🎵 Música del boss iniciada");
      });

      // Activar el movimiento del boss
      this.bossIsActive = true;
      console.log("✅ Boss activado - Iniciando patrón de movimiento");
      console.log("🔢 bossIsActive:", this.bossIsActive);

      // Iniciar el timer de ataques (cada 10 segundos)
      this.startAttackTimer();

      // Iniciar el timer de gotas ácidas (cada 1.5 segundos)
      this.startAcidDropTimer();

      // Iniciar las bolas de nieve rodantes después de 10 segundos
      this.time.delayedCall(10000, () => {
        this.startRollingSnowballs();
      });
    });
  }

  /**
   * Iniciar el timer de ataques periódicos
   */
  private startAttackTimer(): void {
    this.bossAttackTimer = this.time.addEvent({
      delay: 15000, // 15 segundos (antes 10)
      callback: this.executeAttack,
      callbackScope: this,
      loop: true,
    });
    console.log("⏰ Timer de ataques iniciado (cada 15 segundos)");
  }

  /**
   * Iniciar el timer de gotas ácidas
   */
  private startAcidDropTimer(): void {
    this.acidDropTimer = this.time.addEvent({
      delay: 1500, // 1.5 segundos (antes era 2.5)
      callback: this.dropAcid,
      callbackScope: this,
      loop: true,
    });
    console.log("💧 Timer de gotas ácidas iniciado (cada 1.5 segundos)");
  }

  /**
   * Soltar una gota ácida desde la posición del boss
   */
  private dropAcid(): void {
    // Solo soltar gotas si el boss está activo y no está aturdido ni atacando
    if (!this.bossIsActive || this.isStunned || this.isAttacking) return;

    console.log("💚 Boss soltando gota ácida");

    // Crear gráfico de gota REDONDA perfecta
    const dropGraphics = this.add.graphics();
    const centerX = 24; // Centro de la textura 48x48
    const centerY = 24;

    // Sombra (desplazada ligeramente)
    dropGraphics.fillStyle(0x006600, 0.5);
    dropGraphics.fillCircle(centerX + 2, centerY + 2, 20);

    // Círculo principal (verde brillante)
    dropGraphics.fillStyle(0x00ff00, 1);
    dropGraphics.fillCircle(centerX, centerY, 20);

    // Capa de brillo (círculo más pequeño, arriba a la izquierda)
    dropGraphics.fillStyle(0x66ff66, 0.8);
    dropGraphics.fillCircle(centerX - 5, centerY - 5, 10);

    // Punto de luz (reflejo brillante)
    dropGraphics.fillStyle(0xccffcc, 1);
    dropGraphics.fillCircle(centerX - 7, centerY - 7, 5);

    // Convertir a textura de 48x48px (perfectamente cuadrada)
    dropGraphics.generateTexture("acidDrop", 48, 48);
    dropGraphics.destroy();

    // Crear sprite de la gota con físicas
    const drop = this.physics.add.sprite(
      this.bossBat.x,
      this.bossBat.y + 50,
      "acidDrop"
    ) as Phaser.Physics.Arcade.Sprite;

    // Configurar físicas
    drop.setGravityY(500);
    drop.setBounce(0);
    drop.setData("isDrop", true);

    // Configurar cuerpo circular centrado
    if (drop.body) {
      (drop.body as Phaser.Physics.Arcade.Body).setCircle(20, 4, 4);
    }

    // Añadir al grupo
    this.acidDrops.add(drop);

    // Efecto de brillo pulsante
    this.tweens.add({
      targets: drop,
      alpha: 0.85,
      duration: 250,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Crear efecto de explosión de gota ácida con salpicaduras
   */
  private createAcidSplash(
    x: number,
    y: number,
    onPlayer: boolean = false
  ): void {
    console.log("💥 Creando explosión de gota ácida");

    // Crear el círculo central de la explosión (burbuja explotando)
    const splash = this.add.graphics();

    // Dibujar círculo de explosión
    splash.fillStyle(0x00ff00, 0.8);
    splash.fillCircle(x, y, 15);
    splash.fillStyle(0x66ff66, 0.6);
    splash.fillCircle(x, y, 10);
    splash.setDepth(100);

    // Efecto de expansión de la burbuja
    this.tweens.add({
      targets: splash,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onUpdate: (tween) => {
        const progress = tween.progress;
        const scale = 1 + progress * 2; // Expande hasta 3x
        splash.clear();
        splash.fillStyle(0x00ff00, 0.8 * (1 - progress));
        splash.fillCircle(x, y, 15 * scale);
        splash.fillStyle(0x66ff66, 0.6 * (1 - progress));
        splash.fillCircle(x, y, 10 * scale);
      },
      onComplete: () => {
        splash.destroy();
      },
    });

    // Crear salpicaduras (gotas pequeñas que salen en todas direcciones)
    const numSplashes = onPlayer ? 12 : 8; // Más salpicaduras si golpea al jugador

    for (let i = 0; i < numSplashes; i++) {
      const angle = (Math.PI * 2 * i) / numSplashes;
      const speed = Phaser.Math.Between(100, 200);
      const distance = Phaser.Math.Between(30, 60);

      // Crear gota de salpicadura
      const splashDrop = this.add.graphics();
      splashDrop.fillStyle(0x00ff00, 0.9);
      splashDrop.fillCircle(0, 0, Phaser.Math.Between(3, 6));
      splashDrop.setPosition(x, y);
      splashDrop.setDepth(99);

      // Animar la salpicadura
      this.tweens.add({
        targets: splashDrop,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - Phaser.Math.Between(10, 30), // Un poco hacia arriba
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: Phaser.Math.Between(300, 500),
        ease: "Cubic.easeOut",
        onComplete: () => {
          splashDrop.destroy();
        },
      });
    }

    // Efecto de partículas adicionales si golpea al jugador
    if (onPlayer) {
      // Crear anillo de impacto
      const ring = this.add.graphics();
      ring.lineStyle(3, 0x00ff00, 1);
      ring.strokeCircle(x, y, 20);
      ring.setDepth(101);

      this.tweens.add({
        targets: ring,
        alpha: 0,
        duration: 400,
        ease: "Power2",
        onUpdate: (tween) => {
          const progress = tween.progress;
          const scale = 1 + progress * 1.5;
          ring.clear();
          ring.lineStyle(3, 0x00ff00, 1 - progress);
          ring.strokeCircle(x, y, 20 * scale);
        },
        onComplete: () => {
          ring.destroy();
        },
      });
    }
  }

  /**
   * Iniciar el sistema de bolas de nieve rodantes
   */
  private startRollingSnowballs(): void {
    if (this.hasSnowballStarted) return;

    this.hasSnowballStarted = true;
    console.log("⚪ Sistema de bolas de nieve rodantes activado");

    // Lanzar la primera bola inmediatamente
    this.spawnRollingSnowball();
  }

  /**
   * Crear y lanzar una bola de nieve rodante
   */
  private spawnRollingSnowball(): void {
    // Si ya hay una bola activa, no crear otra
    if (this.rollingSnowball && this.rollingSnowball.active) {
      console.log("⚠️ Ya hay una bola de nieve activa");
      return;
    }

    // Calcular tiempo de batalla transcurrido (en segundos)
    const battleTime = (this.time.now - this.battleStartTime) / 1000;

    // Aumentar velocidad progresivamente cada 20 segundos
    // 0-20s: 150px/s, 20-40s: 200px/s, 40-60s: 250px/s, 60s+: 300px/s
    const speedMultiplier = Math.floor(battleTime / 20);
    this.snowballSpeed = 150 + speedMultiplier * 50;
    this.snowballSpeed = Math.min(this.snowballSpeed, 300); // Máximo 300px/s

    // Probabilidad de lanzar 2 bolas seguidas (aumenta con el tiempo)
    // Después de 30s: 30% de probabilidad
    const doubleSnowballChance = battleTime > 30 ? 0.3 : 0;
    const spawnDouble = Math.random() < doubleSnowballChance;

    console.log(
      `⚪ Tiempo de batalla: ${battleTime.toFixed(1)}s | Velocidad: ${
        this.snowballSpeed
      }px/s | Doble: ${spawnDouble}`
    );

    // Decidir aleatoriamente desde qué lado aparece (0 = izquierda, 1 = derecha)
    const fromLeft = Phaser.Math.Between(0, 1) === 0;

    // Posiciones de spawn
    const offsetY = 1080 - 1024; // 56px
    const surfaceY = offsetY + 1024 - 120; // Subido más para que no atraviese la superficie
    const startX = fromLeft ? -80 : 768 + 80; // Fuera de pantalla
    const velocityX = fromLeft ? this.snowballSpeed : -this.snowballSpeed;

    console.log(
      `⚪ Lanzando bola de nieve desde ${
        fromLeft ? "izquierda" : "derecha"
      } en Y=${surfaceY}`
    );

    // Crear la bola de nieve
    this.rollingSnowball = this.physics.add.sprite(
      startX,
      surfaceY,
      "roller-snowball"
    );

    // Configurar físicas
    this.rollingSnowball.setVelocityX(velocityX);
    this.rollingSnowball.setGravityY(0); // Sin gravedad, se mueve sobre el suelo
    this.rollingSnowball.setScale(1.2); // Más grande (1.2x en lugar de 0.8x)
    this.rollingSnowball.setDepth(50);

    // Configurar cuerpo de colisión circular
    if (this.rollingSnowball.body) {
      const body = this.rollingSnowball.body as Phaser.Physics.Arcade.Body;
      body.setCircle(this.rollingSnowball.width / 2);
      body.setAllowGravity(false);
    }

    // Efecto de rotación continua (rodando)
    this.tweens.add({
      targets: this.rollingSnowball,
      angle: fromLeft ? 360 : -360,
      duration: 1500,
      repeat: -1,
      ease: "Linear",
    });

    // Crear sistema de partículas de nieve
    this.createSnowballParticles();

    // Configurar colisión con el jugador
    this.physics.add.overlap(this.rollingSnowball, this.player, () => {
      this.handleSnowballHit();
    });

    // Si se debe lanzar una segunda bola, lanzarla 1.5 segundos después
    if (spawnDouble) {
      console.log("⚪⚪ ¡Bola doble activada! Segunda bola en 1.5s");
      this.time.delayedCall(1500, () => {
        // Crear segunda bola desde el lado opuesto
        const secondStartX = !fromLeft ? -80 : 768 + 80;
        const secondVelocityX = !fromLeft
          ? this.snowballSpeed
          : -this.snowballSpeed;

        const secondSnowball = this.physics.add.sprite(
          secondStartX,
          surfaceY,
          "roller-snowball"
        );

        secondSnowball.setVelocityX(secondVelocityX);
        secondSnowball.setGravityY(0);
        secondSnowball.setScale(1.2);
        secondSnowball.setDepth(50);

        if (secondSnowball.body) {
          const body = secondSnowball.body as Phaser.Physics.Arcade.Body;
          body.setCircle(secondSnowball.width / 2);
          body.setAllowGravity(false);
        }

        this.tweens.add({
          targets: secondSnowball,
          angle: !fromLeft ? 360 : -360,
          duration: 1500,
          repeat: -1,
          ease: "Linear",
        });

        // Partículas para la segunda bola
        const particleTimer = this.time.addEvent({
          delay: 50,
          callback: () => {
            if (!secondSnowball || !secondSnowball.active) {
              particleTimer.remove();
              return;
            }

            const numParticles = Phaser.Math.Between(3, 5);
            for (let i = 0; i < numParticles; i++) {
              const particle = this.add.graphics();
              particle.fillStyle(0xffffff, 1.0);
              particle.fillCircle(0, 0, Phaser.Math.Between(3, 6));

              const velocityDirection =
                secondSnowball.body?.velocity.x! > 0 ? -1 : 1;
              const offsetX = Phaser.Math.Between(20, 40) * velocityDirection;
              const offsetY = Phaser.Math.Between(-10, 10);

              particle.setPosition(
                secondSnowball.x + offsetX,
                secondSnowball.y + offsetY
              );
              particle.setDepth(49);

              this.tweens.add({
                targets: particle,
                y: particle.y + Phaser.Math.Between(-5, 15),
                x: particle.x + Phaser.Math.Between(-20, 20),
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: Phaser.Math.Between(400, 800),
                ease: "Cubic.easeOut",
                onComplete: () => {
                  particle.destroy();
                },
              });
            }
          },
          loop: true,
        });

        this.physics.add.overlap(secondSnowball, this.player, () => {
          if (!secondSnowball.active) return;
          console.log(
            "💥 Jugador golpeado por bola de nieve rodante (segunda)"
          );
          this.player.takeDamage(secondSnowball.x);
        });

        // Auto-destruir segunda bola al salir de pantalla
        this.time.addEvent({
          delay: 100,
          callback: () => {
            if (!secondSnowball || !secondSnowball.active) return;

            const outOfBounds = !fromLeft
              ? secondSnowball.x > 768 + 100
              : secondSnowball.x < -100;

            if (outOfBounds) {
              console.log("⚪ Segunda bola fuera de pantalla");
              particleTimer.remove();
              secondSnowball.destroy();
            }
          },
          loop: true,
        });
      });
    }

    // Destruir la bola cuando salga de la pantalla y lanzar otra
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.rollingSnowball || !this.rollingSnowball.active) return;

        // Verificar si salió de la pantalla
        const outOfBounds = fromLeft
          ? this.rollingSnowball.x > 768 + 100
          : this.rollingSnowball.x < -100;

        if (outOfBounds) {
          console.log("⚪ Bola de nieve fuera de pantalla");
          this.destroySnowball();

          // Lanzar otra bola después de un delay aleatorio (3-6 segundos)
          const nextDelay = Phaser.Math.Between(3000, 6000);
          this.snowballTimer = this.time.delayedCall(nextDelay, () => {
            this.spawnRollingSnowball();
          });
        }
      },
      loop: true,
    });
  }

  /**
   * Crear sistema de partículas de nieve para la bola rodante
   */
  private createSnowballParticles(): void {
    if (!this.rollingSnowball) return;

    // Crear partículas simples usando graphics
    const particleTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (!this.rollingSnowball || !this.rollingSnowball.active) {
          particleTimer.remove();
          return;
        }

        // Crear 3-5 partículas por frame para mejor visibilidad
        const numParticles = Phaser.Math.Between(3, 5);

        for (let i = 0; i < numParticles; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0xffffff, 1.0); // Opacidad completa para mejor visibilidad
          particle.fillCircle(0, 0, Phaser.Math.Between(3, 6)); // Partículas más grandes

          // Posición en la parte trasera de la bola (detrás del centro)
          const velocityDirection =
            this.rollingSnowball.body?.velocity.x! > 0 ? -1 : 1; // Opuesto a la dirección
          const offsetX = Phaser.Math.Between(20, 40) * velocityDirection; // Detrás de la bola
          const offsetY = Phaser.Math.Between(-10, 10); // A la altura de la bola

          particle.setPosition(
            this.rollingSnowball.x + offsetX,
            this.rollingSnowball.y + offsetY
          );
          particle.setDepth(49);

          // Animar partícula - más visible y lenta
          this.tweens.add({
            targets: particle,
            y: particle.y + Phaser.Math.Between(-5, 15),
            x: particle.x + Phaser.Math.Between(-20, 20),
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: Phaser.Math.Between(400, 800), // Duración más larga
            ease: "Cubic.easeOut",
            onComplete: () => {
              particle.destroy();
            },
          });
        }
      },
      loop: true,
    });

    // Guardar referencia para limpieza
    this.rollingSnowball.setData("particleTimer", particleTimer);
  }

  /**
   * Manejar cuando la bola de nieve golpea al jugador
   */
  private handleSnowballHit(): void {
    if (!this.rollingSnowball || !this.player) return;

    console.log("⚪💥 Bola de nieve golpeó al jugador");

    // Hacer daño al jugador (repele igual que el boss)
    this.player.takeDamage(this.rollingSnowball.x);

    // La bola de nieve NO se destruye, sigue rodando
    // (Ya se maneja en el comentario original)
  }

  /**
   * Destruir la bola de nieve y limpiar recursos
   */
  private destroySnowball(): void {
    if (!this.rollingSnowball) return;

    // Limpiar timer de partículas
    const particleTimer = this.rollingSnowball.getData("particleTimer");
    if (particleTimer) {
      particleTimer.remove();
    }

    this.rollingSnowball.destroy();
    this.rollingSnowball = undefined;
  }

  /**
   * Ejecutar el ataque de caída en picado
   */
  private executeAttack(): void {
    if (this.isAttacking || !this.player) return;

    console.log("💥 Boss iniciando ataque de caída en picado");

    // Marcar como atacando y resetear flag de hit
    this.isAttacking = true;
    this.hasHitPlayer = false;

    // Guardar la posición X del jugador como objetivo
    this.attackTargetX = this.player.x;

    // Mover al boss hacia la posición X del jugador primero (fase de preparación)
    this.tweens.add({
      targets: this.bossBat,
      x: this.attackTargetX,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        // Ahora hacer la caída en picado
        this.diveBombAttack();
      },
    });
  }

  /**
   * Ejecutar la caída en picado hacia el suelo
   */
  private diveBombAttack(): void {
    console.log("⬇️ Boss cayendo en picado");

    // Calcular la posición Y del suelo (cerca de la superficie)
    const groundY = 1024 + 56 - 150; // Cerca del suelo pero no en él

    // Caída rápida hacia el suelo
    this.tweens.add({
      targets: this.bossBat,
      y: groundY,
      duration: 1000,
      ease: "Power2",
      onUpdate: () => {
        // Verificar colisión con el jugador durante la caída
        this.checkBossPlayerCollision();
      },
      onComplete: () => {
        // Verificar si golpeó al jugador o falló
        if (this.hasHitPlayer) {
          // Golpeó al jugador, volver a posición normal
          console.log("✅ Boss golpeó al jugador - Volviendo a posición");
          this.returnToOriginalPosition();
        } else {
          // Falló el ataque, quedarse aturdido
          console.log("❌ Boss falló el ataque - Quedando aturdido");
          this.startStunned();
        }
      },
    });
  }

  /**
   * Verificar colisión entre el boss y el jugador
   */
  private checkBossPlayerCollision(): void {
    if (!this.player || !this.isAttacking || this.hasHitPlayer) return;

    // Calcular el radio de colisión basado en los tamaños de los sprites
    const bossWidth = this.bossBat.displayWidth * 0.5;
    const bossHeight = this.bossBat.displayHeight * 0.5;
    const playerWidth = this.player.displayWidth * 0.5;
    const playerHeight = this.player.displayHeight * 0.5;

    // Verificar colisión usando bounds rectangulares
    const bossLeft = this.bossBat.x - bossWidth / 2;
    const bossRight = this.bossBat.x + bossWidth / 2;
    const bossTop = this.bossBat.y - bossHeight / 2;
    const bossBottom = this.bossBat.y + bossHeight / 2;

    const playerLeft = this.player.x - playerWidth / 2;
    const playerRight = this.player.x + playerWidth / 2;
    const playerTop = this.player.y - playerHeight / 2;
    const playerBottom = this.player.y + playerHeight / 2;

    // Colisión AABB (Axis-Aligned Bounding Box)
    const collision =
      bossLeft < playerRight &&
      bossRight > playerLeft &&
      bossTop < playerBottom &&
      bossBottom > playerTop;

    if (collision) {
      console.log("💢 Boss golpeó al jugador!");

      // Marcar que ya golpeó para evitar múltiples hits
      this.hasHitPlayer = true;

      // Hacer daño al jugador usando el método público takeDamage
      this.player.takeDamage(this.bossBat.x);
    }
  }

  /**
   * Iniciar el estado de aturdimiento del boss
   */
  private startStunned(): void {
    console.log("💫 Boss aturdido - Reproduciendo animación de caída");

    // Marcar como aturdido
    this.isStunned = true;

    // 🔊 Reproducir sonido de confusión INMEDIATAMENTE al colisionar
    this.bossConfusedSound = this.sound.add("boss_confused");
    this.bossConfusedSound.play();
    console.log("🔊 Sonido de confusión reproducido al colisionar");

    // Reproducir los primeros 5 frames de HURT (caída)
    this.bossBat.play("boss-bat-hurt-fall");

    // Cuando termine la animación de caída, quedarse estático en el frame 4
    this.bossBat.once("animationcomplete", () => {
      console.log("🛑 Boss quedando estático en el suelo por 5 segundos");

      // Detener en el frame 4 (último de la caída)
      this.bossBat.setFrame(4);

      // Crear y mostrar el sprite de confusión si no existe
      if (!this.confusedSprite) {
        this.confusedSprite = this.add.sprite(
          this.bossBat.x,
          this.bossBat.y - 150,
          "confused-status-spritesheet"
        );
        this.confusedSprite.setScale(0.25); // Reducido a 25% (antes 35%)
        this.confusedSprite.setDepth(1000); // Asegurar que se vea encima
      }

      // Posicionar encima de la cabeza del boss
      this.confusedSprite.setPosition(this.bossBat.x, this.bossBat.y - 150);
      this.confusedSprite.setVisible(true);
      this.confusedSprite.play("confused-status");
      console.log("😵 Sprite de confusión mostrado encima del boss");

      // Iniciar timer de 5 segundos
      this.stunnedTimer = this.time.delayedCall(5000, () => {
        this.recoverFromStun();
      });
    });
  }

  /**
   * Recuperarse del aturdimiento
   */
  private recoverFromStun(): void {
    console.log("💪 Boss recuperándose del aturdimiento");

    // Ocultar el sprite de confusión
    if (this.confusedSprite) {
      this.confusedSprite.setVisible(false);
      this.confusedSprite.stop();
      console.log("✅ Sprite de confusión ocultado");
    }

    // Reproducir los últimos 5 frames de HURT (recuperación)
    this.bossBat.play("boss-bat-hurt-recover");

    // Cuando termine la recuperación, volver a volar
    this.bossBat.once("animationcomplete", () => {
      console.log("🦇 Boss recuperado - Volviendo a modo FLYING");

      // Cambiar a animación FLYING
      this.bossBat.play("boss-bat-flying");

      // Volver a la posición original (arriba)
      this.returnToOriginalPosition();
    });
  }

  /**
   * Volver el boss a su posición original después del ataque
   */
  private returnToOriginalPosition(): void {
    console.log("⬆️ Boss volviendo a posición original");

    this.tweens.add({
      targets: this.bossBat,
      y: this.bossOriginalY,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        // Resetear estados
        this.isAttacking = false;
        this.isStunned = false;
        console.log(
          "✅ Boss de vuelta en posición - Listo para siguiente ataque"
        );
      },
    });
  }

  /**
   * Verificar colisiones entre bolas de nieve y el boss
   * Solo se puede dañar al boss cuando está aturdido
   */
  private checkSnowballCollisions(): void {
    if (!this.projectileSystem || !this.bossBat) return;

    const projectiles = this.projectileSystem
      .getProjectileGroup()
      .getChildren();

    projectiles.forEach((projectile) => {
      const snowball = projectile as Phaser.Physics.Arcade.Sprite;

      // Verificar si la bola de nieve está activa y existe
      if (!snowball.active || !snowball.body) return;

      // Obtener bounds del boss y la bola de nieve
      const bossBounds = this.bossBat.getBounds();
      const snowballBounds = snowball.getBounds();

      // Detectar colisión AABB
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(bossBounds, snowballBounds)
      ) {
        console.log("❄️ Boss impactado por bola de nieve!");

        // Aplicar daño al boss (3 de daño por bola de nieve - reducido aún más)
        // Con 100 de salud, necesitará ~34 impactos (8-9 estados confusos)
        this.damageBoss(3);

        // Aplicar efecto de parpadeo
        this.applyBossHitEffect();

        // Destruir la bola de nieve
        snowball.destroy();
      }
    });
  }

  /**
   * Aplicar daño al boss y verificar si ha sido derrotado
   */
  private damageBoss(damage: number): void {
    if (!this.lifeSystem) return;

    this.lifeSystem.damageBoss(damage);
    const currentHealth = this.lifeSystem.getBossHealth();

    console.log(
      `💔 Boss recibe ${damage} de daño. Salud restante: ${currentHealth}`
    );

    // Verificar si el boss ha sido derrotado
    if (this.lifeSystem.isBossDefeated()) {
      console.log("💀 Boss derrotado!");
      this.onBossDefeated();
    }
  }

  /**
   * Aplicar efecto visual de parpadeo cuando el boss recibe daño
   */
  private applyBossHitEffect(): void {
    // Efecto de parpadeo suave
    this.tweens.add({
      targets: this.bossBat,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.bossBat.setAlpha(1); // Asegurar que vuelva a opacidad completa
      },
    });
  }

  /**
   * Manejar la derrota del boss
   */
  private onBossDefeated(): void {
    console.log("🎉 ¡Boss derrotado! Victoria del jugador");

    // Detener todos los timers
    if (this.bossAttackTimer) {
      this.bossAttackTimer.remove();
    }
    if (this.stunnedTimer) {
      this.stunnedTimer.remove();
    }

    // Desactivar el boss
    this.bossIsActive = false;

    // Ocultar sprite de confusión si existe
    if (this.confusedSprite) {
      this.confusedSprite.setVisible(false);
      this.confusedSprite.stop();
    }

    // Reproducir animación de muerte del boss
    this.bossBat.play("boss-bat-die");

    // Cuando termine la animación de muerte, hacer fade out y transición
    this.bossBat.once("animationcomplete", () => {
      console.log("💀 Animación de muerte completada");

      // Hacer fade out del boss
      this.tweens.add({
        targets: this.bossBat,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          console.log(
            "✅ Boss desaparecido - TODO: Transición al siguiente nivel"
          );
          // TODO: Añadir transición al siguiente nivel o pantalla de victoria
        },
      });
    });
  }

  /**
   * Actualizar el movimiento del boss
   */
  private updateBossMovement(delta: number): void {
    if (
      !this.bossIsActive ||
      !this.bossBat ||
      this.isAttacking ||
      this.isStunned
    )
      return;

    // Debug: mostrar estado cada 60 frames
    if (this.game.getFrame() % 60 === 0) {
      console.log(
        "🔄 Boss moviendose - X:",
        Math.round(this.bossBat.x),
        "Dir:",
        this.bossDirection
      );
    }

    // Mover el boss horizontalmente
    const moveDistance = (this.bossSpeed * delta) / 1000;
    this.bossBat.x += moveDistance * this.bossDirection;

    // Voltear el sprite según la dirección
    this.bossBat.setFlipX(this.bossDirection < 0);

    // Cambiar dirección al llegar a los límites
    if (this.bossBat.x <= this.bossMinX) {
      this.bossBat.x = this.bossMinX;
      this.bossDirection = 1; // Cambiar a derecha
      console.log("↪️ Boss cambió dirección: DERECHA");
    } else if (this.bossBat.x >= this.bossMaxX) {
      this.bossBat.x = this.bossMaxX;
      this.bossDirection = -1; // Cambiar a izquierda
      console.log("↩️ Boss cambió dirección: IZQUIERDA");
    }
  }

  /**
   * Override del método update para controlar el boss
   */
  update(time: number, delta: number): void {
    super.update(time, delta);

    // Actualizar movimiento del boss
    this.updateBossMovement(delta);

    // Verificar colisiones con bolas de nieve si el boss está aturdido
    if (this.isStunned) {
      this.checkSnowballCollisions();
    }

    // Limpiar gotas que salgan de los límites del mundo
    this.cleanupAcidDrops();
  }

  /**
   * Limpiar gotas ácidas que salgan de los límites del mundo
   */
  private cleanupAcidDrops(): void {
    if (!this.acidDrops) return;

    this.acidDrops.getChildren().forEach((drop) => {
      const acidDrop = drop as Phaser.Physics.Arcade.Sprite;
      if (acidDrop.y > 1080 + 100) {
        // Si la gota sale de la pantalla
        acidDrop.destroy();
      }
    });
  }

  /**
   * Cleanup al destruir la escena
   */
  shutdown(): void {
    // Limpiar el timer de despertar si existe
    if (this.bossWakeTimer) {
      this.bossWakeTimer.remove();
      this.bossWakeTimer = undefined;
    }

    // Limpiar el timer de ataques si existe
    if (this.bossAttackTimer) {
      this.bossAttackTimer.remove();
      this.bossAttackTimer = undefined;
    }

    // Limpiar el timer de aturdimiento si existe
    if (this.stunnedTimer) {
      this.stunnedTimer.remove();
      this.stunnedTimer = undefined;
    }

    // Limpiar el timer de gotas ácidas si existe
    if (this.acidDropTimer) {
      this.acidDropTimer.remove();
      this.acidDropTimer = undefined;
    }

    // Limpiar el timer de bola de nieve rodante si existe
    if (this.snowballTimer) {
      this.snowballTimer.remove();
      this.snowballTimer = undefined;
    }

    // Destruir la bola de nieve activa si existe
    if (this.rollingSnowball) {
      this.destroySnowball();
    }

    // Detener y limpiar la música del boss si existe
    if (this.bossMusic) {
      this.bossMusic.stop();
      this.bossMusic.destroy();
      this.bossMusic = undefined;
    }

    // Detener y limpiar el sonido de despertar si existe
    if (this.bossWakeSound) {
      this.bossWakeSound.stop();
      this.bossWakeSound.destroy();
      this.bossWakeSound = undefined;
    }

    // Detener y limpiar el sonido de confusión si existe
    if (this.bossConfusedSound) {
      this.bossConfusedSound.stop();
      this.bossConfusedSound.destroy();
      this.bossConfusedSound = undefined;
    }

    super.shutdown();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

export default FirstBoss;
