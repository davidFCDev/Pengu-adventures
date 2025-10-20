# 🐧 Debug móvil desactivado

El overlay de depuración móvil temporal se ha retirado del proyecto para dejar la experiencia limpia en producción.

## ¿Qué se cambió?

- Se eliminó la inicialización desde `src/main.ts`.
- El módulo `MobileDebugger` ahora es un stub vacío y no agrega elementos visuales.
- Los builds generados ya no incluyen el panel verde/negro ni los botones de control de logs.

## ¿Cómo depurar ahora?

- Utiliza las herramientas de logging estándar (`console.log`) durante el desarrollo.
- Habilita `GameSettings.debug` cuando necesites más información en pantalla.
- Si hiciera falta un overlay temporal en el futuro, crea un branch separado o reutiliza la versión anterior desde control de versiones.

> Nota: Si llegas a ver referencias al panel antiguo en documentación o builds viejos, regenerar el build (`npm run build:standalone`) eliminará cualquier resto del debugger.
