# Guía de Sistemas de Elevadores y Enemigos Acuáticos

## 📋 Resumen

Esta guía explica cómo usar los sistemas **completamente automáticos** de elevadores y enemigos acuáticos en cualquier nivel del juego.

---

## 🛗 Sistema de Elevadores

### ¿Qué hace?

Plataformas móviles de 2 tiles (izquierda + derecha) que se mueven verticalmente entre superficies de forma continua y suave.

### Configuración en el Nivel

```typescript
const config: GameSceneConfig = {
  // ... otras configuraciones ...

  // 🛗 Habilitar sistema de elevadores
  enableElevators: true,
  elevatorConfig: {
    leftTileGID: 20, // GID del tile izquierdo (firstgid + tileID)
    rightTileGID: 2, // GID del tile derecho (firstgid + tileID)
    moveSpeed: 100, // Velocidad en píxeles/segundo (opcional, default: 100)
  },
};
```

### Cómo calcular los GIDs

```
GID = firstgid del tileset + tileID del tile en Tiled

Ejemplo:
- Si tu tileset tiene firstgid = 1
- Y el tile izquierdo tiene ID = 19 en Tiled
- Entonces leftTileGID = 1 + 19 = 20
```

### Configuración en Tiled

En el editor Tiled, coloca los tiles del elevador en la capa "objects":

1. Tile izquierdo y derecho deben estar uno al lado del otro
2. El sistema los detecta automáticamente por GID
3. Se mueven verticalmente hasta colisionar con la capa "superficies"

### ¿Qué hace automáticamente?

✅ Detecta todos los pares de tiles (izquierdo + derecho)  
✅ Crea sprites con física  
✅ Configura movimiento vertical continuo  
✅ Cambia de dirección al colisionar (arriba ↔ abajo)  
✅ Sincroniza ambos tiles perfectamente  
✅ Permite al jugador pararse sobre ellos  
✅ Se actualiza y limpia automáticamente

---

## 🐟 Sistema de Enemigos Acuáticos

### ¿Qué hace?

Peces que nadan horizontalmente y cambian de dirección al colisionar con superficies. Dañan al jugador al tocarlo.

### Opción 1: Posiciones Manuales (Recomendado)

```typescript
const config: GameSceneConfig = {
  // ... otras configuraciones ...

  // 🐟 Habilitar sistema de enemigos acuáticos
  enableAquaticEnemies: true,
  aquaticEnemyConfig: {
    manualPositions: [
      { x: 480, y: 2080, direction: 1 }, // Nada hacia la derecha
      { x: 2432, y: 1856, direction: -1 }, // Nada hacia la izquierda
      { x: 3072, y: 2080, direction: 1 },
    ],
    damage: 1, // Daño al jugador (opcional, default: 1)
    speed: 100, // Velocidad de nado (opcional, default: 100)
  },
};
```

### Opción 2: Detección Automática por GID

```typescript
const config: GameSceneConfig = {
  // ... otras configuraciones ...

  enableAquaticEnemies: true,
  aquaticEnemyConfig: {
    aquaticEnemyGID: 123, // GID del tile del pez en el tilemap
    damage: 1,
    speed: 100,
  },
};
```

### ¿Qué hace automáticamente?

✅ Crea enemigos en las posiciones especificadas  
✅ Configura animación de nado  
✅ Movimiento horizontal continuo  
✅ Cambia de dirección al colisionar con superficies  
✅ Daña al jugador al tocarlo  
✅ Oscilación vertical suave (efecto flotante)  
✅ Se actualiza y limpia automáticamente

---

## 📝 Ejemplo Completo: Level3.ts

```typescript
import { FreezableEnemy } from "../objects/enemies/FreezableEnemy";
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

export class Level3 extends BaseGameScene {
  private freezableEnemies: FreezableEnemy[] = [];

  constructor() {
    const config: GameSceneConfig = {
      tilemapKey: "Level3",
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

      // 🛗 Sistema de Elevadores
      enableElevators: true,
      elevatorConfig: {
        leftTileGID: 20,
        rightTileGID: 2,
        moveSpeed: 100,
      },

      // 🐟 Sistema de Enemigos Acuáticos
      enableAquaticEnemies: true,
      aquaticEnemyConfig: {
        manualPositions: [
          { x: 480, y: 2080, direction: 1 },
          { x: 2432, y: 1856, direction: -1 },
          { x: 3072, y: 2080, direction: 1 },
        ],
        damage: 1,
        speed: 100,
      },
    };

    super("Level3", config);
  }

  create() {
    this.freezableEnemies = [];
    super.create(); // ← BaseGameScene crea TODO automáticamente

    // Solo crea tus sistemas específicos del nivel
    this.createCoins();
    this.createKeys();
    // etc...
  }

  update(time: number, delta: number): void {
    super.update(time, delta); // ← BaseGameScene actualiza TODO automáticamente

    // Solo actualiza tus enemigos específicos
    this.freezableEnemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });
  }

  shutdown(): void {
    // Limpia tus recursos específicos
    this.freezableEnemies.forEach((enemy) => enemy.destroy());
    this.freezableEnemies = [];

    super.shutdown(); // ← BaseGameScene limpia TODO automáticamente
  }
}
```

---

## ✅ Checklist de Implementación

### Para Elevadores:

- [ ] Calcular GIDs correctos (firstgid + tileID)
- [ ] Añadir `enableElevators: true` en la config
- [ ] Añadir `elevatorConfig` con leftTileGID y rightTileGID
- [ ] Colocar tiles del elevador en Tiled (capa "objects")
- [ ] Probar que se mueven correctamente

### Para Enemigos Acuáticos:

- [ ] Decidir si usar posiciones manuales o GID
- [ ] Añadir `enableAquaticEnemies: true` en la config
- [ ] Añadir `aquaticEnemyConfig` con posiciones o GID
- [ ] Verificar que el spritesheet está cargado en PreloadScene
- [ ] Probar que nadan y dañan al jugador

---

## 🔧 Troubleshooting

### Elevadores no aparecen

- Verifica que los GIDs son correctos
- Revisa que los tiles están en la capa "objects"
- Comprueba la consola: debe decir "X elevadores detectados"

### Elevadores se quedan parados

- Ya está solucionado con el sistema de sincronización
- Si pasa, reporta el issue

### Enemigos acuáticos no aparecen

- Verifica que el spritesheet está cargado (`__green_angler_fish_swim_snapping`)
- Revisa las coordenadas X,Y
- Comprueba la consola: debe decir "X enemigos acuáticos creados"

### Enemigos no cambian de dirección

- Verifica que hay superficies cerca (capa "superficies")
- El collider con surfaceLayer debe estar activo

---

## 🎯 Ventajas de estos Sistemas

1. **Completamente automáticos**: Solo configuras, BaseGameScene hace todo
2. **Reutilizables**: Funcionan en cualquier nivel
3. **No requieren código**: Todo en la configuración
4. **Fácil de mantener**: Cambios en un solo lugar
5. **Limpieza automática**: No hay memory leaks

---

## 📚 Ver También

- `ElevatorSystem.ts` - Código fuente del sistema de elevadores
- `AquaticEnemyManager.ts` - Código fuente del manager de enemigos acuáticos
- `BaseGameScene.ts` - Integración en la clase base
- `Level3.ts` - Ejemplo de uso completo
