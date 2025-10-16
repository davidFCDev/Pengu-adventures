/**
 * Sistema de controles táctiles para dispositivos móviles
 * Proporciona un joystick virtual y botones de acción (saltar y lanzar)
 */
import { GameSettings } from "../config/GameSettings";

export class MobileControlsSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  // Joystick
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickThumb!: Phaser.GameObjects.Graphics;
  private joystickZone!: Phaser.GameObjects.Zone;
  private joystickActive: boolean = false;
  private joystickPointerId: number = -1; // ID del pointer que controla el joystick
  private joystickStartX: number = 0;
  private joystickStartY: number = 0;
  private joystickCurrentX: number = 0;
  private joystickCurrentY: number = 0;
  private joystickRadius: number = 100; // Radio del área del joystick (aumentado de 80 a 100)
  private joystickThumbRadius: number = 50; // Radio del control móvil (aumentado de 40 a 50)

  // Botones
  private buttonA!: Phaser.GameObjects.Graphics; // Saltar
  private buttonB!: Phaser.GameObjects.Graphics; // Lanzar bola de nieve
  private buttonAZone!: Phaser.GameObjects.Zone;
  private buttonBZone!: Phaser.GameObjects.Zone;
  private buttonAText!: Phaser.GameObjects.Text;
  private buttonBText!: Phaser.GameObjects.Text;

  // Estado de los botones
  public buttonAPressed: boolean = false;
  public buttonBPressed: boolean = false;
  private buttonAPointerId: number = -1; // ID del pointer que presiona el botón A
  private buttonBPointerId: number = -1; // ID del pointer que presiona el botón B

  // Estado del joystick (dirección normalizada)
  public joystickDirection: { x: number; y: number } = { x: 0, y: 0 };

  // Detección de dispositivo móvil
  private isMobile: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Detectar si es un dispositivo móvil o forzar en modo desarrollo
    this.isMobile = this.detectMobile() || GameSettings.forceShowMobileControls;

    // Habilitar multi-touch en Phaser
    this.scene.input.addPointer(2); // Permite hasta 3 toques simultáneos (el primero ya existe por defecto)

    // Crear contenedor principal (se añadirá a la cámara para que sea fijo)
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(10000); // Siempre visible encima de todo
    this.container.setScrollFactor(0); // No se mueve con la cámara

    if (this.isMobile) {
      this.createJoystick();
      this.createButtons();
      this.setupInputHandlers();
    } else {
      // En desktop, ocultar los controles
      this.container.setVisible(false);
    }
  }

  /**
   * Detecta si el dispositivo es móvil
   */
  private detectMobile(): boolean {
    // Método 1: User Agent
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileUA =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );

    // Método 2: Touch support
    const hasTouchScreen =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Método 3: Screen size (dispositivos pequeños)
    const isSmallScreen = window.innerWidth <= 768;

    // Es móvil si cumple al menos 2 de las 3 condiciones
    const mobileIndicators = [isMobileUA, hasTouchScreen, isSmallScreen].filter(
      Boolean
    ).length;

    return mobileIndicators >= 2;
  }

  /**
   * Crea el joystick virtual
   */
  private createJoystick(): void {
    const canvasWidth = this.scene.cameras.main.width;
    const canvasHeight = this.scene.cameras.main.height;

    // Posición del joystick (esquina inferior izquierda)
    const joystickX = 120; // Aumentado de 100 a 120
    const joystickY = canvasHeight - 120; // Aumentado de 100 a 120

    this.joystickStartX = joystickX;
    this.joystickStartY = joystickY;
    this.joystickCurrentX = joystickX;
    this.joystickCurrentY = joystickY;

    // Base del joystick (círculo exterior translúcido)
    this.joystickBase = this.scene.add.graphics();
    this.joystickBase.fillStyle(0x000000, 0.15); // Negro muy translúcido
    this.joystickBase.lineStyle(3, 0x000000, 0.3); // Borde negro translúcido
    this.joystickBase.fillCircle(0, 0, this.joystickRadius);
    this.joystickBase.strokeCircle(0, 0, this.joystickRadius);
    this.joystickBase.setPosition(joystickX, joystickY);

    // Control del joystick (círculo interior)
    this.joystickThumb = this.scene.add.graphics();
    this.joystickThumb.fillStyle(0x000000, 0.4); // Negro semi-translúcido
    this.joystickThumb.lineStyle(2, 0x000000, 0.6); // Borde más visible
    this.joystickThumb.fillCircle(0, 0, this.joystickThumbRadius);
    this.joystickThumb.strokeCircle(0, 0, this.joystickThumbRadius);
    this.joystickThumb.setPosition(joystickX, joystickY);

    // Zona interactiva del joystick (más grande para facilitar el uso)
    this.joystickZone = this.scene.add.zone(
      joystickX,
      joystickY,
      this.joystickRadius * 3,
      this.joystickRadius * 3
    );
    this.joystickZone.setInteractive();
    this.joystickZone.setScrollFactor(0); // No se mueve con la cámara

    // Añadir al contenedor
    this.container.add(this.joystickBase);
    this.container.add(this.joystickThumb);
    this.container.add(this.joystickZone);
  }

  /**
   * Crea los botones de acción (estilo Game Boy)
   */
  private createButtons(): void {
    const canvasWidth = this.scene.cameras.main.width;
    const canvasHeight = this.scene.cameras.main.height;

    // Posición de los botones (esquina inferior derecha)
    const buttonRadius = 60; // Aumentado de 50 a 60
    const buttonSpacing = 20;

    // Botón B (izquierda - lanzar bola de nieve) - más separado
    const buttonBX = canvasWidth - 220; // Aumentado de 180 a 220
    const buttonBY = canvasHeight - 110; // Aumentado de 100 a 110

    this.buttonB = this.scene.add.graphics();
    this.buttonB.fillStyle(0x000000, 0.25); // Negro translúcido
    this.buttonB.lineStyle(3, 0x000000, 0.4); // Borde negro
    this.buttonB.fillCircle(0, 0, buttonRadius);
    this.buttonB.strokeCircle(0, 0, buttonRadius);
    this.buttonB.setPosition(buttonBX, buttonBY);

    this.buttonBText = this.scene.add.text(0, 0, "B", {
      fontFamily: "Bangers",
      fontSize: "44px", // Reducido de 48 a 44 para evitar cortes
      color: "#000000",
    });
    this.buttonBText.setOrigin(0.5, 0.52); // Ajuste más sutil
    this.buttonBText.setPosition(buttonBX, buttonBY);
    this.buttonBText.setAlpha(0.7);

    this.buttonBZone = this.scene.add.zone(
      buttonBX,
      buttonBY,
      buttonRadius * 2.5,
      buttonRadius * 2.5
    ); // Zona más grande
    this.buttonBZone.setInteractive();
    this.buttonBZone.setScrollFactor(0); // No se mueve con la cámara

    // Botón A (derecha - saltar) - más separado
    const buttonAX = canvasWidth - 100; // Aumentado de 90 a 100
    const buttonAY = canvasHeight - 190; // Aumentado de 160 a 190

    this.buttonA = this.scene.add.graphics();
    this.buttonA.fillStyle(0x000000, 0.25); // Negro translúcido
    this.buttonA.lineStyle(3, 0x000000, 0.4); // Borde negro
    this.buttonA.fillCircle(0, 0, buttonRadius);
    this.buttonA.strokeCircle(0, 0, buttonRadius);
    this.buttonA.setPosition(buttonAX, buttonAY);

    this.buttonAText = this.scene.add.text(0, 0, "A", {
      fontFamily: "Bangers",
      fontSize: "44px", // Reducido de 48 a 44 para mantener consistencia
      color: "#000000",
    });
    this.buttonAText.setOrigin(0.5, 0.52); // Ajuste más sutil
    this.buttonAText.setPosition(buttonAX, buttonAY);
    this.buttonAText.setAlpha(0.7);

    this.buttonAZone = this.scene.add.zone(
      buttonAX,
      buttonAY,
      buttonRadius * 2.5,
      buttonRadius * 2.5
    ); // Zona más grande
    this.buttonAZone.setInteractive();
    this.buttonAZone.setScrollFactor(0); // No se mueve con la cámara

    // Añadir al contenedor
    this.container.add(this.buttonB);
    this.container.add(this.buttonBText);
    this.container.add(this.buttonBZone);
    this.container.add(this.buttonA);
    this.container.add(this.buttonAText);
    this.container.add(this.buttonAZone);
  }

  /**
   * Configura los manejadores de entrada táctil
   */
  private setupInputHandlers(): void {
    // Joystick handlers - solo responde al pointer que lo activó
    this.joystickZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.joystickActive) {
        this.joystickActive = true;
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
      }
    });

    this.joystickZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.id === this.joystickPointerId) {
        this.updateJoystick(pointer);
      }
    });

    this.joystickZone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.id === this.joystickPointerId) {
        this.joystickActive = false;
        this.joystickPointerId = -1;
        this.resetJoystick();
      }
    });

    // Evento global de respaldo para resetear el joystick si se suelta fuera de la zona
    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.id === this.joystickPointerId) {
        this.joystickActive = false;
        this.joystickPointerId = -1;
        this.resetJoystick();
      }
    });

    // Evento cuando el pointer sale de la pantalla
    this.scene.input.on("pointerout", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.id === this.joystickPointerId) {
        this.joystickActive = false;
        this.joystickPointerId = -1;
        this.resetJoystick();
      }
    });

    // Botón A handlers (saltar) - responde a cualquier toque
    this.buttonAZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.buttonAPressed) {
        this.buttonAPressed = true;
        this.buttonAPointerId = pointer.id;
        this.highlightButton(this.buttonA);
      }
    });

    this.buttonAZone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.buttonAPressed && pointer.id === this.buttonAPointerId) {
        this.buttonAPressed = false;
        this.buttonAPointerId = -1;
        this.unhighlightButton(this.buttonA);
      }
    });

    this.buttonAZone.on("pointerout", (pointer: Phaser.Input.Pointer) => {
      if (this.buttonAPressed && pointer.id === this.buttonAPointerId) {
        this.buttonAPressed = false;
        this.buttonAPointerId = -1;
        this.unhighlightButton(this.buttonA);
      }
    });

    // Botón B handlers (lanzar bola de nieve) - responde a cualquier toque
    this.buttonBZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.buttonBPressed) {
        this.buttonBPressed = true;
        this.buttonBPointerId = pointer.id;
        this.highlightButton(this.buttonB);
      }
    });

    this.buttonBZone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.buttonBPressed && pointer.id === this.buttonBPointerId) {
        this.buttonBPressed = false;
        this.buttonBPointerId = -1;
        this.unhighlightButton(this.buttonB);
      }
    });

    this.buttonBZone.on("pointerout", (pointer: Phaser.Input.Pointer) => {
      if (this.buttonBPressed && pointer.id === this.buttonBPointerId) {
        this.buttonBPressed = false;
        this.buttonBPointerId = -1;
        this.unhighlightButton(this.buttonB);
      }
    });
  }

  /**
   * Actualiza la posición del joystick basándose en el input táctil
   */
  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - this.joystickStartX;
    const dy = pointer.y - this.joystickStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Limitar el movimiento al radio del joystick
    const maxDistance = this.joystickRadius - this.joystickThumbRadius;

    if (distance <= maxDistance) {
      this.joystickCurrentX = this.joystickStartX + dx;
      this.joystickCurrentY = this.joystickStartY + dy;
    } else {
      // Normalizar y limitar al borde
      const angle = Math.atan2(dy, dx);
      this.joystickCurrentX =
        this.joystickStartX + Math.cos(angle) * maxDistance;
      this.joystickCurrentY =
        this.joystickStartY + Math.sin(angle) * maxDistance;
    }

    // Actualizar posición visual
    this.joystickThumb.setPosition(
      this.joystickCurrentX,
      this.joystickCurrentY
    );

    // Calcular dirección normalizada
    const finalDx = this.joystickCurrentX - this.joystickStartX;
    const finalDy = this.joystickCurrentY - this.joystickStartY;
    const finalDistance = Math.sqrt(finalDx * finalDx + finalDy * finalDy);

    if (finalDistance > 5) {
      // Zona muerta pequeña
      this.joystickDirection.x = finalDx / maxDistance;
      this.joystickDirection.y = finalDy / maxDistance;

      // Asegurar que los valores estén entre -1 y 1
      this.joystickDirection.x = Math.max(
        -1,
        Math.min(1, this.joystickDirection.x)
      );
      this.joystickDirection.y = Math.max(
        -1,
        Math.min(1, this.joystickDirection.y)
      );
    } else {
      this.joystickDirection.x = 0;
      this.joystickDirection.y = 0;
    }
  }

  /**
   * Reinicia el joystick a su posición central
   */
  private resetJoystick(): void {
    // Resetear posiciones
    this.joystickCurrentX = this.joystickStartX;
    this.joystickCurrentY = this.joystickStartY;

    // Resetear posición visual del thumb
    this.joystickThumb.setPosition(this.joystickStartX, this.joystickStartY);

    // IMPORTANTE: Resetear dirección a cero
    this.joystickDirection.x = 0;
    this.joystickDirection.y = 0;
  }

  /**
   * Resalta un botón cuando se presiona
   */
  private highlightButton(button: Phaser.GameObjects.Graphics): void {
    button.clear();
    button.fillStyle(0x000000, 0.5); // Más opaco al presionar
    button.lineStyle(3, 0x000000, 0.8);
    button.fillCircle(0, 0, 60); // Tamaño actualizado a 60
    button.strokeCircle(0, 0, 60);
  }

  /**
   * Quita el resaltado de un botón
   */
  private unhighlightButton(button: Phaser.GameObjects.Graphics): void {
    button.clear();
    button.fillStyle(0x000000, 0.25); // Volver a translúcido
    button.lineStyle(3, 0x000000, 0.4);
    button.fillCircle(0, 0, 60); // Tamaño actualizado a 60
    button.strokeCircle(0, 0, 60);
  }

  /**
   * Obtiene si el dispositivo es móvil
   */
  public getIsMobile(): boolean {
    return this.isMobile;
  }

  /**
   * Muestra u oculta los controles
   */
  public setVisible(visible: boolean): void {
    if (this.isMobile) {
      this.container.setVisible(visible);
    }
  }

  /**
   * Limpia los recursos del sistema
   */
  public destroy(): void {
    this.container.destroy();
  }

  /**
   * Actualiza las posiciones de los controles si cambia el tamaño de la pantalla
   */
  public resize(width: number, height: number): void {
    if (!this.isMobile) return;

    // Actualizar posición del joystick
    const joystickX = 120;
    const joystickY = height - 120;

    this.joystickStartX = joystickX;
    this.joystickStartY = joystickY;
    this.joystickBase.setPosition(joystickX, joystickY);
    this.joystickThumb.setPosition(joystickX, joystickY);
    this.joystickZone.setPosition(joystickX, joystickY);

    // Actualizar posición de los botones (con nuevas coordenadas)
    const buttonBX = width - 220; // Actualizado
    const buttonBY = height - 110; // Actualizado
    const buttonAX = width - 100; // Actualizado
    const buttonAY = height - 190; // Actualizado

    this.buttonB.setPosition(buttonBX, buttonBY);
    this.buttonBText.setPosition(buttonBX, buttonBY);
    this.buttonBZone.setPosition(buttonBX, buttonBY);

    this.buttonA.setPosition(buttonAX, buttonAY);
    this.buttonAText.setPosition(buttonAX, buttonAY);
    this.buttonAZone.setPosition(buttonAX, buttonAY);
  }
}
