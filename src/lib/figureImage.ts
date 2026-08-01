/**
 * Self-contained figure rasteriser for the .docx export.
 *
 * docx v8's ImageRun only takes raster data (no SVG), and no image library is
 * available offline — so we draw bar charts, number lines and coordinate graphs
 * into an RGB pixel buffer by hand and encode a PNG using Node's zlib. No native
 * dependencies. Returns null for anything it can't draw, so the caller can fall
 * back to a data table.
 */
import { deflateSync } from "zlib";
import type { Figure } from "./exams";

const NAVY: RGB = [22, 35, 91];
const GREEN: RGB = [30, 158, 72];
const AXIS: RGB = [40, 40, 40];
const GRID: RGB = [210, 214, 222];
const LABEL: RGB = [70, 76, 90];
const WHITE: RGB = [255, 255, 255];

type RGB = [number, number, number];

export interface FigurePng {
  data: Buffer;
  width: number;
  height: number;
}

// ── 5×7 bitmap font ─────────────────────────────────────────────────
const GLYPH: Record<string, string[]> = {
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
  "0": [" ### ", "#   #", "#  ##", "# # #", "##  #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"],
  "3": ["#####", "   # ", "  #  ", "   # ", "    #", "#   #", " ### "],
  "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
  "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
  "6": ["  ## ", " #   ", "#    ", "#### ", "#   #", "#   #", " ### "],
  "7": ["#####", "    #", "   # ", "  #  ", " #   ", " #   ", " #   "],
  "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
  "9": [" ### ", "#   #", "#   #", " ####", "    #", "   # ", " ##  "],
  "-": ["     ", "     ", "     ", "#####", "     ", "     ", "     "],
  ".": ["     ", "     ", "     ", "     ", "     ", "  ## ", "  ## "],
  ",": ["     ", "     ", "     ", "     ", "  ## ", "  ## ", " #   "],
  ":": ["     ", "  ## ", "  ## ", "     ", "  ## ", "  ## ", "     "],
  "/": ["    #", "    #", "   # ", "  #  ", " #   ", "#    ", "#    "],
  "(": ["   # ", "  #  ", " #   ", " #   ", " #   ", "  #  ", "   # "],
  ")": [" #   ", "  #  ", "   # ", "   # ", "   # ", "  #  ", " #   "],
  ">": ["#    ", " #   ", "  #  ", "   # ", "  #  ", " #   ", "#    "],
  A: [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  B: ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
  C: [" ### ", "#   #", "#    ", "#    ", "#    ", "#   #", " ### "],
  D: ["###  ", "#  # ", "#   #", "#   #", "#   #", "#  # ", "###  "],
  E: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
  F: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
  G: [" ### ", "#   #", "#    ", "# ###", "#   #", "#   #", " ### "],
  H: ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  I: [" ### ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
  J: ["  ###", "   # ", "   # ", "   # ", "#  # ", "#  # ", " ##  "],
  K: ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
  L: ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "#   #", "#   #", "#   #", "#   #"],
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  P: ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
  Q: [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", " ## #"],
  R: ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
  S: [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  V: ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
  W: ["#   #", "#   #", "#   #", "#   #", "# # #", "## ##", "#   #"],
  X: ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
  Y: ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
  Z: ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
};

// ── Pixel canvas ────────────────────────────────────────────────────
class Canvas {
  readonly w: number;
  readonly h: number;
  private readonly px: Uint8Array;

  constructor(w: number, h: number, bg: RGB = WHITE) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      this.px[i * 3] = bg[0];
      this.px[i * 3 + 1] = bg[1];
      this.px[i * 3 + 2] = bg[2];
    }
  }

  set(x: number, y: number, c: RGB): void {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= this.w || yi >= this.h) return;
    const i = (yi * this.w + xi) * 3;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
  }

  fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
  }

  line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  dot(x: number, y: number, r: number, c: RGB): void {
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) this.set(x + xx, y + yy, c);
  }

  text(x: number, y: number, str: string, scale: number, c: RGB): void {
    let cx = x;
    for (const raw of str.toUpperCase()) {
      const g = GLYPH[raw] ?? GLYPH[" "];
      for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
        if (g[row][col] === "#") this.fillRect(cx + col * scale, y + row * scale, scale, scale, c);
      }
      cx += 6 * scale;
    }
  }

  static textWidth(str: string, scale: number): number {
    return str.length * 6 * scale - scale;
  }

  toPng(): Buffer {
    return encodePng(this.px, this.w, this.h);
  }
}

// ── PNG encoder (RGB, filter 0, zlib via Node) ──────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(rgb: Uint8Array, w: number, h: number): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  // 10-12: compression, filter, interlace = 0

  const stride = w * 3;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: None
    Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idat = deflateSync(raw);

  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// ── Chart renderers ─────────────────────────────────────────────────
const W = 520;
const H = 340;

function clip(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function title(cv: Canvas, caption: string | undefined): void {
  if (caption?.trim()) cv.text(12, 8, clip(caption.trim(), 44), 2, NAVY);
}

function renderBarChart(fig: Figure): FigurePng | null {
  const labels = fig.labels ?? [];
  const values = fig.values ?? [];
  if (!labels.length || !values.length) return null;

  const cv = new Canvas(W, H);
  title(cv, fig.caption);
  const left = 46, right = W - 20, top = 40, bottom = H - 46;
  const maxV = Math.max(1, ...values.map((v) => Math.abs(v)));

  // y gridlines + value labels
  for (let i = 0; i <= 4; i++) {
    const y = bottom - ((bottom - top) * i) / 4;
    cv.line(left, y, right, y, GRID);
    const val = ((maxV * i) / 4).toFixed(maxV >= 10 ? 0 : 1);
    cv.text(left - Canvas.textWidth(val, 1) - 6, y - 3, val, 1, LABEL);
  }
  cv.line(left, top, left, bottom, AXIS);
  cv.line(left, bottom, right, bottom, AXIS);

  const n = labels.length;
  const slot = (right - left) / n;
  const bw = Math.max(6, slot * 0.6);
  for (let i = 0; i < n; i++) {
    const cx = left + slot * i + slot / 2;
    const bh = ((bottom - top) * Math.abs(values[i] ?? 0)) / maxV;
    cv.fillRect(cx - bw / 2, bottom - bh, bw, bh, NAVY);
    const vlabel = String(values[i] ?? "");
    cv.text(cx - Canvas.textWidth(vlabel, 1) / 2, bottom - bh - 10, vlabel, 1, LABEL);
    const clabel = clip(labels[i], 6);
    cv.text(cx - Canvas.textWidth(clabel, 1) / 2, bottom + 6, clabel, 1, LABEL);
  }
  if (fig.yLabel) cv.text(6, top - 14, clip(fig.yLabel, 20), 1, LABEL);
  return { data: cv.toPng(), width: cv.w, height: cv.h };
}

function renderNumberLine(fig: Figure): FigurePng | null {
  if (typeof fig.min !== "number" || typeof fig.max !== "number" || fig.max <= fig.min) return null;
  const cv = new Canvas(W, 150);
  title(cv, fig.caption);
  const left = 34, right = W - 34, y = 92;
  const map = (v: number) => left + ((right - left) * (v - fig.min!)) / (fig.max! - fig.min!);
  cv.line(left - 8, y, right + 8, y, AXIS);
  // arrowheads
  cv.line(right + 8, y, right, y - 5, AXIS);
  cv.line(right + 8, y, right, y + 5, AXIS);
  cv.line(left - 8, y, left, y - 5, AXIS);
  cv.line(left - 8, y, left, y + 5, AXIS);

  const step = fig.step && fig.step > 0 ? fig.step : (fig.max - fig.min) / 10;
  for (let v = fig.min; v <= fig.max + 1e-9; v += step) {
    const x = map(v);
    cv.line(x, y - 5, x, y + 5, AXIS);
    const lbl = Number.isInteger(v) ? String(v) : v.toFixed(1);
    cv.text(x - Canvas.textWidth(lbl, 1) / 2, y + 12, lbl, 1, LABEL);
  }
  for (const m of fig.marks ?? []) {
    const x = map(m.value);
    cv.dot(x, y, 4, GREEN);
    if (m.label) cv.text(x - Canvas.textWidth(clip(m.label, 8), 1) / 2, y - 20, clip(m.label, 8), 1, NAVY);
  }
  return { data: cv.toPng(), width: cv.w, height: cv.h };
}

function renderCoordinates(fig: Figure): FigurePng | null {
  const xMin = fig.xMin ?? -5, xMax = fig.xMax ?? 5, yMin = fig.yMin ?? -5, yMax = fig.yMax ?? 5;
  if (xMax <= xMin || yMax <= yMin) return null;
  const hasContent = (fig.points?.length ?? 0) > 0 || (fig.segments?.length ?? 0) > 0;
  if (!hasContent) return null;

  const cv = new Canvas(W, H);
  title(cv, fig.caption);
  const left = 40, right = W - 20, top = 34, bottom = H - 30;
  const mx = (x: number) => left + ((right - left) * (x - xMin)) / (xMax - xMin);
  const my = (y: number) => bottom - ((bottom - top) * (y - yMin)) / (yMax - yMin);

  // gridlines at integer steps (bounded)
  const xs = Math.max(1, Math.ceil((xMax - xMin) / 12));
  const ys = Math.max(1, Math.ceil((yMax - yMin) / 12));
  for (let x = Math.ceil(xMin); x <= xMax; x += xs) cv.line(mx(x), top, mx(x), bottom, GRID);
  for (let y = Math.ceil(yMin); y <= yMax; y += ys) cv.line(left, my(y), right, my(y), GRID);
  // axes
  if (xMin <= 0 && xMax >= 0) cv.line(mx(0), top, mx(0), bottom, AXIS);
  if (yMin <= 0 && yMax >= 0) cv.line(left, my(0), right, my(0), AXIS);
  cv.line(left, bottom, right, bottom, AXIS);
  cv.line(left, top, left, bottom, AXIS);

  for (const s of fig.segments ?? []) {
    cv.line(mx(s.x1), my(s.y1), mx(s.x2), my(s.y2), NAVY);
    if (s.label) cv.text(mx((s.x1 + s.x2) / 2) + 4, my((s.y1 + s.y2) / 2) - 8, clip(s.label, 6), 1, NAVY);
  }
  for (const p of fig.points ?? []) {
    cv.dot(mx(p.x), my(p.y), 4, GREEN);
    const lbl = p.label ? clip(p.label, 8) : `(${p.x},${p.y})`;
    cv.text(mx(p.x) + 6, my(p.y) - 10, lbl, 1, NAVY);
  }
  return { data: cv.toPng(), width: cv.w, height: cv.h };
}

/** Render a graphic figure to a PNG, or null if it cannot be drawn. */
export function renderFigurePng(fig: Figure): FigurePng | null {
  try {
    if (fig.type === "barchart") return renderBarChart(fig);
    if (fig.type === "numberline") return renderNumberLine(fig);
    if (fig.type === "coordinates") return renderCoordinates(fig);
    return null; // tables render natively in the doc
  } catch {
    return null;
  }
}
