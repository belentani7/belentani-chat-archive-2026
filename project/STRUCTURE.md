# STRUCTURE.md — Arquitectura de Clases (Godogen Adaptado a Babylon.js)

```
client/
  src/
    components/
      GameCanvas.tsx       # Contenedor React / Babylon (singleton engine guard)
    game/
      scene.ts             # Punto de entrada createGameScene()
      GameWorld.ts         # Construcción del escenario 3D, luces, suelo, muros
      Player.ts            # Control de Belentani, física, animaciones y ataque
      EnemyManager.ts      # Gestión de virus Judas y patrulla/persecución
      ItemManager.ts       # Gestión de coleccionables (los 5 elementos)
      BossManager.ts       # Jefe final Judas y lógica de combate
      UIManager.ts         # HUD, joysticks táctiles y pantallas de estado
      AudioSystem.ts       # Efectos de sonido y música procedural sintetizada (Web Audio API)
```
