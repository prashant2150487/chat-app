import { Check, CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DeliveryStatus } from "@/lib/message-status";

type MessageStatusTicksProps = {
  status: DeliveryStatus;
  className?: string;
};

export function MessageStatusTicks({ status, className }: MessageStatusTicksProps) {
  const color =
    status === "read"
      ? "text-[#53bdeb]"
      : "text-muted-foreground/80";

  if (status === "sent") {
    return (
      <Check
        className={cn("size-[14px] shrink-0", color, className)}
        strokeWidth={2.5}
        aria-label="Sent"
      />
    );
  }

  return (
    <CheckCheck
      className={cn("size-[14px] shrink-0", color, className)}
      strokeWidth={2.5}
      aria-label={status === "read" ? "Read" : "Delivered"}
    />
  );
}
