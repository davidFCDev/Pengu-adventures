# 📚 Guía de Arquitectura del Proyecto

## 🎯 Resumen de la Refactorización

Este proyecto ha sido completamente refactorizado para ser **escalable, modular y fácil de mantener**. Toda la lógica compleja ha sido extraída de las escenas de nivel y movida a sistemas reutilizables.

---

## 📁 Estructura del Proyecto

```
src/
├── scenes/
│   ├── BaseGameScene.ts          # ⭐ Clase base con toda la lógica automática
│   ├── TestingMapScene.ts        # 📝 TEMPLATE - Ejemplo minimalista
│   ├── PreloadScene.ts            # Carga de assets
│   └── LevelUtils.ts              # Configuraciones predefinidas
├── systems/
│   ├── EnemyManager.ts            # 🤖 Sistema de enemigos (antes en EnemyManager.ts)
│   ├── ProjectileSystem.ts       # 💫 Sistema de proyectiles
│   ├── SurfaceDetector.ts        # 🔍 Detección de superficies
│   ├── SnowParticleSystem.ts     # ❄️ Sistema de partículas de nieve
│   ├── LifeSystem.ts              # ❤️ Sistema de vidas
│   └── tilemap/
│       ├── TileMapManager.ts      # 🗺️ Gestión de tilemaps
│       └── PlayerStateManager.ts  # 🎮 Estados del player
├── objects/
│   ├── player/
│   │   ├── Player.ts              # Clase del jugador
│   │   ├── PenguinSprites.ts     # Animaciones
│   │   └── Snowball.ts            # Proyectil
│   ├── enemies/
│   │   ├── BasicEnemy.ts          # Enemigo básico
│   │   └── index.ts               # Exports
│   └── ui/
│       └── LevelEndUI.ts          # UI de fin de nivel
└── config/
    └── GameSettings.ts             # Configuración global
```

---

## 🚀 Cómo Crear un Nuevo Nivel

### Paso 1: Copiar el Template

Copia `TestingMapScene.ts` y renómbralo (ej: `Level1Scene.ts`)

### Paso 2: Configurar el Nivel

```typescript
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

export class Level1Scene extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      // 🗺️ Configuración del mapa
      tilemapKey: "Level1",
      surfaceLayerName: "superficies",
      backgroundLayerName: "fondo",
      objectsLayerName: "objects",

      // 🎮 Configuración del player
      playerStartPosition: { x: 400, y: 900 },

      // 📷 Configuración de cámara
      cameraZoom: 1.0,
      cameraFollow: {
        lerp: { x: 1, y: 1 },
        offset: { x: 0, y: 0 },
      },

      // 🎵 Música del nivel
      musicKey: "level1_music",

      // 🤖 Sistema de enemigos (opcional)
      enableEnemies: true,
      enemyConfig: {
        maxEnemies: 8,
        minSurfaceWidth: 5,
        patrolMargin: 50,
        safeDistance: 100,
      },
    };

    super("Level1Scene", config);
  }

  protected createMap(): void {
    this.tilemap = this.add.tilemap("Level1");
    this.setupTilesets();
    this.createStandardLayers();
    this.events.emit("scene-awake");
  }

  editorCreate(): void {
    this.createMap();
  }
}
```

### Paso 3: ¡Listo! 🎉

No necesitas añadir nada más. BaseGameScene maneja automáticamente:

- ✅ Sistema de colisiones
- ✅ Sistema de enemigos
- ✅ Sistema de proyectiles (snowballs)
- ✅ Sistema de nieve
- ✅ Sistema de vidas
- ✅ Detección de tiles especiales (agua, escaleras, etc.)
- ✅ UI de fin de nivel
- ✅ Muros de nieve destructibles

---

## 🎯 Sistemas Centralizados

### 1. **EnemySystem** (`systems/EnemyManager.ts`)

Gestiona automáticamente la creación y comportamiento de enemigos.

```typescript
// Se inicializa automáticamente en BaseGameScene si enableEnemies: true
this.enemySystem = new EnemySystem(
  this,
  this.player,
  this.surfaceLayer,
  config.enemyConfig
);

this.enemySystem.initialize(playerStartPosition);
```

**Características:**

- Detecta automáticamente superficies válidas
- Coloca enemigos evitando la zona del player
- Configura colisiones automáticamente
- Gestiona ciclo de vida completo

### 2. **ProjectileSystem** (`systems/ProjectileSystem.ts`)

Gestiona todos los proyectiles (snowballs).

```typescript
// Se inicializa automáticamente en BaseGameScene
this.projectileSystem = new ProjectileSystem(this);
```

**Características:**

- Escucha eventos de creación de snowballs
- Gestiona grupo de físicas
- Configura colisiones automáticamente
- Limpia proyectiles fuera del mapa

### 3. **SurfaceDetector** (`systems/SurfaceDetector.ts`)

Utilidad para detectar superficies horizontales en el mapa.

```typescript
const surfaces = SurfaceDetector.findValidSurfaces(layer, {
  minTilesWidth: 5,
  excludeAreas: [{ x: 400, y: 900, radius: 100 }],
});
```

**Características:**

- Detecta superficies por propiedades de tiles
- Filtra por tamaño mínimo
- Excluye áreas específicas
- Distribuye posiciones uniformemente

### 4. **SnowParticleSystem** (`systems/SnowParticleSystem.ts`)

Sistema de partículas de nieve que cae en TODO el mapa.

```typescript
// Se inicializa automáticamente en BaseGameScene
this.snowParticleSystem = new SnowParticleSystem(this, this.surfaceLayer);
```

**Características:**

- 200 copos distribuidos en todo el mapa
- Colisionan con tiles que tienen `collision=true`
- Optimizado: solo renderiza copos visibles
- Ciclo continuo y realista

---

## 🔧 Configuración Avanzada

### Deshabilitar Sistemas

```typescript
const config: GameSceneConfig = {
  // ...
  enableEnemies: false, // No crear enemigos automáticamente
};
```

### Configurar Enemigos

```typescript
enemyConfig: {
  maxEnemies: 12,        // Máximo de enemigos
  minSurfaceWidth: 7,    // Ancho mínimo de superficie (tiles)
  patrolMargin: 60,      // Margen para patrulla (px)
  safeDistance: 150,     // Distancia segura del player (px)
}
```

### Configurar Cámara

```typescript
cameraFollow: {
  lerp: { x: 0.1, y: 0.1 },    // Suavidad (0-1)
  offset: { x: 100, y: -30 },  // Offset (px)
}
```

---

## 📝 Mejores Prácticas

### ✅ HACER

1. **Configurar en el constructor**: Toda la configuración va en `GameSceneConfig`
2. **Usar sistemas existentes**: No reinventes la rueda
3. **Extender cuando sea necesario**: Override solo lo que necesites
4. **Documentar cambios específicos**: Si añades lógica especial, documéntala

### ❌ NO HACER

1. **No crear enemigos manualmente**: Usa `enableEnemies: true`
2. **No gestionar proyectiles manualmente**: El sistema lo hace automáticamente
3. **No duplicar lógica**: Si algo puede ir en BaseGameScene, ponlo ahí
4. **No hardcodear valores**: Usa configuración

---

## 🔍 Debugging

### Ver enemigos creados

```typescript
console.log("Enemigos activos:", this.enemySystem?.getEnemyCount());
console.log("Lista:", this.enemySystem?.getEnemies());
```

### Ver proyectiles activos

```typescript
console.log("Proyectiles:", this.projectileSystem?.getProjectileCount());
```

### Ver superficies detectadas

```typescript
const surfaces = SurfaceDetector.findValidSurfaces(this.surfaceLayer);
console.log("Superficies encontradas:", surfaces);
```

---

## 📊 Métricas de Mejora

### Antes de la Refactorización

- **TestingMapScene**: ~368 líneas
- **Lógica duplicada**: Alta
- **Complejidad**: Alta
- **Mantenibilidad**: Baja

### Después de la Refactorización

- **TestingMapScene**: ~90 líneas (-75% 🎉)
- **Lógica duplicada**: Ninguna
- **Complejidad**: Baja
- **Mantenibilidad**: Alta
- **Sistemas reutilizables**: 4 nuevos

---

## 🎓 Conceptos Clave

1. **Separación de Responsabilidades**: Cada sistema tiene una función específica
2. **Composición sobre Herencia**: BaseGameScene compone sistemas
3. **Configuración sobre Código**: Los niveles solo configuran, no implementan
4. **DRY (Don't Repeat Yourself)**: Lógica compartida en un solo lugar

---

## 🚧 Próximos Pasos (Opcional)

- [ ] Añadir sistema de power-ups
- [ ] Crear sistema de diálogos/cutscenes
- [ ] Implementar sistema de guardado
- [ ] Añadir más tipos de enemigos
- [ ] Sistema de achievements

---

## 📞 Soporte

Si tienes dudas sobre cómo usar estos sistemas, revisa:

1. `TestingMapScene.ts` - Ejemplo minimalista
2. `BaseGameScene.ts` - Documentación inline
3. Este README

¡Feliz desarrollo! 🎮✨
