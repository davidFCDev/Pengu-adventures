# 📦 SpikeBoxSystem - Guía de Reutilización

## ✅ Sistema Completamente Reutilizable

El **SpikeBoxSystem** está diseñado para ser usado en **cualquier nivel o escena** de Phaser sin modificaciones.

---

## 🎯 Características de Reutilización

### ✨ Independiente

- No depende de ninguna escena específica
- Solo requiere componentes estándar de Phaser
- Configuración completamente parametrizable

### 🔧 Flexible

- Todos los parámetros visuales y de comportamiento son opcionales
- Valores por defecto sensatos para uso inmediato
- Fácil de personalizar por nivel

### 🚀 Eficiente

- Gestión automática de recursos
- Destrucción limpia sin memory leaks
- Optimizado para múltiples instancias

---

## 📖 Uso en Diferentes Escenas

### Opción 1️⃣: Uso con BaseGameScene (Automático)

La forma más sencilla es usar la integración automática en `BaseGameScene`:

```typescript
// En Level2.ts, Level3.ts, LevelX.ts...
const config: GameSceneConfig = {
  tilemapKey: "Level2",
  surfaceLayerName: "superficies",

  // 🔥 Activar sistema de cajas
  enableSpikeBoxes: true,
  spikeBoxConfig: {
    spikeBoxTileIds: [287], // GIDs específicos de este nivel
    moveInterval: 800, // Pausa corta (fluido)
    moveSpeed: 250, // Rápido y explosivo
    damage: 1,
    knockbackForce: 300,
  },
};
```

**Ventajas:**

- ✅ Integración automática en el ciclo de vida de la escena
- ✅ Colisión con jugador configurada automáticamente
- ✅ Destrucción automática en shutdown
- ✅ Solo 2 líneas de configuración

---

### Opción 2️⃣: Uso Manual (Máximo Control)

Si necesitas control total o estás en una escena personalizada:

```typescript
import { SpikeBoxSystem } from "../systems/SpikeBoxSystem";

export class CustomLevel extends Phaser.Scene {
  private spikeBoxSystem!: SpikeBoxSystem;

  create() {
    // ... crear tilemap, layers, player ...

    // Crear sistema manualmente
    this.spikeBoxSystem = new SpikeBoxSystem(this, {
      tilemap: this.tilemap,
      surfaceLayer: this.surfaceLayer,
      spikeBoxTileIds: [287, 288, 289], // Múltiples GIDs

      // Personalización total
      moveInterval: 1200, // Pausa media
      moveSpeed: 180, // Velocidad moderada
      damage: 2, // Daño aumentado
      knockbackForce: 400, // Más knockback
      depth: 15, // Depth personalizado
      spritesheetKey: "my-tiles", // Tu propio spritesheet
    });

    // Crear cajas
    this.spikeBoxSystem.createSpikeBoxes();

    // Configurar colisión con jugador (OPCIONAL)
    this.spikeBoxSystem.setupPlayerCollision(this.player);
  }

  update() {
    // No necesita update, funciona automáticamente
  }

  shutdown() {
    // ⚠️ IMPORTANTE: Destruir para evitar memory leaks
    this.spikeBoxSystem?.destroy();
  }
}
```

---

## 🎨 Ejemplos de Configuración por Nivel

### Nivel Fácil (Movimiento Lento)

```typescript
spikeBoxConfig: {
  spikeBoxTileIds: [287],
  moveInterval: 3000,    // Pausa larga
  moveSpeed: 120,        // Lento
  damage: 1,
  knockbackForce: 200,   // Knockback suave
}
```

### Nivel Medio (Equilibrado)

```typescript
spikeBoxConfig: {
  spikeBoxTileIds: [287],
  moveInterval: 1500,    // Pausa media
  moveSpeed: 180,        // Velocidad media
  damage: 1,
  knockbackForce: 300,
}
```

### Nivel Difícil (Rápido y Agresivo)

```typescript
spikeBoxConfig: {
  spikeBoxTileIds: [287, 288],  // Múltiples tipos
  moveInterval: 800,     // Muy rápido
  moveSpeed: 250,        // Explosivo
  damage: 2,             // Más daño
  knockbackForce: 400,   // Knockback fuerte
}
```

### Nivel Boss (Extremo)

```typescript
spikeBoxConfig: {
  spikeBoxTileIds: [287, 288, 289],
  moveInterval: 500,     // Sin apenas pausa
  moveSpeed: 300,        // Muy rápido
  damage: 3,             // Daño letal
  knockbackForce: 500,   // Knockback masivo
}
```

---

## 🗂️ Uso con Múltiples Instancias

Puedes tener **varios sistemas** en la misma escena con diferentes configuraciones:

```typescript
// Sistema de cajas lentas en zona 1
this.slowBoxes = new SpikeBoxSystem(this, {
  tilemap: this.tilemap,
  surfaceLayer: this.surfaceLayer,
  spikeBoxTileIds: [287],
  moveSpeed: 100,
  moveInterval: 2000,
});

// Sistema de cajas rápidas en zona 2
this.fastBoxes = new SpikeBoxSystem(this, {
  tilemap: this.tilemap,
  surfaceLayer: this.surfaceLayer,
  spikeBoxTileIds: [288],
  moveSpeed: 300,
  moveInterval: 500,
  damage: 2,
});

this.slowBoxes.createSpikeBoxes();
this.fastBoxes.createSpikeBoxes();
```

---

## 🔍 Verificación de Reutilización

### ✅ Checklist de Independencia

- [x] No depende de variables globales
- [x] No usa imports de escenas específicas
- [x] Todos los parámetros son configurables
- [x] Manejo de recursos limpio (destroy)
- [x] No modifica estado externo sin permiso
- [x] Funciona con cualquier Phaser.Scene
- [x] Documentación completa de uso
- [x] Ejemplos de integración

### ✅ Dependencias Mínimas

**Solo requiere:**

1. `Phaser.Scene` (estándar)
2. `Phaser.Tilemaps.Tilemap` (estándar)
3. `Phaser.Tilemaps.TilemapLayer` (estándar)
4. `Player` class (para colisión, opcional)

---

## 📚 Integración con BaseGameScene

El sistema está **automáticamente integrado** en `BaseGameScene` para facilitar su uso:

```typescript
// En BaseGameScene.ts (YA IMPLEMENTADO)

export interface GameSceneConfig {
  // ... otras opciones ...

  enableSpikeBoxes?: boolean; // Activar/desactivar
  spikeBoxConfig?: {
    // Configuración opcional
    spikeBoxTileIds?: number[];
    moveInterval?: number;
    moveSpeed?: number;
    damage?: number;
    knockbackForce?: number;
  };
}

// Creación automática en create()
if (this.config.enableSpikeBoxes) {
  this.createSpikeBoxSystem();
}

// Destrucción automática en shutdown()
this.spikeBoxSystem?.destroy();
```

**Esto significa que cualquier nivel que herede de `BaseGameScene` puede usar el sistema con solo 2 propiedades en el config.**

---

## 🎯 Resumen

### Para usar en un nuevo nivel:

1. **Opción Simple**: Añade `enableSpikeBoxes: true` en el config
2. **Opción Avanzada**: Crea instancia manual con control total
3. **Personaliza** parámetros según dificultad del nivel
4. **No olvides** llamar `destroy()` en shutdown

### Ventajas de este diseño:

- ✅ **DRY**: No duplicar código entre niveles
- ✅ **Flexible**: Personalizable sin modificar el sistema
- ✅ **Mantenible**: Un único lugar para bugs/mejoras
- ✅ **Escalable**: Fácil añadir más niveles
- ✅ **Testeable**: Sistema aislado y verificable

---

## 🔧 Extensión Futura

Si necesitas **extender** el sistema (ej: movimiento horizontal):

```typescript
// Crear clase derivada
export class HorizontalSpikeBoxSystem extends SpikeBoxSystem {
  // Sobrescribir métodos específicos
  protected findInitialDirection(): "left" | "right" {
    // Nueva lógica
  }
}
```

El diseño modular lo permite sin romper compatibilidad.
