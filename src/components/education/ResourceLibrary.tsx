"use client";

import { useMemo, useState } from "react";
import { SUBJECTS, MATERIAL_TYPES, type Level } from "@/lib/education";

type Filter = "All" | Level;
const FILTERS: Filter[] = ["All", "O-Level", "A-Level"];

export default function ResourceLibrary() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUBJECTS.filter((s) => {
      const matchesLevel = filter === "All" || s.level === filter;
      const matchesQuery = q === "" || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div>
      <div className="edu-filters">
        <div className="edu-pills">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`edu-pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
              type="button"
            >
              {f}
            </button>
          ))}
        </div>
        <div className="edu-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search a subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search subjects"
          />
        </div>
      </div>

      <p className="edu-count">
        {results.length} {results.length === 1 ? "subject" : "subjects"}
        {filter !== "All" ? ` · ${filter}` : ""}
      </p>

      {results.length === 0 ? (
        <p className="edu-empty">No subjects match “{query}”. Try another search.</p>
      ) : (
        <div className="subject-grid">
          {results.map((s, i) => (
            <article className="subject-card" key={`${s.level}-${s.code}-${i}`}>
              <div className="subject-card-top">
                <span className="subj-code" style={{ background: s.color }}>
                  {s.code}
                </span>
                <span className={`subj-level ${s.level === "A-Level" ? "is-alevel" : ""}`}>{s.level}</span>
              </div>
              <h3 className="subj-name">{s.name}</h3>
              <p className="subj-meta">
                {s.forms} · {s.topics} topics
              </p>
              <ul className="subj-materials">
                {MATERIAL_TYPES.map((m) => (
                  <li key={m}>
                    <span className="subj-dot" />
                    {m}
                  </li>
                ))}
              </ul>
              <a href="#samples" className="subj-link">
                View materials →
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
