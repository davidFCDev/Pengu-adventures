import GameSettings from "../config/GameSettings";

export class GameScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    // No preload por ahora para facilitar el desarrollo
    // Aquí irán los assets cuando sea necesario
  }

  create(): void {
    // Configurar el fondo
    this.cameras.main.setBackgroundColor("#2C3E50");

    // Crear texto temporal para verificar que la escena funciona
    const title = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 100,
      "PENGU CLASH",
      {
        fontSize: "48px",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold",
      }
    );
    title.setOrigin(0.5);

    const subtitle = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 30,
      "¡Escena del juego cargada!",
      {
        fontSize: "24px",
        color: "#E74C3C",
        fontFamily: "Arial, sans-serif",
      }
    );
    subtitle.setOrigin(0.5);

    // Crear un rectángulo simple como placeholder del jugador
    this.player = this.add.rectangle(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 100,
      50,
      50,
      0x3498db
    ) as any;

    // Configurar controles
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Texto de instrucciones
    const instructions = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height - 100,
      "Usa las flechas para mover\nEspacio para saltar",
      {
        fontSize: "18px",
        color: "#BDC3C7",
        fontFamily: "Arial, sans-serif",
        align: "center",
      }
    );
    instructions.setOrigin(0.5);

    console.log("🎮 GameScene creada y lista para desarrollo");
  }

  update(): void {
    // Lógica básica de movimiento del jugador placeholder
    if (this.player && this.cursors) {
      const speed = 200;

      if (this.cursors.left.isDown) {
        this.player.x -= speed * (this.game.loop.delta / 1000);
      } else if (this.cursors.right.isDown) {
        this.player.x += speed * (this.game.loop.delta / 1000);
      }

      if (this.cursors.up.isDown) {
        this.player.y -= speed * (this.game.loop.delta / 1000);
      } else if (this.cursors.down.isDown) {
        this.player.y += speed * (this.game.loop.delta / 1000);
      }

      // Mantener al jugador dentro de los límites de la pantalla
      this.player.x = Phaser.Math.Clamp(
        this.player.x,
        25,
        GameSettings.canvas.width - 25
      );
      this.player.y = Phaser.Math.Clamp(
        this.player.y,
        25,
        GameSettings.canvas.height - 25
      );
    }
  }
}
