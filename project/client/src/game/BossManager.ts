// Belentani: Era de Judas — final boss controller.
// Design reminder: Judas is dangerous but fair; attacks are visible before impact.

import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GameWorld } from "./GameWorld";
import { Player } from "./Player";

const purple = new Color3(0.7, 0.03, 1);
const red = new Color3(1, 0.03, 0.16);
const black = new Color3(0.03, 0.01, 0.08);

function mat(scene: Scene, name: string, color: Color3, emissive?: Color3) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = color;
  value.emissiveColor = emissive ?? color.scale(0.12);
  value.specularColor = new Color3(0.4, 0.25, 0.5);
  return value;
}

export class BossManager {
  readonly root: TransformNode;
  readonly position: Vector3;
  active = false;
  defeated = false;
  health = 1;
  private readonly visual: TransformNode;
  private readonly arena: TransformNode;
  private readonly telegraph: TransformNode;
  private attackTimer = 2;
  private dashTimer = 0;
  private phase = 0;
  private readonly scene: Scene;

  constructor(scene: Scene, world: GameWorld) {
    this.scene = scene;
    this.root = new TransformNode("judasBoss", scene);
    this.position = this.root.position;
    this.position.copyFrom(world.bossSpawn);
    this.visual = new TransformNode("judasBossVisual", scene);
    this.visual.parent = this.root;
    this.arena = new TransformNode("judasArena", scene);
    this.telegraph = new TransformNode("judasTelegraph", scene);
    this.telegraph.parent = this.root;
    this.telegraph.setEnabled(false);
    this.buildVisual(scene);
    this.root.setEnabled(false);
  }

  private buildVisual(scene: Scene) {
    const bodyMat = mat(scene, "judasBody", black, purple.scale(0.58));
    const coreMat = mat(scene, "judasCore", new Color3(0.25, 0, 0.32), purple);
    const eyeMat = mat(scene, "judasEye", new Color3(0.3, 0.01, 0.04), red);
    const body = MeshBuilder.CreateIcoSphere("judasBody", { radius: 1.35, subdivisions: 2 }, scene);
    body.parent = this.visual;
    body.position.y = 1.32;
    body.scaling.set(1.25, 1.05, 1.15);
    body.material = bodyMat;
    const core = MeshBuilder.CreateTorus("judasCore", { diameter: 0.78, thickness: 0.13, tessellation: 24 }, scene);
    core.parent = this.visual;
    core.position.set(0, 1.35, -1.22);
    core.rotation.x = Math.PI / 2;
    core.material = coreMat;
    const eye = MeshBuilder.CreateSphere("judasEye", { diameter: 0.26, segments: 12 }, scene);
    eye.parent = this.visual;
    eye.position.set(0, 1.38, -1.36);
    eye.material = eyeMat;
    for (let i = 0; i < 6; i += 1) {
      const shard = MeshBuilder.CreateBox(`judasShard${i}`, { width: 0.18, depth: 0.18, height: 1.8 }, scene);
      shard.parent = this.visual;
      const angle = (i / 6) * Math.PI * 2;
      shard.position.set(Math.cos(angle) * 1.35, 1.2, Math.sin(angle) * 1.35);
      shard.rotation.z = Math.cos(angle) * 0.72;
      shard.rotation.x = Math.sin(angle) * 0.72;
      shard.material = coreMat;
    }
    const ringMat = mat(scene, "judasArenaRing", new Color3(0.14, 0.01, 0.18), purple);
    const ring = MeshBuilder.CreateTorus("judasArenaRing", { diameter: 15, thickness: 0.08, tessellation: 64 }, scene);
    ring.parent = this.arena;
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.09;
    ring.material = ringMat;

    const teleMat = mat(scene, "judasTelegraph", new Color3(0.45, 0.015, 0.03), red);
    const teleRing = MeshBuilder.CreateTorus("judasTelegraphRing", { diameter: 5, thickness: 0.07, tessellation: 48 }, scene);
    teleRing.parent = this.telegraph;
    teleRing.rotation.x = Math.PI / 2;
    teleRing.position.y = 0.07;
    teleRing.material = teleMat;
  }

  activate() {
    if (this.active || this.defeated) return;
    this.active = true;
    this.root.setEnabled(true);
    this.arena.setEnabled(true);
    this.telegraph.setEnabled(false);
    this.position.set(0, 0, -9);
  }

  update(dt: number, player: Player, world: GameWorld) {
    if (!this.active || this.defeated) return;
    this.attackTimer -= dt;
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.phase += dt;
    const direction = player.position.subtract(this.position);
    direction.y = 0;
    const distance = direction.length();
    if (distance > 3.1 && this.dashTimer <= 0) {
      direction.normalize();
      const speed = 1.5 + (1 - this.health) * 1.4;
      const nextX = this.position.x + direction.x * speed * dt;
      const nextZ = this.position.z + direction.z * speed * dt;
      if (!world.isBlocked(nextX, this.position.z, 1.25)) this.position.x = nextX;
      if (!world.isBlocked(this.position.x, nextZ, 1.25)) this.position.z = nextZ;
    }
    this.visual.rotation.y += dt * 1.3;
    this.visual.position.y = Math.sin(this.phase * 2.8) * 0.14;
    this.visual.scaling.setAll(1 + Math.sin(this.phase * 4.4) * 0.035);

    if (this.attackTimer <= 0) {
      this.telegraph.setEnabled(true);
      this.telegraph.scaling.setAll(1 + Math.sin(this.phase * 16) * 0.08);
      if (this.attackTimer < -0.68) {
        if (distance < 5.2) player.takeDamage(0.17);
        this.telegraph.setEnabled(false);
        this.dashTimer = 1.25;
        this.attackTimer = 2.1 - (1 - this.health) * 0.55;
      }
    }
    if (distance < 1.7 && this.dashTimer <= 0) player.takeDamage(0.12);
  }

  hit(player: Player) {
    if (!this.active || this.defeated) return false;
    const distance = Vector3.Distance(this.position, player.position);
    if (distance > player.attackRange + 0.4) return false;
    this.health = Math.max(0, this.health - 0.16);
    this.dashTimer = 0.42;
    this.visual.scaling.set(1.18, 0.82, 1.18);
    window.setTimeout(() => this.visual.scaling.setAll(1), 120);
    if (this.health <= 0) {
      this.defeated = true;
      this.active = false;
      this.root.setEnabled(false);
      this.arena.setEnabled(false);
    }
    return true;
  }

  dispose() {
    this.root.dispose(false, true);
    this.arena.dispose(false, true);
  }
}
