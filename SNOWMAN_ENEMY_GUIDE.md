# ❄️ Snowman Enemy - Guía de Uso

## 📋 Descripción

El **SnowmanEnemy** es un enemigo estático que lanza bolas de nieve de forma periódica. Es inmortal y no puede ser derrotado, lo que lo convierte en un obstáculo permanente que el jugador debe evitar.

## 🎯 Características

- **Estático**: No se mueve de su posición inicial
- **Inmortal**: No puede ser derrotado por proyectiles del jugador
- **Lanza bolas de nieve**: Dispara proyectiles horizontales cada 3 segundos (±0.5s aleatorio)
- **Daño al jugador**: Las bolas de nieve quitan 1 vida y aplican knockback
- **Dos animaciones**: IDLE (20 frames) y ATTACK (7 frames)

## 🎨 Spritesheet

- **Textura**: `snowman_spritesheet`
- **URL**: https://lqy3lriiybxcejon.public.blob.vercel-storage.com/.../snowman-spritesheet-8iFbd0VXKrH5wIUPVYI2y1XnYpcbAU.png
- **Dimensiones por frame**: 155x150 píxeles
- **Total frames**: 27 frames en 2 filas
  - **Fila 1 (frames 0-19)**: Animación IDLE
  - **Fila 2 (frames 20-26)**: Animación ATTACK

## 🔧 Configuración en el Editor de Phaser

### Paso 1: Colocar el sprite en el mapa

1. En el editor de Phaser (Tiled), añade el frame 0,0 del spritesheet `snowman_spritesheet`
2. Colócalo en la posición deseada del mapa
3. Asegúrate de que esté en el layer `objects` o en un layer de objetos

### Paso 2: Configurar propiedades del objeto

Para que el sistema reconozca el objeto como un Snowman, debes configurar una de las siguientes opciones:

**Opción A: Nombre del objeto**

- Establece el `name` del objeto como: `snowman`

**Opción B: Tipo del objeto**

- Establece el `type` del objeto como: `snowman`

**Opción C: Propiedad personalizada**

- Añade una propiedad custom: `enemy` = `"snowman"`

### Paso 3: Configurar dirección (opcional)

- Añade una propiedad custom: `direction`
  - Valor: `1` para disparar hacia la derecha (por defecto)
  - Valor: `-1` para disparar hacia la izquierda

## 💻 Uso en código

### Creación manual (sin editor)

```typescript
import { SnowmanEnemy } from "../objects/enemies/SnowmanEnemy";

// Crear un Snowman que dispara hacia la derecha
const snowman1 = new SnowmanEnemy(this, 500, 300, 1);

// Crear un Snowman que dispara hacia la izquierda
const snowman2 = new SnowmanEnemy(this, 1000, 300, -1);

// Añadir a un array para actualización
this.snowmanEnemies.push(snowman1, snowman2);
```

### Creación desde el editor (automática)

El sistema en `Level5.ts` detecta automáticamente los Snowmen colocados en el editor:

```typescript
private createSnowmanEnemies(): void {
  // Busca objetos en el tilemap con nombre/tipo/propiedad "snowman"
  // Los crea automáticamente con su dirección configurada
  // Configura las colisiones con los proyectiles
}
```

### Actualización en el loop

```typescript
update(time: number, delta: number): void {
  super.update(time, delta);
  // Actualizar todos los Snowman
  this.snowmanEnemies.forEach((enemy) => enemy.update(time, delta));
}
```

### Limpieza al salir del nivel

```typescript
shutdown(): void {
  this.snowmanEnemies.forEach((enemy) => {
    if (enemy && enemy.active) enemy.destroy();
  });
  this.snowmanEnemies = [];
  super.shutdown();
}
```

## ⚙️ Configuración de colisiones

### Colisiones con el jugador

Las colisiones se configuran automáticamente en `createSnowmanEnemies()`:

```typescript
private setupSnowmanProjectileCollisions(): void {
  this.events.on("enemySnowballCreated", (snowball: any) => {
    // Configura overlap entre proyectil y jugador
    // Aplica daño (1 vida)
    // Aplica knockback (400 de fuerza)
    // Destruye el proyectil
  });
}
```

### Sistema de proyectiles

El `ProjectileSystem` se encarga de gestionar los proyectiles de enemigos:

```typescript
// En ProjectileSystem.ts
this.scene.events.on("enemySnowballCreated", this.snowballListener);
```

## 🎮 Mecánicas de juego

### Patrón de ataque

1. El Snowman permanece en estado IDLE
2. Cada ~3 segundos, cambia a estado ATTACK
3. En el frame 4 de la animación de ataque, lanza una bola de nieve
4. La bola de nieve viaja en línea recta horizontal
5. Vuelve a estado IDLE y espera el siguiente ataque

### Proyectiles

- **Velocidad**: 400 píxeles/segundo
- **Dirección**: Horizontal (según `facingDirection`)
- **Daño**: 1 vida
- **Knockback**: 400 de fuerza horizontal + 200 hacia arriba
- **Duración**: Se destruyen después de 3 segundos o al chocar

### Colisión con el jugador

Cuando una bola de nieve golpea al jugador:

1. Se aplica 1 punto de daño (quita 1 vida)
2. El jugador es empujado en dirección opuesta al proyectil
3. El jugador recibe un pequeño impulso hacia arriba
4. El proyectil se destruye

## 📝 Propiedades configurables

### En la clase SnowmanEnemy

```typescript
private attackCooldown: number = 3000; // Tiempo entre ataques (ms)
private snowballSpeed: number = 400;   // Velocidad de la bola de nieve
```

### En setupSnowmanProjectileCollisions

```typescript
const damage = 1; // Daño al jugador
const knockbackForce = 400; // Fuerza del knockback horizontal
const upwardForce = -200; // Impulso hacia arriba
```

## 🚀 Ejemplo completo en Level5

```typescript
export class Level5 extends BaseGameScene {
  private snowmanEnemies: SnowmanEnemy[] = [];

  create() {
    this.snowmanEnemies = [];
    super.create();
    // ... otros sistemas
    this.createSnowmanEnemies(); // ← Crear Snowmen desde editor
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.snowmanEnemies.forEach((enemy) => enemy.update(time, delta));
  }

  shutdown(): void {
    this.snowmanEnemies.forEach((enemy) => {
      if (enemy && enemy.active) enemy.destroy();
    });
    this.snowmanEnemies = [];
    super.shutdown();
  }
}
```

## 🎯 Consejos de diseño de niveles

1. **Posicionamiento**: Coloca Snowmen en plataformas elevadas o detrás de obstáculos
2. **Dirección estratégica**: Usa la propiedad `direction` para crear patrones de fuego cruzado
3. **Timing**: Los disparos cada 3 segundos permiten al jugador encontrar ventanas de oportunidad
4. **Combinaciones**: Combina con otros enemigos para crear desafíos interesantes
5. **Cobertura**: Úsalos para proteger áreas con coleccionables o llaves importantes

## 🐛 Solución de problemas

### El Snowman no aparece

- Verifica que el objeto tenga nombre/tipo/propiedad `snowman`
- Asegúrate de que está en el layer correcto
- Comprueba que `createSnowmanEnemies()` se llama en `create()`

### Los proyectiles no dañan al jugador

- Verifica que `setupSnowmanProjectileCollisions()` se llama
- Asegúrate de que el jugador tenga el método `takeDamage()`
- Comprueba que el `ProjectileSystem` está escuchando eventos de enemigos

### El Snowman no dispara

- Verifica que el método `update()` se llama para cada Snowman
- Comprueba las animaciones en `PreloadScene`
- Asegúrate de que el spritesheet se carga correctamente

## 📚 Archivos relacionados

- **Clase principal**: `src/objects/enemies/SnowmanEnemy.ts`
- **Integración**: `src/scenes/Level5.ts`
- **Sistema de proyectiles**: `src/systems/ProjectileSystem.ts`
- **Carga de assets**: `src/scenes/PreloadScene.ts`
- **Exports**: `src/objects/enemies/index.ts`
