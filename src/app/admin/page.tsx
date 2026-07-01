"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  createdAt: string;
  ip?: string;
  status: Status;
  note: string;
  statusUpdatedAt?: string | null;
}

type SortKey = "newest" | "oldest" | "name";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchLeads(pw: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("Wrong password. Try again.");
        setAuthed(false);
        sessionStorage.removeItem("admin_pw");
        setPassword("");
        return;
      }
      if (res.status === 503) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Admin is not configured.");
        return;
      }
      if (!res.ok) {
        setError("Server error. Check logs.");
        return;
      }
      const data = await res.json();
      const list: Lead[] = data.leads ?? [];
      setLeads(list);
      setTotal(data.total ?? 0);
      setNoteDrafts(Object.fromEntries(list.map((l) => [l.id, l.note ?? ""])));
      setAuthed(true);
      sessionStorage.setItem("admin_pw", pw);
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw") ?? "";
    if (saved) {
      setPassword(saved);
      fetchLeads(saved);
    } else {
      inputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 900) setSidebarOpen(false);
    };

    if (window.innerWidth <= 900) {
      document.body.style.overflow = "hidden";
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [sidebarOpen]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPassword(draft.trim());
    fetchLeads(draft.trim());
  }

  function logout() {
    sessionStorage.removeItem("admin_pw");
    setPassword("");
    setDraft("");
    setAuthed(false);
    setLeads([]);
  }

  async function patchLead(id: string, patch: { status?: Status; note?: string }) {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        setError("Could not save changes.");
        return;
      }
      const meta = await res.json();
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: meta.status, note: meta.note, statusUpdatedAt: meta.updatedAt }
            : l,
        ),
      );
    } catch {
      setError("Could not reach server.");
    } finally {
      setSavingId(null);
    }
  }

  // ── Derived analytics ───────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const week = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const counts: Record<Status, number> = { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 };
    let last7 = 0;
    for (const l of leads) {
      counts[l.status] = (counts[l.status] ?? 0) + 1;
      if (new Date(l.createdAt) >= week) last7 += 1;
    }
    const decided = counts.won + counts.lost;
    const conversion = decided > 0 ? Math.round((counts.won / decided) * 100) : 0;
    return { counts, last7, conversion };
  }, [leads]);

  // 14-day trend of incoming leads.
  const trend = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = leads.filter((l) => {
        const d = new Date(l.createdAt);
        return d >= day && d < next;
      }).length;
      days.push({ label: day.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), count });
    }
    const max = Math.max(1, ...days.map((d) => d.count));
    return { days, max };
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = leads.filter((l) => {
      const matchesQuery =
        !q ||
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.message?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    result.sort((a, b) => {
      if (sortKey === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortKey === "oldest" ? da - db : db - da;
    });
    return result;
  }, [leads, search, statusFilter, sortKey]);

  function exportCsv() {
    const headers = ["id", "name", "email", "company", "phone", "status", "createdAt", "note", "message"];
    const rows = filtered.map((l) =>
      [l.id, l.name, l.email, l.company, l.phone, l.status, l.createdAt, l.note, l.message]
        .map(csvEscape)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) {
    return (
      <>
        <Nav />
        <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form className="admin-login-card" onSubmit={handleLogin}>
            <div className="admin-login-icon" aria-hidden="true">🔒</div>
            <h1 className="admin-login-title">Admin Access</h1>
            <p className="admin-login-sub">Enter your admin password to view leads.</p>
            {error && <div className="admin-error">{error}</div>}
            <input
              ref={inputRef}
              type="password"
              className="admin-login-input"
              placeholder="Password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="submit" className="btn-filled admin-login-btn" disabled={loading}>
              {loading ? "Checking…" : "Sign in"}
            </button>
          </form>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="admin-shell">
        <aside
          id="admin-sidebar"
          className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
          aria-label="Lead dashboard navigation"
        >
          <div className="admin-sidebar-head">
            <div className="admin-sidebar-brand">
              <span className="admin-sidebar-dot" />
              <span>Dolese Admin</span>
            </div>
            <button
              type="button"
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close dashboard menu"
            >
              ×
            </button>
          </div>

          <nav className="admin-sidebar-nav">
            <span className="admin-sidebar-heading">Pipeline</span>
            <button
              className={`admin-nav-item ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => {
                setStatusFilter("all");
                setSidebarOpen(false);
              }}
            >
              <span>All leads</span>
              <span className="admin-nav-count">{leads.length}</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`admin-nav-item ${statusFilter === s ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(s);
                  setSidebarOpen(false);
                }}
              >
                <span className="admin-nav-label">
                  <span className={`admin-nav-dot admin-fill-${s}`} />
                  {STATUS_LABELS[s]}
                </span>
                <span className="admin-nav-count">{stats.counts[s]}</span>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <button className="admin-refresh-btn" onClick={exportCsv} disabled={filtered.length === 0}>
              ↓ Export CSV
            </button>
            <button className="admin-refresh-btn" onClick={() => fetchLeads(password)} disabled={loading}>
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
            <button className="admin-logout-btn" onClick={logout}>Sign out</button>
          </div>
        </aside>

        {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

        <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-menu-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div>
              <div className="tag">Admin</div>
              <h1 className="admin-title">Lead Dashboard</h1>
            </div>
          </div>
        </div>

        {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-num">{total}</span>
            <span className="admin-stat-label">Total leads</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{stats.counts.new}</span>
            <span className="admin-stat-label">Untriaged</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{stats.last7}</span>
            <span className="admin-stat-label">Last 7 days</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{stats.counts.won}</span>
            <span className="admin-stat-label">Won</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{stats.conversion}%</span>
            <span className="admin-stat-label">Win rate</span>
          </div>
        </div>

        <div className="admin-panels">
          <div className="admin-panel">
            <div className="admin-panel-title">Leads · last 14 days</div>
            <div className="admin-chart">
              {trend.days.map((d, i) => (
                <div className="admin-chart-col" key={i} title={`${d.label}: ${d.count}`}>
                  <div className="admin-chart-bar-wrap">
                    <div
                      className="admin-chart-bar"
                      style={{ height: `${(d.count / trend.max) * 100}%` }}
                    >
                      {d.count > 0 && <span className="admin-chart-val">{d.count}</span>}
                    </div>
                  </div>
                  <span className="admin-chart-label">{d.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-title">Pipeline</div>
            <div className="admin-pipeline">
              {STATUSES.map((s) => {
                const count = stats.counts[s];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div className="admin-pipeline-row" key={s}>
                    <span className={`admin-badge admin-badge-${s}`}>{STATUS_LABELS[s]}</span>
                    <div className="admin-pipeline-track">
                      <div className={`admin-pipeline-fill admin-fill-${s}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="admin-pipeline-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-search"
            placeholder="Search name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="admin-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        <div className="admin-count-row">
          <span className="admin-count">{filtered.length} shown</span>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            {total === 0
              ? "No leads yet. Check back after someone fills out the contact form."
              : "No leads match your filters."}
          </div>
        ) : (
          <div className="admin-leads">
            {filtered.map((lead) => (
              <div
                key={lead.id}
                className={`admin-lead-card ${expanded === lead.id ? "admin-lead-expanded" : ""}`}
              >
                <button
                  className="admin-lead-summary"
                  onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                >
                  <div className="admin-lead-avatar">{(lead.name ?? "?")[0].toUpperCase()}</div>
                  <div className="admin-lead-info">
                    <div className="admin-lead-name">
                      {lead.name}
                      <span className={`admin-badge admin-badge-${lead.status}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </div>
                    <div className="admin-lead-meta">
                      <a
                        href={`mailto:${lead.email}`}
                        className="admin-lead-email"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lead.email}
                      </a>
                      {lead.company && <span className="admin-lead-company">· {lead.company}</span>}
                    </div>
                  </div>
                  <div className="admin-lead-right">
                    <span className="admin-lead-date">{formatDate(lead.createdAt)}</span>
                    <span className="admin-lead-chevron">{expanded === lead.id ? "▲" : "▼"}</span>
                  </div>
                </button>
                {expanded === lead.id && (
                  <div className="admin-lead-body">
                    <div className="admin-lead-field admin-lead-field-row">
                      <span className="admin-lead-field-label">Status</span>
                      <select
                        className="admin-select admin-status-select"
                        value={lead.status}
                        disabled={savingId === lead.id}
                        onChange={(e) => patchLead(lead.id, { status: e.target.value as Status })}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                    {lead.phone && (
                      <div className="admin-lead-field">
                        <span className="admin-lead-field-label">Phone</span>
                        <a href={`tel:${lead.phone}`} className="admin-lead-email">{lead.phone}</a>
                      </div>
                    )}
                    <div className="admin-lead-field">
                      <span className="admin-lead-field-label">Message</span>
                      <p className="admin-lead-message">{lead.message}</p>
                    </div>
                    <div className="admin-lead-field">
                      <span className="admin-lead-field-label">Internal note</span>
                      <textarea
                        className="admin-note"
                        rows={2}
                        placeholder="Add a private note…"
                        value={noteDrafts[lead.id] ?? ""}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))
                        }
                      />
                      <button
                        className="admin-refresh-btn admin-note-save"
                        disabled={savingId === lead.id || (noteDrafts[lead.id] ?? "") === (lead.note ?? "")}
                        onClick={() => patchLead(lead.id, { note: noteDrafts[lead.id] ?? "" })}
                      >
                        {savingId === lead.id ? "Saving…" : "Save note"}
                      </button>
                    </div>
                    <div className="admin-lead-field admin-lead-field-row">
                      <span className="admin-lead-field-label">ID</span>
                      <span className="admin-lead-id">{lead.id}</span>
                    </div>
                    <div className="admin-lead-actions">
                      <a
                        href={`mailto:${lead.email}?subject=Re: Your enquiry to Dolese Tech`}
                        className="btn-filled"
                        style={{ fontSize: "0.85rem", padding: "8px 18px" }}
                      >
                        Reply by email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
      <Footer />
    </>
  );
}
