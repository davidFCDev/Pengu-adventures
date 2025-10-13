import { SnowmanEnemy } from "./SnowmanEnemy";

/**
 * Manager para gestionar enemigos Snowman en una escena
 * Detecta sprites del editor y los convierte en enemigos funcionales
 */
export class SnowmanEnemyManager {
  private scene: Phaser.Scene;
  private enemies: SnowmanEnemy[] = [];
  private player?: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Crear enemigos Snowman desde sprites colocados en el editor
   * Busca sprites con textura "snowman-spritesheet" y los convierte en enemigos
   */
  createSnowmenFromEditor(): void {
    const snowmanSprites: Phaser.GameObjects.Sprite[] = [];

    // Buscar sprites con textura snowman-spritesheet
    this.scene.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Sprite) {
        if (child.texture && child.texture.key === "snowman-spritesheet") {
          snowmanSprites.push(child);
        }
      }
    });

    // Crear enemigos desde sprites encontrados
    snowmanSprites.forEach((sprite) => {
      // Obtener dirección guardada (por defecto -1 = izquierda)
      const direction = (sprite.getData("direction") as number) ?? -1;
      const scale = sprite.scaleX;

      // Crear enemigo
      const enemy = new SnowmanEnemy(
        this.scene,
        sprite.x,
        sprite.y,
        direction,
        scale
      );

      this.enemies.push(enemy);
      sprite.destroy(); // Destruir sprite placeholder
    });
  }

  /**
   * Configurar colisiones entre proyectiles de Snowman y el jugador
   */
  setupPlayerCollision(player: Phaser.Physics.Arcade.Sprite): void {
    this.player = player;

    this.scene.events.on("enemySnowballCreated", (snowball: any) => {
      this.scene.time.delayedCall(50, () => {
        if (this.player && snowball.active) {
          this.scene.physics.add.overlap(
            this.player,
            snowball,
            (playerObj, projectile) => {
              // Verificar que es un proyectil enemigo
              if ((projectile as any).isEnemyProjectile) {
                const damage = (projectile as any).damage || 1;
                const knockbackForce =
                  (projectile as any).knockbackForce || 400;

                // Aplicar daño al player
                if (
                  this.player &&
                  typeof (this.player as any).takeDamage === "function"
                ) {
                  (this.player as any).takeDamage(damage);

                  // Aplicar knockback
                  const projectileSprite =
                    projectile as Phaser.Physics.Arcade.Sprite;
                  const playerSprite =
                    playerObj as Phaser.Physics.Arcade.Sprite;
                  const direction =
                    projectileSprite.x > playerSprite.x ? -1 : 1;
                  const playerBody = this.player
                    .body as Phaser.Physics.Arcade.Body;

                  if (playerBody) {
                    playerBody.setVelocityX(direction * knockbackForce);
                    playerBody.setVelocityY(-200); // Impulso hacia arriba
                  }
                }

                // Destruir proyectil
                (projectile as any).destroy();
              }
            },
            undefined,
            this.scene
          );
        }
      });
    });
  }

  /**
   * Actualizar todos los enemigos Snowman
   */
  update(time: number, delta: number): void {
    this.enemies.forEach((enemy) => {
      if (enemy && enemy.active) {
        enemy.update(time, delta);
      }
    });
  }

  /**
   * Obtener la lista de enemigos
   */
  getEnemies(): SnowmanEnemy[] {
    return this.enemies;
  }

  /**
   * Destruir todos los enemigos y limpiar
   */
  destroy(): void {
    this.enemies.forEach((enemy) => {
      if (enemy && enemy.active) {
        enemy.destroy();
      }
    });
    this.enemies = [];

    // Limpiar listener de eventos
    this.scene.events.off("enemySnowballCreated");
  }
}
