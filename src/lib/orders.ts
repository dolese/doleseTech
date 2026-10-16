import { randomBytes, randomUUID } from "node:crypto";
import { db, ensureSchema, type Sql } from "./db";
import { formatTzs, getProduct, saleTerm, termLabel, type Product } from "./catalog";
import { ownsPackTerm } from "./entitlements";
import { networkFor, normalisePhone, displayPhone, NETWORKS } from "./phone";
import { PaymentError, checkDeposit, startDeposit } from "./pawapay";
import { sendSms } from "./sms";
import { sendEmail } from "./email";

/**
 * Orders: a teacher buys a product, pays by mobile money, and gets it.
 *
 *   1. The order is saved first, with an id we choose, and only then is the
 *      payment requested under that same id. Money can never arrive for an
 *      order we do not have.
 *   2. Whether it was paid is read from pawaPay (`refreshOrder`), never from
 *      anything the browser says.
 *   3. Marking it paid and granting the product is one SQL statement, which
 *      only succeeds while the order is still pending. However many times an
 *      order is checked, at the same moment or not, it is granted once.
 */

export type OrderStatus = "pending" | "paid" | "failed" | "review";

export interface Order {
  id: string;
  reference: string;
  teacherId: string;
  product: string;
  description: string;
  amount: number;
  term: string | null;
  phone: string;
  network: string;
  status: OrderStatus;
  failureReason: string | null;
  providerTxn: string | null;
  createdAt: string;
  paidAt: string | null;
}

export class OrderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function requireDb(): Promise<Sql> {
  const sql = db();
  if (!sql) throw new OrderError("Purchases are not available right now.", 503);
  await ensureSchema();
  return sql;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toOrder(r: any): Order {
  return {
    id: String(r.id),
    reference: String(r.reference),
    teacherId: String(r.teacher_id),
    product: String(r.product),
    description: String(r.description),
    amount: Number(r.amount),
    term: r.term ? String(r.term) : null,
    phone: String(r.phone),
    network: String(r.network),
    status: String(r.status) as OrderStatus,
    failureReason: r.failure_reason ? String(r.failure_reason) : null,
    providerTxn: r.provider_txn ? String(r.provider_txn) : null,
    createdAt: new Date(r.created_at).toISOString(),
    paidAt: r.paid_at ? new Date(r.paid_at).toISOString() : null,
  };
}

/** "DT-7K2M9Q": short enough to read out over the phone. No 0/O or 1/I. */
function newReference(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  return "DT-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function describe(product: Product, term: string | null): string {
  return product.kind === "pack" && term ? `${product.name}, ${termLabel(term)}` : product.name;
}

/** Save the order, then ask the payer's phone for the money. */
export async function createOrder(opts: { teacherId: string; productId: string; phone: string }): Promise<Order> {
  const product = getProduct(opts.productId);
  if (!product) throw new OrderError("That product is not on sale.", 404);

  const phone = normalisePhone(opts.phone);
  if (!phone) throw new OrderError("Enter a Tanzanian mobile number, such as 0754 123 456.", 400);
  const network = networkFor(phone);
  if (!network) {
    const names = NETWORKS.map((n) => n.name).join(", ");
    throw new OrderError(`That number can't pay by mobile money here. Use a number on ${names}.`, 400);
  }

  const term = product.kind === "pack" ? saleTerm() : null;
  if (product.kind === "pack" && term && (await ownsPackTerm(opts.teacherId, product.subject, term))) {
    throw new OrderError(`You already have this pack for ${termLabel(term)}.`, 409);
  }

  const sql = await requireDb();
  const id = randomUUID();
  const description = describe(product, term);
  const rows = await sql`
    INSERT INTO orders (id, reference, teacher_id, product, description, amount, term, phone, network)
    VALUES (${id}, ${newReference()}, ${opts.teacherId}, ${product.id}, ${description}, ${product.price},
            ${term}, ${phone}, ${network.provider})
    RETURNING *`;

  try {
    await startDeposit({
      depositId: id,
      phone,
      network,
      amount: product.price,
      description: `Dolese Tech ${rows[0].reference}`,
    });
  } catch (err) {
    const message = err instanceof PaymentError ? err.message : "The payment could not be started. Please try again.";
    await sql`UPDATE orders SET status = 'failed', failure_reason = ${message} WHERE id = ${id}`;
    if (!(err instanceof PaymentError)) console.error("checkout: payment start failed", err);
    throw new OrderError(message, err instanceof PaymentError ? err.status : 502);
  }
  return toOrder(rows[0]);
}

export async function getOrder(id: string): Promise<Order | null> {
  const sql = await requireDb();
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
  return rows[0] ? toOrder(rows[0]) : null;
}

export async function teacherOrders(teacherId: string, limit = 50): Promise<Order[]> {
  const sql = await requireDb();
  const rows = await sql`SELECT * FROM orders WHERE teacher_id = ${teacherId} ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(toOrder);
}

/** Don't ask pawaPay about the same order more often than this. */
const RECHECK_MS = 3000;

/**
 * Ask pawaPay what happened to a pending order, and act on the answer.
 * Returns the order as it now stands.
 */
export async function refreshOrder(order: Order): Promise<Order> {
  if (order.status !== "pending") return order;
  const sql = await requireDb();

  // Claim this check, so that a page polling every few seconds — or two tabs —
  // doesn't turn into a stream of calls to pawaPay.
  const claimed = await sql`
    UPDATE orders SET checked_at = now()
     WHERE id = ${order.id} AND status = 'pending'
       AND (checked_at IS NULL OR checked_at < now() - make_interval(secs => ${RECHECK_MS / 1000}))
    RETURNING id`;
  if (claimed.length === 0) return (await getOrder(order.id)) ?? order;

  let result;
  try {
    result = await checkDeposit(order.id);
  } catch (err) {
    console.error(`checkout: could not check ${order.reference}`, err);
    return order;
  }

  if (result.status === "FAILED") {
    await sql`
      UPDATE orders SET status = 'failed', failure_reason = ${failureMessage(result.failureReason)}
       WHERE id = ${order.id} AND status = 'pending'`;
  } else if (result.status === "COMPLETED") {
    if (result.amount === null || result.amount < order.amount || (result.currency && result.currency !== "TZS")) {
      // Paid, but not what was asked: a person decides, not this code.
      console.error(`checkout: ${order.reference} paid ${result.amount} ${result.currency}, expected ${order.amount} TZS`);
      await sql`
        UPDATE orders SET status = 'review', provider_txn = ${result.providerTransactionId},
               failure_reason = 'The amount received did not match the price.'
         WHERE id = ${order.id} AND status = 'pending'`;
    } else if (await markPaid(order, result.providerTransactionId)) {
      await confirm(order).catch((err) => console.error(`checkout: confirmation for ${order.reference} not sent`, err));
    }
  }
  return (await getOrder(order.id)) ?? order;
}

/** What the teacher is told when a payment fails, in words they can act on. */
function failureMessage(reason: string | null): string {
  const r = (reason ?? "").toLowerCase();
  if (/insufficient|balance|funds/.test(r)) return "There was not enough money in the mobile money account.";
  if (/declined|reject|cancel|not approve|timeout|expired/.test(r)) return "The payment was not approved on the phone.";
  return "The payment did not go through.";
}

/**
 * Mark the order paid and grant what was bought, in one statement. True only
 * for the call that actually did it.
 */
async function markPaid(order: Order, providerTxn: string | null): Promise<boolean> {
  const sql = await requireDb();
  const product = getProduct(order.product);
  if (!product) {
    console.error(`checkout: ${order.reference} is for an unknown product ${order.product}`);
    await sql`UPDATE orders SET status = 'review', failure_reason = 'Unknown product.' WHERE id = ${order.id} AND status = 'pending'`;
    return false;
  }

  const rows =
    product.kind === "papers"
      ? await sql`
          WITH paid AS (
            UPDATE orders SET status = 'paid', paid_at = now(), provider_txn = ${providerTxn}
             WHERE id = ${order.id} AND status = 'pending'
            RETURNING teacher_id
          ), granted AS (
            INSERT INTO paper_balances (teacher_id, credits)
            SELECT teacher_id, ${product.papers} FROM paid
            ON CONFLICT (teacher_id) DO UPDATE SET credits = paper_balances.credits + EXCLUDED.credits
            RETURNING teacher_id
          )
          SELECT (SELECT count(*) FROM paid) AS done`
      : await sql`
          WITH paid AS (
            UPDATE orders SET status = 'paid', paid_at = now(), provider_txn = ${providerTxn}
             WHERE id = ${order.id} AND status = 'pending'
            RETURNING teacher_id, term
          ), granted AS (
            INSERT INTO subject_access (teacher_id, subject, term, order_id)
            SELECT teacher_id, ${product.subject}, term, ${order.id} FROM paid
            ON CONFLICT (teacher_id, subject, term) DO NOTHING
            RETURNING teacher_id
          )
          SELECT (SELECT count(*) FROM paid) AS done`;
  return Number(rows[0]?.done) > 0;
}

/** Tell the teacher the payment arrived: by SMS to their account phone, or by email. */
async function confirm(order: Order): Promise<void> {
  const sql = await requireDb();
  const rows = await sql`SELECT phone, email FROM teachers WHERE id = ${order.teacherId}`;
  const teacher = rows[0];
  if (!teacher) return;
  const line = `${formatTzs(order.amount)} for ${order.description}`;
  if (teacher.phone) {
    await sendSms(
      String(teacher.phone),
      `Dolese Tech: payment received, ${line}. Ref ${order.reference}. Thank you!`,
    );
  } else if (teacher.email) {
    await sendEmail({
      to: String(teacher.email),
      subject: `Payment received: ${order.reference}`,
      text: [
        "Thank you for your purchase from Dolese Tech.",
        "",
        `Reference: ${order.reference}`,
        `Item: ${order.description}`,
        `Amount: ${formatTzs(order.amount)}`,
        `Paid from: ${displayPhone(order.phone)}`,
        "",
        "You can see your purchases at any time in your account: https://dolese.tech/account",
      ].join("\n"),
    });
  }
}

/** Check a teacher's recent pending orders, for payers who closed the page early. */
export async function refreshPendingFor(teacherId: string): Promise<void> {
  const sql = await requireDb();
  const rows = await sql`
    SELECT * FROM orders
     WHERE teacher_id = ${teacherId} AND status = 'pending' AND created_at > now() - interval '2 days'
     ORDER BY created_at DESC LIMIT 3`;
  for (const row of rows) await refreshOrder(toOrder(row));
}

// ── Admin ───────────────────────────────────────────────────────────────────

export interface SalesSummary {
  orders: (Order & { teacher: string })[];
  totals: { paidCount: number; paidAmount: number; last30Amount: number; pending: number; review: number };
}

export async function salesSummary(limit = 200): Promise<SalesSummary> {
  const sql = await requireDb();
  const rows = await sql`
    SELECT o.*, COALESCE(t.phone, t.email, '') AS teacher_contact
      FROM orders o JOIN teachers t ON t.id = o.teacher_id
     ORDER BY o.created_at DESC LIMIT ${limit}`;
  const totals = await sql`
    SELECT count(*) FILTER (WHERE status = 'paid') AS paid_count,
           COALESCE(sum(amount) FILTER (WHERE status = 'paid'), 0) AS paid_amount,
           COALESCE(sum(amount) FILTER (WHERE status = 'paid' AND paid_at > now() - interval '30 days'), 0) AS last30,
           count(*) FILTER (WHERE status = 'pending') AS pending,
           count(*) FILTER (WHERE status = 'review') AS review
      FROM orders`;
  const t = totals[0];
  return {
    orders: rows.map((r) => {
      const contact = String(r.teacher_contact);
      return { ...toOrder(r), teacher: /^255\d{9}$/.test(contact) ? displayPhone(contact) : contact };
    }),
    totals: {
      paidCount: Number(t.paid_count),
      paidAmount: Number(t.paid_amount),
      last30Amount: Number(t.last30),
      pending: Number(t.pending),
      review: Number(t.review),
    },
  };
}
