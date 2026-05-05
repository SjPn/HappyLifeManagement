"use client";

import { deleteBoardPost } from "@/actions/board";
import { deleteForumTopic } from "@/actions/forum";
import { deleteVote } from "@/actions/votes";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

function DangerButton(props: {
  label: string;
  onClick: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (!confirm(props.label + "?")) return;
        setLoading(true);
        try {
          await props.onClick();
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
    >
      {loading ? "…" : props.label}
    </button>
  );
}

export function DeleteBoardPostButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("moderation");
  return (
    <DangerButton
      label={t("delete")}
      onClick={async () => {
        await deleteBoardPost(id);
        router.refresh();
      }}
    />
  );
}

export function DeleteForumTopicButton({ topicId }: { topicId: string }) {
  const router = useRouter();
  const t = useTranslations("moderation");
  return (
    <DangerButton
      label={t("delete")}
      onClick={async () => {
        await deleteForumTopic(topicId);
        router.refresh();
      }}
    />
  );
}

export function DeleteVoteButton({ voteId }: { voteId: string }) {
  const router = useRouter();
  const t = useTranslations("moderation");
  return (
    <DangerButton
      label={t("delete")}
      onClick={async () => {
        await deleteVote(voteId);
        router.refresh();
      }}
    />
  );
}

