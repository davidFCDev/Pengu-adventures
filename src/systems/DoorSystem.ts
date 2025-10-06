/**
 * DoorSystem - Sistema de puertas que requieren llaves
 *
 * Gestiona puertas que bloquean el paso del jugador.
 * Detecta automáticamente puertas en objetos de Tiled por sus GIDs.
 * Agrupa automáticamente partes de puerta cercanas (puertas multi-tile).
 */

import { KeySystem } from "./KeySystem";

export interface DoorSystemConfig {
  tilemap: Phaser.Tilemaps.Tilemap;
  keySystem: KeySystem;
  doorTileIds: number[]; // IDs de los tiles que son puertas (gid)
  tilesetName?: string; // Nombre del tileset (si no se especifica, usa el primero)
  spritesheetKey?: string; // Clave del spritesheet (default: 'spritesheet-tiles-frames')
  proximityThreshold?: number; // Distancia máxima para agrupar partes (default: 96px)
  depth?: number;
  openSoundKey?: string;
  soundVolume?: number;
}

interface DoorPart {
  sprite: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.StaticBody;
  originalX: number;
  originalY: number;
}

export class DoorSystem {
  private scene: Phaser.Scene;
  private config: Required<DoorSystemConfig>;
  private doors: Phaser.Physics.Arcade.StaticGroup;
  private doorParts: Map<number, DoorPart> = new Map();
  private doorGroups: Map<string, DoorPart[]> = new Map();

  constructor(scene: Phaser.Scene, config: DoorSystemConfig) {
    this.scene = scene;

    this.config = {
      tilemap: config.tilemap,
      keySystem: config.keySystem,
      doorTileIds: config.doorTileIds,
      tilesetName:
        config.tilesetName ??
        config.tilemap.tilesets[0]?.name ??
        "spritesheet-tiles",
      spritesheetKey: config.spritesheetKey ?? "spritesheet-tiles-frames",
      proximityThreshold: config.proximityThreshold ?? 96,
      depth: config.depth ?? 10,
      openSoundKey: config.openSoundKey ?? "",
      soundVolume: config.soundVolume ?? 0.3,
    };

    this.doors = this.scene.physics.add.staticGroup();
  }

  /**
   * Crear puertas desde los objetos del tilemap
   */
  createDoors(): void {
    const objectLayers = this.config.tilemap.objects;

    objectLayers.forEach((objectLayer) => {
      objectLayer.objects.forEach((obj: any) => {
        if (obj.gid && this.config.doorTileIds.includes(obj.gid)) {
          this.createDoorPart(obj);
        }
      });
    });
  }

  /**
   * Crear una parte de puerta individual
   */
  private createDoorPart(obj: any): void {
    const tileset = this.config.tilemap.getTileset(this.config.tilesetName);
    if (!tileset) return;

    const localTileId = obj.gid - tileset.firstgid;

    const doorSprite = this.scene.add.sprite(
      obj.x,
      obj.y - 32,
      this.config.spritesheetKey,
      localTileId
    );

    doorSprite.setOrigin(0.5, 0.5);
    doorSprite.setDepth(this.config.depth);

    // Añadir física estática
    this.scene.physics.add.existing(doorSprite, true);
    const body = doorSprite.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(doorSprite.width, doorSprite.height);

    // Añadir al grupo
    this.doors.add(doorSprite);

    // Guardar referencia con coordenadas originales para agrupamiento
    const doorPart: DoorPart = {
      sprite: doorSprite,
      body: body,
      originalX: obj.x,
      originalY: obj.y,
    };
    this.doorParts.set(obj.id, doorPart);

    // Agrupar partes de puerta por proximidad
    // Las puertas verticales tienen la misma X y Y cercana (diferencia de 64px)
    this.addToNearestDoorGroup(doorPart, obj.x, obj.y);
  }

  /**
   * Añadir una parte de puerta al grupo más cercano o crear uno nuevo
   */
  private addToNearestDoorGroup(
    doorPart: DoorPart,
    x: number,
    y: number
  ): void {
    let foundGroup = false;

    for (const [groupKey, parts] of this.doorGroups) {
      if (parts.length > 0) {
        const firstPart = parts[0];
        const distance = Math.sqrt(
          (x - firstPart.originalX) ** 2 + (y - firstPart.originalY) ** 2
        );

        if (distance < this.config.proximityThreshold) {
          parts.push(doorPart);
          foundGroup = true;
          break;
        }
      }
    }

    if (!foundGroup) {
      const newGroupKey = `door_${this.doorGroups.size}`;
      this.doorGroups.set(newGroupKey, [doorPart]);
    }
  }

  /**
   * Configurar colisión con el jugador
   */
  setupPlayerCollision(player: Phaser.Physics.Arcade.Sprite): void {
    // Colisión que bloquea al jugador y detecta intentos de apertura
    this.scene.physics.add.collider(
      player,
      this.doors,
      (playerObj, doorObj) => {
        // Intentar abrir la puerta cuando colisiona
        this.tryOpenDoor(doorObj as Phaser.GameObjects.Sprite);
      },
      undefined,
      this
    );
  }

  /**
   * Intentar abrir una puerta
   */
  private tryOpenDoor(doorSprite: Phaser.GameObjects.Sprite): void {
    // Verificar si la puerta ya está siendo destruida
    if (!doorSprite.active) return;

    // Encontrar todas las partes de esta puerta PRIMERO
    const doorParts = this.findDoorGroup(doorSprite);
    if (doorParts.length === 0) return;

    // Verificar si alguna parte ya está siendo procesada (evitar doble apertura)
    const alreadyProcessing = doorParts.some((part) => !part.sprite.active);
    if (alreadyProcessing) return;

    // MARCAR TODAS LAS PARTES COMO INACTIVAS INMEDIATAMENTE
    // Esto evita que el callback de colisión se ejecute múltiples veces en el mismo frame
    doorParts.forEach((doorPart) => {
      doorPart.sprite.setActive(false);
    });

    // Intentar usar una llave
    const hasKey = this.config.keySystem.useKey();

    if (hasKey) {
      // Reproducir sonido de apertura
      if (this.config.openSoundKey) {
        this.scene.sound.play(this.config.openSoundKey, {
          volume: this.config.soundVolume,
        });
      }

      // Desactivar colisión de todas las partes
      doorParts.forEach((doorPart) => {
        doorPart.body.enable = false;
      });

      // Animar y destruir todas las partes
      doorParts.forEach((doorPart, index) => {
        this.animateDoorOpening(doorPart, index * 100);
      });
    } else {
      // Si no hay llaves, reactivar las partes
      doorParts.forEach((doorPart) => {
        doorPart.sprite.setActive(true);
      });

      // Mostrar feedback visual de que no hay llaves
      doorParts.forEach((doorPart) => {
        this.scene.tweens.add({
          targets: doorPart.sprite,
          x: doorPart.sprite.x - 5,
          duration: 50,
          yoyo: true,
          repeat: 3,
          ease: "Sine.easeInOut",
        });
      });
    }
  }

  /**
   * Encontrar todas las partes que forman una puerta completa
   */
  private findDoorGroup(sprite: Phaser.GameObjects.Sprite): DoorPart[] {
    for (const [key, parts] of this.doorGroups) {
      const found = parts.find((part) => part.sprite === sprite);
      if (found) {
        return parts;
      }
    }
    return [];
  }

  /**
   * Animar la apertura de una parte de puerta
   */
  private animateDoorOpening(doorPart: DoorPart, delay: number = 0): void {
    const sprite = doorPart.sprite;

    // Ya está desactivado desde tryOpenDoor, pero por si acaso
    sprite.setActive(false);
    doorPart.body.enable = false;

    // Animación de desvanecimiento con escalado
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      delay: delay,
      ease: "Cubic.easeOut",
      onComplete: () => {
        sprite.destroy();
        this.doors.remove(sprite);
      },
    });
  }

  /**
   * Destruir el sistema
   */
  destroy(): void {
    this.doors.clear(true, true);
    this.doorParts.clear();
    this.doorGroups.clear();
  }
}
