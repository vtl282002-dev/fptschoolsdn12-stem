import { PuzzlePiece, ActiveGamePiece } from '../types';

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

/**
  * Computes a deterministic content hash from the image URL/Data URL
  */
export function computeImageContentHash(imageUrl: string): string {
  if (!imageUrl) return 'empty_image';
  const len = imageUrl.length;
  let hash = 0;
  const step = Math.max(1, Math.floor(len / 40));
  for (let i = 0; i < len; i += step) {
    hash = ((hash << 5) - hash) + imageUrl.charCodeAt(i);
    hash |= 0;
  }
  return `v_${Math.abs(hash).toString(36)}_${len}`;
}

/**
 * Loads, decodes and physically slices the 9 jigsaw puzzle pieces from the source image.
 * Each piece gets its own clean PNG dataUrl, gameSessionId, and imageVersion.
 */
export async function generatePuzzleSessionPieces(
  sourceImageUrl: string,
  gameSessionId: string,
  imageVersion: string
): Promise<ActiveGamePiece[]> {
  console.log(`[GameSession] Bắt đầu cắt 9 mảnh ghép cho ván: ${gameSessionId}, phiên bản ảnh: ${imageVersion}`);

  // 1. Tải và giải mã ảnh nguồn
  const img = new Image();
  if (!sourceImageUrl.startsWith('data:')) {
    img.crossOrigin = 'anonymous';
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Không thể tải ảnh nguồn để cắt mảnh ghép.'));
    img.src = sourceImageUrl;
  });

  if (img.decode) {
    try {
      await img.decode();
    } catch {}
  }

  const naturalW = img.naturalWidth || 1200;
  const naturalH = img.naturalHeight || 800;

  // Kích thước chuẩn hóa để cắt mảnh ghép với độ phân giải cao và sắc nét
  const targetW = 600;
  const targetH = Math.max(300, Math.round(targetW / (naturalW / naturalH)));
  const pieceW = targetW / 3;
  const pieceH = targetH / 3;

  // Vẽ ảnh nguồn lên canvas trung gian
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = targetW;
  sourceCanvas.height = targetH;
  const sCtx = sourceCanvas.getContext('2d');
  if (!sCtx) {
    throw new Error('Canvas 2D context không khả dụng');
  }
  sCtx.drawImage(img, 0, 0, targetW, targetH);

  const pieces: ActiveGamePiece[] = [];

  for (const piece of PUZZLE_PIECES_CONFIG) {
    const miniW = 120; // Độ phân giải render sắc nét cho khay và bàn cờ
    const miniH = miniW / (pieceW / pieceH);
    const pathData = generateJigsawPath(miniW, miniH, piece);

    // Bounding box có thêm 25% lề xung quanh cho mấu ghép nhô ra
    const padX = miniW * 0.25;
    const padY = miniH * 0.25;
    const canvasW = Math.ceil(miniW * 1.5);
    const canvasH = Math.ceil(miniH * 1.5);

    const pieceCanvas = document.createElement('canvas');
    pieceCanvas.width = canvasW;
    pieceCanvas.height = canvasH;
    const pCtx = pieceCanvas.getContext('2d');

    if (pCtx) {
      pCtx.save();
      pCtx.translate(padX, padY);

      // Cắt theo đường viền jigsaw chính xác
      const path2d = new Path2D(pathData);
      pCtx.clip(path2d);

      // Vẽ đúng phần ảnh của mảnh này từ sourceCanvas
      pCtx.drawImage(
        sourceCanvas,
        -piece.col * miniW,
        -piece.row * miniH,
        miniW * 3,
        miniH * 3
      );
      pCtx.restore();
    }

    const dataUrl = pieceCanvas.toDataURL('image/png');

    pieces.push({
      id: piece.id,
      row: piece.row,
      col: piece.col,
      config: piece,
      gameSessionId,
      imageVersion,
      dataUrl,
      pathData
    });
  }

  console.log(`[GameSession] Cắt thành công 9 mảnh ghép mới. Phiên bản: ${imageVersion}, GameSessionId: ${gameSessionId}`);
  return pieces;
}
