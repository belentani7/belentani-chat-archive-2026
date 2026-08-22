// Belentani: Era de Judas — sacred collectibles.
// Design reminder: every objective has a unique color, silhouette and readable location.

import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Player } from "./Player";

export type ElementKind = "SAN PEDRO" | "SAN MARCOS" | "SANTOS" | "BELENTANI" | "EL HUMANO";

const entries: Array<{ kind: ElementKind; color: Color3; emissive: Color3; position: Vector3 }> = [
  { kind: "SAN PEDRO", color: new Color3(0.8, 0.46, 0.05), emissive: new Color3(1, 0.32, 0.02), position: new Vector3(-19, 0, 7) },
  { kind: "SAN MARCOS", color: new Color3(0.06, 0.28, 0.78), emissive: new Color3(0.04, 0.38, 1), position: new Vector3(19, 0, 7) },
  { kind: "SANTOS", color: new Color3(0.9, 0.62, 0.04), emissive: new Color3(1, 0.75, 0.05), position: new Vector3(-18, 0, -7) },
  { kind: "BELENTANI", color: new Color3(0.78, 0.02, 0.08), emissive: new Color3(1, 0.02, 0.18), position: new Vector3(18, 0, -7) },
  { kind: "EL HUMANO", color: new Color3(0.72, 0.76, 0.9), emissive: new Color3(0.45, 0.74, 1), position: new Vector3(0, 0, 5) },
];

function mat(scene: Scene, name: string, color: Color3, emissive: Color3) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = color;
  value.emissiveColor = emissive;
  value.specularColor = Color3.White();
  return value;
}

export class SacredElement {
  readonly kind: ElementKind;
  readonly root: TransformNode;
  readonly position: Vector3;
  collected = false;
  private readonly visual: TransformNode;
  private readonly baseY: number;
  private readonly start: number;

  constructor(scene: Scene, entry: typeof entries[number], index: number) {
    this.kind = entry.kind;
    this.root = new TransformNode(`sacredElement${index}`, scene);
    this.root.position.copyFrom(entry.position);
    this.position = this.root.position;
    this.baseY = 1.05;
    this.start = performance.now() + index * 400;
    this.visual = new TransformNode(`sacredElementVisual${index}`, scene);
    this.visual.parent = this.root;
    this.build(scene, entry, index);
  }

  private build(scene: Scene, entry: typeof entries[number], index: number) {
    const coreMat = mat(scene, `elementCore${index}`, entry.color, entry.emissive);
    const ringMat = mat(scene, `elementRing${index}`, entry.color.scale(0.55), entry.emissive.scale(0.8));
    const core = index % 2 === 0
      ? MeshBuilder.CreatePolyhedron(`elementCore${index}`, { type: 1, size: 0.9 }, scene)
      : MeshBuilder.CreateIcoSphere(`elementCore${index}`, { radius: 0.55, subdivisions: 1 }, scene);
    core.parent = this.visual;
    core.position.y = this.baseY;
    core.scaling.y = 1.42;
    core.material = coreMat;
    const ring = MeshBuilder.CreateTorus(`elementRing${index}`, { diameter: 1.45, thickness: 0.045, tessellation: 36 }, scene);
    ring.parent = this.visual;
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.24;
    ring.material = ringMat;
    const beam = MeshBuilder.CreateCylinder(`elementBeam${index}`, { diameter: 0.045, height: 1.3, tessellation: 8 }, scene);
    beam.parent = this.visual;
    beam.position.y = 0.52;
    beam.material = ringMat;
  }

  update() {
    if (this.collected) return;
    const t = (performance.now() - this.start) * 0.002;
    this.visual.rotation.y += 0.012;
    this.visual.position.y = Math.sin(t) * 0.12;
    this.visual.scaling.setAll(1 + Math.sin(t * 1.4) * 0.04);
  }

  tryCollect(player: Player) {
    if (this.collected || Vector3.Distance(this.position, player.position) > 1.45) return false;
    this.collected = true;
    this.root.setEnabled(false);
    return true;
  }

  dispose() {
    this.root.dispose(false, true);
  }
}

export class ItemManager {
  readonly items: SacredElement[];

  constructor(scene: Scene) {
    this.items = entries.map((entry, index) => new SacredElement(scene, entry, index));
  }

  update(player: Player) {
    this.items.forEach((item) => {
      item.update();
      item.tryCollect(player);
    });
  }

  collect(player: Player) {
    const item = this.items.find((candidate) => !candidate.collected && candidate.tryCollect(player));
    return item?.kind ?? null;
  }

  get count() {
    return this.items.filter((item) => item.collected).length;
  }

  get complete() {
    return this.count === this.items.length;
  }

  dispose() {
    this.items.forEach((item) => item.dispose());
  }
}
