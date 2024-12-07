export type HorizontalGapDirection = "leftConvex" | "rightConvex";
export type VerticalGapDirection = "topConvex" | "bottomConvex";
export type GapDirection = HorizontalGapDirection | VerticalGapDirection;

export interface Gap {
  direction: GapDirection;
}

export interface Gaps {
  top: VerticalGapDirection | null;
  left: HorizontalGapDirection | null;
  bottom: VerticalGapDirection | null;
  right: HorizontalGapDirection | null;
}
