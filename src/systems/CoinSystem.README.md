# Sistema de Monedas (CoinSystem)

Sistema reutilizable para gestionar monedas coleccionables en cualquier nivel del juego.

## Características

- ✅ Creación automática de monedas con física
- ✅ Animaciones de flotación suaves
- ✅ Detección de colisión con el jugador
- ✅ Efectos visuales de recolección
- ✅ Sistema de eventos para feedback
- ✅ Contador de monedas recolectadas
- ✅ Soporte para sonidos de recolección
- ✅ Completamente configurable

## Uso Básico

```typescript
import { CoinSystem } from "../systems/CoinSystem";

export class MiNivel extends BaseGameScene {
  private coinSystem!: CoinSystem;

  protected createMap(): void {
    // ... crear tilemap ...

    // 1. Crear el sistema
    this.coinSystem = new CoinSystem(this, {
      textureKey: "PT_TOKEN_MASTER_001",
      scale: 0.03,
      depth: 10,
      // Opcional: sonido de recolección
      collectSoundKey: "coin_sound",
      soundVolume: 0.3,
    });

    // 2. Definir posiciones de las monedas
    const coinPositions = [
      { x: 100, y: 200 },
      { x: 200, y: 200 },
      { x: 300, y: 200 },
    ];

    // 3. Crear las monedas
    this.coinSystem.createCoins(coinPositions);

    // 4. Configurar colisión con el jugador
    this.time.delayedCall(100, () => {
      if (this.player) {
        this.coinSystem.setupPlayerCollision(this.player);
      }
    });

    // 5. (Opcional) Escuchar eventos de recolección
    this.events.on(
      "coinCollected",
      (data: { collected: number; total: number }) => {
        console.log(`Monedas: ${data.collected}/${data.total}`);
        // Aquí puedes actualizar UI, mostrar efectos, etc.
      }
    );
  }
}
```

## Configuración

### CoinSystemConfig

```typescript
{
  // Requerido
  textureKey: string;           // Clave de la textura de la moneda

  // Opcional
  scale?: number;               // Escala de la moneda (default: 0.03)
  depth?: number;               // Profundidad de renderizado (default: 10)
  collectSoundKey?: string;     // Clave del sonido de recolección
  soundVolume?: number;         // Volumen del sonido (default: 0.3)
  floatDuration?: number;       // Duración de la animación en ms (default: 1000)
  floatDistance?: number;       // Distancia de flotación en px (default: 5)
}
```

## Métodos Públicos

### `createCoins(positions: CoinPosition[])`

Crea las monedas en las posiciones especificadas.

```typescript
this.coinSystem.createCoins([
  { x: 100, y: 200 },
  { x: 200, y: 200 },
]);
```

### `setupPlayerCollision(player: Phaser.Physics.Arcade.Sprite)`

Configura la detección de colisión con el jugador.

```typescript
this.coinSystem.setupPlayerCollision(this.player);
```

### `getCollectedCoins(): number`

Obtiene el número de monedas recolectadas.

```typescript
const collected = this.coinSystem.getCollectedCoins();
```

### `getTotalCoins(): number`

Obtiene el total de monedas en el nivel.

```typescript
const total = this.coinSystem.getTotalCoins();
```

### `reset(): void`

Resetea el contador de monedas recolectadas.

```typescript
this.coinSystem.reset();
```

### `destroy(): void`

Destruye el sistema y todas las monedas.

```typescript
this.coinSystem.destroy();
```

## Eventos

El sistema emite el evento `coinCollected` cuando se recoge una moneda:

```typescript
this.events.on(
  "coinCollected",
  (data: { collected: number; total: number }) => {
    // Actualizar UI
    this.updateCoinUI(data.collected, data.total);

    // Mostrar partículas
    this.showCoinParticles();

    // Verificar si se recolectaron todas
    if (data.collected === data.total) {
      console.log("¡Todas las monedas recolectadas!");
    }
  }
);
```

## Ejemplo Completo

Ver `src/scenes/Level1.ts` para un ejemplo completo de implementación.

## Notas

- Las monedas se crean con física pero sin gravedad
- La animación de flotación es automática
- El efecto de recolección incluye escala y fade out
- El sistema se integra perfectamente con `BaseGameScene`
