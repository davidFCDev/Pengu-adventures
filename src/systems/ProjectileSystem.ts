/**
 * Sistema centralizado para gestión de proyectiles (snowballs)
 * Maneja creación, colisiones y ciclo de vida de proyectiles
 */
export class ProjectileSystem {
  private scene: Phaser.Scene;
  private projectileGroup: Phaser.Physics.Arcade.Group;
  private snowballListener: (snowball: Phaser.GameObjects.GameObject) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.projectileGroup = scene.physics.add.group();

    // Crear la función listener como propiedad para poder removerla después
    this.snowballListener = (snowball: Phaser.GameObjects.GameObject) => {
      this.handleSnowballCreated(snowball);
    };

    // Escuchar eventos de creación de snowballs
    this.setupSnowballListener();
  }

  /**
   * Configurar listener para cuando se crean snowballs
   */
  private setupSnowballListener(): void {
    this.scene.events.on("snowballCreated", this.snowballListener);
    // También escuchar snowballs de enemigos
    this.scene.events.on("enemySnowballCreated", this.snowballListener);
  }

  /**
   * Manejar la creación de un snowball
   */
  private handleSnowballCreated(snowball: Phaser.GameObjects.GameObject): void {
    // Verificar que el sistema siga activo y válido
    if (
      !this.projectileGroup ||
      !this.projectileGroup.scene ||
      !this.projectileGroup.scene.sys
    ) {
      console.warn("⚠️ ProjectileSystem ya fue destruido, ignorando snowball");
      return;
    }

    try {
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
      }
    } catch (error) {
      console.error("❌ Error al añadir snowball al grupo:", error);
    }
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
    // 1. PRIMERO remover el listener para que no se procesen más eventos
    if (this.snowballListener) {
      this.scene.events.off("snowballCreated", this.snowballListener);
      this.scene.events.off("enemySnowballCreated", this.snowballListener);
      this.snowballListener = undefined as any;
    }

    // 2. Destruir todos los proyectiles si el grupo aún existe
    if (this.projectileGroup) {
      this.projectileGroup.clear(true, true);
      this.projectileGroup.destroy();
    }

    // 3. Limpiar referencias
    this.projectileGroup = undefined as any;
    this.scene = undefined as any;
  }
}
