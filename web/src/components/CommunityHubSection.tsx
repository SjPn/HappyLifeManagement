"use client";

import {
  HubActionCard,
  HubSection,
  HubStatTile,
  HubStatsRow,
} from "@/components/hub/hubUi";
import { useNotifications } from "@/components/NotificationProvider";
import type { CommunityHubStats } from "@/lib/hubStats";
import type { NotificationCounts } from "@/lib/notifications";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Megaphone,
  Users,
} from "lucide-react";
import type { HubAccentTone } from "@/components/hub/hubUi";

type CountKey = keyof Pick<
  NotificationCounts,
  "news" | "board" | "forum" | "messages"
>;

const itemMeta: Record<
  CountKey | "residents",
  { icon: LucideIcon; tone: HubAccentTone }
> = {
  news: { icon: Newspaper, tone: "blue" },
  board: { icon: Megaphone, tone: "amber" },
  forum: { icon: MessagesSquare, tone: "violet" },
  messages: { icon: MessageCircle, tone: "cyan" },
  residents: { icon: Users, tone: "emerald" },
};

export function CommunityHubSection({
  stats,
  items,
}: {
  stats: CommunityHubStats;
  items: {
    href: string;
    title: string;
    desc: string;
    countKey?: CountKey;
    id: keyof typeof itemMeta;
  }[];
}) {
  const t = useTranslations("community.hubStats");
  const { counts } = useNotifications();

  return (
  <>
      <HubStatsRow>
        <HubStatTile
          href="/messages"
          value={stats.messages}
          label={t("messages")}
          highlight={stats.messages > 0}
        />
        <HubStatTile href="/community/forum" value={stats.forumTopics} label={t("forum")} />
        <HubStatTile href="/community/board" value={stats.board} label={t("board")} />
        <HubStatTile href="/community/news" value={stats.newsPosts} label={t("news")} />
      </HubStatsRow>

      <HubSection title={t("sectionLinks")} className="!mt-6">
        {items.map((item) => {
          const meta = itemMeta[item.id];
          const badge = item.countKey ? counts[item.countKey] : 0;
          return (
            <HubActionCard
              key={item.href}
              href={item.href}
              icon={meta.icon}
              title={item.title}
              description={item.desc}
              badge={badge}
              tone={meta.tone}
            />
          );
        })}
      </HubSection>
    </>
  );
}
