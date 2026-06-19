"use client";

export default function PrintButton() {
  return (
    <button type="button" className="btn-outline mat-print-btn" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
