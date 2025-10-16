# Sistema de Controles Móviles

## Descripción General

Sistema de controles táctiles diseñado específicamente para dispositivos móviles, proporcionando una experiencia de juego intuitiva y ergonómica sin necesidad de teclado.

## Componentes

### 1. Joystick Virtual (Zona Izquierda)

- **Ubicación**: Esquina inferior izquierda de la pantalla
- **Posición**: (100px, altura - 100px)
- **Función**: Control de movimiento horizontal del personaje
- **Características**:
  - Diseño circular translúcido
  - Radio de base: 60px
  - Radio del control: 30px
  - Zona muerta: 5px (evita micro-movimientos no deseados)
  - Movimiento limitado al radio para evitar pérdida de control

### 2. Botones de Acción (Zona Derecha - Estilo Game Boy)

#### Botón A (Saltar)

- **Ubicación**: Esquina inferior derecha superior
- **Posición**: (ancho - 70px, altura - 120px)
- **Función**: Saltar / Nadar hacia arriba
- **Características**:
  - Etiqueta: "A"
  - Radio: 35px
  - Diseño circular translúcido

#### Botón B (Lanzar Bola de Nieve)

- **Ubicación**: Esquina inferior derecha inferior
- **Posición**: (ancho - 150px, altura - 80px)
- **Función**: Lanzar bola de nieve / Soplar viento (modo fantasma)
- **Características**:
  - Etiqueta: "B"
  - Radio: 35px
  - Diseño circular translúcido

## Diseño Visual

### Estilo Translúcido

- **Base del Joystick**:
  - Relleno: Blanco con 15% de opacidad
  - Borde: Blanco con 30% de opacidad
- **Control del Joystick**:

  - Relleno: Blanco con 40% de opacidad
  - Borde: Blanco con 60% de opacidad

- **Botones (Estado Normal)**:

  - Relleno: Blanco con 25% de opacidad
  - Borde: Blanco con 40% de opacidad
  - Texto: Blanco con 70% de opacidad

- **Botones (Estado Presionado)**:
  - Relleno: Blanco con 50% de opacidad
  - Borde: Blanco con 80% de opacidad
  - Feedback visual inmediato al tocar

### Ergonomía

- Todos los controles están posicionados en zonas de fácil acceso con los pulgares
- El joystick a la izquierda es natural para usuarios diestros y zurdos
- Los botones en disposición Game Boy son familiares y cómodos
- Diseño translúcido minimiza la obstrucción visual del juego

## Detección de Dispositivo Móvil

El sistema detecta automáticamente si el dispositivo es móvil mediante 3 métodos:

1. **User Agent**: Analiza el string del navegador
2. **Touch Support**: Verifica si el dispositivo soporta eventos táctiles
3. **Screen Size**: Comprueba si el ancho es ≤ 768px

**Criterio de Activación**: Se considera móvil si cumple al menos 2 de las 3 condiciones.

## Integración con el Player

### Movimiento Horizontal

```typescript
// El joystick se integra con el input de teclado
const joystickLeft =
  this.mobileControls && this.mobileControls.joystickDirection.x < -0.3;
const joystickRight =
  this.mobileControls && this.mobileControls.joystickDirection.x > 0.3;
const isMovingLeft = keyboardLeft || joystickLeft;
const isMovingRight = keyboardRight || joystickRight;
```

### Salto

```typescript
// El botón A se integra con la tecla de salto
const mobileJumpJustPressed =
  this.mobileControls &&
  this.mobileControls.buttonAPressed &&
  !this.wasButtonAPressed;
const jumpJustPressed =
  (this.jumpKey.isDown && !this.wasJumpPressed) || mobileJumpJustPressed;
```

### Lanzar Bola de Nieve

```typescript
// El botón B se integra con la tecla E
const mobileThrowJustPressed =
  this.mobileControls &&
  this.mobileControls.buttonBPressed &&
  !this.wasButtonBPressed;
const isThrowKeyJustPressed =
  (this.throwKey!.isDown && !this.wasThrowKeyDown) || mobileThrowJustPressed;
```

## Funcionalidades Especiales

### Joystick

- **Dirección Normalizada**: Los valores de dirección están normalizados entre -1 y 1
- **Zona Muerta**: Los movimientos menores a 5px son ignorados
- **Límite de Movimiento**: El control no puede salir del círculo base
- **Reset Automático**: El joystick vuelve al centro al soltar

### Botones

- **Detección de Tap**: Se detecta cuando el botón pasa de no presionado a presionado
- **Feedback Visual**: Los botones cambian de opacidad al ser presionados
- **Zonas Interactivas Amplias**: 70px de radio (2x del botón visual) para facilitar el uso

### Resize Automático

El sistema se adapta automáticamente cuando cambia el tamaño de la pantalla:

```typescript
public resize(width: number, height: number): void
```

## Uso

### Inicialización

```typescript
// En el Player constructor
this.mobileControls = new MobileControlsSystem(this.scene);
```

### Control de Visibilidad

```typescript
// Mostrar/ocultar controles
player.setMobileControlsVisible(true / false);
```

### Limpieza

```typescript
// El sistema se limpia automáticamente al destruir el player
player.destroy();
```

## Compatibilidad

- ✅ iOS (iPhone, iPad)
- ✅ Android (smartphones, tablets)
- ✅ Navegadores móviles (Chrome, Safari, Firefox)
- ✅ Desktop con pantalla táctil
- ❌ Desktop sin pantalla táctil (controles ocultos automáticamente)

## Ventajas del Diseño

1. **No Invasivo**: Diseño translúcido que no obstruye la vista del juego
2. **Ergonómico**: Posicionamiento natural para los pulgares
3. **Familiar**: Disposición Game Boy reconocible por jugadores
4. **Responsive**: Se adapta a diferentes tamaños de pantalla
5. **Feedback Visual**: Indicaciones claras de interacción
6. **Detección Inteligente**: Solo aparece en dispositivos móviles
7. **Integración Perfecta**: Compatible con controles de teclado existentes

## Personalización

Para ajustar el diseño, modificar en `MobileControlsSystem.ts`:

- **Tamaño del Joystick**: `joystickRadius` y `joystickThumbRadius`
- **Tamaño de Botones**: En `createButtons()`, modificar `buttonRadius`
- **Posiciones**: Ajustar coordenadas en `createJoystick()` y `createButtons()`
- **Opacidad**: Modificar valores de `fillStyle()` en cada elemento
- **Sensibilidad**: Cambiar threshold en detección de dirección (actualmente 0.3)

## Testing

### Modo Desarrollo (Desktop)

Para activar los controles en PC para desarrollo y testing:

1. Abrir `src/config/GameSettings.ts`
2. Cambiar `forceShowMobileControls: true`
3. Los controles aparecerán en PC y funcionarán con el mouse
4. Para producción, cambiar a `forceShowMobileControls: false`

```typescript
export const GameSettings = {
  debug: true,
  forceShowMobileControls: true, // true = mostrar en PC, false = solo móviles
  canvas: { width: 720, height: 1080 },
};
```

### Testing en DevTools

Para probar en modo responsive sin cambiar configuración:

1. Abrir DevTools (F12)
2. Activar modo responsive (Ctrl+Shift+M)
3. Seleccionar un dispositivo móvil
4. Recargar la página
5. Los controles deberían aparecer automáticamente

### Interacción en PC

Cuando `forceShowMobileControls: true`:

- **Joystick**: Click y arrastrar con el mouse
- **Botones**: Click con el mouse
- Los controles de teclado siguen funcionando normalmente
- Puedes probar ambos sistemas de control simultáneamente
