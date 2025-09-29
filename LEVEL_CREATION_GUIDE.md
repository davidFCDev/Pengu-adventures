# 🐧 **GUÍA COMPLETA: CREAR NUEVOS NIVELES**

Esta guía te enseña cómo crear nuevos niveles para el juego del pingüino de forma rápida y eficiente usando la arquitectura BaseGameScene.

---

## 📋 **ÍNDICE**

1. [Resumen Rápido](#resumen-rápido)
2. [Configuración de Tiled](#configuración-de-tiled)
3. [Implementación del Código](#implementación-del-código)
4. [Configuración Avanzada](#configuración-avanzada)
5. [Propiedades de Tiles](#propiedades-de-tiles)
6. [Ejemplos Completos](#ejemplos-completos)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 **RESUMEN RÁPIDO**

### ⏱️ **Crear un nivel en 5 minutos:**

1. **Crear mapa en Tiled** con layers: `fondo`, `superficies`, `objects`
2. **Añadir tile con `start=true`** donde aparecerá el player
3. **Copiar `LevelTemplate.ts`** como plantilla
4. **Cambiar 3 valores**: `tilemapKey`, nombre de la clase, clave de la escena
5. **Cargar tilemap en PreloadScene**
6. **¡Listo!** - Todas las mecánicas funcionan automáticamente

---

## 🗺️ **CONFIGURACIÓN DE TILED**

### 📁 **Estructura de Layers Requerida**

```
Nuevo_Mapa.tmx
├── 🎨 fondo           (Layer de decoración, opcional)
├── 🏗️ superficies     (Layer principal de colisiones)
└── ⚡ objects         (Layer de spikes, items especiales)
```

### 🎯 **Propiedades de Tiles Soportadas**

#### **Tiles de Inicio**

```json
{ "start": true } // Posición inicial del player
```

#### **Tiles de Agua**

```json
{ "water": true } // Activa modo nado automáticamente
```

#### **Tiles de Escalera**

```json
{ "ladder": true } // Activa modo escalada con ↑/↓
```

#### **Tiles de Colisión**

```json
{ "collision": true } // Bloquea el paso del player
```

#### **Tiles Cross (Fantasma)**

```json
{ "cross": true } // Colisión en modo normal, atravesable en modo fantasma
```

#### **Spikes (Enemigos)**

```json
{ "collision": true, "kill": true } // Quita vida al player
```

#### **Spikes con Orientación Específica**

```json
{
  "collision": true,
  "kill": true,
  "position": "top" // "top", "bottom", "left", "right"
}
```

### 📐 **Configuración Recomendada en Tiled**

```
Tamaño de Tile: 64x64 pixels
Formato de exportación: JSON
Layers:
  - fondo: Infinite = true, Visible = true
  - superficies: Infinite = true, Visible = true
  - objects: Infinite = true, Visible = true
```

---

## 💾 **IMPLEMENTACIÓN DEL CÓDIGO**

### 1️⃣ **Crear Archivo de Escena** (`src/scenes/MiNuevoNivel.ts`)

```typescript
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

export class MiNuevoNivel extends BaseGameScene {
  constructor() {
    // 🎯 CONFIGURACIÓN ESPECÍFICA DEL NIVEL
    const config: GameSceneConfig = {
      tilemapKey: "MiMapaEnTiled", // ← Nombre del JSON del mapa
      surfaceLayerName: "superficies", // ← Layer principal
      backgroundLayerName: "fondo", // ← Layer de fondo (opcional)
      objectsLayerName: "objects", // ← Layer de objetos (opcional)
      playerStartPosition: { x: 400, y: 900 }, // ← Fallback si no hay start=true
      cameraZoom: 1.0, // ← Zoom específico
      cameraFollow: {
        // ← Configuración de cámara
        lerp: { x: 1, y: 1 },
        offset: { x: 0, y: 0 },
      },
    };

    super("MiNuevoNivel", config);
  }

  // 🗺️ CREACIÓN DEL MAPA (Solo necesitas cambiar nombres)
  protected createMap(): void {
    // Crear tilemap
    this.tilemap = this.add.tilemap("MiMapaEnTiled");

    // Configurar tilesets automáticamente
    this.setupTilesets();

    // Crear layers estándar automáticamente
    this.createStandardLayers();

    // Evento para compatibilidad con editor
    this.events.emit("scene-awake");
  }

  // 🎮 LÓGICA ESPECÍFICA DEL NIVEL (Opcional)
  create() {
    super.create(); // ← ¡SIEMPRE llamar primero!

    // Aquí puedes añadir:
    // - NPCs específicos
    // - Efectos visuales únicos
    // - Música del nivel
    // - Elementos interactivos especiales
  }
}
```

### 2️⃣ **Cargar Tilemap** (`src/scenes/PreloadScene.ts`)

```typescript
preload(): void {
  // ... otros assets ...

  // 📁 CARGAR NUEVO MAPA
  this.load.tilemapTiledJSON("MiMapaEnTiled", "assets/MiMapaEnTiled.json");

  // ... resto del código ...
}
```

### 3️⃣ **Registrar Escena** (`src/main.ts` o donde configures Phaser)

```typescript
import { MiNuevoNivel } from "./scenes/MiNuevoNivel";

const config: Phaser.Types.Core.GameConfig = {
  scene: [
    PreloadScene,
    TestingMapScene,
    MiNuevoNivel, // ← Añadir nueva escena
  ],
  // ... resto de configuración
};
```

---

## ⚙️ **CONFIGURACIÓN AVANZADA**

### 🎨 **Tilesets Personalizados**

```typescript
const config: GameSceneConfig = {
  // ... configuración básica ...

  // 🖼️ TILESETS PERSONALIZADOS
  tilesets: [
    { name: "mi-tileset-suelo", imageKey: "mi_tileset_suelo" },
    { name: "mi-tileset-fondo", imageKey: "mi_tileset_fondo" },
    { name: "mi-tileset-decoraciones", imageKey: "decoraciones" },
  ],
};
```

### 📹 **Configuración Avanzada de Cámara**

```typescript
const config: GameSceneConfig = {
  // ... configuración básica ...

  cameraZoom: 1.5, // Zoom más cercano
  cameraFollow: {
    lerp: { x: 0.1, y: 0.1 }, // Seguimiento más suave
    offset: { x: 0, y: -50 }, // Offset hacia arriba
  },
};
```

### 🎵 **Lógica Específica de Nivel**

```typescript
create() {
  super.create();

  // 🎵 MÚSICA DEL NIVEL
  this.sound.play('nivel_1_musica', { loop: true, volume: 0.5 });

  // 🌟 EFECTOS VISUALES
  this.add.particles(100, 100, 'estrella', {
    speed: { min: 50, max: 100 },
    lifespan: 2000,
    frequency: 500
  });

  // 🚪 PORTAL DE SALIDA (ejemplo)
  const portal = this.add.sprite(1200, 300, 'portal');
  this.physics.add.existing(portal, true);
  this.physics.add.overlap(this.player, portal, () => {
    this.scene.start('SiguienteNivel');
  });
}
```

---

## 🎯 **PROPIEDADES DE TILES DETALLADAS**

### 🏊 **Sistema de Agua**

```json
// Tile de agua básica
{ "water": true }

// Agua con corriente (futuro)
{ "water": true, "current": "right", "force": 2 }
```

### 🧗 **Sistema de Escaleras**

```json
// Escalera normal
{ "ladder": true }

// Escalera de una dirección (futuro)
{ "ladder": true, "direction": "up" }
```

### � **Sistema Cross (Fantasma)**

```json
// Tile que bloquea en modo normal pero se puede atravesar en modo fantasma
{ "cross": true }

// Combinado con otros sistemas (futuro)
{ "cross": true, "decoration": true }
```

**Comportamiento:**

- ✅ **Modo Normal**: El tile tiene colisión, bloquea el paso
- 👻 **Modo Fantasma**: El tile no tiene colisión, se puede atravesar
- 🔄 **Dinámico**: El cambio es inmediato al alternar entre modos

### �🔥 **Sistema de Spikes**

```json
// Spike que se auto-orienta según rotación en Tiled
{ "collision": true, "kill": true }

// Spike con orientación forzada
{ "collision": true, "kill": true, "position": "top" }

// Spike con daño personalizado (futuro)
{ "collision": true, "kill": true, "damage": 2 }
```

### 🎯 **Posicionamiento del Player**

```json
// Posición de inicio (solo uno por nivel)
{ "start": true }

// Checkpoint (futuro)
{ "checkpoint": true, "id": "checkpoint_1" }
```

---

## 📚 **EJEMPLOS COMPLETOS**

### 🏔️ **Nivel de Montaña**

```typescript
export class MountainLevel extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "mountain_map",
      surfaceLayerName: "rocas",
      backgroundLayerName: "cielo",
      objectsLayerName: "peligros",
      playerStartPosition: { x: 100, y: 800 },
      cameraZoom: 1.2,
      cameraFollow: {
        lerp: { x: 0.8, y: 0.9 },
        offset: { x: 0, y: -30 },
      },
    };
    super("MountainLevel", config);
  }

  protected createMap(): void {
    this.tilemap = this.add.tilemap("mountain_map");
    this.setupTilesets();
    this.createStandardLayers();
    this.events.emit("scene-awake");
  }

  create() {
    super.create();

    // Viento de montaña
    this.add.particles(0, 0, "nieve", {
      speed: { min: 20, max: 40 },
      angle: { min: 45, max: 135 },
      lifespan: 5000,
      frequency: 200,
      emitZone: {
        type: "edge",
        source: new Phaser.Geom.Rectangle(
          0,
          -100,
          this.cameras.main.width,
          100
        ),
      },
    });
  }
}
```

### 🌊 **Nivel Acuático**

```typescript
export class UnderwaterLevel extends BaseGameScene {
  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "underwater_map",
      surfaceLayerName: "coral",
      backgroundLayerName: "agua_profunda",
      playerStartPosition: { x: 200, y: 400 },
      cameraZoom: 0.8, // Zoom más lejano para ver más área
      cameraFollow: {
        lerp: { x: 0.6, y: 0.6 }, // Movimiento más fluido bajo el agua
        offset: { x: 0, y: 0 },
      },
    };
    super("UnderwaterLevel", config);
  }

  protected createMap(): void {
    this.tilemap = this.add.tilemap("underwater_map");
    this.setupTilesets();
    this.createStandardLayers();
    this.events.emit("scene-awake");
  }

  create() {
    super.create();

    // Burbujas constantes
    this.add.particles(0, this.cameras.main.height, "burbuja", {
      speed: { min: 30, max: 60 },
      angle: { min: -100, max: -80 },
      lifespan: 4000,
      frequency: 300,
      scale: { start: 0.1, end: 0.3 },
      emitZone: {
        type: "edge",
        source: new Phaser.Geom.Rectangle(0, 0, this.cameras.main.width, 50),
      },
    });

    // Filtro azul para simular estar bajo el agua
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0066cc,
      0.1
    );
    overlay.setScrollFactor(0);
  }
}
```

---

## 🚨 **TROUBLESHOOTING**

### ❌ **Problemas Comunes**

#### **El player no aparece**

```typescript
// ✅ SOLUCIÓN: Verificar que existe tile con start=true
// O configurar playerStartPosition como fallback
playerStartPosition: { x: 400, y: 900 } // Posición visible en el mapa
```

#### **Las colisiones no funcionan**

```typescript
// ✅ SOLUCIÓN: Verificar nombres de layers
surfaceLayerName: "superficies"; // Debe coincidir exactamente con Tiled
```

#### **Los spikes no hacen daño**

```json
// ✅ SOLUCIÓN: Verificar propiedades del tile
{ "collision": true, "kill": true } // Ambas propiedades necesarias
```

#### **La cámara no sigue al player**

```typescript
// ✅ SOLUCIÓN: Configurar seguimiento de cámara
cameraFollow: {
  lerp: { x: 1, y: 1 },    // Valores entre 0-1
  offset: { x: 0, y: 0 }
}
```

#### **El mapa no se carga**

```typescript
// ✅ SOLUCIÓN: Verificar carga en PreloadScene
this.load.tilemapTiledJSON("nombre_mapa", "assets/nombre_mapa.json");

// Y verificar tilemapKey coincide
tilemapKey: "nombre_mapa"; // Debe ser exactamente igual
```

### 🔧 **Debug Tips**

```typescript
create() {
  super.create();

  // 🐛 DEBUG: Mostrar información del player
  this.add.text(10, 10, 'DEBUG MODE', { color: '#ff0000' })
    .setScrollFactor(0)
    .setDepth(1000);

  // 🔍 DEBUG: Resaltar tiles con propiedades
  this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    const tile = this.tilemap.getTileAtWorldXY(worldX, worldY);
    console.log('Tile properties:', tile?.properties);
  });
}
```

---

## ✅ **CHECKLIST DE NUEVO NIVEL**

### 📋 **Antes de empezar:**

- [ ] Mapa creado en Tiled con layers correctos
- [ ] Tile con `start=true` colocado
- [ ] Mapa exportado como JSON en `/assets/`
- [ ] Tilesets necesarios cargados en PreloadScene

### 📋 **Durante implementación:**

- [ ] Archivo de escena creado heredando de BaseGameScene
- [ ] Configuración de GameSceneConfig completada
- [ ] Método createMap() implementado
- [ ] Tilemap cargado en PreloadScene
- [ ] Escena registrada en configuración principal

### 📋 **Testing:**

- [ ] Player aparece en posición correcta
- [ ] Colisiones funcionan correctamente
- [ ] Spikes causan daño
- [ ] Agua activa modo nado
- [ ] Escaleras permiten escalada
- [ ] Cámara sigue al player correctamente
- [ ] Transiciones a otros niveles funcionan

---

## 🎉 **¡NIVEL COMPLETADO!**

Con esta guía puedes crear niveles completos en pocos minutos. El sistema BaseGameScene maneja automáticamente:

- ✅ **Físicas del player** (nado, escalada, salto)
- ✅ **Sistema de colisiones** (spikes, obstáculos)
- ✅ **Sistema de vidas** (UI de corazones)
- ✅ **Detección de tiles especiales** (agua, escaleras)
- ✅ **Posicionamiento automático** (tiles start=true)
- ✅ **Cámara inteligente** (seguimiento, límites)
- ✅ **Debug tools** (botón fantasma, controles)

**🚀 ¡Solo necesitas configurar tu mapa y empezar a crear!**

---

## 📞 **SOPORTE**

Si encuentras problemas:

1. **Revisa la consola** del navegador para errores
2. **Verifica los nombres** de layers y assets coinciden exactamente
3. **Consulta LevelTemplate.ts** como template de referencia
4. **Usa herramientas de debug** incluidas en BaseGameScene

**¡Happy Level Design! 🎮✨**
