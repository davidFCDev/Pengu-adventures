# 🐟⚡ Efecto de Electrocución del Enemigo Acuático

## 📋 Descripción

El enemigo acuático (pez eléctrico) tiene un efecto visual y sonoro espectacular cuando toca al jugador. Este efecto simula una electrocución con:

- ⚡ **Parpadeo rápido** entre colores (blanco brillante ↔ azul eléctrico)
- 📳 **Vibración intensa** del jugador (shake effect)
- ✨ **Partículas eléctricas** (rayos amarillos) alrededor del jugador
- 🔊 **Sonido de electrocución** (chispazo eléctrico)
- 🏊 **Fuerza animación de nado** durante todo el efecto (nunca STANDING)
- ⏱️ **Cooldown de 1 segundo** para evitar spam del efecto

---

## 🎨 Detalles Técnicos del Efecto

### Timing

- **Duración total**: 500ms (0.5 segundos)
- **Intervalo de parpadeo**: 50ms (muy rápido, 10 flashes por segundo)
- **Cooldown**: 1000ms (1 segundo entre electrocuciones)

### Colores

- **Blanco brillante**: `0xffffff` (frames pares)
- **Azul eléctrico**: `0x0088ff` (frames impares)

### Vibración

- **Intensidad**: ±3 píxeles en X e Y
- **Frecuencia**: Cada 50ms (sincronizado con parpadeo)

### Animación Forzada

- **Estado**: SWIM (`penguin_swing` animation)
- **Duración**: Durante toda la electrocución (500ms)
- **Comportamiento**: Se fuerza al inicio y en cada flash
- **Restauración**: Automática al finalizar (el sistema de estados del jugador retoma control)

### Partículas Eléctricas

- **Cantidad**: 8-12 rayos por electrocución
- **Color**: Amarillo brillante (`0xffff00`)
- **Grosor**: 2 píxeles
- **Distancia del jugador**: 20-40 píxeles
- **Segmentos por rayo**: 3 (zigzag)
- **Animación**: Parpadeo rápido (fade in/out) durante 500ms

### Efectos de Sonido

- **Sonido**: `electrocute_sound`
- **Volumen**: 0.5 (50%)
- **Timing**: Se reproduce al inicio del efecto
- **Fuente**: Vercel Blob Storage
- **URL**: `https://lqy3lriiybxcejon.public.blob.vercel-storage.com/.../electrocute-ISm1Olyb9dag0f5mlYJh6XPSXCrvdm.mp3`

---

## 🔧 Implementación

### Método Principal: `damagePlayer()`

```typescript
public damagePlayer(player: any): void {
  const currentTime = this.scene.time.now;

  // Verificar cooldown para el efecto visual
  const canElectrocute = currentTime - this.lastElectrocutionTime > this.electrocutionCooldown;

  if (player.takeDamage) {
    player.takeDamage(this.x);

    // Aplicar efecto de electrocución solo si ha pasado el cooldown
    if (canElectrocute) {
      this.applyElectrocutionEffect(player);
      this.lastElectrocutionTime = currentTime;
    }
  }
}
```

### Efecto de Electrocución: `applyElectrocutionEffect()`

**Fases del efecto:**

1. **Guardar estado original** del jugador (posición, tint, animación actual)
2. **Forzar animación de nado** (`penguin_swing`) - CRÍTICO para mantener SWIM state
3. **Crear partículas eléctricas** alrededor del jugador
4. **Iniciar timer de parpadeo** (cada 50ms durante 500ms)
   - Alternar tint: blanco ↔ azul eléctrico
   - Aplicar shake: ±3px en X e Y
   - **Re-forzar animación de nado** en cada flash (asegura SWIM durante todo el efecto)
5. **Restaurar estado original** después de 500ms
   - El sistema de estados del jugador retoma el control de la animación

**⚠️ IMPORTANTE: Animación SWIM Forzada**

Durante la electrocución, el jugador **siempre** debe estar en animación de nado (`penguin_swing`), nunca en STANDING. Esto se logra:

```typescript
// Al inicio del efecto
if (player.anims && player.anims.getName() !== "penguin_swing") {
  player.anims.play("penguin_swing", true);
}

// En cada flash (cada 50ms)
if (player.anims && player.anims.getName() !== "penguin_swing") {
  player.anims.play("penguin_swing", true);
}
```

Esto garantiza que incluso si el jugador intenta cambiar de animación, se mantiene forzado en SWIM durante toda la electrocución.

### Partículas Eléctricas: `createElectricParticles()`

**Proceso de creación:**

1. **Determinar cantidad**: 8-12 rayos aleatorios
2. **Para cada rayo:**
   - Calcular posición inicial (círculo alrededor del jugador)
   - Dibujar zigzag de 3 segmentos con `Graphics`
   - Aplicar tween de parpadeo (alpha: 1 → 0)
   - Auto-destruir después de la animación

```typescript
private createElectricParticles(player: any): void {
  const scene = this.scene;
  const particleCount = Phaser.Math.Between(8, 12);

  for (let i = 0; i < particleCount; i++) {
    const lightning = scene.add.graphics();
    lightning.lineStyle(2, 0xffff00, 1); // Amarillo brillante

    // Posición aleatoria alrededor del jugador
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = Phaser.Math.Between(20, 40);
    const startX = player.x + Math.cos(angle) * distance;
    const startY = player.y + Math.sin(angle) * distance;

    // Dibujar rayo zigzag
    // ... (ver código completo en AquaticEnemy.ts)
  }
}
```

---

## 🎯 Mejoras Futuras Posibles

### Efectos Visuales Adicionales

- [ ] Distorsión de pantalla (chromatic aberration)
- [ ] Flash blanco de toda la pantalla
- [ ] Efecto de "slowmo" temporal (0.5x velocidad por 200ms)
- [ ] Partículas de chispas cayendo

### Efectos de Sonido

- [ ] Sonido de chispazo eléctrico (`zap.mp3`)
- [ ] Sonido ambiente de electricidad (`electric_hum.mp3`)
- [ ] Grito del jugador (opcional)

### Gameplay

- [ ] Paralización temporal del jugador (no puede moverse por 0.3s)
- [ ] Inversión temporal de controles
- [ ] Daño continuo si permanece tocando al pez

---

## 📊 Diagrama de Flujo del Efecto

```
Jugador toca al pez eléctrico
    ↓
¿Ha pasado el cooldown (1s)?
    ↓ SÍ
Aplicar daño al jugador
    ↓
Guardar estado original (pos, tint)
    ↓
Crear partículas eléctricas (8-12 rayos)
    ├─→ Rayo 1: zigzag amarillo, fade in/out
    ├─→ Rayo 2: zigzag amarillo, fade in/out
    └─→ ... (hasta 12)
    ↓
Iniciar timer de parpadeo (cada 50ms)
    ├─→ Frame 0: Tint blanco + shake
    ├─→ Frame 50ms: Tint azul + shake
    ├─→ Frame 100ms: Tint blanco + shake
    └─→ ... (hasta 500ms)
    ↓
Restaurar estado original
    ├─→ Limpiar tint
    └─→ Restaurar posición
    ↓
Registrar tiempo de última electrocución
```

---

## 🧪 Testing

### Checklist de Pruebas

- [x] El efecto se activa al tocar al pez
- [x] El parpadeo es rápido y visible
- [x] La vibración es perceptible pero no exagerada
- [x] Las partículas aparecen alrededor del jugador
- [x] El efecto termina correctamente
- [x] El estado del jugador se restaura
- [x] El cooldown funciona (no spam)
- [ ] El efecto funciona con múltiples peces
- [ ] No hay memory leaks (partículas se destruyen)

### Casos de Borde

- **Jugador muere durante el efecto**: ✅ El efecto se cancela automáticamente
- **Cambio de escena durante el efecto**: ✅ Los timers se limpian en `shutdown()`
- **Múltiples peces tocan al mismo tiempo**: ✅ El cooldown previene múltiples efectos simultáneos

---

## 💡 Tips de Uso

1. **Ajustar intensidad**: Modifica `shakeIntensity` (default: 3) para más o menos vibración
2. **Cambiar duración**: Modifica `duration` (default: 500ms) para efectos más largos/cortos
3. **Más/menos rayos**: Modifica `Phaser.Math.Between(8, 12)` en `createElectricParticles()`
4. **Colores personalizados**: Cambia `0xffffff` y `0x0088ff` en `applyElectrocutionEffect()`
5. **Cooldown**: Modifica `electrocutionCooldown` (default: 1000ms)

---

## 📝 Changelog

### v1.0.0 - Efecto Inicial

- ✅ Parpadeo blanco/azul eléctrico
- ✅ Vibración del jugador
- ✅ Partículas eléctricas (rayos zigzag)
- ✅ Cooldown de 1 segundo
- ✅ Restauración automática del estado

---

## 🔗 Referencias

- **Archivo**: `src/objects/enemies/AquaticEnemy.ts`
- **Métodos clave**:
  - `damagePlayer()` - Punto de entrada
  - `applyElectrocutionEffect()` - Lógica principal del efecto
  - `createElectricParticles()` - Creación de rayos visuales
