# 🎮 Controles Móviles - Guía Rápida

## ⚡ Activación Rápida para Testing en PC

1. Abrir **`src/config/GameSettings.ts`**
2. Cambiar la línea:

```typescript
forceShowMobileControls: true; // ← Activado para PC
```

3. Guardar y recargar el navegador
4. ¡Los controles aparecerán en la pantalla!

## 🎯 Controles

| Control           | Acción                  | Tecla (PC) |
| ----------------- | ----------------------- | ---------- |
| **Joystick** (↔️) | Mover izquierda/derecha | A/D o ←/→  |
| **Botón A** 🅰️    | Saltar / Nadar          | SPACE      |
| **Botón B** 🅱️    | Lanzar bola de nieve    | E          |

## 📍 Ubicación en Pantalla

```
┌─────────────────────────┐
│                         │
│     ÁREA DE JUEGO       │
│                         │
│                  🅰️     │
│                         │
│    ⭕              🅱️   │
│   ╱ ⬤ ╲                │
│  │ JOY │                │
│   ╲   ╱                 │
└─────────────────────────┘
```

## 🔧 Configuración

### Modo Desarrollo (ver en PC)

```typescript
// src/config/GameSettings.ts
forceShowMobileControls: true;
```

✅ Controles visibles en desktop con mouse  
✅ Ideal para ajustar diseño

### Modo Producción (solo móviles)

```typescript
// src/config/GameSettings.ts
forceShowMobileControls: false;
```

✅ Solo aparece en dispositivos móviles  
✅ Desktop sin controles táctiles

## 📚 Documentación Completa

- **[MOBILE_CONTROLS_SYSTEM.md](./MOBILE_CONTROLS_SYSTEM.md)** - Documentación técnica completa
- **[MOBILE_CONTROLS_VISUAL_GUIDE.md](./MOBILE_CONTROLS_VISUAL_GUIDE.md)** - Guía visual con diagramas
- **[MOBILE_CONTROLS_CONFIG.md](./MOBILE_CONTROLS_CONFIG.md)** - Guía de configuración detallada

## 🎨 Personalización Rápida

### Cambiar Tamaños

Editar en `src/systems/MobileControlsSystem.ts`:

```typescript
private joystickRadius: number = 60;      // Tamaño joystick
private joystickThumbRadius: number = 30; // Tamaño control
const buttonRadius = 35;                   // Tamaño botones
```

### Cambiar Posiciones

```typescript
// Joystick (izquierda)
const joystickX = 100;
const joystickY = canvasHeight - 100;

// Botón A (derecha superior)
const buttonAX = canvasWidth - 70;
const buttonAY = canvasHeight - 120;
```

### Cambiar Opacidad

```typescript
// Más translúcido
this.joystickBase.fillStyle(0xffffff, 0.1); // 10%

// Más visible
this.joystickBase.fillStyle(0xffffff, 0.3); // 30%
```

### Cambiar Sensibilidad

Editar en `src/objects/player/Player.ts`:

```typescript
// Menos sensible (requiere más movimiento)
const joystickLeft = ... && joystickDirection.x < -0.5;

// Más sensible (se activa con poco movimiento)
const joystickLeft = ... && joystickDirection.x < -0.2;
```

## ✅ Checklist Pre-Producción

Antes de subir a producción:

- [ ] `forceShowMobileControls: false`
- [ ] Probado en iOS
- [ ] Probado en Android
- [ ] Controles NO visibles en desktop
- [ ] Teclado funciona en desktop
- [ ] Controles táctiles funcionan en móvil

## 🚀 Uso

Los controles:

- ✅ Aparecen **automáticamente** en móviles
- ✅ Se ocultan **automáticamente** en desktop
- ✅ Funcionan con **touch** en móviles
- ✅ Funcionan con **mouse** en modo desarrollo
- ✅ **No interfieren** con controles de teclado

## 💡 Tips

1. **Testing en PC**: Activa `forceShowMobileControls: true` y usa el mouse
2. **Testing en DevTools**: F12 → Modo responsive (Ctrl+Shift+M)
3. **Testing Real**: Usa tu teléfono para probar la experiencia real
4. **Producción**: No olvides poner `forceShowMobileControls: false`

## 🎯 Características

- 🎨 Diseño translúcido no invasivo
- 🎮 Estilo Game Boy familiar
- 📱 Auto-detección de dispositivos móviles
- 🖱️ Funciona con mouse en modo desarrollo
- ⚙️ Altamente personalizable
- 🔄 Responsive (se adapta al tamaño)
- ♿ Ergonómico y accesible

---

**¿Necesitas ayuda?** Revisa la documentación completa en los archivos MD mencionados arriba.
