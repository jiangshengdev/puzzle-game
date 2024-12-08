/**
 * 水平间隙的方向类型。
 */
export type HorizontalGapDirection = "leftConvex" | "rightConvex";

/**
 * 垂直间隙的方向类型。
 */
export type VerticalGapDirection = "topConvex" | "bottomConvex";

/**
 * 间隙的方向类型，包含水平和垂直方向。
 */
export type GapDirection = HorizontalGapDirection | VerticalGapDirection;

/**
 * 描述一个间隙的接口。
 */
export interface Gap {
  direction: GapDirection;
}

/**
 * 描述拼图块四周间隙的接口。
 */
export interface Gaps {
  top: VerticalGapDirection | null;
  left: HorizontalGapDirection | null;
  bottom: VerticalGapDirection | null;
  right: HorizontalGapDirection | null;
}
