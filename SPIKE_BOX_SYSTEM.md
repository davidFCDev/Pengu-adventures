# 🔥 Sistema de Cajas con Pinchos (Spike Boxes)

## 📋 Descripción General

Las **Cajas con Pinchos** son obstáculos móviles que añaden dificultad a los niveles. Se mueven verticalmente de forma sincronizada entre paredes, causando daño y repulsión al jugador.

---

## 🎯 Características

### Comportamiento Principal

- ✅ **Movimiento vertical** entre paredes con colisión
- ✅ **Sincronización global**: Todas las cajas se mueven al mismo tiempo
- ✅ **Ciclo de movimiento**: Mueve → Colisiona → Espera 2s → Cambia dirección → Repite
- ✅ **Daño al jugador**: Quita 1 vida al contacto
- ✅ **Efecto de repulsión**: Empuja al jugador en dirección opuesta

### Propiedades del Tile

Las cajas deben tener estas propiedades en Tiled:

```
smash = true
kill = true
collision = true
```

---

## 🛠️ Configuración en Tiled

### 1. Crear el Tile

1. En el tileset, selecciona el tile de la caja con pinchos (ID 286)
2. Añade las propiedades:
   - `smash: true` (marca como caja móvil)
   - `kill: true` (causa daño)
   - `collision: true` (tiene colisión)

### 2. Colocar en el Mapa

1. Usa la capa **"elements"** (object layer)
2. Inserta el tile como **objeto** (no como tile de capa)
3. Coloca la caja **pegada a una pared** con colisión
4. La caja detectará automáticamente su dirección inicial

### 3. GID del Tile

- **Tile ID en tileset**: 286
- **GID en el mapa**: 287 (firstgid + tile ID)

---

## 💻 Implementación en Código

### Configuración en Level2.ts

```typescript
const config: GameSceneConfig = {
  // ... otras configuraciones

  // 🔥 Habilitar sistema de cajas con pinchos
  enableSpikeBoxes: true,
  spikeBoxConfig: {
    spikeBoxTileIds: [287], // GID de las cajas
    moveInterval: 2000, // Tiempo entre movimientos (ms)
    moveSpeed: 100, // Velocidad de movimiento (px/s)
    damage: 1, // Daño al jugador
    knockbackForce: 300, // Fuerza de repulsión
  },
};
```

### Parámetros Personalizables

| Parámetro         | Tipo       | Default | Descripción                             |
| ----------------- | ---------- | ------- | --------------------------------------- |
| `spikeBoxTileIds` | `number[]` | `[]`    | GIDs de los tiles de cajas              |
| `moveInterval`    | `number`   | `2000`  | Tiempo de espera entre movimientos (ms) |
| `moveSpeed`       | `number`   | `100`   | Velocidad de movimiento (px/s)          |
| `damage`          | `number`   | `1`     | Cantidad de vidas que quita             |
| `knockbackForce`  | `number`   | `300`   | Fuerza del empujón al jugador           |

---

## 🎮 Funcionamiento Técnico

### Ciclo de Movimiento

```
1. Inicio
   ↓
2. Buscar pared más cercana en dirección inicial
   ↓
3. MOVER hacia la pared
   ↓
4. Detectar COLISIÓN con pared
   ↓
5. DETENER movimiento
   ↓
6. ESPERAR 2 segundos
   ↓
7. CAMBIAR dirección (up ↔ down)
   ↓
8. Volver al paso 2 (BUCLE INFINITO)
```

### Detección de Dirección Inicial

```typescript
// Si hay pared arriba → empezar bajando
// Si NO hay pared arriba → empezar subiendo

const tileAbove = surfaceLayer.getTileAtWorldXY(x, y - tileSize);
const hasWallAbove = tileAbove?.properties?.collision === true;
return hasWallAbove ? "down" : "up";
```

### Búsqueda de Siguiente Pared

```typescript
// Busca hasta 20 tiles en la dirección actual
// Retorna la posición justo antes de colisionar
for (let i = 1; i <= 20; i++) {
  const checkY = y + step * i;
  const tile = surfaceLayer.getTileAtWorldXY(x, checkY);

  if (tile?.properties?.collision === true) {
    return checkY - step + offset;
  }
}
```

### Colisión con el Jugador

```typescript
// Al tocar una caja:
1. Verificar invulnerabilidad del jugador
2. Quitar vida: player.takeDamage(1)
3. Calcular dirección de repulsión
4. Aplicar knockback: setVelocity(knockbackX, knockbackY)
```

---

## 📊 Datos del Nivel 2

### Estadísticas Actuales

- **Cantidad de cajas**: 17 unidades
- **GID usado**: 287
- **Capa**: elements (object layer)
- **Distribución**: A lo largo de todo el nivel

### Posiciones en el Mapa

Las cajas están colocadas estratégicamente:

- Entre plataformas verticales
- En pasillos estrechos
- Cerca de coleccionables (añade dificultad)

---

## 🔧 Sistema Técnico

### Archivos del Sistema

#### `SpikeBoxSystem.ts`

Sistema principal que gestiona todas las cajas:

- **Creación**: Lee objetos del tilemap con GID especificado
- **Movimiento**: Timer sincronizado para todas las cajas
- **Colisión**: Detección de paredes y jugador
- **Update**: Verificación de llegada a destino

#### `BaseGameScene.ts`

Integración automática:

- Import del sistema
- Configuración en `GameSceneConfig`
- Creación automática si `enableSpikeBoxes = true`
- Update en el game loop
- Cleanup en shutdown

#### `Level2.ts`

Configuración específica del nivel:

- GIDs de las cajas (287)
- Parámetros de movimiento
- Habilitación del sistema

---

## 🎨 Efectos Visuales

### Animación de Movimiento

```typescript
// Movimiento suave con física de Arcade
body.setVelocityY(direction === "down" ? 100 : -100);
```

### Knockback del Jugador

```typescript
// Empuje en X (alejarse de la caja)
knockbackX = playerX < boxX ? -300 : 300;

// Empuje en Y (salto pequeño hacia arriba)
knockbackY = -150;
```

---

## 🐛 Debugging

### Verificar Cajas en Consola

```typescript
// En BaseGameScene.ts, después de crear el sistema
if (this.spikeBoxSystem) {
  console.log("🔥 Cajas creadas:", this.spikeBoxSystem.getGroup().getLength());
}
```

### Visualizar Colisiones

```typescript
// En create() de BaseGameScene
this.physics.world.createDebugGraphic();
```

### Problemas Comunes

| Problema            | Causa                   | Solución                             |
| ------------------- | ----------------------- | ------------------------------------ |
| Cajas no aparecen   | GID incorrecto          | Verificar firstgid del tileset       |
| No se mueven        | Sin paredes cercanas    | Colocar entre superficies            |
| Movimiento errático | Búsqueda fallida        | Verificar tiles con `collision=true` |
| No causan daño      | Colisión no configurada | Verificar `setupPlayerCollision()`   |

---

## 📈 Mejoras Futuras

### Posibles Extensiones

- 🔄 Movimiento horizontal (además de vertical)
- ⏱️ Intervalos de movimiento variables por caja
- 💥 Efectos de partículas al colisionar con paredes
- 🎵 Sonidos de movimiento y colisión
- 🎨 Animación del sprite (frames de rotación)
- 🔀 Patrones de movimiento más complejos

---

## 📚 Recursos Relacionados

- **Player.ts**: Sistema de daño (`takeDamage()`)
- **BaseGameScene.ts**: Arquitectura de niveles
- **DoorSystem.ts**: Referencia similar de sistema de objetos
- **EnemyManager.ts**: Sistema de colisión con enemigos

---

## ✅ Checklist de Implementación

- [x] Crear `SpikeBoxSystem.ts`
- [x] Integrar en `BaseGameScene.ts`
- [x] Configurar en `Level2.ts`
- [x] Añadir propiedades en Tiled
- [x] Colocar cajas en el mapa
- [x] Probar movimiento sincronizado
- [x] Verificar daño y knockback
- [ ] Añadir efectos de sonido
- [ ] Añadir efectos visuales
- [ ] Documentar para otros niveles

---

**Autor**: Sistema de Cajas con Pinchos v1.0  
**Fecha**: 8 de octubre de 2025  
**Nivel**: Level2  
**Estado**: ✅ Implementado y funcional
