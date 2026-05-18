"use client";

import { HubActionCard } from "@/components/hub/hubUi";
import { Plus } from "lucide-react";

export function RequestsNewTicketLink({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <HubActionCard
      href="/requests/new"
      icon={Plus}
      title={title}
      description={description}
      tone="blue"
    />
  );
}
