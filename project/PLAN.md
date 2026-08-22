# PLAN.md — Belentani: Era de Judas (Remake Consola Web)

## Goal
Crear una aventura de acción 3D estilo consola (inspirada en Zelda / RPG de acción táctil y de escritorio) utilizando Babylon.js dentro del proyecto WebDev. El jugador encarna a **Belentani** (el guerrero mesiánico de la Era de Judas), explora un santuario cibernético/místico, recolecta los 5 Elementos Sagrados (San Pedro, San Marcos, Santos, Belentani, El Humano), esquiva/elimina glitch-enemigos del virus Judas, y se enfrenta a un combate contra el jefe final Judas.

## Risk Slices & Verification Criteria
1. **Slice 1: Babylon 3D Engine + Character Controller + Camera + Collisions**
   - *Criteria*: Canvas en pantalla completa, Belentani se mueve suavemente por el suelo con WASD/Joysticks táctiles, cámara en tercera persona cenital/estilo Zelda, colisión con paredes del santuario.
2. **Slice 2: Collectibles & HUD & Audio/Visual Feedback**
   - *Criteria*: Aparición de los 5 elementos sagrados en el mapa. Al tocarlos, se suman al contador del HUD, emiten partículas y activan un mensaje de lore.
3. **Slice 3: Combat, Enemies & Boss AI (Judas)**
   - *Criteria*: Ataque de energía con la barra espaciadora o botón táctil. Virus enemigos patrullan y persiguen al jugador. Al recolectar los 5 elementos, aparece el jefe Judas con barra de vida propia y ataques de embestida.
4. **Slice 4: UI Menus, Touch Controls, Autopilot Verification & Polish**
   - *Criteria*: Pantalla de inicio con lore y botón "Jugar", controles virtuales en pantalla para móvil, HUD flotante, pantalla de victoria/derrota, y testeo visual con `webdev_take_screenshot`.
