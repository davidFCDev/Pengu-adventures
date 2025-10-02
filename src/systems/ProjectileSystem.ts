/**
 * Sistema centralizado para gestión de proyectiles (snowballs)
 * Maneja creación, colisiones y ciclo de vida de proyectiles
 */
export class ProjectileSystem {
  private scene: Phaser.Scene;
  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.projectileGroup = scene.physics.add.group();

    // Escuchar eventos de creación de snowballs
    this.setupSnowballListener();
  }

  /**
   * Configurar listener para cuando se crean snowballs
   */
  private setupSnowballListener(): void {
    this.scene.events.on(
      "snowballCreated",
      (snowball: Phaser.GameObjects.GameObject) => {
        console.log("Snowball creada, añadiendo al grupo...");

        const snowballSprite = snowball as Phaser.Physics.Arcade.Sprite;

        // Guardar velocidad actual
        const currentVelocityX = snowballSprite.body?.velocity.x || 0;
        const currentVelocityY = snowballSprite.body?.velocity.y || 0;

        // Añadir al grupo
        this.projectileGroup.add(snowballSprite);

        // Restaurar velocidad
        if (snowballSprite.body && "setVelocity" in snowballSprite.body) {
          (snowballSprite.body as Phaser.Physics.Arcade.Body).setVelocity(
            currentVelocityX,
            currentVelocityY
          );
          console.log("Snowball añadida al grupo, velocidad restaurada:", {
            x: currentVelocityX,
            y: currentVelocityY,
          });
        }
      }
    );
  }

  /**
   * Obtener el grupo de proyectiles
   */
  getProjectileGroup(): Phaser.Physics.Arcade.Group {
    return this.projectileGroup;
  }

  /**
   * Configurar colisiones con un layer específico
   */
  setupCollisionsWith(
    layer: Phaser.Tilemaps.TilemapLayer,
    callback?: (projectile: any, tile: any) => void
  ): void {
    this.scene.physics.add.collider(
      this.projectileGroup,
      layer,
      (projectile, tile) => {
        if (callback) {
          callback(projectile, tile);
        } else {
          // Comportamiento por defecto: destruir el proyectil
          (projectile as any).destroy();
        }
      }
    );
  }

  /**
   * Limpiar proyectiles que salen del mapa
   */
  cleanOutOfBoundsProjectiles(bounds: Phaser.Geom.Rectangle): void {
    this.projectileGroup.children.entries.forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      if (
        sprite.x < bounds.x ||
        sprite.x > bounds.x + bounds.width ||
        sprite.y < bounds.y ||
        sprite.y > bounds.y + bounds.height
      ) {
        sprite.destroy();
      }
    });
  }

  /**
   * Obtener cantidad de proyectiles activos
   */
  getProjectileCount(): number {
    return this.projectileGroup.countActive();
  }

  /**
   * Destruir todos los proyectiles
   */
  destroyAll(): void {
    this.projectileGroup.clear(true, true);
  }

  /**
   * Destruir el sistema
   */
  destroy(): void {
    this.scene.events.off("snowballCreated");
    this.destroyAll();
  }
}
