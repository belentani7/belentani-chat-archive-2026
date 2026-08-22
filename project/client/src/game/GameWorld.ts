// Belentani: Era de Judas — handcrafted 3D sanctuary world.
// Design reminder: basalt, red/cyan signal lines, purple corruption, readable routes.

import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type RectObstacle = { x: number; z: number; width: number; depth: number; mesh: AbstractMesh };

function material(scene: Scene, name: string, color: Color3, emissive?: Color3) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.18, 0.2, 0.3);
  mat.roughness = 0.74;
  if (emissive) {
    mat.emissiveColor = emissive;
  }
  return mat;
}

export class GameWorld {
  readonly width = 52;
  readonly depth = 34;
  readonly obstacles: RectObstacle[] = [];
  readonly spawn = new Vector3(0, 1.05, 12);
  readonly bossSpawn = new Vector3(0, 1.45, -9);
  readonly scene: Scene;
  readonly red = new Color3(1, 0.035, 0.22);
  readonly cyan = new Color3(0, 0.85, 1);
  readonly violet = new Color3(0.55, 0.04, 1);
  readonly gold = new Color3(1, 0.58, 0.08);
  readonly stone = new Color3(0.045, 0.06, 0.12);
  readonly floorMaterial: StandardMaterial;
  private readonly neonMats: StandardMaterial[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    scene.clearColor = new Color4(0.008, 0.012, 0.035, 1);
    scene.ambientColor = new Color3(0.16, 0.18, 0.25);
    const fill = new HemisphericLight("moonFill", new Vector3(0, 1, 0), scene);
    fill.intensity = 0.62;
    fill.diffuse = new Color3(0.3, 0.42, 0.62);
    fill.groundColor = new Color3(0.01, 0.015, 0.03);
    const moon = new PointLight("moon", new Vector3(0, 12, 0), scene);
    moon.diffuse = new Color3(0.22, 0.42, 0.86);
    moon.specular = new Color3(0.1, 0.2, 0.4);
    moon.intensity = 4.5;

    const redLight = new PointLight("redSignal", new Vector3(-14, 3, 4), scene);
    redLight.diffuse = this.red;
    redLight.intensity = 5.5;
    redLight.range = 18;
    const cyanLight = new PointLight("cyanSignal", new Vector3(14, 3, -4), scene);
    cyanLight.diffuse = this.cyan;
    cyanLight.intensity = 5.5;
    cyanLight.range = 18;

    this.floorMaterial = new StandardMaterial("basaltFloor", scene);
    this.floorMaterial.diffuseColor = new Color3(0.018, 0.028, 0.062);
    this.floorMaterial.specularColor = new Color3(0.04, 0.06, 0.12);
    this.floorMaterial.roughness = 0.94;

    this.buildFloor();
    this.buildWalls();
    this.buildRouteSignals();
    this.buildShrine();
    this.buildPillars();
  }

  private buildFloor() {
    const floor = MeshBuilder.CreateBox("sanctuaryFloor", { width: this.width, depth: this.depth, height: 0.45 }, this.scene);
    floor.position.y = -0.22;
    floor.material = this.floorMaterial;
    floor.receiveShadows = true;

    const inner = MeshBuilder.CreateBox("innerFloor", { width: this.width - 2, depth: this.depth - 2, height: 0.08 }, this.scene);
    inner.position.y = 0.02;
    inner.material = material(this.scene, "innerBasalt", new Color3(0.012, 0.02, 0.045));
    inner.receiveShadows = true;
  }

  private buildWalls() {
    const wallMat = material(this.scene, "sanctuaryWall", new Color3(0.07, 0.08, 0.15));
    const trimMat = material(this.scene, "wallTrim", new Color3(0.14, 0.18, 0.3));
    const walls = [
      { name: "northWall", x: 0, z: -this.depth / 2, width: this.width, depth: 1.2 },
      { name: "southWall", x: 0, z: this.depth / 2, width: this.width, depth: 1.2 },
      { name: "westWall", x: -this.width / 2, z: 0, width: 1.2, depth: this.depth },
      { name: "eastWall", x: this.width / 2, z: 0, width: 1.2, depth: this.depth },
    ];
    walls.forEach((spec) => {
      const wall = MeshBuilder.CreateBox(spec.name, { width: spec.width, depth: spec.depth, height: 3.2 }, this.scene);
      wall.position.set(spec.x, 1.45, spec.z);
      wall.material = wallMat;
      wall.receiveShadows = true;
      const trim = MeshBuilder.CreateBox(`${spec.name}Trim`, { width: spec.width * 0.98, depth: spec.depth * 0.98, height: 0.12 }, this.scene);
      trim.position.set(spec.x, 2.98, spec.z);
      trim.material = trimMat;
      this.obstacles.push({ x: spec.x, z: spec.z, width: spec.width, depth: spec.depth, mesh: wall });
    });
  }

  private buildRouteSignals() {
    const cyanMat = material(this.scene, "routeCyan", new Color3(0.02, 0.16, 0.24), this.cyan.scale(0.8));
    const redMat = material(this.scene, "routeRed", new Color3(0.25, 0.02, 0.05), this.red.scale(0.8));
    this.neonMats.push(cyanMat, redMat);
    const horizontal = [-10, -5, 0, 5, 10];
    horizontal.forEach((z, index) => {
      const line = MeshBuilder.CreateBox(`cyanLine${index}`, { width: 34, depth: 0.06, height: 0.03 }, this.scene);
      line.position.set(0, 0.06, z);
      line.material = index === 2 ? redMat : cyanMat;
    });
    const vertical = [-18, -9, 9, 18];
    vertical.forEach((x, index) => {
      const line = MeshBuilder.CreateBox(`redLine${index}`, { width: 0.06, depth: 26, height: 0.03 }, this.scene);
      line.position.set(x, 0.065, 0);
      line.material = index % 2 === 0 ? redMat : cyanMat;
    });
  }

  private buildShrine() {
    const platformMat = material(this.scene, "shrinePlatform", new Color3(0.11, 0.12, 0.2), this.violet.scale(0.13));
    const platform = MeshBuilder.CreateCylinder("shrinePlatform", { diameter: 9, height: 0.38, tessellation: 8 }, this.scene);
    platform.position.set(0, 0.2, -11.2);
    platform.material = platformMat;
    const ringMat = material(this.scene, "shrineRing", new Color3(0.12, 0.025, 0.1), this.violet);
    const ring = MeshBuilder.CreateTorus("shrineRing", { diameter: 7.2, thickness: 0.12, tessellation: 48 }, this.scene);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.46, -11.2);
    ring.material = ringMat;
    const crystalMat = material(this.scene, "goldenKey", new Color3(0.9, 0.38, 0.03), this.gold);
    const crystal = MeshBuilder.CreatePolyhedron("goldenKey", { type: 1, size: 2.4 }, this.scene);
    crystal.position.set(0, 1.65, -11.2);
    crystal.scaling.y = 1.8;
    crystal.material = crystalMat;
    this.scene.onBeforeRenderObservable.add(() => {
      crystal.rotation.y += 0.006;
      crystal.position.y = 1.65 + Math.sin(performance.now() * 0.002) * 0.08;
    });
  }

  private buildPillars() {
    const pillarMat = material(this.scene, "pillarStone", new Color3(0.09, 0.1, 0.17));
    const capMat = material(this.scene, "pillarCap", new Color3(0.22, 0.04, 0.12), this.red.scale(0.6));
    const positions = [
      [-20, -10], [20, -10], [-20, 10], [20, 10],
      [-13, -4], [13, -4], [-13, 4], [13, 4],
    ];
    positions.forEach(([x, z], i) => {
      const pillar = MeshBuilder.CreateBox(`pillar${i}`, { width: 1.3, depth: 1.3, height: 3.4 }, this.scene);
      pillar.position.set(x, 1.7, z);
      pillar.material = pillarMat;
      const cap = MeshBuilder.CreateBox(`pillarCap${i}`, { width: 1.6, depth: 1.6, height: 0.12 }, this.scene);
      cap.position.set(x, 3.42, z);
      cap.material = capMat;
      this.obstacles.push({ x, z, width: 1.55, depth: 1.55, mesh: pillar });
    });
  }

  addObstacle(x: number, z: number, width: number, depth: number, materialOverride?: StandardMaterial) {
    const mesh = MeshBuilder.CreateBox(`obstacle${this.obstacles.length}`, { width, depth, height: 1.4 }, this.scene);
    mesh.position.set(x, 0.7, z);
    mesh.material = materialOverride ?? material(this.scene, `obstacleMat${this.obstacles.length}`, new Color3(0.09, 0.1, 0.17));
    this.obstacles.push({ x, z, width, depth, mesh });
    return mesh;
  }

  isBlocked(x: number, z: number, radius = 0.45) {
    const halfW = this.width / 2 - 1.2;
    const halfD = this.depth / 2 - 1.2;
    if (x < -halfW + radius || x > halfW - radius || z < -halfD + radius || z > halfD - radius) return true;
    return this.obstacles.some((obstacle) => {
      const halfX = obstacle.width / 2 + radius;
      const halfZ = obstacle.depth / 2 + radius;
      return x > obstacle.x - halfX && x < obstacle.x + halfX && z > obstacle.z - halfZ && z < obstacle.z + halfZ;
    });
  }

  dispose() {
    this.obstacles.length = 0;
  }
}
