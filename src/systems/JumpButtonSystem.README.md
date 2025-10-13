# 🚀 Jump Button System (Trampolines)

Sistema reutilizable para crear trampolines que lanzan al jugador con super saltos.

## Características

- ✅ **Detección automática** de objetos con GID específico en el tilemap
- ✅ **Sprites visuales** con cambio de estado (normal → pressed)
- ✅ **Super salto** configurable con velocidad personalizable
- ✅ **Cooldown automático** para evitar múltiples activaciones
- ✅ **Sonido personalizable** al activar
- ✅ **Integración con BaseGameScene** para uso automático

## Uso en Tiled

### 1. Crear el objeto trampolín

1. En Tiled, selecciona el tile del trampolín (ID 136)
2. Usa la herramienta "Insert Tile" (T) para colocarlo como **objeto** en la capa de objetos (normalmente "elements")
3. Añade las propiedades personalizadas:
   - `name` (string): `"jump-button"`
   - `pressed` (bool): `false`
   - `collision` (bool): `true`

### 2. Tile presionado (opcional)

- ID 118: Tile del trampolín con el muelle estirado
- Se cambia automáticamente cuando el jugador salta

## Uso en código

### Opción 1: Configuración automática en BaseGameScene (Recomendado)

Simplemente añade la configuración en el constructor de tu nivel:

\`\`\`typescript
constructor() {
const config: GameSceneConfig = {
// ... otras configuraciones ...

    // 🚀 Habilitar sistema de trampolines
    enableJumpButtons: true,
    jumpButtonConfig: {
      unpressedGID: 137,        // ID 136 + 1 (GID de Tiled)
      pressedGID: 119,          // ID 118 + 1
      superJumpVelocity: -800,  // Potencia del salto
      resetDelay: 500,          // ms antes de resetear
    },

};
super("MiNivel", config);
}
\`\`\`

### Opción 2: Uso manual (Si necesitas más control)

\`\`\`typescript
import { JumpButtonSystem } from "../systems/JumpButtonSystem";

export class MiNivel extends Phaser.Scene {
private jumpButtonSystem!: JumpButtonSystem;

create() {
// ... crear tilemap y player ...

    this.jumpButtonSystem = new JumpButtonSystem({
      tilemap: this.tilemap,
      scene: this,
      player: this.player,
      unpressedGID: 137,
      pressedGID: 119,
      superJumpVelocity: -1200,  // Salto más potente
      resetDelay: 300,
    });

}

shutdown() {
if (this.jumpButtonSystem) {
this.jumpButtonSystem.destroy();
}
}
}
\`\`\`

## Configuración

### Parámetros de JumpButtonConfig

| Parámetro           | Tipo                           | Default                       | Descripción                                   |
| ------------------- | ------------------------------ | ----------------------------- | --------------------------------------------- |
| `tilemap`           | `Phaser.Tilemaps.Tilemap`      | -                             | **Requerido**. Tilemap del nivel              |
| `scene`             | `Phaser.Scene`                 | -                             | **Requerido**. Escena actual                  |
| `player`            | `Phaser.Physics.Arcade.Sprite` | -                             | **Requerido**. Sprite del jugador             |
| `unpressedGID`      | `number`                       | `137`                         | GID del trampolín sin presionar (ID + 1)      |
| `pressedGID`        | `number`                       | `119`                         | GID del trampolín presionado (ID + 1)         |
| `superJumpVelocity` | `number`                       | `-800`                        | Velocidad del super salto (negativo = arriba) |
| `resetDelay`        | `number`                       | `500`                         | Milisegundos antes de resetear el trampolín   |
| `tilesetName`       | `string`                       | `"spritesheet-tiles-default"` | Nombre del tileset                            |
| `spritesheetKey`    | `string`                       | `"spritesheet-tiles-frames"`  | Clave del spritesheet con frames              |
| `depth`             | `number`                       | `10`                          | Profundidad de renderizado                    |
| `soundKey`          | `string`                       | `"jump_sound"`                | Sonido al activar                             |
| `soundVolume`       | `number`                       | `1.0`                         | Volumen del sonido                            |

## Ajuste de potencia

Valores recomendados según altura deseada:

- **Salto bajo** (2-3 tiles): `-600`
- **Salto medio** (4-6 tiles): `-800`
- **Salto alto** (7-10 tiles): `-1200`
- **Salto muy alto** (11-15 tiles): `-1600`
- **Salto extremo** (16+ tiles): `-2000+`

> **Nota**: El salto normal del jugador es aproximadamente `-400`, así que estos valores son múltiplos de esa base.

## Ejemplo completo

\`\`\`typescript
// Level5.ts
import { BaseGameScene, GameSceneConfig } from "./BaseGameScene";

export class Level5 extends BaseGameScene {
constructor() {
const config: GameSceneConfig = {
tilemapKey: "Level5",
surfaceLayerName: "superficies",
playerStartPosition: { x: 100, y: 2080 },

      // Trampolines configurados
      enableJumpButtons: true,
      jumpButtonConfig: {
        superJumpVelocity: -1400,  // Salto muy alto
        resetDelay: 300,           // Reset rápido
      },
    };
    super("Level5", config);

}

create() {
super.create();
// El sistema se inicializa automáticamente
}
}
\`\`\`

## Troubleshooting

### Los trampolines no aparecen

1. Verifica que los objetos estén en una capa de objetos (no capa de tiles)
2. Confirma que el GID sea correcto (ID + 1)
3. Revisa la consola: debería aparecer `🚀 [JumpButtonSystem] Encontrados X jump buttons`

### El salto es muy débil

- Aumenta `superJumpVelocity` (valor más negativo)
- Valores recomendados: `-1200` a `-2000` para saltos potentes

### El trampolín no cambia de apariencia

- Verifica que `pressedGID` sea correcto
- Asegúrate de que existe el tile con ID 118 en el tileset

## Arquitectura

```
JumpButtonSystem
├── Busca objetos con unpressedGID en tilemap.objects
├── Crea sprites con física para cada trampolín
├── Detecta overlap con el jugador
├── Aplica super salto cuando el jugador cae sobre él
├── Cambia el frame visual al estado "pressed"
└── Resetea automáticamente después del delay
```

## Integración con otros sistemas

El JumpButtonSystem se integra perfectamente con:

- ✅ **ElevatorSystem**: Combina trampolines con plataformas móviles
- ✅ **TemporaryPlatformSystem**: Usa trampolines para alcanzar plataformas temporales
- ✅ **SpikeBoxSystem**: Crea desafíos donde debes usar trampolines para evitar pinchos
- ✅ **FreezableEnemy**: Combina enemigos congelados como plataformas con trampolines

## Licencia

Parte del proyecto Pengu Adventures.
