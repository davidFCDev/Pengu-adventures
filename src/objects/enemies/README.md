# Sistema de Enemigos

Sistema centralizado y reutilizable para gestionar enemigos en diferentes niveles del juego.

## Tipos de Enemigos

### 1. BasicEnemy (Rojo)

- **Comportamiento**: Patrulla entre dos puntos en superficies sólidas
- **Velocidad**: 50px/s
- **Daño**: Muere al ser golpeado por una bola de nieve
- **Visual**: Círculo rojo con ojos

### 2. FreezableEnemy (Azul)

- **Comportamiento**: Patrulla entre dos puntos en superficies sólidas
- **Velocidad**: 80px/s
- **Daño**: Se congela durante 5 segundos al ser golpeado por una bola de nieve
- **Visual**: Círculo azul con ojos
- **Especial**: Al congelarse crea un bloque de hielo con física de superficie (el jugador puede saltar sobre él)

### 3. AquaticEnemy (Verde)

- **Comportamiento**: Nada entre dos puntos en zonas de agua (tiles con `swim=true`)
- **Velocidad**: 120px/s (el más rápido)
- **Daño**: NO puede ser atacado (las bolas de nieve no funcionan en el agua)
- **Visual**: Pez verde con aletas, cola, ojo y burbujas
- **Especial**:
  - Solo aparece en tiles con propiedad `swim=true`
  - No tiene gravedad (flota en el agua)
  - Animación de natación con ondulación vertical y rotación

## Uso en Nuevos Niveles

### Configuración Básica

```typescript
const config: LevelConfig = {
  // ... otras configuraciones del nivel

  enableEnemies: true,
  enemyConfig: {
    // Número máximo de enemigos terrestres (basic + freezable)
    maxEnemies: 8,

    // Número máximo de enemigos acuáticos
    maxAquaticEnemies: 2,

    // Ancho mínimo de superficie en tiles para crear enemigos
    minSurfaceWidth: 5,

    // Margen de patrulla (px desde el borde de la superficie)
    patrolMargin: 50,

    // Distancia segura del jugador al inicio (px)
    safeDistance: 100,

    // Número de superficies iniciales a saltar (evitar enemigos cerca del spawn)
    skipFirstSurfaces: 10,

    // Ratio de tipos de enemigos (debe sumar <= 1.0)
    enemyTypeRatio: {
      basic: 0.4, // 40% BasicEnemy
      freezable: 0.4, // 40% FreezableEnemy
      aquatic: 0.2, // 20% AquaticEnemy (solo si hay zonas de agua)
    },
  },
};
```

### Ejemplos de Configuración

#### Nivel Solo con Enemigos Básicos

```typescript
enemyConfig: {
  maxEnemies: 10,
  enemyTypeRatio: { basic: 1.0, freezable: 0, aquatic: 0 },
}
```

#### Nivel con Muchos Enemigos Congelables

```typescript
enemyConfig: {
  maxEnemies: 12,
  enemyTypeRatio: { basic: 0.2, freezable: 0.8, aquatic: 0 },
}
```

#### Nivel Acuático con Pocos Enemigos Terrestres

```typescript
enemyConfig: {
  maxEnemies: 4,
  maxAquaticEnemies: 6,
  enemyTypeRatio: { basic: 0.3, freezable: 0.3, aquatic: 0.4 },
}
```

#### Nivel Sin Enemigos

```typescript
enableEnemies: false,
// No se necesita enemyConfig
```

## Requisitos del Tilemap

### Para Enemigos Terrestres (BasicEnemy, FreezableEnemy)

- Los tiles de superficie deben tener la propiedad `collision=true`
- Los tiles NO deben tener `swim=true` (reservado para agua)
- El sistema `SurfaceDetector` encuentra automáticamente las superficies válidas

### Para Enemigos Acuáticos (AquaticEnemy)

- Los tiles de agua deben tener la propiedad `swim=true`
- Los enemigos se crean en el **centro vertical** de la zona de agua
- El margen de patrulla es proporcional: 10% del ancho de la zona (mínimo 20px)
- Se requiere un ancho mínimo de patrulla de 100px

## Comportamiento Automático

El sistema `EnemySystem` se encarga automáticamente de:

1. **Detección de superficies**: Encuentra todas las superficies válidas en el mapa
2. **Detección de zonas de agua**: Encuentra todas las zonas con `swim=true`
3. **Spawn inteligente**:
   - Evita crear enemigos cerca del punto de inicio del jugador
   - Salta las primeras N superficies (configurable con `skipFirstSurfaces`)
   - Verifica que haya espacio suficiente para patrullar
4. **Colisiones**:
   - Player vs Enemy (daño al jugador)
   - Snowball vs Enemy (daño a enemigos terrestres)
   - Player vs Ice Block (plataforma temporal)
5. **Ciclo de vida**: Destrucción automática cuando cambia de escena

## Extensión del Sistema

Para añadir un nuevo tipo de enemigo:

1. Crear una nueva clase que extienda `Phaser.Physics.Arcade.Sprite`
2. Implementar los métodos:
   - `constructor(scene, x, y, pointA, pointB, surfaceLayer)`
   - `update(time, delta)`
   - `damagePlayer(player)`
   - `takeDamageFromSnowball()` (opcional, solo para enemigos atacables)
3. Actualizar el tipo `Enemy` en `EnemyManager.ts`:
   ```typescript
   export type Enemy =
     | BasicEnemy
     | FreezableEnemy
     | AquaticEnemy
     | NuevoEnemigo;
   ```
4. Actualizar el tipo `EnemyType`:
   ```typescript
   export type EnemyType = "basic" | "freezable" | "aquatic" | "nuevo";
   ```
5. Actualizar la configuración `enemyTypeRatio` para incluir el nuevo tipo
6. Añadir lógica de creación en `createEnemy()` o crear un nuevo método especializado

## Notas Importantes

- **BasicEnemy y FreezableEnemy** se crean en superficies sólidas (`collision=true`, `swim!=true`)
- **AquaticEnemy** se crea en zonas de agua (`swim=true`)
- El ratio de enemigos se distribuye solo entre los tipos disponibles en cada contexto
- Los enemigos acuáticos **no aparecen** si no hay tiles con `swim=true` en el nivel
- El sistema es completamente automático: solo necesitas configurar `enemyConfig` en cada nivel
