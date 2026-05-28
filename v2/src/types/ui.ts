/**
 * ui.ts
 *
 * Shared types for layout / section components.
 */

export type PillarVisual =
  | "spatial"
  | "technology"
  | "brand-digital"
  | "content"
  | "time";

/** Identical set of keys, kept distinct so the Approach page's
 *  Dimension visuals can evolve without coupling to the Home Pillars. */
export type DimensionKey = PillarVisual;

export interface Pillar {
  num: string;
  name: string;
  desc: string;
  visual: PillarVisual;
}

export interface Phase {
  num: string;
  name: string;
  desc: string;
}

export interface Stat {
  num: string;
  label: string;
}

export interface PhotoTile {
  src: string;
  alt: string;
  caption?: string;
}
