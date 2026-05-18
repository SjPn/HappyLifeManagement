"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { sendDirectMessage } from "@/actions/messages";
import { inputClass, primaryButtonClass } from "@/lib/formStyles";
import { useTranslations } from "next-intl";

export type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

export function MessageThread({
  partnerId,
  partnerName,
  messages: initial,
}: {
  partnerId: string;
  partnerName: string;
  messages: MessageRow[];
}) {
  const t = useTranslations("messages");
  const router = useRouter();
  const [messages, setMessages] = useState(initial);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem(
      "body",
    ) as HTMLTextAreaElement;
    const text = input.value.trim();
    if (!text) return;
    setLoading(true);
    const res = await sendDirectMessage(partnerId, text);
    setLoading(false);
    if (res && "ok" in res && res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          body: text,
          createdAt: new Date().toISOString(),
          mine: true,
        },
      ]);
      input.value = "";
      router.refresh();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      <p className="mb-4 text-center text-sm font-semibold">{partnerName}</p>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.mine
                ? "ml-auto bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.body}</p>
            <p
              className={`mt-1 text-[0.65rem] ${
                m.mine ? "text-blue-100" : "text-zinc-500"
              }`}
            >
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <textarea
          name="body"
          rows={2}
          required
          className={`${inputClass} min-h-[2.5rem] flex-1 resize-none`}
          placeholder={t("placeholder")}
        />
        <button
          type="submit"
          disabled={loading}
          className={`${primaryButtonClass} shrink-0 self-end`}
        >
          {t("send")}
        </button>
      </form>
    </div>
  );
}
