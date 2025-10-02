# 📁 Escenas del Proyecto

## 🎯 Overview

Esta carpeta contiene todas las escenas del juego. El proyecto usa una arquitectura centralizada donde **BaseGameScene** maneja toda la lógica automáticamente.

---

## � Archivos Principales

### ⭐ **BaseGameScene.ts**

**Clase base con toda la lógica del juego**

Maneja automáticamente:

- ✅ Sistema de colisiones
- ✅ Sistema de enemigos (opcional)
- ✅ Sistema de proyectiles (snowballs)
- ✅ Sistema de partículas de nieve
- ✅ Sistema de vidas
- ✅ Detección de tiles especiales
- ✅ UI de fin de nivel
- ✅ Muros de nieve destructibles
- ✅ Música y sonidos

**No edites este archivo a menos que necesites añadir funcionalidad global.**

---

### 📝 **TestingMapScene.ts**

**TEMPLATE OFICIAL - Ejemplo minimalista para nuevos niveles**

Este es el ejemplo perfecto de cómo debe ser un nuevo nivel: **SOLO CONFIGURACIÓN**.

```typescript
export class MiNuevoNivel extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      // Configuración del mapa
      tilemapKey: "MiMapa",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",

      // Player
      playerStartPosition: { x: 400, y: 900 },

      // Cámara
      cameraZoom: 1.0,
      cameraFollow: { lerp: { x: 1, y: 1 }, offset: { x: 0, y: 0 } },

      // Música
      musicKey: "mi_musica",

      // Enemigos automáticos
      enableEnemies: true,
      enemyConfig: {
        maxEnemies: 8,
        minSurfaceWidth: 5,
        patrolMargin: 50,
        safeDistance: 100,
      },
    };

    super("MiNuevoNivel", config);
  }

  protected createMap(): void {
    this.tilemap = this.add.tilemap("MiMapa");
    this.setupTilesets();
    this.createStandardLayers();
    this.events.emit("scene-awake");
  }

  editorCreate(): void {
    this.createMap();
  }
}
```

**Eso es todo. No necesitas más código. 🎉**

---

### 🎵 **PreloadScene.ts**

Carga todos los assets del juego (imágenes, audio, tilemaps).

---

### 🔧 **LevelUtils.ts**

Configuraciones y utilidades predefinidas para niveles.

- Presets de cámara (NORMAL, SMOOTH, PLATFORMER, etc.)
- Presets de tilesets
- Posiciones de inicio predefinidas
- Helpers de configuración

---

## 🚀 Cómo Crear un Nuevo Nivel

### Opción 1: Copiar el Template (Recomendado)

```bash
# 1. Copiar TestingMapScene.ts
cp src/scenes/TestingMapScene.ts src/scenes/Level1Scene.ts

# 2. Editar el archivo:
# - Cambiar clase: TestingMapScene → Level1Scene
# - Cambiar tilemapKey: "TestingMap" → "Level1"
# - Ajustar configuración
```

### Opción 2: Desde Cero

1. Crear nuevo archivo en `src/scenes/`
2. Extender `BaseGameScene`
3. Configurar en el constructor
4. Implementar `createMap()` y `editorCreate()`

---

## ⚙️ Configuración de Nivel

### Configuración Básica

```typescript
const config: GameSceneConfig = {
  tilemapKey: string, // Clave del tilemap
  surfaceLayerName: string, // Layer de superficies
  backgroundLayerName: string, // Layer de fondo (opcional)
  objectsLayerName: string, // Layer de objetos (opcional)
  playerStartPosition: { x, y }, // Posición inicial del player
  cameraZoom: number, // Zoom de cámara (default: 1.0)
  musicKey: string, // Clave de música (opcional)
};
```

### Configuración de Enemigos

```typescript
const config: GameSceneConfig = {
  // ... configuración básica

  enableEnemies: true, // Activar sistema de enemigos
  enemyConfig: {
    maxEnemies: 8, // Máximo de enemigos
    minSurfaceWidth: 5, // Ancho mínimo de superficie (tiles)
    patrolMargin: 50, // Margen para patrulla (px)
    safeDistance: 100, // Distancia segura del player (px)
  },
};
```

### Configuración de Cámara

```typescript
cameraFollow: {
  lerp: { x: 1, y: 1 },           // Suavidad (0-1)
  offset: { x: 0, y: 0 },         // Offset (px)
}
```

---

## 📋 Checklist para Nuevo Nivel

- [ ] Crear archivo extendiendo `BaseGameScene`
- [ ] Configurar `GameSceneConfig` en constructor
- [ ] Implementar `createMap()`
- [ ] Implementar `editorCreate()` para compatibilidad con editor
- [ ] Añadir tilemap al `PreloadScene`
- [ ] Probar el nivel

---

## 🎯 Sistemas Disponibles

Todos estos sistemas están disponibles automáticamente en `BaseGameScene`:

| Sistema                | Descripción          | Activación            |
| ---------------------- | -------------------- | --------------------- |
| **EnemySystem**        | Gestión de enemigos  | `enableEnemies: true` |
| **ProjectileSystem**   | Gestión de snowballs | Automático            |
| **SnowParticleSystem** | Partículas de nieve  | Automático            |
| **LifeSystem**         | Sistema de vidas     | Automático            |
| **PlayerStateManager** | Estados del player   | Automático            |
| **TileMapManager**     | Gestión de tilemap   | Automático            |

---

## ❌ Qué NO Hacer

1. **No crear enemigos manualmente** → Usa `enableEnemies: true`
2. **No gestionar proyectiles manualmente** → El sistema lo hace
3. **No duplicar lógica de BaseGameScene** → Extiende cuando sea necesario
4. **No hardcodear valores** → Usa configuración

---

## ✅ Mejores Prácticas

1. **Mantén las escenas simples**: Solo configuración
2. **Usa sistemas existentes**: No reinventes la rueda
3. **Override solo cuando sea necesario**: La mayoría de lógica está en BaseGameScene
4. **Documenta cambios específicos**: Si añades lógica especial

---

## 📚 Documentación Adicional

Para más información sobre la arquitectura del proyecto, consulta:

- [`/ARCHITECTURE.md`](../../ARCHITECTURE.md) - Documentación completa de la arquitectura
- [`/src/systems/`](../systems/) - Documentación de sistemas individuales

---

## 🔍 Debugging

```typescript
// Ver enemigos activos
console.log(this.enemySystem?.getEnemyCount());

// Ver proyectiles activos
console.log(this.projectileSystem?.getProjectileCount());

// Ver superficies detectadas
const surfaces = SurfaceDetector.findValidSurfaces(this.surfaceLayer);
console.log(surfaces);
```

---

¡Feliz desarrollo! 🎮✨
