import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandLogo";
import PrintButton from "@/components/education/PrintButton";
import { formatTzs } from "@/lib/catalog";
import { getOrder } from "@/lib/orders";
import { orderView } from "@/lib/orderView";
import { SESSION_COOKIE, readSession } from "@/lib/teacherAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment confirmation — Dolese Tech", robots: { index: false } };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Dar_es_Salaam",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * A printable confirmation of one paid order. Deliberately not called a
 * receipt: a tax receipt in Tanzania is issued through TRA's systems.
 */
export default async function OrderPage({ params }: { params: { id: string } }) {
  const teacherId = readSession(cookies().get(SESSION_COOKIE)?.value);
  if (!teacherId) redirect(`/account/sign-in?next=${encodeURIComponent(`/account/orders/${params.id}`)}`);

  const order = await getOrder(params.id).catch(() => null);
  if (!order || order.teacherId !== teacherId || order.status !== "paid") notFound();
  const view = orderView(order);

  return (
    <main className="confirmation">
      <div className="confirmation-sheet">
        <header className="confirmation-head">
          <BrandMark size={44} />
          <div>
            <h1>Payment confirmation</h1>
            <p>Dolese Tech · dolese.tech</p>
          </div>
        </header>
        <dl className="confirmation-rows">
          <dt>Reference</dt>
          <dd>{view.reference}</dd>
          <dt>Item</dt>
          <dd>{view.description}</dd>
          {view.until && (
            <>
              <dt>Access until</dt>
              <dd>{view.until}</dd>
            </>
          )}
          <dt>Amount paid</dt>
          <dd className="confirmation-amount">{formatTzs(view.amount)}</dd>
          <dt>Paid by</dt>
          <dd>
            {view.network}, {view.phone}
          </dd>
          {order.providerTxn && (
            <>
              <dt>Network reference</dt>
              <dd>{order.providerTxn}</dd>
            </>
          )}
          <dt>Paid on</dt>
          <dd>{when(view.paidAt ?? view.createdAt)}</dd>
        </dl>
        <p className="confirmation-note">Thank you. Keep this reference if you need to contact us about this payment.</p>
        <div className="confirmation-actions">
          <PrintButton />
          <a className="btn-outline" href="/account">Back to your account</a>
        </div>
      </div>
    </main>
  );
}
