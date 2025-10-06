# Guía: Sistema de Llaves y Puertas

## Resumen

Sistema automático de llaves coleccionables y puertas que se abren consumiendo llaves. Los sistemas detectan automáticamente objetos en Tiled por sus GIDs.

## Configuración en Tiled

### 1. Crear Capa de Objetos

- En Tiled, crea una capa de tipo **Object Layer** (por ejemplo: "elements")
- Esta capa contendrá todas las llaves y puertas

### 2. Añadir Llaves

1. Selecciona la herramienta **"Insertar Patrón"** (Insert Tile)
2. Elige el tile de la llave del tileset (ej: tile 229 - fila 12, col 12)
3. Coloca las llaves en el mapa
4. **NO necesitas añadir propiedades custom** - se detecta por GID automáticamente

### 3. Añadir Puertas

1. Las puertas suelen tener 2 tiles verticales (superior + inferior)
2. Usa la herramienta **"Insertar Patrón"**
3. Coloca el tile superior (ej: tile 52) en la posición superior
4. Coloca el tile inferior (ej: tile 70) justo debajo (64px de separación)
5. El sistema **agrupa automáticamente** las partes cercanas (<96px)

### 4. Exportar

- Guarda el mapa (Ctrl+S)
- Exporta a JSON (Archivo → Exportar como → JSON)

## Configuración en tu Nivel (TypeScript)

### Ejemplo completo:

```typescript
import { KeySystem } from "../systems/KeySystem";
import { DoorSystem } from "../systems/DoorSystem";

export class Level2 extends BaseGameScene {
  private keySystem!: KeySystem;
  private doorSystem!: DoorSystem;

  create() {
    super.create();

    // 1. Crear sistema de llaves
    this.createKeys();

    // 2. Crear sistema de puertas (requiere keySystem)
    this.createDoors();
  }

  private createKeys(): void {
    this.keySystem = new KeySystem(this, {
      tilemap: this.tilemap,
      keyTileIds: [229], // GID del tile de llave en tu tileset
    });

    this.keySystem.createKeys();

    // Configurar colisión con jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.keySystem.setupPlayerCollision(this.player);
      }
    });
  }

  private createDoors(): void {
    this.doorSystem = new DoorSystem(this, {
      tilemap: this.tilemap,
      keySystem: this.keySystem,
      doorTileIds: [52, 70], // GIDs de tiles de puerta (superior, inferior)
    });

    this.doorSystem.createDoors();

    // Configurar colisión con jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.doorSystem.setupPlayerCollision(this.player);
      }
    });
  }
}
```

## Opciones Avanzadas

### KeySystem - Configuración Opcional

```typescript
new KeySystem(this, {
  tilemap: this.tilemap,
  keyTileIds: [229],

  // Opcionales (con valores por defecto):
  tilesetName: "spritesheet-tiles-default", // Auto-detecta el primero
  spritesheetKey: "spritesheet-tiles-frames", // Spritesheet para frames
  depth: 10,
  collectSoundKey: "", // Sonido al recoger
  soundVolume: 0.3,
});
```

### DoorSystem - Configuración Opcional

```typescript
new DoorSystem(this, {
  tilemap: this.tilemap,
  keySystem: this.keySystem,
  doorTileIds: [52, 70],

  // Opcionales (con valores por defecto):
  tilesetName: "spritesheet-tiles-default", // Auto-detecta el primero
  spritesheetKey: "spritesheet-tiles-frames", // Spritesheet para frames
  proximityThreshold: 96, // Distancia máxima para agrupar partes (px)
  depth: 10,
  openSoundKey: "", // Sonido al abrir
  soundVolume: 0.3,
});
```

## Cómo Encontrar GIDs

### Método 1: Inspeccionar JSON

1. Abre tu archivo `Level.json`
2. Busca la sección `"objectgroup"` con tu capa de objetos
3. Encuentra el objeto y busca su propiedad `"gid"`

Ejemplo:

```json
{
  "gid": 229,
  "x": 448,
  "y": 128
}
```

### Método 2: Calcular desde Tileset

- **Fórmula**: `gid = (fila × columnas_por_fila) + columna + firstgid`
- Ejemplo para tileset de 18 columnas, fila 12, col 12:
  - `gid = (12 × 18) + 12 + 1 = 229`

## Comportamiento del Sistema

### Llaves

- ✅ Flotan y rotan automáticamente
- ✅ Se recogen al tocarlas (colisión)
- ✅ Incrementan contador en UI
- ✅ Animación de recogida (flotar hacia arriba + fade)

### Puertas

- ✅ Bloquean al jugador (colisión estática)
- ✅ Puertas multi-tile se agrupan automáticamente (distancia < 96px)
- ✅ Al tocar con llave → se consume 1 llave y se abren todas las partes
- ✅ Al tocar sin llave → vibran para indicar que necesitas llave
- ✅ Animación de apertura (scale + fade)

## UI Automática

El contador de llaves se actualiza automáticamente:

- `BaseGameScene` escucha eventos `keyCollected` y `keyUsed`
- `LifeSystem` muestra el contador en pantalla
- No necesitas código adicional

## Troubleshooting

### Las llaves/puertas no aparecen

- ✅ Verifica que exportaste el mapa a JSON después de añadir los objetos
- ✅ Comprueba que los GIDs en `keyTileIds` / `doorTileIds` coinciden con el JSON
- ✅ Asegúrate de tener una capa de objetos (no tile layer)

### Las puertas consumen 2 llaves

- ✅ Verifica que las 2 partes están a menos de 96px de distancia
- ✅ Revisa en consola del navegador si se agruparon correctamente
- ✅ Aumenta `proximityThreshold` si están más separadas

### Las llaves no tienen colisión

- ✅ Asegúrate de llamar `setupPlayerCollision()` después de crear el jugador
- ✅ Usa `delayedCall(100)` para dar tiempo a la creación del jugador

## Próximos Pasos

Para nuevos niveles, solo necesitas:

1. Crear capa de objetos en Tiled
2. Añadir tiles de llaves/puertas
3. Exportar JSON
4. Copiar los métodos `createKeys()` y `createDoors()`
5. Ajustar los GIDs si usas diferentes tiles

¡Listo! El sistema se encarga del resto automáticamente. 🎮
