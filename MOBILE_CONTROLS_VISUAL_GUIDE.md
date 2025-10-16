# Sistema de Controles Móviles - Resumen Visual

## 📱 Layout de la Pantalla

```
┌─────────────────────────────────────────────┐
│                                             │
│           ÁREA DE JUEGO                     │
│                                             │
│                                             │
│                                             │
│                                             │
│                                    ⭕ A     │
│                                   (Saltar)  │
│         ⭕                                   │
│        ╱ ⬤ ╲          ⭕ B                  │
│       │  ⬤  │       (Lanzar)                │
│        ╲   ╱                                │
│      JOYSTICK                               │
└─────────────────────────────────────────────┘
```

## 🎮 Componentes

### Joystick Virtual (Izquierda)

```
   ⭕  ← Base (Radio: 60px)
  ╱ ⬤ ╲ ← Control (Radio: 30px)
 │  ⬤  │
  ╲   ╱
```

- Posición: (100, altura-100)
- Opacidad: 15%-40%
- Color: Blanco translúcido
- Zona muerta: 5px
- Rango: -1 a 1 (normalizado)

### Botones (Derecha - Estilo Game Boy)

```
      ⭕ A
     (ancho-70, altura-120)

⭕ B
(ancho-150, altura-80)
```

## 🎯 Mapeo de Controles

| Control      | Función Desktop | Función Móvil         |
| ------------ | --------------- | --------------------- |
| Joystick ← → | A/D o ←/→       | Movimiento horizontal |
| Botón A      | SPACE           | Saltar / Nadar        |
| Botón B      | E               | Lanzar / Soplar       |

## 📊 Estados Visuales

### Joystick

| Estado | Base         | Control      |
| ------ | ------------ | ------------ |
| Idle   | 15% opacidad | 40% opacidad |
| Activo | 15% opacidad | 40% opacidad |

### Botones

| Estado     | Relleno | Borde | Texto |
| ---------- | ------- | ----- | ----- |
| Normal     | 25%     | 40%   | 70%   |
| Presionado | 50%     | 80%   | 70%   |

## 🔍 Detección de Móvil

```
┌─────────────────────┐
│ User Agent Mobile?  │───┐
└─────────────────────┘   │
                          │
┌─────────────────────┐   │    ┌──────────────┐
│ Touch Support?      │───┼───→│ ≥ 2/3 = TRUE │
└─────────────────────┘   │    └──────────────┘
                          │
┌─────────────────────┐   │
│ Screen ≤ 768px?     │───┘
└─────────────────────┘
```

## 💡 Características Clave

✅ **Auto-detección**: Solo aparece en dispositivos móviles  
✅ **Translúcido**: No obstruye la vista del juego  
✅ **Ergonómico**: Diseño Game Boy familiar  
✅ **Responsive**: Se adapta al tamaño de pantalla  
✅ **Zona muerta**: Evita movimientos accidentales  
✅ **Feedback visual**: Indicación clara de interacción  
✅ **Compatible**: Funciona junto con teclado

## 🎨 Paleta de Colores

| Elemento         | Color   | Opacidad Normal | Opacidad Activa |
| ---------------- | ------- | --------------- | --------------- |
| Joystick Base    | #FFFFFF | 15%             | 15%             |
| Joystick Control | #FFFFFF | 40%             | 40%             |
| Botón Relleno    | #FFFFFF | 25%             | 50%             |
| Botón Borde      | #FFFFFF | 40%             | 80%             |
| Botón Texto      | #FFFFFF | 70%             | 70%             |

## 📐 Dimensiones

| Componente       | Tamaño               | Zona Interactiva     |
| ---------------- | -------------------- | -------------------- |
| Joystick Base    | Ø 120px (radio 60px) | Ø 180px (radio 90px) |
| Joystick Control | Ø 60px (radio 30px)  | -                    |
| Botón A/B        | Ø 70px (radio 35px)  | Ø 70px (radio 35px)  |

## 🔧 Sensibilidad

```typescript
// Joystick
Threshold horizontal: ±0.3  // 30% del máximo
Zona muerta: 5px

// Botones
Detección: Tap (no hold)
Cooldown: Según acción
  - Salto: 150ms entre saltos
  - Lanzar: 500ms cooldown
```

## 🌟 Ventajas del Diseño

1. **Minimalista**: Diseño limpio que no distrae
2. **Intuitivo**: Controles familiares para jugadores móviles
3. **Preciso**: Zona muerta evita movimientos no deseados
4. **Adaptable**: Se ajusta a diferentes pantallas
5. **No intrusivo**: Transparencia permite ver el juego
6. **Profesional**: Acabado pulido y ergonómico
