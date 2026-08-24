export type DeliveryStatus = "sent" | "delivered" | "read";

export type MessageStatusRow = {
  userId: string;
  status: DeliveryStatus;
  updatedAt?: string;
};

/** WhatsApp-style aggregate tick from per-recipient statuses (1:1 or group). */
export function aggregateMessageStatus(
  statuses?: MessageStatusRow[],
): DeliveryStatus {
  if (!statuses?.length) return "sent";

  if (statuses.every((s) => s.status === "read")) return "read";
  if (statuses.every((s) => s.status === "sent")) return "sent";
  if (statuses.some((s) => s.status === "delivered" || s.status === "read")) {
    return "delivered";
  }

  return "sent";
}

export function patchMessageStatus(
  statuses: MessageStatusRow[] | undefined,
  userId: string,
  status: DeliveryStatus,
): MessageStatusRow[] {
  const list = [...(statuses ?? [])];
  const idx = list.findIndex((s) => s.userId === userId);

  if (idx >= 0) {
    list[idx] = { ...list[idx], status, updatedAt: new Date().toISOString() };
  } else {
    list.push({ userId, status, updatedAt: new Date().toISOString() });
  }

  return list;
}
