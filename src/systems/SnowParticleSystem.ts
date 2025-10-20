/**
 * Sistema de partículas de nieve que simula nevada en TODO el mapa
 * Las partículas caen continuamente en todo el nivel y colisionan con superficies
 */
export class SnowParticleSystem {
  private scene: Phaser.Scene;
  private snowflakes: Array<{
    graphic: Phaser.GameObjects.Graphics;
    x: number;
    y: number;
    velocityY: number;
    velocityX: number;
    size: number;
    opacity: number;
  }> = [];
  private surfaceLayer?: Phaser.Tilemaps.TilemapLayer;
  private mapWidth: number = 0;
  private mapHeight: number = 0;
  private maxSnowflakes: number = 350; // Cantidad total de copos en el mapa

  constructor(
    scene: Phaser.Scene,
    surfaceLayer?: Phaser.Tilemaps.TilemapLayer
  ) {
    this.scene = scene;
    this.surfaceLayer = surfaceLayer;

    // 🚀 MOBILE OPTIMIZATION: Reducir partículas drásticamente en móviles
    if (this.isMobileDevice()) {
      this.maxSnowflakes = 50; // Reducir de 350 a 50 en móviles (85% menos)
      console.log(
        "📱 Mobile detected: Snow particles reduced to",
        this.maxSnowflakes
      );
    }

    // Obtener dimensiones del mapa completo
    if (surfaceLayer && surfaceLayer.tilemap) {
      this.mapWidth = surfaceLayer.tilemap.widthInPixels;
      this.mapHeight = surfaceLayer.tilemap.heightInPixels;
    } else {
      // Fallback a dimensiones de cámara si no hay tilemap
      this.mapWidth = scene.cameras.main.width * 3;
      this.mapHeight = scene.cameras.main.height * 2;
    }

    // Crear copos de nieve distribuidos en TODO el mapa
    this.createSnowflakes();

    // Actualizar en cada frame
    this.scene.events.on("update", this.update, this);
  }

  /**
   * Crear copos de nieve distribuidos en todo el mapa
   */
  private createSnowflakes(): void {
    for (let i = 0; i < this.maxSnowflakes; i++) {
      const graphic = this.scene.add.graphics();

      // ❄️ Depth en el fondo (menor que cualquier otra capa)
      // Fondo: 0-5, Nieve: 3, Objetos/Player: 10+, UI: 1000
      graphic.setDepth(3);

      // Las partículas siguen el mundo (no la cámara)
      graphic.setScrollFactor(1, 1);

      // Posición inicial aleatoria en TODO el mapa (no solo en la vista)
      const x = Math.random() * this.mapWidth;
      const y = Math.random() * this.mapHeight;

      // Velocidad variable para más realismo
      const velocityY = 30 + Math.random() * 40; // 30-70 px/s
      const velocityX = (Math.random() - 0.5) * 30; // -15 a 15 px/s

      // Tamaño y opacidad variable
      const size = 2.5 + Math.random() * 3.5; // 2.5-6 px
      const opacity = 0.5 + Math.random() * 0.5; // 0.5-1.0

      this.snowflakes.push({
        graphic,
        x,
        y,
        velocityY,
        velocityX,
        size,
        opacity,
      });
    }
  }

  /**
   * Reiniciar un copo en la parte superior del mapa
   */
  private resetSnowflake(snowflake: {
    graphic: Phaser.GameObjects.Graphics;
    x: number;
    y: number;
    velocityY: number;
    velocityX: number;
    size: number;
    opacity: number;
  }): void {
    // Reiniciar en la parte superior del mapa en una posición aleatoria
    snowflake.x = Math.random() * this.mapWidth;
    snowflake.y = -10; // Justo arriba del mapa

    // Nueva velocidad aleatoria
    snowflake.velocityY = 30 + Math.random() * 40;
    snowflake.velocityX = (Math.random() - 0.5) * 30;

    // Nuevo tamaño y opacidad
    snowflake.size = 2.5 + Math.random() * 3.5;
    snowflake.opacity = 0.5 + Math.random() * 0.5;
  }

  /**
   * Verificar si una partícula colisiona con un tile de superficie
   */
  private checkTileCollision(x: number, y: number): boolean {
    if (!this.surfaceLayer) return false;

    const tile = this.surfaceLayer.getTileAtWorldXY(x, y, true);

    if (!tile) return false;

    // Verificar si el tile tiene la propiedad collision=true
    const hasCollision = tile.properties?.collision === true;

    return hasCollision;
  }

  /**
   * Actualizar todas las partículas
   */
  private update(time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    const camera = this.scene.cameras.main;

    // Calcular el área visible con un margen
    const viewLeft = camera.worldView.x - 100;
    const viewRight = camera.worldView.x + camera.worldView.width + 100;
    const viewTop = camera.worldView.y - 100;
    const viewBottom = camera.worldView.y + camera.worldView.height + 100;

    for (const snowflake of this.snowflakes) {
      // Actualizar posición
      snowflake.x += snowflake.velocityX * deltaSeconds;
      snowflake.y += snowflake.velocityY * deltaSeconds;

      // ❄️ NIEVE INFINITA: Ya no verificamos colisiones con tiles
      // Las partículas caen indefinidamente sin detenerse

      // Si sale por abajo del mapa, reiniciar arriba
      if (snowflake.y > this.mapHeight) {
        this.resetSnowflake(snowflake);
        snowflake.graphic.clear();
        continue;
      }

      // Si sale por los lados del mapa, ajustar posición
      if (snowflake.x < 0) {
        snowflake.x = this.mapWidth;
      } else if (snowflake.x > this.mapWidth) {
        snowflake.x = 0;
      }

      // Solo renderizar si está en el área visible (optimización)
      if (
        snowflake.x >= viewLeft &&
        snowflake.x <= viewRight &&
        snowflake.y >= viewTop &&
        snowflake.y <= viewBottom
      ) {
        // Dibujar la partícula
        snowflake.graphic.clear();
        snowflake.graphic.fillStyle(0xffffff, snowflake.opacity);
        snowflake.graphic.fillCircle(snowflake.x, snowflake.y, snowflake.size);
      } else {
        // Limpiar si está fuera de la vista (optimización)
        snowflake.graphic.clear();
      }
    }
  }

  /**
   * Destruir el sistema de partículas
   */
  public destroy(): void {
    this.scene.events.off("update", this.update, this);

    for (const snowflake of this.snowflakes) {
      snowflake.graphic.destroy();
    }

    this.snowflakes = [];
  }

  /**
   * Pausar el sistema de partículas
   */
  public pause(): void {
    this.scene.events.off("update", this.update, this);
  }

  /**
   * Reanudar el sistema de partículas
   */
  public resume(): void {
    this.scene.events.on("update", this.update, this);
  }

  /**
   * Cambiar la intensidad de la nevada (número de copos)
   */
  public setIntensity(maxSnowflakes: number): void {
    const newCount = Math.max(50, Math.min(300, maxSnowflakes));

    // Si necesitamos más copos, crear nuevos
    while (this.snowflakes.length < newCount) {
      const graphic = this.scene.add.graphics();
      graphic.setDepth(3); // Mismo depth que el resto de copos
      graphic.setScrollFactor(1, 1);

      this.snowflakes.push({
        graphic,
        x: Math.random() * this.mapWidth,
        y: Math.random() * this.mapHeight,
        velocityY: 30 + Math.random() * 40,
        velocityX: (Math.random() - 0.5) * 30,
        size: 2.5 + Math.random() * 3.5,
        opacity: 0.5 + Math.random() * 0.5,
      });
    }

    // Si necesitamos menos copos, destruir algunos
    while (this.snowflakes.length > newCount) {
      const snowflake = this.snowflakes.pop();
      if (snowflake) {
        snowflake.graphic.destroy();
      }
    }
  }

  /**
   * Detectar si el dispositivo es móvil
   */
  private isMobileDevice(): boolean {
    // Verificar por user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );

    // Verificar por touch support
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Verificar por ancho de pantalla (menor a 768px se considera móvil)
    const isNarrowScreen = window.innerWidth < 768;

    return isMobileUA || (hasTouch && isNarrowScreen);
  }
}
