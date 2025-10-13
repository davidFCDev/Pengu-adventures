# 🔴 Red Button System - Guía de Uso

## 📋 Descripción General

El **Red Button System** es un sistema reutilizable que permite crear **botones rojos** que, al ser presionados por el jugador, **desbloquean cadenas** de forma **permanente**. Este sistema es ideal para crear puzzles de desbloqueo en los niveles.

---

## 🎯 Características Principales

- ✅ **Botones permanentes**: Una vez presionados, permanecen activados
- ✅ **Desbloqueo global**: Al presionar un botón, se desbloquean **TODAS** las cadenas del nivel
- ✅ **Animación suave**: Las cadenas desaparecen con fade out (300ms)
- ✅ **Física automática**: Sistema de colisiones configurado automáticamente
- ✅ **Detección inteligente**: Detecta objetos desde Tiled con propiedades específicas
- ✅ **Sistema de sonido**: Sonido de desbloqueo al activar (configurable)

---

## 🎮 Comportamiento

### Botón Rojo

1. El jugador salta y cae sobre el botón (detecta `velocity.y > 0`)
2. El botón cambia de **unpressed** (ID 10) a **pressed** (ID 315)
3. Se emite el evento de desbloqueo de cadenas
4. El botón permanece presionado **para siempre**

### Cadenas

1. Inician como **colisiones sólidas** que bloquean el paso
2. Al presionar el botón rojo, se desactiva su física
3. Se aplica un **fade out** de 300ms con alpha 0
4. Son destruidas una vez completada la animación

---

## 🔧 Configuración en Tiled

### Botón Rojo (Sin Presionar)

```
Tile ID: 10
GID: 11 (ID + 1)
Propiedades:
  - name: "red-button"
  - collision: true
  - pressed: false
```

### Botón Rojo (Presionado)

```
Tile ID: 315
GID: 316 (ID + 1)
Propiedades:
  - name: "red-button"
  - collision: true
  - pressed: true
```

### Cadenas (Bloqueo)

```
Tile ID: 213
GID: 214 (ID + 1)
Propiedades:
  - chain: true
  - collision: true
```

---

## 🚀 Uso en una Escena

### 1. Habilitar el Sistema en la Configuración

```typescript
export class Level5 extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level5",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",
      tilesets: [
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
      ],
      playerStartPosition: { x: 100, y: 2080 },
      musicKey: "level5_music",

      // 🔴 Habilitar sistema de botones rojos
      enableRedButtons: true,
      redButtonConfig: {
        unpressedGID: 11, // ID 10 + 1
        pressedGID: 316, // ID 315 + 1
        chainGID: 214, // ID 213 + 1
      },
    };
    super("Level5", config);
  }
}
```

### 2. Configuración Personalizada (Opcional)

```typescript
redButtonConfig: {
  unpressedGID: 11,           // GID del botón sin presionar
  pressedGID: 316,            // GID del botón presionado
  chainGID: 214,              // GID de las cadenas
  soundKey: "unlock_sound",   // Sonido personalizado
  soundVolume: 1.0,           // Volumen del sonido
  depth: 10,                  // Profundidad visual
}
```

---

## 📐 Arquitectura del Sistema

### Archivos Principales

```
src/systems/RedButtonSystem.ts     # Sistema principal
src/scenes/BaseGameScene.ts        # Integración automática
```

### Flujo de Ejecución

```
1. BaseGameScene.create()
   ↓
2. createRedButtonSystem() (si enableRedButtons = true)
   ↓
3. RedButtonSystem.createRedButtons()
   → Busca objetos con GID = unpressedGID
   → Crea sprites con física
   → Configura overlap con player
   ↓
4. RedButtonSystem.createChains()
   → Busca objetos con GID = chainGID
   → Crea sprites con física y colisión sólida
   ↓
5. Player presiona botón
   ↓
6. RedButtonSystem.unlockAllChains()
   → Desactiva física de cadenas
   → Aplica fade out (300ms)
   → Destruye cadenas
```

---

## 🎨 Ejemplo Completo

### Configuración en Level5.ts

```typescript
export class Level5 extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level5",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",
      tilesets: [
        {
          name: "spritesheet-tiles-default",
          imageKey: "spritesheet-tiles-default",
        },
      ],
      playerStartPosition: { x: 100, y: 2080 },
      musicKey: "level5_music",

      // 🔴 Sistema de botones rojos y cadenas
      enableRedButtons: true,
      redButtonConfig: {
        unpressedGID: 11, // Botón sin presionar
        pressedGID: 316, // Botón presionado
        chainGID: 214, // Cadenas de bloqueo
      },
    };
    super("Level5", config);
  }
}
```

### Objetos en Tiled

```
Capa: objects

Objeto 1:
  - Tile: ID 10 (Botón sin presionar)
  - Position: (500, 1500)
  - Properties:
    * name: "red-button"
    * collision: true
    * pressed: false

Objeto 2:
  - Tile: ID 213 (Cadena)
  - Position: (800, 1200)
  - Properties:
    * chain: true
    * collision: true

Objeto 3:
  - Tile: ID 213 (Cadena)
  - Position: (850, 1200)
  - Properties:
    * chain: true
    * collision: true
```

---

## ⚙️ Configuración Avanzada

### Personalizar Sonidos

```typescript
// En PreloadScene.ts
this.load.audio("custom_unlock", "assets/sounds/unlock.mp3");

// En Level5.ts
redButtonConfig: {
  unpressedGID: 11,
  pressedGID: 316,
  chainGID: 214,
  soundKey: "custom_unlock",
  soundVolume: 0.8,
}
```

### Ajustar Animaciones

Modificar en `RedButtonSystem.ts`:

```typescript
// En el método unlockAllChains()
this.config.scene.tweens.add({
  targets: chainSprite,
  alpha: 0,
  duration: 500, // Duración más larga (500ms)
  ease: "Cubic.easeOut", // Ease diferente
  onComplete: () => {
    chainSprite.destroy();
  },
});
```

---

## 🐛 Debugging

### Logs de Consola

```typescript
🔴 [RedButtonSystem] Encontrados 2 red buttons
⛓️ [RedButtonSystem] Encontradas 5 cadenas
🔴 [RedButtonSystem] Botón presionado - Cadenas desbloqueadas
⛓️ [RedButtonSystem] 5 cadenas desbloqueadas
```

### Verificación de GIDs

Si los objetos no se detectan:

1. Verificar que `GID = TileID + 1`
2. Confirmar el nombre del tileset: `"spritesheet-tiles-default"`
3. Revisar propiedades en Tiled (name, collision, chain, pressed)

---

## 📊 Comparación con Otros Sistemas

| Sistema             | Activación         | Efecto             | Permanente      |
| ------------------- | ------------------ | ------------------ | --------------- |
| **Red Button**      | Saltar sobre botón | Desbloquea cadenas | ✅ Sí           |
| **Jump Button**     | Saltar sobre botón | Super salto        | ❌ No (resetea) |
| **Door System**     | Recoger llave      | Abre puerta        | ✅ Sí           |
| **Elevator System** | Automático         | Plataforma móvil   | ♾️ Infinito     |

---

## 🔄 Reutilización en Otros Niveles

```typescript
// Level6.ts
export class Level6 extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      // ... otras configuraciones

      // Simplemente habilita el sistema
      enableRedButtons: true,
      redButtonConfig: {
        unpressedGID: 11,
        pressedGID: 316,
        chainGID: 214,
      },
    };
    super("Level6", config);
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] Añadir tiles en Tiled con IDs correctos (10, 315, 213)
- [ ] Configurar propiedades en Tiled (name, collision, chain, pressed)
- [ ] Habilitar `enableRedButtons: true` en la escena
- [ ] Configurar `redButtonConfig` con los GIDs correctos
- [ ] (Opcional) Añadir sonido de desbloqueo en PreloadScene
- [ ] Probar en el juego: saltar sobre el botón
- [ ] Verificar que las cadenas desaparezcan

---

## 🎓 Notas Técnicas

### Diferencias con JumpButton System

- **JumpButton**: Resetea después de usarse (temporal)
- **RedButton**: Permanente, no resetea

### Gestión de Estado

- El botón guarda su estado en `isPressed` (local)
- El sistema guarda el estado global en `isUnlocked`
- **No** se resetea al cambiar de nivel (comportamiento deseado)

### Física de Colisiones

- **Cadenas**: `Collider` con player (bloquea paso)
- **Botón**: `Overlap` con player (no bloquea paso)

---

## 📚 Referencias

- Sistema base: `JumpButtonSystem.ts`
- Integración: `BaseGameScene.ts`
- Patrón similar a: `ElevatorSystem`, `TemporaryPlatformSystem`

---

¡Sistema listo para usar en cualquier nivel! 🎮
