import { PuzzlePiece } from '../types';

/**
 * Predefined complementary jigsaw tabs for a 3x3 grid:
 * 1 = tab (protrusion)
 * -1 = blank (indentation)
 * 0 = flat boundary
 */
export const PUZZLE_PIECES_CONFIG: PuzzlePiece[] = [
  // Row 0
  { id: 0, row: 0, col: 0, top: 0, right: 1, bottom: 1, left: 0 },
  { id: 1, row: 0, col: 1, top: 0, right: -1, bottom: -1, left: -1 },
  { id: 2, row: 0, col: 2, top: 0, right: 0, bottom: 1, left: 1 },
  // Row 1
  { id: 3, row: 1, col: 0, top: -1, right: 1, bottom: -1, left: 0 },
  { id: 4, row: 1, col: 1, top: 1, right: 1, bottom: 1, left: -1 },
  { id: 5, row: 1, col: 2, top: -1, right: 0, bottom: -1, left: -1 },
  // Row 2
  { id: 6, row: 2, col: 0, top: 1, right: -1, bottom: 0, left: 0 },
  { id: 7, row: 2, col: 1, top: -1, right: 1, bottom: 0, left: 1 },
  { id: 8, row: 2, col: 2, top: 1, right: 0, bottom: 0, left: -1 }
];

/**
 * Generates an SVG path data for a jigsaw puzzle piece of width W and height H.
 * The base rectangle is [0, 0] to [W, H].
 * Tabs protrude outward by approx 18% of dimension, blanks indent inward by approx 18%.
 */
export function generateJigsawPath(w: number, h: number, piece: PuzzlePiece): string {
  const tabW = w * 0.22;
  const tabH = h * 0.22;

  let path = `M 0 0`;

  // Top Edge (from (0,0) to (w,0))
  if (piece.top === 0) {
    path += ` L ${w} 0`;
  } else {
    const sign = piece.top; // 1 = protrudes up (-y), -1 = indents down (+y)
    const midX = w / 2;
    const neckW = tabW * 0.55;
    const headW = tabW;
    const depth = tabH * sign * -1; // -y is up

    path += ` L ${midX - headW * 0.6} 0`;
    path += ` C ${midX - neckW} 0, ${midX - headW} ${depth * 0.4}, ${midX - headW * 0.7} ${depth * 0.8}`;
    path += ` C ${midX - headW * 0.4} ${depth * 1.15}, ${midX + headW * 0.4} ${depth * 1.15}, ${midX + headW * 0.7} ${depth * 0.8}`;
    path += ` C ${midX + headW} ${depth * 0.4}, ${midX + neckW} 0, ${midX + headW * 0.6} 0`;
    path += ` L ${w} 0`;
  }

  // Right Edge (from (w,0) to (w,h))
  if (piece.right === 0) {
    path += ` L ${w} ${h}`;
  } else {
    const sign = piece.right; // 1 = protrudes right (+x), -1 = indents left (-x)
    const midY = h / 2;
    const neckH = tabH * 0.55;
    const headH = tabH;
    const depth = tabW * sign; // +x is right

    path += ` L ${w} ${midY - headH * 0.6}`;
    path += ` C ${w} ${midY - neckH}, ${w + depth * 0.4} ${midY - headH}, ${w + depth * 0.8} ${midY - headH * 0.7}`;
    path += ` C ${w + depth * 1.15} ${midY - headH * 0.4}, ${w + depth * 1.15} ${midY + headH * 0.4}, ${w + depth * 0.8} ${midY + headH * 0.7}`;
    path += ` C ${w + depth * 0.4} ${midY + headH}, ${w} ${midY + neckH}, ${w} ${midY + headH * 0.6}`;
    path += ` L ${w} ${h}`;
  }

  // Bottom Edge (from (w,h) to (0,h))
  if (piece.bottom === 0) {
    path += ` L 0 ${h}`;
  } else {
    const sign = piece.bottom; // 1 = protrudes down (+y), -1 = indents up (-y)
    const midX = w / 2;
    const neckW = tabW * 0.55;
    const headW = tabW;
    const depth = tabH * sign; // +y is down

    path += ` L ${midX + headW * 0.6} ${h}`;
    path += ` C ${midX + neckW} ${h}, ${midX + headW} ${h + depth * 0.4}, ${midX + headW * 0.7} ${h + depth * 0.8}`;
    path += ` C ${midX + headW * 0.4} ${h + depth * 1.15}, ${midX - headW * 0.4} ${h + depth * 1.15}, ${midX - headW * 0.7} ${h + depth * 0.8}`;
    path += ` C ${midX - headW} ${h + depth * 0.4}, ${midX - neckW} ${h}, ${midX - headW * 0.6} ${h}`;
    path += ` L 0 ${h}`;
  }

  // Left Edge (from (0,h) to (0,0))
  if (piece.left === 0) {
    path += ` L 0 0`;
  } else {
    const sign = piece.left; // 1 = protrudes left (-x), -1 = indents right (+x)
    const midY = h / 2;
    const neckH = tabH * 0.55;
    const headH = tabH;
    const depth = tabW * sign * -1; // -x is left

    path += ` L 0 ${midY + headH * 0.6}`;
    path += ` C 0 ${midY + neckH}, ${depth * 0.4} ${midY + headH}, ${depth * 0.8} ${midY + headH * 0.7}`;
    path += ` C ${depth * 1.15} ${midY + headH * 0.4}, ${depth * 1.15} ${midY - headH * 0.4}, ${depth * 0.8} ${midY - headH * 0.7}`;
    path += ` C ${depth * 0.4} ${midY - headH}, 0 ${midY - neckH}, 0 ${midY - headH * 0.6}`;
    path += ` L 0 0`;
  }

  path += ` Z`;
  return path;
}
