/**
 * point-cloud.ts
 *
 * Three.js point cloud that morphs between six architectural shapes —
 * a multi-storey building, a stadium, a concert stage, a theatre, an
 * immersive cube room, and a spherical theatre. Each shape's structural
 * corners become points; the vertical structural edges connect them with
 * stepped line thicknesses for an architectural-drawing feel.
 *
 * Used as a background layer in the Hero component. Non-interactive
 * (no OrbitControls): the camera auto-rotates gently around the form.
 *
 * Initialised via `initPointCloud(canvas, options)`. Returns a teardown
 * function in case a future SPA flow needs to dispose the scene.
 */

import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface PointCloudOptions {
  /** Hex string (e.g. "#F9F9F3") for both points and lines */
  cloudColor?: string;
  /**
   * Offset into the shape sequence — controls which shape this hero
   * starts on (and therefore the full morph order). 0..5; defaults to 0.
   */
  startIndex?: number;
  /**
   * Whether to render the human figure at the centre of the scene.
   * Defaults to true.
   */
  showFigure?: boolean;
  /** URL of the figure glTF model. */
  figureModel?: string;
  /** Target height of the figure in scene units. Defaults to 3. */
  figureHeight?: number;
  /** Tint applied to the figure mesh. */
  figureColor?: string;
}

interface Shape {
  verts: number[];
  edges: number[];
}

interface ShapeBuffers {
  positions: Float32Array;
  edges: Uint32Array;
}

interface VerticalLineEntry {
  line: Line2;
  mat: LineMaterial;
  geom: LineGeometry;
  a: number;
  b: number;
}

// -------------------------------------------------------------------
// Shape builders — each returns structural corners + connecting edges.
// -------------------------------------------------------------------

const addBox = (
  verts: number[],
  edges: number[],
  cx: number, cy: number, cz: number,
  w: number,  h: number,  d: number,
): void => {
  const base = verts.length / 3;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const c = [
    [-hw, -hh, -hd], [ hw, -hh, -hd], [ hw,  hh, -hd], [-hw,  hh, -hd],
    [-hw, -hh,  hd], [ hw, -hh,  hd], [ hw,  hh,  hd], [-hw,  hh,  hd],
  ];
  for (const [x, y, z] of c) verts.push(cx + x, cy + y, cz + z);
  const e = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, b] of e) edges.push(base + a, base + b);
};

const addRing = (
  verts: number[],
  edges: number[],
  cx: number, cy: number, cz: number,
  rx: number, rz: number,
  n: number,
  closed = true,
): number => {
  const base = verts.length / 3;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    verts.push(cx + Math.cos(a) * rx, cy, cz + Math.sin(a) * rz);
  }
  for (let i = 0; i < n - (closed ? 0 : 1); i++) {
    edges.push(base + i, base + ((i + 1) % n));
  }
  return base;
};

function genArchitecture(): Shape {
  const verts: number[] = [];
  const edges: number[] = [];
  const floors = 4, gridX = 4, gridZ = 4;
  const rW = 2.0, rD = 2.0, rH = 1.6;
  const baseY = -3;

  const skip = new Set<string>();
  for (let f = 1; f <= 2; f++) {
    skip.add(`${f},1,1`); skip.add(`${f},2,1`);
    skip.add(`${f},1,2`); skip.add(`${f},2,2`);
  }

  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < gridX; i++) {
      for (let j = 0; j < gridZ; j++) {
        if (skip.has(`${f},${i},${j}`)) continue;
        const cx = (i - (gridX - 1) / 2) * rW;
        const cy = baseY + f * rH + rH / 2;
        const cz = (j - (gridZ - 1) / 2) * rD;
        addBox(verts, edges, cx, cy, cz, rW * 0.94, rH * 0.94, rD * 0.94);
      }
    }
  }
  addBox(verts, edges, 0, baseY + floors * rH + 0.2, 0, gridX * rW + 0.4, 0.3, gridZ * rD + 0.4);
  for (let s = 0; s <= floors; s++) {
    addBox(verts, edges, -(gridX * rW) / 2 - 1.6, baseY + s * rH, 0, 1.0, 0.12, 1.4);
  }
  addBox(verts, edges, -(gridX * rW) / 2 - 1.6, baseY + (floors * rH) / 2, 0, 1.2, floors * rH, 1.6);
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < gridX; i++) {
      const cx = (i - (gridX - 1) / 2) * rW;
      const cy = baseY + f * rH + rH * 0.55;
      const czS =  ((gridZ - 1) / 2) * rD + rD / 2 + 0.04;
      const czN = -((gridZ - 1) / 2) * rD - rD / 2 - 0.04;
      addBox(verts, edges, cx, cy, czS, rW * 0.55, rH * 0.45, 0.05);
      addBox(verts, edges, cx, cy, czN, rW * 0.55, rH * 0.45, 0.05);
    }
  }
  addBox(verts, edges, 0, baseY - 0.15, 0, gridX * rW + 1.2, 0.2, gridZ * rD + 1.2);
  return { verts, edges };
}

function genStadium(): Shape {
  const verts: number[] = [];
  const edges: number[] = [];
  const segments = 56, tiers = 9, baseY = -3;
  const ringBases: number[] = [];
  for (let t = 0; t < tiers; t++) {
    const rx = 5.5 + t * 0.45;
    const rz = 4.2 + t * 0.4;
    const y = baseY + t * 0.55;
    ringBases.push(addRing(verts, edges, 0, y, 0, rx, rz, segments));
  }
  for (let t = 0; t < tiers - 1; t++) {
    for (let i = 0; i < segments; i += 2) {
      edges.push(ringBases[t]! + i, ringBases[t + 1]! + i);
    }
  }
  const roofY = baseY + tiers * 0.55 + 0.8;
  const roofRx = 5.5 + tiers * 0.45 + 0.4;
  const roofRz = 4.2 + tiers * 0.4 + 0.4;
  const roofBase = addRing(verts, edges, 0, roofY, 0, roofRx, roofRz, segments);
  const topTier = ringBases[tiers - 1]!;
  for (let i = 0; i < segments; i += 2) edges.push(topTier + i, roofBase + i);

  addBox(verts, edges, 0, baseY - 0.1, 0, 8, 0.05, 5.4);
  addBox(verts, edges, 0, baseY - 0.05, 0, 0.05, 0.02, 5);
  addBox(verts, edges, -3.4, baseY - 0.05, 0, 0.6, 0.02, 2.4);
  addBox(verts, edges,  3.4, baseY - 0.05, 0, 0.6, 0.02, 2.4);

  const towers: [number, number][] = [
    [-roofRx - 0.6, -roofRz - 0.6],
    [ roofRx + 0.6, -roofRz - 0.6],
    [-roofRx - 0.6,  roofRz + 0.6],
    [ roofRx + 0.6,  roofRz + 0.6],
  ];
  for (const [tx, tz] of towers) {
    addBox(verts, edges, tx, baseY + 1.2, tz, 0.3, 4.0, 0.3);
    addBox(verts, edges, tx, baseY + 3.6, tz, 1.6, 0.6, 1.0);
  }
  addBox(verts, edges, 0, baseY + 4.6, -roofRz - 0.4, 4, 1.3, 0.25);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    addBox(verts, edges, Math.cos(a) * 5.4, baseY + 0.4, Math.sin(a) * 4.1, 0.6, 0.7, 0.6);
  }
  return { verts, edges };
}

function genConcertStage(): Shape {
  const verts: number[] = [];
  const edges: number[] = [];
  const stageY = -2.6;
  addBox(verts, edges, 0, stageY, 0, 11, 0.5, 4.4);
  addBox(verts, edges, 0, stageY + 0.55, -1.0, 2.2, 0.45, 1.8);
  for (let i = -1; i <= 1; i++) addBox(verts, edges, i * 2.6, stageY + 1.9, -2.0, 2.4, 3.2, 0.1);
  addBox(verts, edges, -7.0, stageY + 1.9, -0.6, 0.25, 3.4, 2.6);
  addBox(verts, edges,  7.0, stageY + 1.9, -0.6, 0.25, 3.4, 2.6);
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? -6.2 : 6.2;
    for (let h = 0; h < 6; h++) addBox(verts, edges, x, stageY + 4.4 - h * 0.55, 1.5, 0.9, 0.5, 0.7);
  }
  for (let i = 0; i < 5; i++) addBox(verts, edges, -4 + i * 2, stageY - 0.05, 2.6, 0.9, 0.55, 0.7);
  addBox(verts, edges, -5.6, stageY + 2.6, -0.2, 0.35, 5.4, 0.35);
  addBox(verts, edges,  5.6, stageY + 2.6, -0.2, 0.35, 5.4, 0.35);
  addBox(verts, edges,  0, stageY + 5.3, -0.2, 11.6, 0.35, 0.35);
  const truY = stageY + 5.0;
  addBox(verts, edges,  0, truY, 1.6, 11.0, 0.3, 0.3);
  addBox(verts, edges,  0, truY, -1.6, 11.0, 0.3, 0.3);
  addBox(verts, edges, -5.2, truY, 0, 0.3, 0.3, 3.2);
  addBox(verts, edges,  5.2, truY, 0, 0.3, 0.3, 3.2);
  for (let i = 0; i < 9; i++) {
    const x = -5 + i * (10 / 8);
    addBox(verts, edges, x, truY - 0.4, 1.6, 0.28, 0.45, 0.28);
    addBox(verts, edges, x, truY - 0.4, -1.6, 0.28, 0.45, 0.28);
  }
  for (let i = -2; i <= 2; i++) {
    addBox(verts, edges, i * 2, stageY + 0.55, 1.6, 0.08, 0.7, 0.08);
    addBox(verts, edges, i * 2, stageY + 0.32, 1.9, 0.6, 0.25, 0.4);
  }
  for (let i = 0; i < 7; i++) addBox(verts, edges, -6 + i * 2, stageY + 0.1, 3.6, 0.1, 0.7, 0.1);
  addBox(verts, edges, 0, stageY - 0.4, 2.2, 11, 0.6, 0.05);
  return { verts, edges };
}

function genTheatre(): Shape {
  const verts: number[] = [];
  const edges: number[] = [];
  const stageY = -3;
  addBox(verts, edges, 0, stageY + 0.25, -3.8, 9, 0.5, 3);
  addBox(verts, edges, 0, stageY + 0.05, -2.0, 9, 0.05, 0.6);
  addBox(verts, edges, 0, stageY + 2.8, -5.2, 9, 5, 0.15);
  addBox(verts, edges, -4.7, stageY + 2.6, -2.4, 0.45, 5.2, 0.45);
  addBox(verts, edges,  4.7, stageY + 2.6, -2.4, 0.45, 5.2, 0.45);
  addBox(verts, edges,  0.0, stageY + 5.0, -2.4, 9.9,  0.45, 0.45);
  addBox(verts, edges,  0.0, stageY + 5.6, -2.4, 8.5,  0.4,  0.4);
  addBox(verts, edges,  0.0, stageY + 6.1, -2.4, 7.0,  0.3,  0.3);
  addBox(verts, edges, -3.4, stageY + 2.4, -2.3, 2.4, 4.7, 0.1);
  addBox(verts, edges,  3.4, stageY + 2.4, -2.3, 2.4, 4.7, 0.1);

  const pivot = { x: 0, z: -10 };
  const addArcRow = (r: number, y: number, span: number, n: number): number => {
    const base = verts.length / 3;
    for (let j = 0; j < n; j++) {
      const a = -span / 2 + span * (j / (n - 1));
      verts.push(pivot.x + r * Math.sin(a), y, pivot.z + r * Math.cos(a));
    }
    for (let j = 0; j < n - 1; j++) edges.push(base + j, base + j + 1);
    return base;
  };
  const orchN = 18;
  const orchBases: number[] = [];
  for (let i = 0; i < 9; i++) {
    orchBases.push(addArcRow(11.5 + i * 0.65, stageY + 0.05 + i * 0.18, Math.PI / 3, orchN));
  }
  for (let i = 0; i < orchBases.length - 1; i++) {
    for (let j = 0; j < orchN; j += 2) edges.push(orchBases[i]! + j, orchBases[i + 1]! + j);
  }
  for (let i = 0; i < 5; i++) {
    addArcRow(12.5 + i * 0.6, stageY + 4.2 + i * 0.22, Math.PI / 3.4, 16);
  }
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? -6.5 : 6.5;
    for (let h = 0; h < 2; h++) {
      addBox(verts, edges, sx, stageY + 1.6 + h * 1.8, -1.5, 1.6, 1.4, 1.6);
    }
  }
  addRing(verts, edges, 0, stageY + 7.4, 0, 5.5, 5.5, 24);
  addRing(verts, edges, 0, stageY + 8.0, 0, 3.8, 3.8, 18);
  addRing(verts, edges, 0, stageY + 8.3, 0, 2.0, 2.0, 12);
  addBox(verts, edges, 0, stageY + 6.6, 0, 1.4, 1.0, 1.4);
  addBox(verts, edges, 0, stageY + 6.0, 0, 0.1, 1.0, 0.1);
  return { verts, edges };
}

function genImmersiveSpace(): Shape {
  const verts: number[] = [];
  const edges: number[] = [];
  const W = 12, H = 6, D = 12, baseY = -3;
  const floorN = 5;
  const cell = W / floorN;
  for (let i = 0; i < floorN; i++) {
    for (let j = 0; j < floorN; j++) {
      const cx = -W / 2 + cell / 2 + i * cell;
      const cz = -D / 2 + cell / 2 + j * cell;
      addBox(verts, edges, cx, baseY, cz, cell * 0.92, 0.06, cell * 0.92);
      addBox(verts, edges, cx, baseY + H + 0.05, cz, cell * 0.92, 0.06, cell * 0.92);
    }
  }
  const wCols = 4, wRows = 2;
  for (let i = 0; i < wCols; i++) {
    for (let j = 0; j < wRows; j++) {
      const cx = -W / 2 + (W / wCols) * (i + 0.5);
      const cy = baseY + (H / wRows) * (j + 0.5);
      const w = W / wCols * 0.92;
      const h = H / wRows * 0.92;
      addBox(verts, edges, cx, cy,  D / 2, w, h, 0.06);
      addBox(verts, edges, cx, cy, -D / 2, w, h, 0.06);
    }
  }
  for (let i = 0; i < wCols; i++) {
    for (let j = 0; j < wRows; j++) {
      const cz = -D / 2 + (D / wCols) * (i + 0.5);
      const cy = baseY + (H / wRows) * (j + 0.5);
      const w = D / wCols * 0.92;
      const h = H / wRows * 0.92;
      addBox(verts, edges,  W / 2, cy, cz, 0.06, h, w);
      addBox(verts, edges, -W / 2, cy, cz, 0.06, h, w);
    }
  }
  const corners: [number, number, number][] = [
    [-W / 2, baseY,       -D / 2], [ W / 2, baseY,       -D / 2],
    [ W / 2, baseY,        D / 2], [-W / 2, baseY,        D / 2],
    [-W / 2, baseY + H,   -D / 2], [ W / 2, baseY + H,   -D / 2],
    [ W / 2, baseY + H,    D / 2], [-W / 2, baseY + H,    D / 2],
  ];
  const cBase = verts.length / 3;
  for (const [x, y, z] of corners) verts.push(x, y, z);
  const cubeEdges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, b] of cubeEdges) edges.push(cBase + a, cBase + b);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    addBox(verts, edges, Math.cos(a) * 3, baseY + 1.4, Math.sin(a) * 3, 0.45, 2.6, 0.45);
  }
  addBox(verts, edges, 0, baseY + 0.6, 0, 1.8, 1.2, 1.8);
  addBox(verts, edges, 0, baseY + 1.6, 0, 1.2, 0.8, 1.2);
  addBox(verts, edges, 0, baseY + 2.3, 0, 0.6, 0.6, 0.6);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    addBox(verts, edges, Math.cos(a) * 4.5, baseY + H - 0.6, Math.sin(a) * 4.5, 0.4, 0.6, 0.4);
  }
  return { verts, edges };
}

function genSphericalTheatre(): Shape {
  const verts: number[] = [];
  const edges: number[] = [];
  const R = 6.5, lats = 11, lons = 22;
  const ringBases: number[] = [];
  for (let i = 1; i < lats; i++) {
    const phi = (i / lats) * Math.PI;
    const y = R * Math.cos(phi);
    const rr = R * Math.sin(phi);
    const base = verts.length / 3;
    for (let j = 0; j < lons; j++) {
      const theta = (j / lons) * Math.PI * 2;
      verts.push(rr * Math.cos(theta), y, rr * Math.sin(theta));
    }
    for (let j = 0; j < lons; j++) edges.push(base + j, base + (j + 1) % lons);
    ringBases.push(base);
  }
  const topIdx = verts.length / 3; verts.push(0,  R, 0);
  const botIdx = verts.length / 3; verts.push(0, -R, 0);
  for (let j = 0; j < lons; j++) {
    edges.push(topIdx, ringBases[0]! + j);
    for (let i = 0; i < ringBases.length - 1; i++) {
      edges.push(ringBases[i]! + j, ringBases[i + 1]! + j);
    }
    edges.push(ringBases[ringBases.length - 1]! + j, botIdx);
  }
  const stageY = -R + 1.0;
  addBox(verts, edges, 0, stageY, -2.0, 4, 0.4, 2.5);

  const bowl = { x: 0, z: 1.0 };
  for (let i = 0; i < 7; i++) {
    const r = 1.6 + i * 0.7;
    const y = stageY + 0.2 + i * 0.25;
    const span = Math.PI * 1.4;
    const n = 14 + i * 2;
    const base = verts.length / 3;
    for (let j = 0; j < n; j++) {
      const a = Math.PI / 2 + Math.PI - span / 2 + span * (j / (n - 1));
      verts.push(bowl.x + r * Math.cos(a), y, bowl.z + r * Math.sin(a));
    }
    for (let j = 0; j < n - 1; j++) edges.push(base + j, base + j + 1);
  }
  const innerR = R - 1.0;
  for (let i = 1; i < 6; i++) {
    const phi = (i / lats) * Math.PI;
    const y = innerR * Math.cos(phi) + 0.5;
    const rr = innerR * Math.sin(phi);
    const base = verts.length / 3;
    const n = 16;
    for (let j = 0; j < n; j++) {
      const theta = (j / n) * Math.PI * 2;
      verts.push(rr * Math.cos(theta), y, rr * Math.sin(theta));
    }
    for (let j = 0; j < n; j++) edges.push(base + j, base + (j + 1) % n);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    addBox(verts, edges, Math.cos(a) * (R - 0.3), -R + 1, Math.sin(a) * (R - 0.3), 1.0, 2.0, 0.8);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    addBox(verts, edges, Math.cos(a) * (R + 0.5), -R + 1, Math.sin(a) * (R + 0.5), 0.4, 4, 0.4);
  }
  return { verts, edges };
}

// -------------------------------------------------------------------
// Normalisation — pad to common vertex count, sort spherically, centre.
// -------------------------------------------------------------------

function padShape(shape: Shape, N: number): Shape {
  const src = shape.verts;
  const srcN = src.length / 3;
  const verts = src.slice();
  for (let i = srcN; i < N; i++) {
    const k = i % srcN;
    verts.push(src[k * 3]!, src[k * 3 + 1]!, src[k * 3 + 2]!);
  }
  return { verts, edges: shape.edges.slice() };
}

function sortShape(shape: Shape): Shape {
  const n = shape.verts.length / 3;
  const idx = new Array<number>(n);
  for (let i = 0; i < n; i++) idx[i] = i;

  idx.sort((a, b) => {
    const ax = shape.verts[a * 3]!, ay = shape.verts[a * 3 + 1]!, az = shape.verts[a * 3 + 2]!;
    const bx = shape.verts[b * 3]!, by = shape.verts[b * 3 + 1]!, bz = shape.verts[b * 3 + 2]!;
    const angA = Math.atan2(az, ax);
    const angB = Math.atan2(bz, bx);
    if (Math.abs(angA - angB) > 0.04) return angA - angB;
    if (Math.abs(ay - by) > 0.05) return ay - by;
    return (ax * ax + az * az) - (bx * bx + bz * bz);
  });

  const newVerts = new Array<number>(n * 3);
  const inverse = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const o = idx[i]!;
    inverse[o] = i;
    newVerts[i * 3]     = shape.verts[o * 3]!;
    newVerts[i * 3 + 1] = shape.verts[o * 3 + 1]!;
    newVerts[i * 3 + 2] = shape.verts[o * 3 + 2]!;
  }
  const newEdges = shape.edges.map((e) => inverse[e]!);
  return { verts: newVerts, edges: newEdges };
}

function centreShape(shape: Shape): Shape {
  const n = shape.verts.length / 3;
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < n; i++) {
    cx += shape.verts[i * 3]!;
    cy += shape.verts[i * 3 + 1]!;
    cz += shape.verts[i * 3 + 2]!;
  }
  cx /= n; cy /= n; cz /= n;
  for (let i = 0; i < n; i++) {
    shape.verts[i * 3]     -= cx;
    shape.verts[i * 3 + 1] -= cy;
    shape.verts[i * 3 + 2] -= cz;
  }
  return shape;
}

function shapeToBuffers(shape: Shape, N: number): ShapeBuffers {
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) positions[i] = shape.verts[i]!;
  return { positions, edges: new Uint32Array(shape.edges) };
}


// -------------------------------------------------------------------
// Public init
// -------------------------------------------------------------------

export function initPointCloud(
  canvas: HTMLCanvasElement,
  options: PointCloudOptions = {},
): () => void {
  const cloudColor = options.cloudColor ?? "#F9F9F3";
  const startIndex = Math.max(0, Math.floor(options.startIndex ?? 0));
  const showFigure = options.showFigure !== false;
  // Honour Astro's base path so the GLTF resolves under sub-path deploys
  // (e.g. GitHub Pages at /interval/).
  const baseUrl = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const figureModel = options.figureModel ?? `${baseUrl}/assets/uploads/low_poly_human_template/scene.gltf`;
  const figureHeight = options.figureHeight ?? 3;
  const figureColor = options.figureColor ?? "#F9F9F3";

  const rawShapes = [
    genArchitecture(),
    genStadium(),
    genConcertStage(),
    genTheatre(),
    genImmersiveSpace(),
    genSphericalTheatre(),
  ].map(centreShape);

  const N = Math.max(...rawShapes.map((s) => s.verts.length / 3));
  const shapes = rawShapes
    .map((s) => padShape(s, N))
    .map(sortShape)
    .map((s) => shapeToBuffers(s, N));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(18, 6, 18);

  // Round point sprite (avoids square gl.POINTS).
  const pointSprite = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.85)");
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  })();

  const positions = new Float32Array(N * 3);
  positions.set(shapes[0]!.positions);
  const positionAttr = new THREE.BufferAttribute(positions, 3);
  positionAttr.setUsage(THREE.DynamicDrawUsage);

  const pointsGeom = new THREE.BufferGeometry();
  pointsGeom.setAttribute("position", positionAttr);
  const pointsMat = new THREE.PointsMaterial({
    color: new THREE.Color(cloudColor),
    size: 0.17,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    map: pointSprite,
    alphaTest: 0.01,
    blending: THREE.NormalBlending,
  });
  const points = new THREE.Points(pointsGeom, pointsMat);
  scene.add(points);

  // Centre figure ----------------------------------------------------
  // Low-poly human glTF model (Godough, Sketchfab) loaded async at
  // world origin. OrbitControls rotates the camera around the origin,
  // so dragging carries the figure along with the architectural cloud.
  //
  // The model is centred via its bounding box and scaled to a fixed
  // height so it looks consistent regardless of source mesh size.
  let figureRoot: THREE.Group | null = null;
  const collectedFigureGeoms: THREE.BufferGeometry[] = [];
  const collectedFigureMats: THREE.Material[] = [];

  if (showFigure) {
    figureRoot = new THREE.Group();
    scene.add(figureRoot);

    // Lights — only affect the figure mesh (points + lines use unlit
    // basic materials, so they remain flat regardless).
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(5, 8, 6);
    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(-4, 2, -5);
    scene.add(ambient, key, rim);

    const tint = new THREE.Color(figureColor);
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      figureModel,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Centre on origin via bounding-box, scale to target height.
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const centre = bbox.getCenter(new THREE.Vector3());
        model.position.sub(centre);
        const targetScale = size.y > 0 ? figureHeight / size.y : 1;
        model.scale.setScalar(targetScale);

        // Tint every mesh to a consistent brand colour + soft material.
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const oldMat = mesh.material;
          const oldMats = Array.isArray(oldMat) ? oldMat : [oldMat];
          for (const m of oldMats) m.dispose();
          const mat = new THREE.MeshStandardMaterial({
            color: tint,
            roughness: 0.55,
            metalness: 0.05,
            emissive: tint,
            emissiveIntensity: 0.08,
          });
          mesh.material = mat;
          collectedFigureMats.push(mat);
          if (mesh.geometry) collectedFigureGeoms.push(mesh.geometry);
        });

        figureRoot!.add(model);
      },
      undefined,
      (err) => {
        // Loading failure is non-fatal — the cloud still renders.
        // eslint-disable-next-line no-console
        console.warn("[point-cloud] Failed to load figure model:", err);
      },
    );
  }

  // Stepped vertical line strokes
  const VERT_AXIS_EPS = 0.01;
  const VERT_MIN_LEN  = 0.25;
  const STROKE_MAX = 24;
  const STROKE_MIN = 1;

  type VEdge = { a: number; b: number; midX: number; midZ: number };
  function findVerticalEdges(shape: ShapeBuffers): VEdge[] {
    const e = shape.edges;
    const p = shape.positions;
    const out: VEdge[] = [];
    for (let k = 0; k < e.length; k += 2) {
      const ai = e[k]!, bi = e[k + 1]!;
      const ax = p[ai * 3]!,     ay = p[ai * 3 + 1]!, az = p[ai * 3 + 2]!;
      const bx = p[bi * 3]!,     by = p[bi * 3 + 1]!, bz = p[bi * 3 + 2]!;
      if (Math.abs(ax - bx) < VERT_AXIS_EPS &&
          Math.abs(az - bz) < VERT_AXIS_EPS &&
          Math.abs(ay - by) > VERT_MIN_LEN) {
        out.push({ a: ai, b: bi, midX: (ax + bx) / 2, midZ: (az + bz) / 2 });
      }
    }
    out.sort((p1, p2) => {
      if (Math.abs(p1.midX - p2.midX) > 0.05) return p1.midX - p2.midX;
      return p1.midZ - p2.midZ;
    });
    return out;
  }

  function findHorizontalEdges(shape: ShapeBuffers): number[] {
    const e = shape.edges;
    const p = shape.positions;
    const out: number[] = [];
    for (let k = 0; k < e.length; k += 2) {
      const ai = e[k]!, bi = e[k + 1]!;
      const ay = p[ai * 3 + 1]!;
      const by = p[bi * 3 + 1]!;
      if (Math.abs(ay - by) < VERT_AXIS_EPS) {
        const dx = p[ai * 3]!     - p[bi * 3]!;
        const dz = p[ai * 3 + 2]! - p[bi * 3 + 2]!;
        if (dx * dx + dz * dz > VERT_MIN_LEN * VERT_MIN_LEN) {
          out.push(ai, bi);
        }
      }
    }
    return out;
  }

  const lineMatRegistry: LineMaterial[] = [];

  const horizontalLineMaterials = shapes.map(() => new THREE.LineBasicMaterial({
    color: new THREE.Color(cloudColor),
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }));
  shapes.forEach((s, i) => {
    const idx = findHorizontalEdges(s);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", positionAttr);
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
    scene.add(new THREE.LineSegments(g, horizontalLineMaterials[i]!));
  });

  const verticalLines: VerticalLineEntry[][] = shapes.map((shape) => {
    const vEdges = findVerticalEdges(shape);
    const total = vEdges.length;
    const step = total > 1 ? (STROKE_MAX - STROKE_MIN) / (total - 1) : 0;

    return vEdges.map((edge, idx) => {
      const thickness = total <= 1 ? STROKE_MAX : STROKE_MAX - step * idx;
      const geom = new LineGeometry();
      geom.setPositions([0, 0, 0, 0, 0, 0]);
      const mat = new LineMaterial({
        color: new THREE.Color(cloudColor),
        linewidth: thickness,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        worldUnits: false,
        dashed: false,
        alphaToCoverage: false,
      });
      mat.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "void main() {",
          "void main() {\n  if ( abs( vUv.y ) > 1.0 ) discard;",
        );
      };
      lineMatRegistry.push(mat);
      const line = new Line2(geom, mat);
      line.computeLineDistances();
      scene.add(line);
      return { line, mat, geom, a: edge.a, b: edge.b };
    });
  });

  // Sizing — track the canvas (not window), so the animation fills the
  // hero box even though the canvas is smaller than the viewport.
  function resize(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const m of lineMatRegistry) m.resolution.set(w, h);
    for (const m of horizontalLineMaterials) {/* no-op for basic line */ void m;}
  }
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(canvas);
  resize();

  // Camera controls --------------------------------------------------
  //
  // OrbitControls in rotate-only mode:
  //   - left mouse / pointer drag rotates the view
  //   - mouse wheel + pan disabled (the canvas is decoration, not a
  //     navigable scene)
  //   - single-finger touch disabled so the page can still scroll on
  //     mobile when the user drags over the hero; two-finger touch
  //     rotates instead
  //   - autoRotate provides the idle drift; we pause it during drag
  //     and resume after a beat of stillness
  //
  const controls = new OrbitControls(camera, canvas);
  // Target sits below world origin so the cloud (built around (0,0,0))
  // renders in the upper part of the viewport — roughly ~200px above
  // viewport centre on a desktop-sized hero. Adjust this value to
  // raise or lower the cloud's apparent centre.
  controls.target.set(0, -5, 0);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.6;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.touches = { ONE: null as unknown as THREE.TOUCH, TWO: THREE.TOUCH.ROTATE };
  controls.update();

  const RESUME_AFTER_S = 3.5;
  let lastInteractAt = -Infinity;
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
    lastInteractAt = performance.now() / 1000;
  });
  controls.addEventListener("end", () => {
    lastInteractAt = performance.now() / 1000;
  });

  // Animation loop ----------------------------------------------------
  const SHAPE_DURATION = 5.0;
  const MORPH_DURATION = 0.8;
  const HOLD_DURATION  = SHAPE_DURATION - MORPH_DURATION;
  const LINE_BASE_OPACITY = 1.0;
  const NOISE_AMP = 0.018;

  const smooth = (t: number): number => t * t * (3 - 2 * t);
  const clock = new THREE.Clock();
  let rafId = 0;
  let disposed = false;

  function frame(): void {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);

    const time = clock.getElapsedTime();
    const cycle   = Math.floor(time / SHAPE_DURATION);
    const inCycle = time - cycle * SHAPE_DURATION;

    let t: number;
    if (inCycle < HOLD_DURATION) {
      t = 0;
    } else {
      const raw = (inCycle - HOLD_DURATION) / MORPH_DURATION;
      t = smooth(raw);
    }

    // startIndex shifts the entire morph sequence, so different pages
    // can begin on different shapes.
    const fromIdx = (((cycle + startIndex) % shapes.length) + shapes.length) % shapes.length;
    const toIdx   = (fromIdx + 1) % shapes.length;
    const fromPos = shapes[fromIdx]!.positions;
    const toPos   = shapes[toIdx]!.positions;

    const arr = positionAttr.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const fX = fromPos[i3]!,     fY = fromPos[i3 + 1]!, fZ = fromPos[i3 + 2]!;
      const tX = toPos[i3]!,       tY = toPos[i3 + 1]!,   tZ = toPos[i3 + 2]!;
      const seed = i * 0.137;
      const nx = Math.sin(time * 0.6  + seed)         * NOISE_AMP;
      const ny = Math.sin(time * 0.45 + seed * 1.7)   * NOISE_AMP;
      const nz = Math.sin(time * 0.75 + seed * 2.3)   * NOISE_AMP;
      arr[i3]     = fX + (tX - fX) * t + nx;
      arr[i3 + 1] = fY + (tY - fY) * t + ny;
      arr[i3 + 2] = fZ + (tZ - fZ) * t + nz;
    }
    positionAttr.needsUpdate = true;

    const visibleIdx = t < 0.5 ? fromIdx : toIdx;

    const writePos = (sl: VerticalLineEntry[]): void => {
      for (let k = 0; k < sl.length; k++) {
        const v = sl[k]!;
        const ai = v.a * 3, bi = v.b * 3;
        v.geom.setPositions([
          arr[ai]!, arr[ai + 1]!, arr[ai + 2]!,
          arr[bi]!, arr[bi + 1]!, arr[bi + 2]!,
        ]);
      }
    };
    writePos(verticalLines[fromIdx]!);
    if (toIdx !== fromIdx) writePos(verticalLines[toIdx]!);

    for (let i = 0; i < shapes.length; i++) {
      const op = (i === visibleIdx) ? LINE_BASE_OPACITY : 0;
      const sl = verticalLines[i]!;
      for (let k = 0; k < sl.length; k++) sl[k]!.mat.opacity = op;
      horizontalLineMaterials[i]!.opacity = op;
    }

    // Resume idle auto-rotate once the user has stopped interacting
    // for RESUME_AFTER_S seconds.
    if (!controls.autoRotate &&
        performance.now() / 1000 - lastInteractAt > RESUME_AFTER_S) {
      controls.autoRotate = true;
    }
    controls.update();

    renderer.render(scene, camera);
  }

  frame();

  // Teardown ----------------------------------------------------------
  return function dispose(): void {
    disposed = true;
    cancelAnimationFrame(rafId);
    resizeObs.disconnect();
    controls.dispose();
    renderer.dispose();
    pointsGeom.dispose();
    pointSprite.dispose();
    pointsMat.dispose();
    for (const m of horizontalLineMaterials) m.dispose();
    for (const sl of verticalLines) {
      for (const v of sl) { v.geom.dispose(); v.mat.dispose(); }
    }
    for (const g of collectedFigureGeoms) g.dispose();
    for (const m of collectedFigureMats) m.dispose();
    void figureRoot;
  };
}
