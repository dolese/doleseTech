"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  createdAt: string;
  ip?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
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

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.message?.toLowerCase().includes(q)
    );
  });

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
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <div className="tag">Admin</div>
            <h1 className="admin-title">Lead Inbox</h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-refresh-btn" onClick={() => fetchLeads(password)} disabled={loading}>
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
            <button className="admin-logout-btn" onClick={logout}>Sign out</button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-num">{total}</span>
            <span className="admin-stat-label">Total leads</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">
              {leads.filter((l) => {
                const d = new Date(l.createdAt);
                const now = new Date();
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              }).length}
            </span>
            <span className="admin-stat-label">This month</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">
              {leads.filter((l) => {
                const d = new Date(l.createdAt);
                const now = new Date();
                const week = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                return d >= week;
              }).length}
            </span>
            <span className="admin-stat-label">Last 7 days</span>
          </div>
        </div>

        <div className="admin-search-row">
          <input
            type="search"
            className="admin-search"
            placeholder="Search name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="admin-count">
            {filtered.length} of {total}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            {total === 0
              ? "No leads yet. Check back after someone fills out the contact form."
              : "No leads match your search."}
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
                    <div className="admin-lead-name">{lead.name}</div>
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
      <Footer />
    </>
  );
}
