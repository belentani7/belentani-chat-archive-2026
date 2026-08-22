// Belentani: Era de Judas — player controller.
// Design reminder: movement must feel immediate, readable and human-controlled.

import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GameWorld } from "./GameWorld";

export type PlayerInput = { x: number; z: number; attack: boolean };

const red = new Color3(1, 0.035, 0.22);
const cyan = new Color3(0, 0.85, 1);
const skin = new Color3(0.31, 0.13, 0.1);
const hair = new Color3(0.015, 0.018, 0.03);

function mat(scene: Scene, name: string, diffuse: Color3, emissive?: Color3) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = diffuse;
  value.specularColor = new Color3(0.42, 0.42, 0.5);
  if (emissive) value.emissiveColor = emissive;
  return value;
}

export class Player {
  readonly root: TransformNode;
  readonly collider: AbstractMesh;
  readonly scene: Scene;
  readonly speed = 7.6;
  health = 1;
  energy = 1;
  facing = new Vector3(0, 0, -1);
  attackCooldown = 0;
  invulnerable = 0;
  private readonly visual: TransformNode;
  private readonly redMat;
  private readonly cyanMat;
  private readonly darkMat;
  private readonly bodyParts: AbstractMesh[] = [];
  private readonly keyState = new Set<string>();
  private attackPulse = 0;
  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.keyState.add(event.key.toLowerCase());
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase())) event.preventDefault();
  };
  private readonly onKeyUp = (event: KeyboardEvent) => this.keyState.delete(event.key.toLowerCase());

  constructor(scene: Scene, spawn: Vector3) {
    this.scene = scene;
    this.root = new TransformNode("belentaniRoot", scene);
    this.root.position.copyFrom(spawn);
    this.visual = new TransformNode("belentaniVisual", scene);
    this.visual.parent = this.root;
    this.redMat = mat(scene, "belentaniRed", new Color3(0.48, 0.015, 0.06), red.scale(0.35));
    this.cyanMat = mat(scene, "belentaniCyan", new Color3(0.01, 0.24, 0.3), cyan.scale(0.5));
    this.darkMat = mat(scene, "belentaniDark", new Color3(0.035, 0.04, 0.07));
    this.buildVisual();

    this.collider = MeshBuilder.CreateCylinder("belentaniCollider", { diameter: 0.95, height: 1.85, tessellation: 12 }, scene);
    this.collider.parent = this.root;
    this.collider.position.y = 0.92;
    this.collider.visibility = 0;
    this.collider.isPickable = false;

    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
  }

  private buildVisual() {
    const body = MeshBuilder.CreateBox("belentaniBody", { width: 0.8, depth: 0.52, height: 1.05 }, this.scene);
    body.parent = this.visual;
    body.position.y = 1.02;
    body.material = this.redMat;
    this.bodyParts.push(body);

    const chest = MeshBuilder.CreateBox("belentaniChestSignal", { width: 0.16, depth: 0.06, height: 0.7 }, this.scene);
    chest.parent = this.visual;
    chest.position.set(0, 1.06, -0.28);
    chest.material = this.cyanMat;
    this.bodyParts.push(chest);

    const head = MeshBuilder.CreateSphere("belentaniHead", { diameter: 0.62, segments: 12 }, this.scene);
    head.parent = this.visual;
    head.position.y = 1.85;
    head.material = mat(this.scene, "belentaniSkin", skin);
    this.bodyParts.push(head);

    const hairBack = MeshBuilder.CreateSphere("belentaniHair", { diameter: 0.78, segments: 12 }, this.scene);
    hairBack.parent = this.visual;
    hairBack.position.set(0, 1.9, 0.12);
    hairBack.scaling.set(1.04, 1.18, 0.74);
    hairBack.material = mat(this.scene, "belentaniHair", hair);
    this.bodyParts.push(hairBack);

    const leftShoulder = MeshBuilder.CreateSphere("leftShoulder", { diameter: 0.36, segments: 8 }, this.scene);
    leftShoulder.parent = this.visual;
    leftShoulder.position.set(-0.52, 1.3, 0);
    leftShoulder.material = this.redMat;
    const rightShoulder = leftShoulder.clone("rightShoulder");
    rightShoulder.position.x = 0.52;
    this.bodyParts.push(leftShoulder, rightShoulder);

    const leftBoot = MeshBuilder.CreateBox("leftBoot", { width: 0.28, depth: 0.42, height: 0.72 }, this.scene);
    leftBoot.parent = this.visual;
    leftBoot.position.set(-0.22, 0.35, -0.03);
    leftBoot.material = this.darkMat;
    const rightBoot = leftBoot.clone("rightBoot");
    rightBoot.position.x = 0.22;
    this.bodyParts.push(leftBoot, rightBoot);

    const aura = MeshBuilder.CreateTorus("belentaniAura", { diameter: 1.6, thickness: 0.025, tessellation: 40 }, this.scene);
    aura.parent = this.visual;
    aura.rotation.x = Math.PI / 2;
    aura.position.y = 0.06;
    aura.material = this.cyanMat;
    this.bodyParts.push(aura);
  }

  readInput(touchX: number, touchY: number): PlayerInput {
    let x = touchX;
    let z = touchY;
    if (this.keyState.has("a") || this.keyState.has("arrowleft")) x -= 1;
    if (this.keyState.has("d") || this.keyState.has("arrowright")) x += 1;
    if (this.keyState.has("w") || this.keyState.has("arrowup")) z -= 1;
    if (this.keyState.has("s") || this.keyState.has("arrowdown")) z += 1;
    const attack = this.keyState.has(" ") || this.keyState.has("enter");
    const length = Math.hypot(x, z);
    if (length > 1) {
      x /= length;
      z /= length;
    }
    return { x, z, attack };
  }

  update(dt: number, touchX: number, touchY: number, world: GameWorld) {
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.energy = Math.min(1, this.energy + dt * 0.08);
    this.attackPulse = Math.max(0, this.attackPulse - dt);
    const input = this.readInput(touchX, touchY);
    const move = new Vector3(input.x, 0, input.z);
    if (move.lengthSquared() > 0.01) {
      this.facing.set(input.x, 0, input.z);
      const nextX = this.root.position.x + input.x * this.speed * dt;
      const nextZ = this.root.position.z + input.z * this.speed * dt;
      if (!world.isBlocked(nextX, this.root.position.z)) this.root.position.x = nextX;
      if (!world.isBlocked(this.root.position.x, nextZ)) this.root.position.z = nextZ;
      this.visual.rotation.y = Math.atan2(input.x, -input.z);
      const bob = Math.sin(performance.now() * 0.012) * 0.035;
      this.visual.position.y = bob;
    } else {
      this.visual.position.y = Math.sin(performance.now() * 0.002) * 0.02;
    }
    this.bodyParts.forEach((part, index) => {
      if (index < 4) part.rotation.z = Math.sin(performance.now() * 0.004 + index) * 0.012;
    });
    return input;
  }

  canAttack() {
    return this.energy >= 0.19 && this.attackCooldown <= 0;
  }

  attack() {
    if (!this.canAttack()) return false;
    this.energy -= 0.19;
    this.attackCooldown = 0.42;
    this.attackPulse = 0.22;
    return true;
  }

  takeDamage(amount: number) {
    if (this.invulnerable > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnerable = 0.8;
    this.visual.scaling.set(1.08, 0.94, 1.08);
    window.setTimeout(() => this.visual.scaling.setAll(1), 120);
    return true;
  }

  get position() {
    return this.root.position;
  }

  get attackRange() {
    return 3.6;
  }

  get isAttacking() {
    return this.attackPulse > 0;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.root.dispose(false, true);
    this.collider.dispose();
  }
}
