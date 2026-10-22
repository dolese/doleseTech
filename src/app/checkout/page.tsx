"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BrandMark } from "@/components/BrandLogo";
import { formatTzs, getProduct, saleTerm, termLabel } from "@/lib/catalog";
import { getSubjectBySlug } from "@/lib/education";
import { NETWORKS, networkFor, normalisePhone } from "@/lib/phone";

interface OrderView {
  id: string;
  reference: string;
  description: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "review";
  failureReason: string | null;
  phone: string;
  network: string;
  until: string | null;
}

type Step = "form" | "waiting" | "paid" | "failed" | "slow";

/** Ask about the payment every few seconds for about three minutes. */
const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000;

function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const product = getProduct(params.get("product") ?? "");

  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const started = useRef(0);

  // Signed in? If not, come back here after signing in.
  useEffect(() => {
    const here = `/checkout?product=${encodeURIComponent(params.get("product") ?? "")}`;
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.selling) {
          setError("Payments aren't available yet. Please check back soon.");
          return;
        }
        if (!data.teacher) {
          router.replace(`/account/sign-in?next=${encodeURIComponent(here)}`);
          return;
        }
        if (data.teacher.phone) setPhone(data.teacher.phone);
        setReady(true);
      })
      .catch(() => setError("Could not load your account. Please refresh the page."));
  }, [params, router]);

  // Each step replaces the card's content: bring it into view on a phone.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  // While the payment is pending, keep asking.
  useEffect(() => {
    if (step !== "waiting" || !order) return;
    const timer = setInterval(async () => {
      if (Date.now() - started.current > GIVE_UP_MS) {
        setStep("slow");
        return;
      }
      try {
        const res = await fetch(`/api/checkout/${order.id}`);
        const data = await res.json();
        if (!res.ok) return;
        setOrder(data.order);
        if (data.order.status === "paid") setStep("paid");
        else if (data.order.status === "failed") setStep("failed");
        else if (data.order.status === "review") setStep("slow");
      } catch {
        // A dropped connection on a phone: try again on the next tick.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [step, order]);

  if (!product) {
    return (
      <div className="admin-login-card account-card">
        <h1 className="admin-login-title">Nothing to buy</h1>
        <p className="admin-login-sub">That item isn&apos;t on sale.</p>
        <a className="btn-filled admin-login-btn" href="/pricing">See prices</a>
      </div>
    );
  }

  const msisdn = normalisePhone(phone);
  const network = msisdn ? networkFor(msisdn) : null;
  const subject = product.kind === "pack" ? getSubjectBySlug(product.subject) : null;
  const detail =
    product.kind === "pack"
      ? `${subject?.level ?? ""} · ${subject?.forms ?? ""} · ${termLabel(saleTerm())}`
      : "Never expire · used after your free papers each month";

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setError("");
    if (!msisdn) return setError("Enter a Tanzanian mobile number, such as 0754 123 456.");
    if (!network) return setError(`Use a number on ${NETWORKS.map((n) => n.name).join(", ")}.`);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: product.id, phone: msisdn }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace(`/account/sign-in?next=${encodeURIComponent(`/checkout?product=${product.id}`)}`);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "The payment could not be started.");
      setOrder(data.order);
      started.current = Date.now();
      setStep("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The payment could not be started.");
    } finally {
      setBusy(false);
    }
  }

  const next =
    product.kind === "pack"
      ? { href: `/education/${product.subject}`, label: `Open ${subject?.name ?? "the pack"}` }
      : { href: "/exams/write", label: "Open the Exams Composer" };

  return (
    <div className="admin-login-card account-card checkout-card">
      <div className="account-card-mark"><BrandMark size={40} /></div>

      <div className="checkout-item">
        <div>
          <p className="checkout-item-name">{product.name}</p>
          <p className="checkout-item-detail">{detail}</p>
        </div>
        <p className="checkout-item-price">{formatTzs(product.price)}</p>
      </div>

      {step === "form" && (
        <form className="account-form" onSubmit={pay}>
          <label htmlFor="pay-phone">Mobile money number</label>
          <input
            id="pay-phone"
            className="admin-login-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0754 123 456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!ready || busy}
          />
          <p className="account-hint" aria-live="polite">
            {network ? `${network.name} · a payment prompt will appear on this phone.` : "M-Pesa, Mixx by Yas, Airtel Money or HaloPesa."}
          </p>
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" className="btn-filled admin-login-btn" disabled={!ready || busy}>
            {busy ? "Sending the prompt…" : `Pay ${formatTzs(product.price)}`}
          </button>
          <p className="account-hint checkout-fine">
            By paying you agree to our <a href="/terms">terms</a>.
          </p>
        </form>
      )}

      {step === "waiting" && order && (
        <div className="checkout-state" role="status">
          <div className="checkout-spinner" aria-hidden="true" />
          <h1 className="checkout-title">Check your phone</h1>
          <p>
            Approve the payment of <strong>{formatTzs(order.amount)}</strong> on <strong>{order.phone}</strong> by
            entering your {order.network} PIN.
          </p>
          <p className="account-hint">Reference {order.reference}. Keep this page open; it updates by itself.</p>
        </div>
      )}

      {step === "paid" && order && (
        <div className="checkout-state" role="status">
          <div className="checkout-tick" aria-hidden="true">✓</div>
          <h1 className="checkout-title">Payment received</h1>
          <p>
            {product.kind === "papers"
              ? `${product.papers} papers have been added to your account.`
              : `Your ${subject?.name ?? ""} pack is ready, until ${order.until}.`}
          </p>
          <p className="account-hint">Reference {order.reference}</p>
          <a className="btn-filled admin-login-btn" href={next.href}>{next.label}</a>
          <a className="account-link checkout-center" href="/account">See your account</a>
        </div>
      )}

      {step === "failed" && order && (
        <div className="checkout-state" role="status">
          <h1 className="checkout-title">Payment not completed</h1>
          <div className="admin-error">{order.failureReason ?? "The payment did not go through."}</div>
          <p className="account-hint">No money was taken. You can try again, with the same number or another.</p>
          <button type="button" className="btn-filled admin-login-btn" onClick={() => { setStep("form"); setOrder(null); }}>
            Try again
          </button>
        </div>
      )}

      {step === "slow" && order && (
        <div className="checkout-state" role="status">
          <h1 className="checkout-title">Still waiting for confirmation</h1>
          <p>
            If you approved the payment on {order.phone}, it will appear in your account as soon as the network
            confirms it. You don&apos;t need to pay again.
          </p>
          <p className="account-hint">Reference {order.reference}</p>
          <a className="btn-filled admin-login-btn" href="/account">Go to your account</a>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Nav />
      <main className="account-shell">
        <Suspense fallback={null}>
          <Checkout />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
