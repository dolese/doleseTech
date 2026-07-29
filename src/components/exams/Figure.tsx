import type { Figure } from "@/lib/exams";

const NAVY = "#16235B";
const GREEN = "#1E9E48";
const GRID = "#DBE2EC";

/** Renders a controlled diagram spec as SVG / an HTML table. Deterministic & safe. */
export default function ExamFigure({ figure }: { figure: Figure }) {
  return (
    <figure className="exam-figure">
      <div className="exam-figure-body">{render(figure)}</div>
      {figure.caption ? <figcaption>{figure.caption}</figcaption> : null}
    </figure>
  );
}

function render(f: Figure) {
  switch (f.type) {
    case "table":
      return renderTable(f);
    case "numberline":
      return renderNumberLine(f);
    case "barchart":
      return renderBar(f);
    case "coordinates":
      return renderCoords(f);
    default:
      return null;
  }
}

function renderTable(f: Figure) {
  const headers = f.headers ?? [];
  const rows = f.rows ?? [];
  return (
    <table className="exam-figure-table">
      {headers.length > 0 && (
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
      )}
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri}>{r.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function renderNumberLine(f: Figure) {
  const min = f.min ?? 0;
  const max = f.max ?? 10;
  const step = f.step && f.step > 0 ? f.step : 1;
  const W = 480, H = 70, padX = 24, y = 34;
  const span = Math.max(1, max - min);
  const x = (v: number) => padX + ((v - min) / span) * (W - 2 * padX);
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1000) / 1000);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="exam-figure-svg" role="img">
      <line x1={padX} y1={y} x2={W - padX} y2={y} stroke={NAVY} strokeWidth={1.6} />
      <polygon points={`${W - padX},${y} ${W - padX - 8},${y - 4} ${W - padX - 8},${y + 4}`} fill={NAVY} />
      <polygon points={`${padX},${y} ${padX + 8},${y - 4} ${padX + 8},${y + 4}`} fill={NAVY} />
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={x(t)} y1={y - 5} x2={x(t)} y2={y + 5} stroke={NAVY} strokeWidth={1.2} />
          <text x={x(t)} y={y + 20} textAnchor="middle" fontSize={11} fill="#41506E">{t}</text>
        </g>
      ))}
      {(f.marks ?? []).map((m, i) => (
        <g key={i}>
          <circle cx={x(m.value)} cy={y} r={5} fill={GREEN} />
          {m.label ? <text x={x(m.value)} y={y - 12} textAnchor="middle" fontSize={11} fill={GREEN} fontWeight="600">{m.label}</text> : null}
        </g>
      ))}
    </svg>
  );
}

function renderBar(f: Figure) {
  const labels = f.labels ?? [];
  const values = f.values ?? [];
  const n = Math.max(labels.length, values.length);
  const W = 460, H = 260, padL = 40, padB = 42, padT = 16, padR = 12;
  const maxV = Math.max(1, ...values);
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const bw = (plotW / Math.max(1, n)) * 0.62;
  const gap = plotW / Math.max(1, n);
  const yFor = (v: number) => padT + plotH - (v / maxV) * plotH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="exam-figure-svg" role="img">
      {/* y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={padT + plotH * (1 - t)} x2={W - padR} y2={padT + plotH * (1 - t)} stroke={GRID} strokeWidth={1} />
          <text x={padL - 6} y={padT + plotH * (1 - t) + 4} textAnchor="end" fontSize={10} fill="#7B879C">{Math.round(maxV * t)}</text>
        </g>
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={NAVY} strokeWidth={1.4} />
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke={NAVY} strokeWidth={1.4} />
      {values.map((v, i) => {
        const bx = padL + gap * i + (gap - bw) / 2;
        return (
          <g key={i}>
            <rect x={bx} y={yFor(v)} width={bw} height={padT + plotH - yFor(v)} fill={GREEN} rx={2} />
            <text x={bx + bw / 2} y={padT + plotH + 14} textAnchor="middle" fontSize={10} fill="#41506E">{labels[i] ?? ""}</text>
            <text x={bx + bw / 2} y={yFor(v) - 4} textAnchor="middle" fontSize={10} fill={NAVY}>{v}</text>
          </g>
        );
      })}
      {f.yLabel ? <text x={12} y={padT + plotH / 2} transform={`rotate(-90 12 ${padT + plotH / 2})`} textAnchor="middle" fontSize={11} fill="#41506E">{f.yLabel}</text> : null}
      {f.xLabel ? <text x={padL + plotW / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#41506E">{f.xLabel}</text> : null}
    </svg>
  );
}

function renderCoords(f: Figure) {
  const xMin = f.xMin ?? -5, xMax = f.xMax ?? 5, yMin = f.yMin ?? -5, yMax = f.yMax ?? 5;
  const W = 300, H = 300, pad = 20;
  const sx = (W - 2 * pad) / Math.max(1, xMax - xMin);
  const sy = (H - 2 * pad) / Math.max(1, yMax - yMin);
  const X = (x: number) => pad + (x - xMin) * sx;
  const Y = (y: number) => H - pad - (y - yMin) * sy;
  const xticks: number[] = [], yticks: number[] = [];
  for (let v = Math.ceil(xMin); v <= xMax; v++) xticks.push(v);
  for (let v = Math.ceil(yMin); v <= yMax; v++) yticks.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="exam-figure-svg" role="img">
      {xticks.map((t, i) => <line key={`gx${i}`} x1={X(t)} y1={pad} x2={X(t)} y2={H - pad} stroke={GRID} strokeWidth={t === 0 ? 0 : 0.8} />)}
      {yticks.map((t, i) => <line key={`gy${i}`} x1={pad} y1={Y(t)} x2={W - pad} y2={Y(t)} stroke={GRID} strokeWidth={t === 0 ? 0 : 0.8} />)}
      {/* axes */}
      <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke={NAVY} strokeWidth={1.4} />
      <line x1={X(0)} y1={pad} x2={X(0)} y2={H - pad} stroke={NAVY} strokeWidth={1.4} />
      {(f.segments ?? []).map((s, i) => (
        <line key={i} x1={X(s.x1)} y1={Y(s.y1)} x2={X(s.x2)} y2={Y(s.y2)} stroke={GREEN} strokeWidth={2} />
      ))}
      {(f.points ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={4} fill={GREEN} />
          <text x={X(p.x) + 6} y={Y(p.y) - 6} fontSize={11} fill={NAVY}>{p.label ?? `(${p.x}, ${p.y})`}</text>
        </g>
      ))}
    </svg>
  );
}
