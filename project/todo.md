# TODO — Criterio de salida 10/10

## Producción jugable

- [ ] Sustituir el prototipo actual por un núcleo de juego que responda a entradas humanas reales.
- [ ] Crear una escena inicial con instrucciones visibles y botón de inicio.
- [ ] Implementar movimiento 8-direcciones con WASD y flechas, con velocidad estable y límites del mapa.
- [ ] Implementar cámara que mantenga al jugador visible sin cortar objetivos ni HUD.
- [ ] Implementar mapa con suelo, muros y colisiones verificables.
- [ ] Implementar interacción con los cinco elementos sagrados y feedback de recogida.
- [ ] Implementar ataque con teclado y botón táctil, cooldown, alcance, daño y feedback.
- [ ] Implementar enemigos con estados reposo, patrulla, persecución, daño y derrota.
- [ ] Implementar jefe Judas con arena clara, vida visible, telegráficos y condición de victoria.
- [ ] Implementar derrota, reinicio y pausa sin bloquear la página.

## UX PC

- [ ] Probar foco, WASD, flechas, espacio, reinicio y pausa en escritorio.
- [ ] Confirmar que el jugador puede completar el objetivo sin depender del autopilot.
- [ ] Confirmar que los botones e instrucciones tienen contraste y no cubren el área jugable.

## UX móvil

- [ ] Añadir joystick virtual o pad direccional visible.
- [ ] Añadir botón táctil de ataque y botón de pausa.
- [ ] Probar viewport estrecho y apaisado; comprobar que el canvas no se recorta.
- [ ] Confirmar que los objetivos y textos se leen con toque y sin teclado.

## Verificación independiente 1 — PC

- [ ] Iniciar partida desde cero.
- [ ] Mover al personaje intencionadamente.
- [ ] Recoger al menos un elemento.
- [ ] Atacar un enemigo.
- [ ] Alcanzar la arena del jefe.
- [ ] Derrotar a Judas o validar una ruta de combate reproducible.
- [ ] Puntuación: 10/10 solo si todos los pasos responden sin errores.

## Verificación independiente 2 — móvil

- [ ] Iniciar partida mediante toque.
- [ ] Mover con controles táctiles.
- [ ] Recoger elementos mediante toque y movimiento.
- [ ] Atacar con botón táctil.
- [ ] Pausar y reanudar.
- [ ] Validar orientación y escalado.
- [ ] Puntuación: 10/10 solo si todos los pasos son cómodos y legibles.

## Verificación independiente 3 — estabilidad y recorrido

- [ ] Ejecutar la ruta completa inicio → exploración → combate → jefe → victoria.
- [ ] Ejecutar reinicio tras derrota.
- [ ] Ejecutar dos partidas consecutivas sin duplicar canvas ni listeners.
- [ ] Ejecutar `pnpm check` sin errores.
- [ ] Revisar consola y red para errores de runtime o assets fallidos.
- [ ] Capturar vista de inicio, partida, combate y victoria.
- [ ] Puntuación: 10/10 solo si el flujo completo es repetible.

## Salida

- [ ] Corregir cualquier fallo detectado y repetir las tres verificaciones.
- [ ] Guardar checkpoint únicamente cuando las tres verificaciones alcancen 10/10.
- [ ] Entregar controles reales y explicar cualquier limitación restante con honestidad.
```#+#+#+#+ nggun

## Ampliación y Módulos Avanzados (Neutral & Drive)

- [ ] Diseñar el sistema de Capítulos (Capítulo I: Santuario Raíz, Capítulo II: Archivo Neutral, Capítulo III: Cripta de Judas).
- [ ] Implementar Galería de Lore interactiva accesible desde el menú principal para consultar fragmentos y descubrimientos de Drive.
- [ ] Integrar persistencia de puntuaciones y tiempo récord en localStorage.
- [ ] Añadir efectos de partículas avanzados en la recogida de elementos sagrados y ataque de voz.
- [ ] Verificar la compilación TypeScript y la estabilidad de la ampliación en PC y móvil.

## Exportación privada y archivo del chat

- [ ] Auditar el proyecto y excluir secretos, tokens, credenciales, cachés y logs sensibles.
- [ ] Preparar un paquete exportable con código, assets, documentos, medios y manifiesto de hashes.
- [ ] Crear un registro del chat con todo el contenido recuperable y documentar lo no disponible.
- [ ] Crear un repositorio nuevo, privado, en GitHub y subir el paquete versionado.
- [ ] Crear una carpeta nueva en Google Drive y subir el paquete completo.
- [ ] Verificar que GitHub es privado, que Drive contiene el paquete y que los hashes coinciden.
- [ ] Entregar URLs, inventario, versiones conocidas y limitaciones de la exportación.
