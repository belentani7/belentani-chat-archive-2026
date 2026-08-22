// Belentani: Era de Judas — enemy AI.
// Design reminder: every enemy telegraphs its presence and remains readable in the arena.

import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GameWorld } from "./GameWorld";
import { Player } from "./Player";

const purple = new Color3(0.65, 0.03, 1);
const cyan = new Color3(0, 0.9, 1);
const dark = new Color3(0.04, 0.025, 0.09);

function mat(scene: Scene, name: string, diffuse: Color3, emissive?: Color3) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = diffuse;
  value.specularColor = new Color3(0.32, 0.22, 0.44);
  if (emissive) value.emissiveColor = emissive;
  return value;
}

export class GlitchEnemy {
  readonly root: TransformNode;
  readonly position: Vector3;
  health = 1;
  alive = true;
  private readonly visual: TransformNode;
  private readonly material: StandardMaterial;
  private velocity = new Vector3();
  private phase: "patrol" | "chase" | "stagger" = "patrol";
  private stagger = 0;
  private patrolAngle: number;
  private readonly patrolCenter: Vector3;
  private attackTimer = 0;

  constructor(scene: Scene, position: Vector3, index: number) {
    this.root = new TransformNode(`glitchEnemy${index}`, scene);
    this.position = this.root.position;
    this.position.copyFrom(position);
    this.patrolCenter = position.clone();
    this.patrolAngle = index * 1.37;
    this.material = mat(scene, `virusMat${index}`, dark, purple.scale(0.46));
    this.visual = new TransformNode(`glitchEnemyVisual${index}`, scene);
    this.visual.parent = this.root;
    this.buildVisual(scene, index);
  }

  private buildVisual(scene: Scene, index: number) {
    const body = MeshBuilder.CreateIcoSphere(`virusBody${index}`, { radius: 0.82, subdivisions: 1 }, scene);
    body.parent = this.visual;
    body.position.y = 0.82;
    body.scaling.set(1.15, 0.85, 0.95);
    body.material = this.material;
    const eyeMat = mat(scene, `virusEye${index}`, new Color3(0.04, 0.23, 0.3), cyan);
    const eye = MeshBuilder.CreateTorus(`virusEye${index}`, { diameter: 0.42, thickness: 0.08, tessellation: 16 }, scene);
    eye.parent = this.visual;
    eye.position.set(0, 0.88, -0.75);
    eye.rotation.x = Math.PI / 2;
    eye.material = eyeMat;
    const ringMat = mat(scene, `virusRing${index}`, new Color3(0.22, 0.015, 0.25), purple);
    const ring = MeshBuilder.CreateTorus(`virusRing${index}`, { diameter: 1.85, thickness: 0.035, tessellation: 28 }, scene);
    ring.parent = this.visual;
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    ring.material = ringMat;
    const shard = MeshBuilder.CreateBox(`virusShard${index}`, { width: 0.12, depth: 0.12, height: 0.92 }, scene);
    shard.parent = this.visual;
    shard.position.set(0.72, 1.0, 0.1);
    shard.rotation.z = 0.6;
    shard.material = eyeMat;
  }

  update(dt: number, player: Player, world: GameWorld) {
    if (!this.alive) return;
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.stagger = Math.max(0, this.stagger - dt);
    if (this.stagger > 0) {
      this.position.addInPlace(this.velocity.scale(dt));
      this.velocity.scaleInPlace(0.88);
      return;
    }

    const distance = Vector3.Distance(this.position, player.position);
    if (distance < 9.5) {
      this.phase = "chase";
      const direction = player.position.subtract(this.position);
      direction.y = 0;
      if (direction.lengthSquared() > 0.05) {
        direction.normalize();
        const desired = direction.scale(distance < 3.2 ? 0.9 : 2.15);
        this.velocity = Vector3.Lerp(this.velocity, desired, Math.min(1, dt * 4));
      }
    } else {
      this.phase = "patrol";
      this.patrolAngle += dt * 0.7;
      const target = this.patrolCenter.add(new Vector3(Math.cos(this.patrolAngle) * 2.4, 0, Math.sin(this.patrolAngle) * 2.2));
      const direction = target.subtract(this.position);
      direction.y = 0;
      if (direction.lengthSquared() > 0.08) {
        direction.normalize();
        this.velocity = Vector3.Lerp(this.velocity, direction.scale(1.15), Math.min(1, dt * 3));
      }
    }

    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;
    if (!world.isBlocked(nextX, this.position.z, 0.65)) this.position.x = nextX;
    if (!world.isBlocked(this.position.x, nextZ, 0.65)) this.position.z = nextZ;
    this.visual.rotation.y += dt * (this.phase === "chase" ? 2.6 : 1.2);
    this.visual.position.y = Math.sin(performance.now() * 0.003 + this.patrolAngle) * 0.06;
    this.visual.scaling.setAll(1 + Math.sin(performance.now() * 0.005 + this.patrolAngle) * 0.04);

    if (distance < 1.55 && this.attackTimer <= 0) {
      this.attackTimer = 1.0;
      player.takeDamage(0.12);
    }
  }

  hit(knockback: Vector3) {
    if (!this.alive) return false;
    this.health -= 1;
    this.stagger = 0.24;
    this.velocity = knockback.scale(8);
    this.visual.scaling.set(1.3, 0.68, 1.3);
    window.setTimeout(() => this.visual.scaling.setAll(1), 130);
    if (this.health <= 0) {
      this.alive = false;
      this.root.setEnabled(false);
    }
    return true;
  }

  dispose() {
    this.root.dispose(false, true);
  }
}

export class EnemyManager {
  readonly enemies: GlitchEnemy[] = [];
  private readonly scene: Scene;

  constructor(scene: Scene, world: GameWorld) {
    this.scene = scene;
    const positions = [
      new Vector3(-16, 0, 8), new Vector3(16, 0, 7), new Vector3(-14, 0, -2),
      new Vector3(14, 0, 0), new Vector3(-6, 0, -7), new Vector3(8, 0, -7),
    ];
    positions.forEach((position, index) => this.enemies.push(new GlitchEnemy(scene, position, index)));
  }

  update(dt: number, player: Player, world: GameWorld) {
    this.enemies.forEach((enemy) => enemy.update(dt, player, world));
  }

  living() {
    return this.enemies.filter((enemy) => enemy.alive);
  }

  dispose() {
    this.enemies.forEach((enemy) => enemy.dispose());
    this.enemies.length = 0;
  }
}
