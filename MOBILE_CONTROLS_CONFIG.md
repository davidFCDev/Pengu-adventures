# Configuración Rápida - Controles Móviles

## 🎮 Activar/Desactivar Controles en PC

### Archivo: `src/config/GameSettings.ts`

```typescript
export const GameSettings = {
  debug: true,

  // ⚙️ CONTROL DE VISIBILIDAD DE CONTROLES MÓVILES
  forceShowMobileControls: true, // ← CAMBIAR AQUÍ

  canvas: {
    width: 720,
    height: 1080,
  },
};
```

## 📝 Configuraciones Disponibles

### Modo Desarrollo (Testing en PC)

```typescript
forceShowMobileControls: true;
```

- ✅ Controles visibles en desktop
- ✅ Funciona con mouse (click y arrastrar)
- ✅ Teclado sigue funcionando
- ✅ Ideal para ajustar diseño y posiciones
- ⚠️ **NO usar en producción**

### Modo Producción (Solo Móviles)

```typescript
forceShowMobileControls: false;
```

- ✅ Controles solo en dispositivos móviles
- ✅ Auto-detección inteligente
- ✅ Desktop sin controles táctiles
- ✅ **Recomendado para producción**

## 🔧 Ajustes de Diseño

Si necesitas modificar el diseño de los controles, edita:
`src/systems/MobileControlsSystem.ts`

### Tamaños

```typescript
private joystickRadius: number = 60;        // Radio del joystick base
private joystickThumbRadius: number = 30;   // Radio del control del joystick
const buttonRadius = 35;                     // Radio de botones A/B
```

### Posiciones

```typescript
// Joystick
const joystickX = 100;
const joystickY = canvasHeight - 100;

// Botón B (lanzar)
const buttonBX = canvasWidth - 150;
const buttonBY = canvasHeight - 80;

// Botón A (saltar)
const buttonAX = canvasWidth - 70;
const buttonAY = canvasHeight - 120;
```

### Opacidades

```typescript
// Joystick Base
this.joystickBase.fillStyle(0xffffff, 0.15); // 15% opacidad
this.joystickBase.lineStyle(3, 0xffffff, 0.3); // Borde 30%

// Joystick Control
this.joystickThumb.fillStyle(0xffffff, 0.4); // 40% opacidad
this.joystickThumb.lineStyle(2, 0xffffff, 0.6); // Borde 60%

// Botones normales
button.fillStyle(0xffffff, 0.25); // 25% opacidad
button.lineStyle(3, 0xffffff, 0.4); // Borde 40%

// Botones presionados
button.fillStyle(0xffffff, 0.5); // 50% opacidad
button.lineStyle(3, 0xffffff, 0.8); // Borde 80%
```

### Sensibilidad del Joystick

```typescript
// En Player.ts, líneas de detección de movimiento
const joystickLeft =
  this.mobileControls && this.mobileControls.joystickDirection.x < -0.3; // Threshold: -0.3

const joystickRight =
  this.mobileControls && this.mobileControls.joystickDirection.x > 0.3; // Threshold: 0.3
```

Valores recomendados para threshold:

- `0.2` = Muy sensible (puede activarse con poco movimiento)
- `0.3` = **Equilibrado** (valor actual - recomendado)
- `0.5` = Menos sensible (requiere más movimiento del joystick)

## 🎨 Cambiar Colores

Los controles usan color blanco translúcido por defecto. Para cambiar:

```typescript
// Cambiar de blanco (0xffffff) a otro color
this.joystickBase.fillStyle(0x00ff00, 0.15); // Verde
this.joystickThumb.fillStyle(0xff0000, 0.4); // Rojo
buttonA.fillStyle(0x0000ff, 0.25); // Azul
```

Colores hexadecimales comunes:

- Blanco: `0xffffff`
- Negro: `0x000000`
- Rojo: `0xff0000`
- Verde: `0x00ff00`
- Azul: `0x0000ff`
- Amarillo: `0xffff00`
- Cian: `0x00ffff`
- Magenta: `0xff00ff`

## 🚀 Checklist Pre-Producción

Antes de desplegar a producción:

- [ ] Cambiar `forceShowMobileControls: false` en GameSettings.ts
- [ ] Probar en dispositivo móvil real (iOS y Android)
- [ ] Verificar que controles NO aparezcan en desktop
- [ ] Confirmar que teclado funciona correctamente en desktop
- [ ] Verificar que controles táctiles funcionen en móvil
- [ ] Probar en diferentes tamaños de pantalla (portrait/landscape)
- [ ] Verificar que la opacidad sea cómoda para el jugador

## 💡 Tips de Desarrollo

1. **Testing Rápido**: Usa `forceShowMobileControls: true` y prueba con el mouse
2. **Ajuste de Posiciones**: Modifica las coordenadas X/Y directamente en el código
3. **Feedback Visual**: Ajusta las opacidades hasta que sea cómodo visualmente
4. **Sensibilidad**: Prueba con diferentes thresholds para el joystick
5. **Producción**: No olvides desactivar `forceShowMobileControls` antes de deployar

## 📱 Recuerda

El sistema detecta automáticamente dispositivos móviles, pero en desarrollo es útil forzar la visualización para ajustar diseño y posiciones sin necesidad de un dispositivo físico.
