/**
 * TipNPC - Pingüino NPC que muestra tips al jugador
 */
export class TipNPC extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Sprite;
  private tipBubble!: Phaser.GameObjects.Container;
  private tipText!: Phaser.GameObjects.Text;
  private bubbleBackground!: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    tipMessage: string = "Hello"
  ) {
    super(scene, x, y);

    // Verificar que el spritesheet esté cargado
    if (!scene.textures.exists("penguin_girl_idle")) {
      console.error("❌ Spritesheet 'penguin_girl_idle' no encontrado");
      return;
    }

    // Crear el sprite del pingüino femenino
    this.sprite = scene.add.sprite(0, 0, "penguin_girl_idle", 0);
    this.sprite.setOrigin(0.5, 1); // Origen en los pies
    // Escalar para que tenga altura similar al player (128px)
    // El sprite girl es 171px de alto, queremos que sea ~128px
    this.sprite.setScale(128 / 171); // ≈ 0.75

    // Crear animación idle solo si no existe
    if (!scene.anims.exists("penguin_girl_idle_anim")) {
      try {
        scene.anims.create({
          key: "penguin_girl_idle_anim",
          frames: scene.anims.generateFrameNumbers("penguin_girl_idle", {
            start: 0,
            end: 8,
          }),
          frameRate: 8,
          repeat: -1,
        });
      } catch (error) {
        console.error(
          "❌ Error creando animación penguin_girl_idle_anim:",
          error
        );
        // Usar frame estático si la animación falla
        this.sprite.setFrame(0);
      }
    }

    // Reproducir animación solo si existe
    if (scene.anims.exists("penguin_girl_idle_anim")) {
      this.sprite.play("penguin_girl_idle_anim");
    }

    // Crear bocadillo de tip (ajustado para el tamaño del sprite)
    this.createTipBubble(tipMessage);

    // Añadir al contenedor
    this.add(this.sprite);
    this.add(this.tipBubble);

    // Añadir al scene
    scene.add.existing(this);
  }

  private createTipBubble(message: string): void {
    // Posicionar el bocadillo más arriba para que quede sobre la cabeza del NPC
    this.tipBubble = this.scene.add.container(0, -180);

    // Fondo del bocadillo
    this.bubbleBackground = this.scene.add.graphics();
    this.bubbleBackground.fillStyle(0xffffff, 1);
    this.bubbleBackground.lineStyle(3, 0x000000, 1);

    // Crear texto primero para obtener dimensiones
    this.tipText = this.scene.add.text(0, 0, message, {
      fontFamily: "TT-Trailers",
      fontSize: "32px",
      color: "#000000",
      align: "center",
      wordWrap: { width: 250 },
      padding: { x: 15, y: 10 },
    });
    this.tipText.setOrigin(0.5);

    // Dibujar bocadillo basado en tamaño del texto
    const bubbleWidth = this.tipText.width + 20;
    const bubbleHeight = this.tipText.height + 10;
    const cornerRadius = 8;

    // Bocadillo redondeado
    this.bubbleBackground.fillRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      cornerRadius
    );
    this.bubbleBackground.strokeRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      cornerRadius
    );

    this.tipBubble.add(this.bubbleBackground);
    this.tipBubble.add(this.tipText);
  }

  /**
   * Actualizar el mensaje del tip
   */
  public setTipMessage(message: string): void {
    this.tipText.setText(message);

    // Redibujar bocadillo con nuevo tamaño
    const bubbleWidth = this.tipText.width + 20;
    const bubbleHeight = this.tipText.height + 10;
    const cornerRadius = 8;

    this.bubbleBackground.clear();
    this.bubbleBackground.fillStyle(0xffffff, 1);
    this.bubbleBackground.lineStyle(3, 0x000000, 1);
    this.bubbleBackground.fillRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      cornerRadius
    );
    this.bubbleBackground.strokeRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      cornerRadius
    );
  }

  /**
   * Destruir el NPC
   */
  public destroy(fromScene?: boolean): void {
    this.sprite.destroy();
    this.tipText.destroy();
    this.bubbleBackground.destroy();
    this.tipBubble.destroy();
    super.destroy(fromScene);
  }
}
