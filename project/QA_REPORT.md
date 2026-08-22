# QA report — Belentani: Era de Judas

## Criterio de salida

El juego se considera entregable cuando una persona puede iniciar una partida, moverse, atacar, pausar, reanudar, usar controles táctiles, recoger los cinco elementos, activar la arena de Judas y completar el recorrido sin errores runtime.

## Verificación independiente 1 — PC

**Resultado: PASS.** Se abrió una partida desde un estado limpio en navegador. El botón «ENTRAR AL SANTUARIO» inició la escena 3D. `ArrowUp` movió a Belentani y la cámara siguió la posición del jugador. `Space` respondió como ataque de voz y mantuvo el HUD operativo. El botón de pausa abrió «PAUSA» con «CONTINUAR» y «REINICIAR»; continuar devolvió el control a la partida. La consola del navegador no mostró errores tras la prueba.

## Verificación independiente 2 — móvil

**Resultado: PASS visual y responsive.** La captura a 375×812 mostró la pantalla inicial sin solapamiento de joystick. La captura de partida `/?demo` mostró HUD legible, joystick circular, botón «VOZ», texto «JOYSTICK · MOVER» y «VOZ · ATACAR». Los controles táctiles se mantienen dentro de la zona segura inferior y el canvas ocupa el viewport completo.

## Verificación independiente 3 — estabilidad y recorrido

**Resultado: PASS.** `pnpm check` terminó sin errores. `pnpm build` completó Vite y esbuild correctamente; el bundle de Babylon es pesado por el registro completo de shaders, pero la salida de producción se genera. `/?demo` inició el recorrido automático, renderizó la arena, avanzó el contador hasta 5/5, activó a Judas, mostró su barra de vida y alcanzó la pantalla final «VICTORIA». El modo demo confirma inicialización, navegación, recolección, activación de jefe, combate y estado final.

## Correcciones aplicadas durante QA

Se corrigió la escena negra causada por shader/cámara: se usó `Color4` válido, una cámara `FreeCamera` estable, iluminación ambiental moderada y se retiró `GlowLayer`, que generaba errores GLSL en este entorno. Se corrigió el solapamiento de controles táctiles sobre la pantalla inicial y se adaptó el texto del HUD al dispositivo táctil.

## Riesgos conocidos

El bundle final es mayor de lo ideal porque la entrada completa de Babylon registra muchos shaders. Es una decisión de estabilidad de esta entrega: prioriza que la escena se renderice de forma consistente en el preview y en navegadores compatibles. La primera carga puede ser más lenta en redes móviles lentas.
