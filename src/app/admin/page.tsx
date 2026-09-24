"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Nav from "@/components/Nav";
import { BrandMark } from "@/components/BrandLogo";
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

/** The three things this page is for: read the business, work the leads, check the systems. */
type Section = "overview" | "leads" | "systems";

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

interface Systems {
  site: {
    emailConfigured: boolean;
    contactTo: string;
    leadStorage: "postgres" | "file";
    databaseConfigured: boolean;
    databaseReachable: boolean;
    diskWritable: boolean;
  };
  resultsPortal: {
    api: { ok: boolean; ms: number; detail?: string };
    web: { ok: boolean; ms: number; detail?: string };
    adminUrl: string;
  };
  checkedAt: string;
}

type SortKey = "newest" | "oldest" | "name";

/** External consoles, each keeping its own sign-in. */
const CONSOLES = [
  {
    name: "ResultsPortal platform admin",
    desc: "Schools, tenants, support desk and tutorials",
    href: "https://results.dolese.tech",
  },
  { name: "Vercel", desc: "This site: deployments, domains, environment", href: "https://vercel.com/dolese" },
  { name: "Railway", desc: "ResultsPortal API and its Postgres", href: "https://railway.app" },
  { name: "Resend", desc: "Email delivery and logs for both products", href: "https://resend.com/emails" },
  { name: "GitHub", desc: "doleseTech source and deploy history", href: "https://github.com/dolese/doleseTech" },
];

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
  const [draft, setDraft] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [storage, setStorage] = useState<"postgres" | "file" | null>(null);
  const [systems, setSystems] = useState<Systems | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [section, setSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Server error. Check the logs.");
        return;
      }
      const data = await res.json();
      const list: Lead[] = data.leads ?? [];
      setLeads(list);
      setStorage(data.storage ?? null);
      setNoteDrafts(Object.fromEntries(list.map((l) => [l.id, l.note ?? ""])));
      setAuthed(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/systems");
      if (res.ok) setSystems(await res.json());
    } catch {
      /* the systems view degrades to "unknown" on its own */
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchLeads(), fetchSystems()]);
  }, [fetchLeads, fetchSystems]);

  // The session lives in an httpOnly cookie, so ask the server whether we are
  // signed in rather than keeping anything in the page.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session");
        const data = await res.json().catch(() => ({}));
        if (data?.configured === false) {
          setError("Admin is not configured. Set the ADMIN_PASSWORD environment variable.");
        }
        if (data?.authenticated) {
          setAuthed(true);
          await refresh();
        }
      } finally {
        setCheckingSession(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    if (!authed && !checkingSession) inputRef.current?.focus();
  }, [authed, checkingSession]);

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
    if (window.innerWidth <= 900) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [sidebarOpen]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: draft.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not sign in.");
        return;
      }
      setDraft("");
      setAuthed(true);
      await refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setAuthed(false);
    setLeads([]);
    setSystems(null);
    setSection("overview");
  }

  async function patchLead(id: string, patch: { status?: Status; note?: string }) {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      setError("Could not reach the server.");
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
      const dbTime = new Date(b.createdAt).getTime();
      return sortKey === "oldest" ? da - dbTime : dbTime - da;
    });
    return result;
  }, [leads, search, statusFilter, sortKey]);

  const total = leads.length;

  /** Problems worth seeing on the overview, not buried in a systems tab. */
  const alerts = useMemo(() => {
    const list: { level: "warn" | "bad"; text: string }[] = [];
    if (systems) {
      const { site, resultsPortal } = systems;
      if (!site.emailConfigured) {
        list.push({ level: "bad", text: "Email is not configured — enquiry notifications are not being sent." });
      }
      if (!site.databaseConfigured && !site.diskWritable) {
        list.push({
          level: "bad",
          text: "No lead storage on this host. Enquiries exist only as email, and this list stays empty.",
        });
      }
      if (site.databaseConfigured && !site.databaseReachable) {
        list.push({ level: "bad", text: "The database is configured but unreachable." });
      }
      if (!resultsPortal.api.ok) {
        list.push({ level: "bad", text: `ResultsPortal API is not responding (${resultsPortal.api.detail}).` });
      }
      if (!resultsPortal.web.ok) {
        list.push({ level: "warn", text: `results.dolese.tech did not answer (${resultsPortal.web.detail}).` });
      }
    }
    if (stats.counts.new > 0) {
      list.push({
        level: "warn",
        text: `${stats.counts.new} enquir${stats.counts.new === 1 ? "y" : "ies"} still untriaged.`,
      });
    }
    return list;
  }, [systems, stats.counts.new]);

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

  function goTo(next: Section, status?: Status | "all") {
    setSection(next);
    if (status) setStatusFilter(status);
    setSidebarOpen(false);
  }

  if (!authed) {
    return (
      <>
        <Nav />
        <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form className="admin-login-card" onSubmit={handleLogin}>
            <div className="admin-login-icon" aria-hidden="true">🔒</div>
            <h1 className="admin-login-title">Admin Access</h1>
            <p className="admin-login-sub">
              {checkingSession ? "Checking your session…" : "Enter your admin password to continue."}
            </p>
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
            <button type="submit" className="btn-filled admin-login-btn" disabled={loading || checkingSession}>
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
          aria-label="Admin navigation"
        >
          <div className="admin-sidebar-head">
            <div className="admin-sidebar-brand">
              <BrandMark size={22} tone="dark" className="admin-sidebar-mark" />
              <span>Dolese Admin</span>
            </div>
            <button
              type="button"
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <nav className="admin-sidebar-nav">
            <span className="admin-sidebar-heading">Dashboard</span>
            <button
              className={`admin-nav-item ${section === "overview" ? "active" : ""}`}
              onClick={() => goTo("overview")}
            >
              <span>Overview</span>
              {alerts.length > 0 && <span className="admin-nav-count admin-nav-count-alert">{alerts.length}</span>}
            </button>
            <button
              className={`admin-nav-item ${section === "systems" ? "active" : ""}`}
              onClick={() => goTo("systems")}
            >
              <span>Systems</span>
            </button>

            <span className="admin-sidebar-heading">Pipeline</span>
            <button
              className={`admin-nav-item ${section === "leads" && statusFilter === "all" ? "active" : ""}`}
              onClick={() => goTo("leads", "all")}
            >
              <span>All leads</span>
              <span className="admin-nav-count">{total}</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`admin-nav-item ${section === "leads" && statusFilter === s ? "active" : ""}`}
                onClick={() => goTo("leads", s)}
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
            {section === "leads" && (
              <button className="admin-refresh-btn" onClick={exportCsv} disabled={filtered.length === 0}>
                ↓ Export CSV
              </button>
            )}
            <button className="admin-refresh-btn" onClick={refresh} disabled={loading}>
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
                <h1 className="admin-title">
                  {section === "overview" ? "Overview" : section === "leads" ? "Leads" : "Systems"}
                </h1>
              </div>
            </div>
          </div>

          {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

          {/* ── OVERVIEW ─────────────────────────────────── */}
          {section === "overview" && (
            <>
              {alerts.length > 0 && (
                <div className="admin-alerts">
                  {alerts.map((a) => (
                    <div className={`admin-alert admin-alert-${a.level}`} key={a.text}>
                      <span className="admin-alert-dot" aria-hidden="true" />
                      {a.text}
                    </div>
                  ))}
                </div>
              )}

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
                          <div className="admin-chart-bar" style={{ height: `${(d.count / trend.max) * 100}%` }}>
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
                        <button className="admin-pipeline-row" key={s} onClick={() => goTo("leads", s)}>
                          <span className={`admin-badge admin-badge-${s}`}>{STATUS_LABELS[s]}</span>
                          <div className="admin-pipeline-track">
                            <div className={`admin-pipeline-fill admin-fill-${s}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="admin-pipeline-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="admin-panel-title admin-section-h">Latest enquiries</div>
              {leads.length === 0 ? (
                <div className="admin-empty">
                  {storage === "file"
                    ? "No leads yet."
                    : "No leads stored yet. New enquiries appear here as they arrive."}
                </div>
              ) : (
                <div className="admin-recent">
                  {leads.slice(0, 5).map((l) => (
                    <button className="admin-recent-row" key={l.id} onClick={() => goTo("leads", "all")}>
                      <span className={`admin-badge admin-badge-${l.status}`}>{STATUS_LABELS[l.status]}</span>
                      <span className="admin-recent-name">{l.name}</span>
                      <span className="admin-recent-co">{l.company || l.email}</span>
                      <span className="admin-recent-date">{formatDate(l.createdAt)}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── LEADS ────────────────────────────────────── */}
          {section === "leads" && (
            <>
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
                <span className="admin-count">
                  {filtered.length} shown
                  {statusFilter !== "all" && ` · ${STATUS_LABELS[statusFilter]}`}
                </span>
                {storage && (
                  <span className="admin-count admin-count-muted">
                    stored in {storage === "postgres" ? "Postgres" : "a local file"}
                  </span>
                )}
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
                              disabled={
                                savingId === lead.id || (noteDrafts[lead.id] ?? "") === (lead.note ?? "")
                              }
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
            </>
          )}

          {/* ── SYSTEMS ──────────────────────────────────── */}
          {section === "systems" && (
            <>
              <div className="admin-sys-grid">
                <div className="admin-panel">
                  <div className="admin-panel-title">dolese.tech</div>
                  <ul className="admin-sys-list">
                    <SysRow
                      ok={systems?.site.emailConfigured}
                      label="Email delivery (Resend)"
                      value={systems ? (systems.site.emailConfigured ? `to ${systems.site.contactTo}` : "not configured") : "…"}
                    />
                    <SysRow
                      ok={systems ? systems.site.databaseConfigured && systems.site.databaseReachable : undefined}
                      label="Lead database"
                      value={
                        !systems
                          ? "…"
                          : !systems.site.databaseConfigured
                            ? "not configured"
                            : systems.site.databaseReachable
                              ? "Postgres reachable"
                              : "configured but unreachable"
                      }
                    />
                    <SysRow
                      ok={systems?.site.diskWritable}
                      label="Disk storage"
                      value={
                        !systems ? "…" : systems.site.diskWritable ? "writable" : "read-only (expected on Vercel)"
                      }
                      neutral={systems ? !systems.site.diskWritable : false}
                    />
                  </ul>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-title">ResultsPortal</div>
                  <ul className="admin-sys-list">
                    <SysRow
                      ok={systems?.resultsPortal.api.ok}
                      label="API (Railway)"
                      value={systems ? `${systems.resultsPortal.api.detail} · ${systems.resultsPortal.api.ms}ms` : "…"}
                    />
                    <SysRow
                      ok={systems?.resultsPortal.web.ok}
                      label="Web (results.dolese.tech)"
                      value={systems ? `${systems.resultsPortal.web.detail} · ${systems.resultsPortal.web.ms}ms` : "…"}
                    />
                  </ul>
                  <a
                    className="btn-outline admin-sys-cta"
                    href={systems?.resultsPortal.adminUrl ?? "https://results.dolese.tech"}
                    target="_blank"
                    rel="noopener"
                  >
                    Open platform admin →
                  </a>
                </div>
              </div>

              <div className="admin-panel-title admin-section-h">Consoles</div>
              <p className="admin-sys-note">
                Each keeps its own sign-in. ResultsPortal&apos;s admin stays in ResultsPortal, so school
                data never depends on this site&apos;s password.
              </p>
              <div className="admin-console-grid">
                {CONSOLES.map((c) => (
                  <a className="admin-console-card" key={c.name} href={c.href} target="_blank" rel="noopener">
                    <span className="admin-console-name">{c.name}</span>
                    <span className="admin-console-desc">{c.desc}</span>
                    <span className="svc-link">Open →</span>
                  </a>
                ))}
              </div>

              {systems && (
                <p className="admin-sys-note">Checked {formatDate(systems.checkedAt)}.</p>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

function SysRow({
  ok,
  label,
  value,
  neutral = false,
}: {
  ok: boolean | undefined;
  label: string;
  value: string;
  neutral?: boolean;
}) {
  const state = neutral ? "neutral" : ok === undefined ? "unknown" : ok ? "ok" : "bad";
  return (
    <li className="admin-sys-row">
      <span className={`admin-sys-dot admin-sys-${state}`} aria-hidden="true" />
      <span className="admin-sys-label">{label}</span>
      <span className="admin-sys-value">{value}</span>
    </li>
  );
}
