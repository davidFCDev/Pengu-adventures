import GameSettings from "../config/GameSettings";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    // Load your game assets here
    // Example: this.load.image('player', 'assets/player.png');
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor("#2C3E50");

    // Welcome message
    const title = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 - 50,
      "CREATE YOUR GAME",
      {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold",
      }
    );
    title.setOrigin(0.5);

    const subtitle = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 20,
      "Start building your game here!",
      {
        fontSize: "18px",
        color: "#BDC3C7",
        fontFamily: "Arial, sans-serif",
      }
    );
    subtitle.setOrigin(0.5);

    const instructions = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height / 2 + 80,
      "Edit src/scenes/GameScene.ts\nto start developing",
      {
        fontSize: "16px",
        color: "#95A5A6",
        fontFamily: "Arial, sans-serif",
        align: "center",
      }
    );
    instructions.setOrigin(0.5);

    console.log("🎮 GameScene loaded - Ready for development!");
  }

  update(): void {
    // Your game logic goes here
    // This method is called every frame
  }
}
