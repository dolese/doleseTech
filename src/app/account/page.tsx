"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatTzs } from "@/lib/catalog";

interface Me {
  phone: string | null;
  email: string | null;
  name: string | null;
  since: string;
}

interface Summary {
  papers: { freeLeft: number; freePerMonth: number; credits: number };
  packs: { subject: string; name: string; termLabel: string; until: string; active: boolean }[];
  orders: {
    id: string;
    reference: string;
    description: string;
    amount: number;
    status: "pending" | "paid" | "failed" | "review";
    failureReason: string | null;
    createdAt: string;
  }[];
}

const STATUS: Record<Summary["orders"][number]["status"], string> = {
  paid: "Paid",
  pending: "Waiting for confirmation",
  failed: "Not completed",
  review: "Being checked",
};

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.teacher) {
          router.replace("/account/sign-in");
          return;
        }
        setMe(data.teacher);
        return fetch("/api/account/summary")
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then(setSummary)
          .catch(() => setSummaryError(true));
      })
      .catch(() => router.replace("/account/sign-in"));
  }, [router]);

  async function signOut() {
    await fetch("/api/account/sign-out", { method: "POST" }).catch(() => {});
    router.replace("/");
  }

  return (
    <>
      <Nav />
      <main className="account-page">
        <header className="account-page-head">
          <h1>Your account</h1>
          {me && <p>{me.phone ?? me.email}</p>}
        </header>

        {!me ? (
          <p className="account-hint">Loading…</p>
        ) : (
          <div className="account-grid">
            <section className="account-panel">
              <h2>Exam papers</h2>
              {summary ? (
                <>
                  <div className="account-stats">
                    <div>
                      <strong>{summary.papers.freeLeft}</strong>
                      <span>of {summary.papers.freePerMonth} free left this month</span>
                    </div>
                    <div>
                      <strong>{summary.papers.credits}</strong>
                      <span>bought papers left</span>
                    </div>
                  </div>
                  <div className="account-actions">
                    <a className="btn-filled" href="/exams/write">Make a paper</a>
                    <a className="btn-outline" href="/checkout?product=papers-10">Buy 10 papers</a>
                  </div>
                </>
              ) : (
                <p className="account-hint">{summaryError ? "Could not load your papers. Please refresh." : "Loading…"}</p>
              )}
            </section>

            <section className="account-panel">
              <h2>Subject packs</h2>
              {summary && summary.packs.length > 0 ? (
                <ul className="account-packs">
                  {summary.packs.map((p) => (
                    <li key={`${p.subject}-${p.termLabel}`} className={p.active ? "" : "is-past"}>
                      <div>
                        <a href={`/education/${p.subject}`}>{p.name}</a>
                        <span>{p.termLabel}</span>
                      </div>
                      <span className="account-pack-until">{p.active ? `Until ${p.until}` : "Ended"}</span>
                    </li>
                  ))}
                </ul>
              ) : summary ? (
                <p className="account-hint">
                  Complete schemes of work, lesson plans and notes for Basic Mathematics and Biology, by term.
                </p>
              ) : null}
              <div className="account-actions">
                <a className="btn-outline" href="/pricing">See packs</a>
              </div>
            </section>

            <section className="account-panel account-panel-wide">
              <h2>Purchases</h2>
              {summary && summary.orders.length > 0 ? (
                <div className="table-scroll">
                  <table className="account-orders">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Item</th>
                        <th className="num">Amount</th>
                        <th>Status</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.orders.map((o) => (
                        <tr key={o.id}>
                          <td>{date(o.createdAt)}</td>
                          <td>{o.description}</td>
                          <td className="num">{formatTzs(o.amount)}</td>
                          <td>
                            <span className={`order-status order-${o.status}`} title={o.failureReason ?? undefined}>
                              {STATUS[o.status]}
                            </span>
                          </td>
                          <td>
                            {o.status === "paid" ? (
                              <a href={`/account/orders/${o.id}`}>{o.reference}</a>
                            ) : (
                              o.reference
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : summary ? (
                <p className="account-hint">Nothing yet. Your purchases and their references will appear here.</p>
              ) : null}
            </section>

            <section className="account-panel account-panel-wide">
              <h2>Details</h2>
              <dl className="account-details">
                {me.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>{me.phone}</dd>
                  </>
                )}
                {me.email && (
                  <>
                    <dt>Email</dt>
                    <dd>{me.email}</dd>
                  </>
                )}
                <dt>Member since</dt>
                <dd>{date(me.since)}</dd>
              </dl>
              <button type="button" className="admin-logout-btn" onClick={signOut}>
                Sign out
              </button>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
