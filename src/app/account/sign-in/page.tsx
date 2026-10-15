"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BrandMark } from "@/components/BrandLogo";

type Method = "sms" | "email";
type Step = "enter" | "code" | "email-sent";

/** Only same-site paths, so a sign-in link can't bounce someone elsewhere. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [methods, setMethods] = useState<{ sms: boolean; email: boolean } | null>(null);
  const [available, setAvailable] = useState(true);
  const [method, setMethod] = useState<Method>("sms");
  const [step, setStep] = useState<Step>("enter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") === "link" ? "That sign-in link has expired or was already used. Ask for a new one." : "");
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.teacher) {
          router.replace(next);
          return;
        }
        setAvailable(Boolean(data.available));
        setMethods(data.methods);
        if (!data.methods?.sms && data.methods?.email) setMethod("email");
      })
      .catch(() => setMethods({ sms: false, email: false }));
  }, [next, router]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function start(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "sms" ? { method, phone } : { method, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setStep(method === "sms" ? "code" : "email-sent");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        if (data.reason === "expired" || data.reason === "too-many-attempts") setCode("");
        return;
      }
      router.replace(next);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const both = methods?.sms && methods?.email;

  return (
    <>
      <Nav />
      <main className="account-shell">
        <div className="admin-login-card account-card">
          <div className="account-card-mark"><BrandMark size={40} /></div>
          <h1 className="admin-login-title">Sign in</h1>
          <p className="admin-login-sub">For teachers using Dolese Tech materials and the Exams Composer.</p>

          {!available ? (
            <div className="admin-error">Sign-in isn&apos;t available yet. Please check back soon.</div>
          ) : (
            <>
              {both && step === "enter" && (
                <div className="account-tabs" role="tablist" aria-label="Sign-in method">
                  {(["sms", "email"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={method === m}
                      className={`account-tab ${method === m ? "active" : ""}`}
                      onClick={() => {
                        setMethod(m);
                        setError("");
                      }}
                    >
                      {m === "sms" ? "Phone" : "Email"}
                    </button>
                  ))}
                </div>
              )}

              {error && <div className="admin-error">{error}</div>}

              {step === "enter" && method === "sms" && (
                <form className="account-form" onSubmit={start}>
                  <label htmlFor="phone">Mobile number</label>
                  <input
                    id="phone"
                    className="admin-login-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0754 312 908"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <p className="account-hint">We&apos;ll text you a 6-digit code.</p>
                  <button type="submit" className="btn-filled admin-login-btn" disabled={busy}>
                    {busy ? "Sending…" : "Send code"}
                  </button>
                </form>
              )}

              {step === "enter" && method === "email" && (
                <form className="account-form" onSubmit={start}>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    className="admin-login-input"
                    type="email"
                    autoComplete="email"
                    placeholder="teacher@school.ac.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="account-hint">We&apos;ll email you a link that signs you in.</p>
                  <button type="submit" className="btn-filled admin-login-btn" disabled={busy}>
                    {busy ? "Sending…" : "Send link"}
                  </button>
                </form>
              )}

              {step === "code" && (
                <form className="account-form" onSubmit={verify}>
                  <label htmlFor="code">Code sent to {phone}</label>
                  <input
                    id="code"
                    ref={codeRef}
                    className="admin-login-input account-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <button type="submit" className="btn-filled admin-login-btn" disabled={busy || code.length !== 6}>
                    {busy ? "Checking…" : "Sign in"}
                  </button>
                  <div className="account-links">
                    <button type="button" className="account-link" onClick={() => start()} disabled={busy}>
                      Send a new code
                    </button>
                    <button
                      type="button"
                      className="account-link"
                      onClick={() => {
                        setStep("enter");
                        setCode("");
                        setError("");
                      }}
                    >
                      Change number
                    </button>
                  </div>
                </form>
              )}

              {step === "email-sent" && (
                <div className="account-sent">
                  <p>
                    We&apos;ve sent a sign-in link to <strong>{email}</strong>. Open it on this device to sign in.
                    It expires in 20 minutes.
                  </p>
                  <button type="button" className="account-link" onClick={() => setStep("enter")}>
                    Use a different address
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
