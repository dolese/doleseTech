import { termEndLabel } from "./catalog";
import { displayPhone, NETWORKS } from "./phone";
import type { Order } from "./orders";

/** An order as the teacher's own pages show it: nothing internal. */
export function orderView(order: Order) {
  return {
    id: order.id,
    reference: order.reference,
    description: order.description,
    amount: order.amount,
    status: order.status,
    failureReason: order.failureReason,
    phone: displayPhone(order.phone),
    network: NETWORKS.find((n) => n.provider === order.network)?.name ?? order.network,
    until: order.term ? termEndLabel(order.term) : null,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  };
}

export type OrderView = ReturnType<typeof orderView>;
