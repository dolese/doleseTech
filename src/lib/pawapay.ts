import type { Network } from "./phone";

/**
 * Mobile money through pawaPay — the same account ResultsPortal collects with.
 *
 * Ported from ResultsPortal's pawaPayService, which is live, and it keeps its
 * rule: nothing that arrives unauthenticated is believed. Whether money moved
 * is only ever read from pawaPay over an authenticated call (`checkDeposit`).
 *
 * The account is shared, and pawaPay sends a deposit's callback to the one
 * address registered for the account — ResultsPortal's. So this site does
 * not wait for callbacks at all: the checkout page asks for the status while
 * the teacher approves the prompt, and pending orders are checked again
 * whenever the teacher opens their account.
 *
 *   PAYMENTS_PROVIDER=pawapay   PAWAPAY_API_TOKEN (sandbox or live token)
 *                               PAWAPAY_BASE_URL  https://api.sandbox.pawapay.io
 *                                                 or https://api.pawapay.io (default)
 *   PAYMENTS_PROVIDER=simulate  development only: no money moves. A deposit
 *                               completes after a few seconds; numbers ending
 *                               in 000 fail, so both paths can be tried.
 *
 * https://docs.pawapay.io/v2/api-reference/deposits/initiate-deposit
 */

export type DepositStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface DepositResult {
  status: DepositStatus;
  /** Whole shillings, as pawaPay reports them. */
  amount: number | null;
  currency: string | null;
  /** The operator's own reference, once paid. */
  providerTransactionId: string | null;
  failureReason: string | null;
}

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 20_000;

function provider(): "pawapay" | "simulate" | null {
  const name = process.env.PAYMENTS_PROVIDER?.trim().toLowerCase();
  if (name === "pawapay" && process.env.PAWAPAY_API_TOKEN?.trim()) return "pawapay";
  // Never in production, whatever the setting says: it would give things away.
  if (name === "simulate" && process.env.NODE_ENV !== "production") return "simulate";
  return null;
}

export function paymentsAvailable(): boolean {
  return provider() !== null;
}

/**
 * What the payer sees on the prompt and their statement. pawaPay accepts
 * letters, digits and spaces only, 4 to 22 of them.
 */
export function statementText(text: string): string {
  const clean = text.replace(/[^A-Za-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 22).trim();
  return clean.length >= 4 ? clean : "Dolese Tech";
}

async function call(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<Record<string, unknown>> {
  const base = (process.env.PAWAPAY_BASE_URL?.trim() || "https://api.pawapay.io").replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: init.method,
      headers: {
        authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN?.trim()}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    throw new PaymentError(
      (err as Error)?.name === "AbortError"
        ? "The payment service did not answer in time. Please try again."
        : "The payment service could not be reached. Please try again.",
      502,
    );
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // Not JSON: handled as an error below.
  }
  if (!res.ok) {
    if (res.status === 401) {
      console.error("pawapay: credentials refused (check PAWAPAY_API_TOKEN and PAWAPAY_BASE_URL)");
      throw new PaymentError("Payments are temporarily unavailable.", 503);
    }
    console.error(`pawapay: ${init.method} ${path} → HTTP ${res.status}`, text.slice(0, 500));
    throw new PaymentError("The payment could not be started. Please try again.", 502);
  }
  return json;
}

// Simulated deposits live only in this process, for local development. On
// globalThis because each route is bundled with its own copy of this module.
type Simulated = Map<string, { at: number; amount: number; fail: boolean }>;
const store = globalThis as typeof globalThis & { __doleseSimulatedDeposits?: Simulated };
const simulated: Simulated = (store.__doleseSimulatedDeposits ??= new Map());

/**
 * Ask the payer's phone for the money. The id is ours — the order's id, a
 * UUID — which makes a retry safe: pawaPay treats the same id as one deposit.
 */
export async function startDeposit(opts: {
  depositId: string;
  phone: string;
  network: Network;
  amount: number;
  description: string;
}): Promise<{ depositId: string }> {
  const mode = provider();
  if (!mode) throw new PaymentError("Payments are not set up yet.", 503);
  const { depositId } = opts;
  const amount = Math.trunc(opts.amount);

  if (mode === "simulate") {
    simulated.set(depositId, { at: Date.now(), amount, fail: opts.phone.endsWith("000") });
    return { depositId };
  }

  let json: Record<string, unknown>;
  try {
    json = await call("/v2/deposits", {
      method: "POST",
      body: {
        depositId,
        payer: { type: "MMO", accountDetails: { phoneNumber: opts.phone, provider: opts.network.provider } },
        // A string of whole shillings: TZS takes no decimals here.
        amount: String(amount),
        currency: "TZS",
        customerMessage: statementText(opts.description),
      },
    });
  } catch (err) {
    if (err instanceof PaymentError && /not been configured|not configured to/i.test(err.message)) {
      throw new PaymentError(`Payments from ${opts.network.name} are not available yet. Please use a number on another network.`, 409);
    }
    throw err;
  }

  const status = String(json.status ?? "").toUpperCase();
  if (status !== "ACCEPTED" && status !== "DUPLICATE_IGNORED") {
    const reason = (json.failureReason as { failureMessage?: string; failureCode?: string } | undefined) ?? {};
    const why = reason.failureMessage || reason.failureCode || "";
    console.error(`pawapay: deposit ${depositId} rejected: ${why || JSON.stringify(json).slice(0, 300)}`);
    if (/not been configured|not configured to/i.test(why)) {
      throw new PaymentError(`Payments from ${opts.network.name} are not available yet. Please use a number on another network.`, 409);
    }
    throw new PaymentError("The payment could not be started. Please check the number and try again.", 502);
  }
  return { depositId };
}

/** pawaPay's own answer about a deposit: the only thing that counts. */
export async function checkDeposit(depositId: string): Promise<DepositResult> {
  const mode = provider();
  if (!mode) throw new PaymentError("Payments are not set up yet.", 503);

  if (mode === "simulate") {
    const deposit = simulated.get(depositId);
    if (!deposit) return { status: "FAILED", amount: null, currency: null, providerTransactionId: null, failureReason: "Unknown payment" };
    if (Date.now() - deposit.at < 4000) return { status: "PENDING", amount: null, currency: null, providerTransactionId: null, failureReason: null };
    return deposit.fail
      ? { status: "FAILED", amount: null, currency: null, providerTransactionId: null, failureReason: "The payer did not approve the payment." }
      : { status: "COMPLETED", amount: deposit.amount, currency: "TZS", providerTransactionId: `SIM${depositId.slice(0, 8).toUpperCase()}`, failureReason: null };
  }

  const json = await call(`/v2/deposits/${encodeURIComponent(depositId)}`, { method: "GET" });
  const data = (json.data ?? {}) as Record<string, unknown>;
  const theirs = String(data.status ?? "").toUpperCase();
  const reason = (data.failureReason as { failureMessage?: string; failureCode?: string } | undefined) ?? {};
  return {
    // IN_RECONCILIATION and the rest are pending on purpose: nobody is given
    // anything on a maybe.
    status: theirs === "COMPLETED" ? "COMPLETED" : theirs === "FAILED" ? "FAILED" : "PENDING",
    amount: data.amount == null ? null : Math.trunc(Number(data.amount)),
    currency: data.currency == null ? null : String(data.currency),
    providerTransactionId: data.providerTransactionId ? String(data.providerTransactionId) : null,
    failureReason: reason.failureMessage || reason.failureCode || null,
  };
}
