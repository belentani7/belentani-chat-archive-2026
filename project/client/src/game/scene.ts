// Belentani: Era de Judas — Babylon scene orchestration.
// React is only the frame; all gameplay lives here in framework-agnostic modules.

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GameWorld } from "./GameWorld";
import { Player } from "./Player";
import { EnemyManager } from "./EnemyManager";
import { ItemManager } from "./ItemManager";
import { BossManager } from "./BossManager";
import { UIManager } from "./UIManager";
import { AudioSystem } from "./AudioSystem";

export type GameHandle = {
  scene: Scene;
  dispose: () => void;
};

function effectMaterial(scene: Scene, color: Color3) {
  const material = new StandardMaterial("attackPulseMaterial", scene);
  material.diffuseColor = color.scale(0.24);
  material.emissiveColor = color;
  material.alpha = 0.86;
  return material;
}

function attackEffect(scene: Scene, position: Vector3, color: Color3) {
  const ring = MeshBuilder.CreateTorus("voiceAttackPulse", { diameter: 1.4, thickness: 0.08, tessellation: 48 }, scene);
  ring.position.copyFrom(position);
  ring.position.y = 0.18;
  ring.scaling.setAll(0.65);
  ring.material = effectMaterial(scene, color);
  const started = performance.now();
  const observer = scene.onBeforeRenderObservable.add(() => {
    const elapsed = performance.now() - started;
    const progress = Math.min(1, elapsed / 260);
    ring.scaling.setAll(0.65 + progress * 2.8);
    ring.rotation.y += 0.18;
    const material = ring.material as StandardMaterial;
    material.alpha = 0.86 * (1 - progress);
    if (progress >= 1) {
      scene.onBeforeRenderObservable.remove(observer);
      ring.dispose();
    }
  });
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  const world = new GameWorld(scene);
  const player = new Player(scene, world.spawn);
  const enemies = new EnemyManager(scene, world);
  const items = new ItemManager(scene);
  const boss = new BossManager(scene, world);
  const ui = new UIManager();
  const audio = new AudioSystem();
  const demo = new URLSearchParams(window.location.search).has("demo");
  const touchDevice = window.matchMedia("(pointer: coarse), (max-width: 720px)").matches;
  ui.setMobileVisible(touchDevice);

  const camera = new FreeCamera("camera", player.position.add(new Vector3(0, 11, 14)), scene);
  camera.fov = 0.85;
  camera.minZ = 0.1;
  camera.maxZ = 120;
  camera.setTarget(player.position);
  camera.attachControl(canvas, false);
  scene.activeCamera = camera;

  let started = demo;
  let paused = false;
  let ended = false;
  let lastCount = 0;
  let demoClock = 0;
  let demoStage = 0;

  const begin = () => {
    started = true;
    paused = false;
    ended = false;
    audio.start();
    ui.flash("ENTRA. LA ROCA TE RECONOCE.", 1800);
  };
  const restart = () => window.location.reload();
  const resume = () => {
    paused = false;
    ui.flash("EL SILENCIO VUELVE A SER TU ARMA.", 1200);
  };
  ui.setStartHandler(begin);
  ui.setRestartHandler(restart);
  ui.setResumeHandler(resume);
  if (demo) ui.hideStart();

  const finish = (victory: boolean) => {
    if (ended) return;
    ended = true;
    paused = true;
    if (victory) {
      audio.victory();
      ui.showEnd("VICTORIA", "Judas ha perdido la ilusión de victoria. La Llave Dorada vuelve a responder.", true, restart);
    } else {
      audio.hurt();
      ui.showEnd("CAÍDA", "El santuario sigue abierto. Respira, vuelve a entrar y cambia el ritmo.", false, restart);
    }
  };

  const updateDemo = (dt: number) => {
    demoClock += dt;
    if (demoStage === 0) {
      const target = items.items.find((item) => !item.collected);
      if (target) {
        const dir = target.position.subtract(player.position);
        dir.y = 0;
        if (dir.length() > 1.4) {
          dir.normalize();
          player.root.position.x += dir.x * player.speed * dt;
          player.root.position.z += dir.z * player.speed * dt;
        } else {
          target.collected = true;
          target.root.setEnabled(false);
          audio.collect();
        }
      } else {
        demoStage = 1;
        boss.activate();
        audio.boss();
        ui.flash("DEMO: JUDAS DESPIERTA.", 1400);
      }
    } else if (demoStage === 1 && boss.active) {
      const toBoss = boss.position.subtract(player.position);
      toBoss.y = 0;
      if (toBoss.length() > 2.8) {
        toBoss.normalize();
        player.root.position.x += toBoss.x * player.speed * dt;
        player.root.position.z += toBoss.z * player.speed * dt;
      } else if (demoClock > 0.2) {
        if (player.attack()) {
          boss.hit(player);
          demoClock = 0;
        }
      }
    }
  };

  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(0.045, engine.getDeltaTime() / 1000);
    if (!started || ended) return;
    if (ui.consumePause()) {
      paused = !paused;
      if (paused) ui.showPause();
      return;
    }
    if (paused) return;

    if (demo) updateDemo(dt);
    const input = player.update(dt, ui.touch.x, ui.touch.y, world);
    if (!demo && (input.attack || ui.consumeAttack())) {
      if (player.attack()) {
        audio.attack();
        attackEffect(scene, player.position, new Color3(1, 0.04, 0.26));
        const attackDirection = player.facing.clone();
        enemies.living().forEach((enemy) => {
          const offset = enemy.position.subtract(player.position);
          offset.y = 0;
          if (offset.length() <= player.attackRange) {
            const distanceAlongFacing = Vector3.Dot(offset.normalize(), attackDirection);
            if (distanceAlongFacing > -0.15) enemy.hit(attackDirection);
          }
        });
        if (boss.active && boss.hit(player)) {
          attackEffect(scene, boss.position, new Color3(0.8, 0.02, 1));
        }
      }
    }

    enemies.update(dt, player, world);
    items.update(player);
    const count = items.count;
    if (count > lastCount) {
      audio.collect();
      ui.flash(`${count}/5 · ELEMENTO INTEGRADO`, 1100);
      lastCount = count;
    }
    if (items.complete && !boss.active && !boss.defeated) {
      boss.activate();
      audio.boss();
      ui.flash("LOS CINCO ELEMENTOS ABREN LA ARENA DE JUDAS.", 2300);
    }
    boss.update(dt, player, world);
    if (boss.defeated) finish(true);
    if (player.health <= 0) finish(false);

    const target = player.position.add(new Vector3(0, 0.6, 0));
    camera.target = Vector3.Lerp(camera.target, target, Math.min(1, dt * 7));
    const desired = player.position.add(new Vector3(0, 11, 14));
    camera.position = Vector3.Lerp(camera.position, desired, Math.min(1, dt * 3.2));
    camera.setTarget(camera.target);
    ui.update(player.health, player.energy, items.count, boss.active ? boss.health : null);
  });

  if (!demo) ui.flash("MUEVE A BELENTANI. BUSCA LAS LUCES.", 2200);

  return {
    scene,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(observer);
      camera.detachControl();
      player.dispose();
      enemies.dispose();
      items.dispose();
      boss.dispose();
      world.dispose();
      audio.dispose();
      ui.dispose();
      scene.dispose();
    },
  };
}
