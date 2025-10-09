# 📦 SpikeBoxSystem - Ejemplos de Uso

## Ejemplo Real: Level1 vs Level2

### Level2 (Actual - Con Cajas Rápidas)

```typescript
// src/scenes/Level2.ts
export class Level2 extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level2",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",
      tilesets: [
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
        {
          name: "spritesheet-backgrounds-default",
          imageKey: "spritesheet-backgrounds-default",
        },
      ],
      playerStartPosition: { x: 100, y: 1800 },
      musicKey: "level2_music",

      // 🔥 Cajas explosivas y rápidas
      enableSpikeBoxes: true,
      spikeBoxConfig: {
        spikeBoxTileIds: [287],
        moveInterval: 800, // 0.8s - Muy fluido
        moveSpeed: 250, // Rápido y explosivo
        damage: 1,
        knockbackForce: 300,
      },
    };

    super("Level2", config);
  }
}
```

---

### Level1 (Ejemplo - Con Cajas Lentas)

Si quisieras añadir cajas en Level1 con comportamiento diferente:

```typescript
// src/scenes/Level1.ts
export class Level1 extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level1",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",
      tilesets: [
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
        {
          name: "spritesheet-backgrounds-default",
          imageKey: "spritesheet-backgrounds-default",
        },
      ],
      playerStartPosition: { x: 100, y: 100 },
      musicKey: "level1_music",

      // 🐌 Cajas lentas para nivel fácil
      enableSpikeBoxes: true,
      spikeBoxConfig: {
        spikeBoxTileIds: [287], // Mismo GID, diferente comportamiento
        moveInterval: 3000, // 3s - Pausas largas
        moveSpeed: 120, // Lento y predecible
        damage: 1,
        knockbackForce: 200, // Knockback suave
      },
    };

    super("Level1", config);
  }
}
```

**Mismo sistema, comportamiento totalmente diferente!** 🎯

---

## Ejemplo: Nivel con Múltiples Tipos de Cajas

```typescript
// src/scenes/Level3.ts
export class Level3 extends Phaser.Scene {
  private slowBoxSystem!: SpikeBoxSystem;
  private fastBoxSystem!: SpikeBoxSystem;

  create() {
    // ... setup básico ...

    // 🐌 Sistema 1: Cajas lentas en zona inicial (GID 287)
    this.slowBoxSystem = new SpikeBoxSystem(this, {
      tilemap: this.tilemap,
      surfaceLayer: this.surfaceLayer,
      spikeBoxTileIds: [287],
      moveInterval: 2500,
      moveSpeed: 150,
      damage: 1,
      knockbackForce: 250,
      depth: 10,
    });
    this.slowBoxSystem.createSpikeBoxes();
    this.slowBoxSystem.setupPlayerCollision(this.player);

    // ⚡ Sistema 2: Cajas rápidas en zona final (GID 288)
    this.fastBoxSystem = new SpikeBoxSystem(this, {
      tilemap: this.tilemap,
      surfaceLayer: this.surfaceLayer,
      spikeBoxTileIds: [288],
      moveInterval: 600, // Muy rápido
      moveSpeed: 280,
      damage: 2, // Más daño
      knockbackForce: 400,
      depth: 10,
    });
    this.fastBoxSystem.createSpikeBoxes();
    this.fastBoxSystem.setupPlayerCollision(this.player);
  }

  shutdown() {
    this.slowBoxSystem?.destroy();
    this.fastBoxSystem?.destroy();
  }
}
```

---

## Ejemplo: Cajas Solo Visuales (Sin Daño)

```typescript
// Cajas decorativas que se mueven pero no hacen daño
const decorativeBoxes = new SpikeBoxSystem(this, {
  tilemap: this.tilemap,
  surfaceLayer: this.surfaceLayer,
  spikeBoxTileIds: [289],
  moveInterval: 1000,
  moveSpeed: 100,
});

decorativeBoxes.createSpikeBoxes();
// ⚠️ NO llamar setupPlayerCollision() = sin daño
```

---

## Ejemplo: Sincronización de Múltiples Cajas

```typescript
// Todas las cajas del mismo sistema se mueven al mismo tiempo
const synchronizedBoxes = new SpikeBoxSystem(this, {
  tilemap: this.tilemap,
  surfaceLayer: this.surfaceLayer,
  spikeBoxTileIds: [287, 288, 289], // Múltiples GIDs
  moveInterval: 1500,
  moveSpeed: 200,
});

synchronizedBoxes.createSpikeBoxes();
// Todas empiezan y paran al mismo tiempo = efecto coreografiado
```

---

## Ejemplo: Cajas con Spritesheet Personalizado

```typescript
// Usar tus propios assets
const customBoxes = new SpikeBoxSystem(this, {
  tilemap: this.tilemap,
  surfaceLayer: this.surfaceLayer,
  spikeBoxTileIds: [100, 101, 102],
  spritesheetKey: "my-custom-traps", // Tu spritesheet
  tilesetName: "my-tileset", // Tu tileset
  moveInterval: 1200,
  moveSpeed: 180,
});
```

---

## Tabla Comparativa de Configuraciones

| Nivel    | Intervalo | Velocidad | Daño | Knockback | Dificultad |
| -------- | --------- | --------- | ---- | --------- | ---------- |
| Tutorial | 4000ms    | 80 px/s   | 0    | 0         | ⭐         |
| Fácil    | 3000ms    | 120 px/s  | 1    | 200       | ⭐⭐       |
| Normal   | 1500ms    | 180 px/s  | 1    | 300       | ⭐⭐⭐     |
| Difícil  | 800ms     | 250 px/s  | 2    | 400       | ⭐⭐⭐⭐   |
| Extremo  | 500ms     | 300 px/s  | 3    | 500       | ⭐⭐⭐⭐⭐ |

---

## Código Mínimo Requerido

```typescript
// Uso más simple posible (solo 5 líneas)
const boxes = new SpikeBoxSystem(this, {
  tilemap: this.tilemap,
  surfaceLayer: this.surfaceLayer,
  spikeBoxTileIds: [287],
});
boxes.createSpikeBoxes(); // Usa todos los valores por defecto
```

---

## Integración con BaseGameScene

La forma más simple de todas:

```typescript
// En el constructor de cualquier nivel
const config: GameSceneConfig = {
  // ... config básico ...
  enableSpikeBoxes: true, // Solo esto!
  spikeBoxConfig: { spikeBoxTileIds: [287] }, // Y esto!
};
```

**Todo lo demás es automático:**

- ✅ Creación
- ✅ Colisión con jugador
- ✅ Update
- ✅ Destrucción

---

## Checklist de Implementación

- [ ] Añadir tiles con propiedad `smash=true` en Tiled
- [ ] Anotar el GID del tile (ej: 287)
- [ ] Añadir config en el nivel
- [ ] Probar y ajustar velocidad/intervalo
- [ ] Verificar que se destruye en shutdown (si es manual)

¡Listo para usar en cualquier nivel! 🚀
