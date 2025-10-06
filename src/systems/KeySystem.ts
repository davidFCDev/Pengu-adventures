/**
 * KeySystem - Sistema de llaves coleccionables
 *
 * Gestiona las llaves que el jugador puede recoger del mapa.
 * Detecta automáticamente llaves en objetos de Tiled por sus GIDs.
 */

export interface KeySystemConfig {
  tilemap: Phaser.Tilemaps.Tilemap;
  keyTileIds: number[]; // IDs de los tiles que son llaves (gid)
  tilesetName?: string; // Nombre del tileset (si no se especifica, usa el primero)
  spritesheetKey?: string; // Clave del spritesheet (default: 'spritesheet-tiles-frames')
  depth?: number;
  collectSoundKey?: string;
  soundVolume?: number;
}

export class KeySystem {
  private scene: Phaser.Scene;
  private config: Required<KeySystemConfig>;
  private keys: Phaser.Physics.Arcade.Group;
  private collectedKeys: number = 0;
  private keySprites: Map<number, Phaser.GameObjects.Sprite> = new Map();

  constructor(scene: Phaser.Scene, config: KeySystemConfig) {
    this.scene = scene;

    // Configuración por defecto
    this.config = {
      tilemap: config.tilemap,
      keyTileIds: config.keyTileIds,
      tilesetName:
        config.tilesetName ??
        config.tilemap.tilesets[0]?.name ??
        "spritesheet-tiles",
      spritesheetKey: config.spritesheetKey ?? "spritesheet-tiles-frames",
      depth: config.depth ?? 10,
      collectSoundKey: config.collectSoundKey ?? "",
      soundVolume: config.soundVolume ?? 0.3,
    };

    // Crear grupo de física para las llaves
    this.keys = this.scene.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
  }

  /**
   * Crear llaves desde los objetos del tilemap
   */
  createKeys(): void {
    const objectLayers = this.config.tilemap.objects;

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && this.config.keyTileIds.includes(obj.gid)) {
          this.createKey(obj);
        }
      });
    });
  }

  /**
   * Crear una llave individual
   */
  private createKey(obj: any): void {
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) return;

    const localTileId = obj.gid - tileset.firstgid;

    const key = this.scene.add.sprite(
      obj.x,
      obj.y - 32, // Ajustar Y porque Tiled usa bottom-left como origen
      this.config.spritesheetKey,
      localTileId
    );

    key.setOrigin(0.5, 0.5);
    key.setDepth(this.config.depth);

    // Añadir física
    this.scene.physics.add.existing(key);
    const body = key.body as Phaser.Physics.Arcade.Body;
    body.setSize(key.width * 0.8, key.height * 0.8);
    body.setAllowGravity(false);

    // Añadir al grupo
    this.keys.add(key);

    // Guardar referencia con el ID del objeto
    this.keySprites.set(obj.id, key);

    // Animación de flotación suave
    this.scene.tweens.add({
      targets: key,
      y: key.y - 10,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Configurar colisión con el jugador
   */
  setupPlayerCollision(player: Phaser.Physics.Arcade.Sprite): void {
    this.scene.physics.add.overlap(
      player,
      this.keys,
      (playerObj, keyObj) => {
        this.collectKey(keyObj as Phaser.GameObjects.Sprite);
      },
      undefined,
      this
    );
  }

  /**
   * Recoger una llave
   */
  private collectKey(key: Phaser.GameObjects.Sprite): void {
    // Evitar recolección múltiple
    if (!key.active) return;

    // Desactivar inmediatamente
    key.setActive(false);

    // Incrementar contador
    this.collectedKeys++;

    // Reproducir sonido si está configurado
    if (this.config.collectSoundKey) {
      this.scene.sound.play(this.config.collectSoundKey, {
        volume: this.config.soundVolume,
      });
    }

    // Animación de recolección
    this.scene.tweens.add({
      targets: key,
      y: key.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: "Back.easeIn",
      onComplete: () => {
        key.destroy();
        this.keys.remove(key);
      },
    });

    // Emitir evento
    this.scene.events.emit("keyCollected", this.collectedKeys);
  }

  /**
   * Obtener el número de llaves recogidas
   */
  getCollectedKeys(): number {
    return this.collectedKeys;
  }

  /**
   * Usar una llave (cuando se abre una puerta)
   */
  useKey(): boolean {
    if (this.collectedKeys > 0) {
      this.collectedKeys--;
      this.scene.events.emit("keyUsed", this.collectedKeys);
      return true;
    }
    return false;
  }

  /**
   * Destruir el sistema
   */
  destroy(): void {
    this.keys.clear(true, true);
    this.keySprites.clear();
  }
}
