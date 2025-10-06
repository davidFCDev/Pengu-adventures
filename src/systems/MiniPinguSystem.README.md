# MiniPinguSystem - Sistema de Mini-Pingüinos Coleccionables

## Descripción

Sistema reutilizable para gestionar mini-pingüinos coleccionables en cualquier nivel del juego. Funciona de manera similar al CoinSystem pero con diferentes animaciones y efectos visuales.

## Características

- ✅ Animación de rebote automática (más enérgica que las monedas)
- ✅ Detección de colisión con el jugador
- ✅ Protección contra colisiones múltiples
- ✅ Efectos visuales de recolección (salto hacia arriba)
- ✅ Contador automático
- ✅ Sistema de eventos reutilizable
- ✅ Soporte para sonidos de recolección
- ✅ UI automática en el header (debajo del contador de monedas)

## Uso en un Nivel

### 1. Importar el Sistema

```typescript
import { MiniPinguSystem } from "../systems/MiniPinguSystem";
```

### 2. Declarar Propiedad Privada

```typescript
export class MiNivel extends BaseGameScene {
  private miniPinguSystem!: MiniPinguSystem;
  // ... resto del código
}
```

### 3. Inicializar en el Método create()

```typescript
create() {
  super.create();

  // Crear el sistema de mini-pingüinos
  this.miniPinguSystem = new MiniPinguSystem(this, {
    textureKey: "mini-pingu",    // Textura del mini-pingüino
    scale: 1.0,                   // Tamaño del mini-pingüino
    depth: 10,                    // Profundidad de renderizado
    bounceDistance: 10,           // Distancia de rebote
    bounceDuration: 800,          // Duración de la animación
    // Opcional: sonido de recolección
    // collectSoundKey: "pingu_sound",
    // soundVolume: 0.3,
  });

  // Definir posiciones de mini-pingüinos
  const miniPinguPositions = [
    { x: 1184, y: 128 },
    { x: 2080, y: 480 },
    { x: 4000, y: 1408 },
  ];

  // Crear los mini-pingüinos
  this.miniPinguSystem.createMiniPingus(miniPinguPositions);

  // Configurar colisión con el jugador
  this.time.delayedCall(100, () => {
    if (this.player) {
      this.miniPinguSystem.setupPlayerCollision(this.player);
    }
  });
}
```

## Actualización Automática del UI

El contador de mini-pingüinos se actualiza **automáticamente** gracias al sistema de eventos en `BaseGameScene`:

- ✅ El contador se inicializa en `x0` al crear el nivel
- ✅ Se actualiza automáticamente cuando recoges mini-pingüinos
- ✅ Se muestra en el header debajo del contador de monedas
- ✅ **No necesitas código adicional en tu nivel**

## Configuración Disponible

```typescript
interface MiniPinguSystemConfig {
  textureKey: string; // Clave de textura (requerido)
  scale?: number; // Escala (default: 1.0)
  depth?: number; // Profundidad (default: 10)
  collectSoundKey?: string; // Sonido (opcional)
  soundVolume?: number; // Volumen (default: 0.3)
  bounceDuration?: number; // Duración rebote (default: 800ms)
  bounceDistance?: number; // Distancia rebote (default: 10px)
}
```

## Eventos Emitidos

El sistema emite el evento `miniPinguCollected` con la siguiente data:

```typescript
{
  collected: number; // Mini-pingüinos recolectados
  total: number; // Total de mini-pingüinos en el nivel
}
```

**Nota:** No necesitas escuchar este evento manualmente. `BaseGameScene` ya lo gestiona y actualiza el UI automáticamente.

## Diferencias con CoinSystem

| Característica        | CoinSystem                       | MiniPinguSystem                  |
| --------------------- | -------------------------------- | -------------------------------- |
| Animación             | Flotación suave (Sine.easeInOut) | Rebote enérgico (Bounce.easeOut) |
| Efecto de recolección | Escala x2 + fade                 | Salto + escala x1.5 + fade       |
| Escala por defecto    | 0.03                             | 1.0                              |
| Distancia animación   | 5px                              | 10px                             |
| Duración animación    | 1000ms                           | 800ms                            |
| Color del contador    | Dorado (#FFD700)                 | Cian (#00D4FF)                   |
| Hitbox                | 100% del sprite                  | 80% del sprite                   |

## Ejemplo Completo

```typescript
import { BaseGameScene } from "./BaseGameScene";
import { MiniPinguSystem } from "../systems/MiniPinguSystem";

export class Level2 extends BaseGameScene {
  private miniPinguSystem!: MiniPinguSystem;

  constructor() {
    super("Level2");
  }

  create() {
    super.create();
    this.createMap();
    this.createStandardLayers();
    this.createMiniPingus();
  }

  private createMiniPingus(): void {
    this.miniPinguSystem = new MiniPinguSystem(this, {
      textureKey: "mini-pingu",
      scale: 1.0,
      depth: 10,
    });

    const miniPinguPositions = [
      { x: 200, y: 300 },
      { x: 400, y: 500 },
    ];

    this.miniPinguSystem.createMiniPingus(miniPinguPositions);

    this.time.delayedCall(100, () => {
      if (this.player) {
        this.miniPinguSystem.setupPlayerCollision(this.player);
      }
    });
  }
}
```

## Protección Contra Bugs

El sistema incluye protección contra colisiones múltiples:

```typescript
// ✅ Desactiva el sprite inmediatamente
miniPinguSprite.setActive(false);
this.miniPingus.remove(miniPinguSprite, false, false);

// ✅ Incrementa el contador solo una vez
this.collectedMiniPingus++;
```

Esto previene que un solo mini-pingüino se cuente múltiples veces por frame.

## Integración con BaseGameScene

El `BaseGameScene` ya incluye:

1. **Inicialización del contador:** El contador se muestra en `x0` al iniciar
2. **Listener automático:** Escucha `miniPinguCollected` y actualiza el UI
3. **UI en el header:** Icono de mini-pingüino + contador en la esquina superior izquierda (debajo de monedas)

**No necesitas agregar código adicional para el UI.**

## Uso Conjunto con CoinSystem

Ambos sistemas pueden coexistir sin problemas:

```typescript
create() {
  super.create();
  this.createMap();
  this.createStandardLayers();

  // Crear ambos sistemas
  this.createCoins();
  this.createMiniPingus();
}
```

Los contadores se mostrarán uno debajo del otro:

- **Monedas:** Posición (30, 105) - Color dorado
- **Mini-pingüinos:** Posición (30, 135) - Color cian

## Notas Importantes

- Las posiciones se definen en píxeles del mundo (no de la cámara)
- El sistema usa física Arcade para detección de colisiones
- Los mini-pingüinos rebotan automáticamente con tweens
- El efecto de recolección incluye salto, escala y fade-out
- El contador es visible en todas las escenas que hereden de `BaseGameScene`
- La animación de rebote usa `Bounce.easeOut` para un efecto más juguetón
