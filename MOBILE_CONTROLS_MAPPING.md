# 🎮 Mapeo Completo de Controles Móviles

## 📱 Joystick Virtual (Zona Izquierda)

### Movimiento Horizontal (←→)

| Dirección       | Acción               | Threshold | Equivalente Teclado |
| --------------- | -------------------- | --------- | ------------------- |
| **← Izquierda** | Mover a la izquierda | x < -0.3  | A o ←               |
| **→ Derecha**   | Mover a la derecha   | x > 0.3   | D o →               |

```typescript
const joystickLeft = joystickDirection.x < -0.3;
const joystickRight = joystickDirection.x > 0.3;
```

### Movimiento Vertical (↑↓)

| Dirección    | Acción            | Threshold | Equivalente Teclado | Contexto              |
| ------------ | ----------------- | --------- | ------------------- | --------------------- |
| **↑ Arriba** | Escalar/Trepar    | y < -0.3  | W o ↑               | Solo en modo Climbing |
| **↓ Abajo**  | Bajar escalera    | y > 0.3   | S o ↓               | Solo en modo Climbing |
| **↓ Abajo**  | Agacharse (CRAWL) | y > 0.3   | S, ↓ o SHIFT        | En tierra firme       |

```typescript
// Climbing (escaleras)
const joystickUp = joystickDirection.y < -0.3;
const joystickDown = joystickDirection.y > 0.3;

// Crouch (agacharse en tierra)
const joystickCrouch = !this.isClimbing && joystickDirection.y > 0.3;
```

## 🅰️ Botón A (Derecha Superior)

| Acción                 | Contexto   | Equivalente Teclado |
| ---------------------- | ---------- | ------------------- |
| **Saltar**             | En tierra  | SPACE               |
| **Doble Salto**        | En el aire | SPACE (segunda vez) |
| **Nadar hacia arriba** | En agua    | SPACE               |

```typescript
const mobileJump = mobileControls.buttonAPressed;
```

## 🅱️ Botón B (Derecha Inferior)

| Acción                   | Contexto      | Equivalente Teclado |
| ------------------------ | ------------- | ------------------- |
| **Lanzar bola de nieve** | Modo normal   | E                   |
| **Soplar viento**        | Modo fantasma | E                   |

```typescript
const mobileThrow = mobileControls.buttonBPressed;
```

## 📊 Diagrama de Controles

```
┌─────────────────────────────────────────────┐
│                 JUEGO                       │
│                                             │
│   JOYSTICK              BOTONES             │
│                                             │
│      ↑                            🅰️       │
│      │                          (Saltar)    │
│   ←──┼──→                                   │
│      │                    🅱️                │
│      ↓                 (Lanzar)             │
│                                             │
│   Horizontal:          A = Saltar/Nadar     │
│   ← Mover Izq          B = Lanzar/Soplar    │
│   → Mover Der                               │
│                                             │
│   Vertical:                                 │
│   ↑ Trepar (climbing)                       │
│   ↓ Bajar / Agacharse                       │
└─────────────────────────────────────────────┘
```

## 🎯 Contextos de Uso

### 1. En Tierra (Normal)

```
Joystick:
  ← → = Caminar izquierda/derecha
  ↓   = Agacharse (CRAWL)
  ↑   = (no usado)

Botones:
  A   = Saltar
  B   = Lanzar bola de nieve
```

### 2. En el Aire

```
Joystick:
  ← → = Moverse en el aire
  ↓   = (no usado)
  ↑   = (no usado)

Botones:
  A   = Doble salto (si disponible)
  B   = Lanzar bola de nieve
```

### 3. En Agua (Swimming)

```
Joystick:
  ← → = Nadar izquierda/derecha
  ↓   = (no usado)
  ↑   = (no usado - usar Botón A)

Botones:
  A   = Impulso hacia arriba (Flappy)
  B   = (no disponible)
```

### 4. En Escaleras (Climbing)

```
Joystick:
  ← → = (no usado - opcional)
  ↑   = Subir escalera
  ↓   = Bajar escalera

Botones:
  A   = (no usado)
  B   = (no usado)
```

### 5. Modo Fantasma (Ghost)

```
Joystick:
  ← → = Flotar izquierda/derecha
  ↓   = (no usado)
  ↑   = (no usado)

Botones:
  A   = Flotar hacia arriba
  B   = Soplar viento
```

### 6. Agachado (Crouching)

```
Joystick:
  ← → = Gatear izquierda/derecha (velocidad reducida)
  ↓   = Mantener agachado
  ↑   = Soltar para levantarse

Botones:
  A   = (no disponible mientras agachado)
  B   = Lanzar bola de nieve
```

## ⚙️ Configuración de Sensibilidad

### Threshold Actual: 0.3

```typescript
// Horizontal
x < -0.3; // Izquierda (30% del rango)
x > 0.3; // Derecha (30% del rango)

// Vertical
y < -0.3; // Arriba (30% del rango)
y > 0.3; // Abajo (30% del rango)
```

### Ajustar Sensibilidad

**Más sensible** (se activa con menos movimiento):

```typescript
x < -0.2; // 20% del rango
y < -0.2;
```

**Menos sensible** (requiere más movimiento):

```typescript
x < -0.5; // 50% del rango
y < -0.5;
```

## 🔄 Estados del Joystick

| Estado     | X      | Y      | Acción                  |
| ---------- | ------ | ------ | ----------------------- |
| Centro     | 0.0    | 0.0    | Sin movimiento          |
| Izquierda  | < -0.3 | ~0     | Caminar izquierda       |
| Derecha    | > 0.3  | ~0     | Caminar derecha         |
| Arriba     | ~0     | < -0.3 | Trepar (climbing)       |
| Abajo      | ~0     | > 0.3  | Bajar / Agacharse       |
| Diagonal ↖ | < -0.3 | < -0.3 | Izq + Arriba (climbing) |
| Diagonal ↗ | > 0.3  | < -0.3 | Der + Arriba (climbing) |
| Diagonal ↙ | < -0.3 | > 0.3  | Izq + Abajo             |
| Diagonal ↘ | > 0.3  | > 0.3  | Der + Abajo             |

## 📝 Notas Importantes

1. **Zona Muerta**: Movimientos menores a 5px son ignorados
2. **Normalización**: Los valores están normalizados entre -1 y 1
3. **Prioridad**:

   - Climbing tiene prioridad sobre Crouch en eje vertical
   - Si `isClimbing = true`, joystick abajo baja escalera
   - Si `isClimbing = false`, joystick abajo = agacharse

4. **Detección de Techo**: Si hay un techo encima, el personaje se agacha automáticamente independientemente del joystick

## 🎮 Equivalencias Completas

| Acción    | Teclado     | Joystick | Botón |
| --------- | ----------- | -------- | ----- |
| Mover Izq | A, ←        | x < -0.3 | -     |
| Mover Der | D, →        | x > 0.3  | -     |
| Saltar    | SPACE       | -        | A     |
| Lanzar    | E           | -        | B     |
| Trepar    | W, ↑        | y < -0.3 | -     |
| Bajar     | S, ↓        | y > 0.3  | -     |
| Agacharse | S, ↓, SHIFT | y > 0.3  | -     |

## 💡 Tips de Uso Móvil

1. **Saltar**: Toca el botón A rápidamente
2. **Doble Salto**: Toca A dos veces rápido en el aire
3. **Agacharse**: Mueve el joystick hacia abajo
4. **Gatear**: Mantén joystick abajo + mueve horizontal
5. **Trepar**: Posiciónate frente a escalera + joystick arriba
6. **Nadar**: Toca A repetidamente para impulsarte

---

**Versión**: 2.0 - Control vertical completo con joystick
