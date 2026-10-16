"use client";

import { useCallback, useEffect, useState } from "react";
import { formatTzs } from "@/lib/catalog";

interface SalesOrder {
  id: string;
  reference: string;
  teacher: string;
  description: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "review";
  failureReason: string | null;
  providerTxn: string | null;
  createdAt: string;
}

interface Sales {
  configured: boolean;
  paymentsAvailable: boolean;
  orders?: SalesOrder[];
  totals?: { paidCount: number; paidAmount: number; last30Amount: number; pending: number; review: number };
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Admin → Sales: what was bought, by whom, and anything that needs a look. */
export default function SalesPanel() {
  const [sales, setSales] = useState<Sales | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sales");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSales(await res.json());
      setError("");
    } catch {
      setError("Could not load sales.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function recheck(id: string) {
    setChecking(id);
    await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    setChecking(null);
    load();
  }

  if (error) return <div className="admin-error">{error}</div>;
  if (!sales) return <p className="sales-empty">Loading…</p>;
  if (!sales.configured) return <p className="sales-empty">Sales need the database to be configured.</p>;
  const t = sales.totals!;
  const orders = sales.orders ?? [];

  return (
    <>
      {!sales.paymentsAvailable && (
        <div className="admin-alerts">
          <div className="admin-alert admin-alert-warn">
            <span className="admin-alert-dot" aria-hidden="true" />
            Payments are off. Set PAYMENTS_PROVIDER=pawapay and PAWAPAY_API_TOKEN to take payments.
          </div>
        </div>
      )}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-num sales-money">{formatTzs(t.paidAmount)}</span>
          <span className="admin-stat-label">All sales</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num sales-money">{formatTzs(t.last30Amount)}</span>
          <span className="admin-stat-label">Last 30 days</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{t.paidCount}</span>
          <span className="admin-stat-label">Paid orders</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{t.pending}</span>
          <span className="admin-stat-label">Pending</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{t.review}</span>
          <span className="admin-stat-label">Need review</span>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-title">Orders</div>
        {orders.length === 0 ? (
          <p className="sales-empty">No orders yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Reference</th>
                  <th>Teacher</th>
                  <th>Item</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{when(o.createdAt)}</td>
                    <td title={o.providerTxn ?? undefined}>{o.reference}</td>
                    <td>{o.teacher}</td>
                    <td>{o.description}</td>
                    <td className="num">{formatTzs(o.amount)}</td>
                    <td>
                      <span className={`order-status order-${o.status}`} title={o.failureReason ?? undefined}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {o.status === "pending" && (
                        <button className="sales-check" onClick={() => recheck(o.id)} disabled={checking === o.id}>
                          {checking === o.id ? "Checking…" : "Check now"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
