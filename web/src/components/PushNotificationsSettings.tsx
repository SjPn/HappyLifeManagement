"use client";

import { updatePushPreferences } from "@/actions/pushPreferences";
import { isCapacitorNative } from "@/lib/capacitorNative";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

type Prefs = {
  pushNotifyNewTickets: boolean;
  pushNotifyTicketStatus: boolean;
  pushNotifyNews: boolean;
  pushNotifyDebt: boolean;
};

export function PushNotificationsSettings({
  role,
  prefs,
}: {
  role: string;
  prefs: Prefs;
}) {
  const t = useTranslations("profile.push");
  const [pending, startTransition] = useTransition();

  if (!isCapacitorNative()) return null;

  const isChair = role === "CHAIR";

  function onToggle(name: keyof Prefs, checked: boolean) {
    const fd = new FormData();
    fd.set(name, checked ? "on" : "off");
    startTransition(async () => {
      await updatePushPreferences(fd);
    });
  }

  return (
    <div className="hl-glass rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Bell className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {t("title")}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("hint")}
          </p>
          <ul className="mt-3 space-y-2.5">
            {isChair && (
              <ToggleRow
                label={t("newTickets")}
                checked={prefs.pushNotifyNewTickets}
                disabled={pending}
                onChange={(c) => onToggle("pushNotifyNewTickets", c)}
              />
            )}
            <ToggleRow
              label={t("ticketStatus")}
              checked={prefs.pushNotifyTicketStatus}
              disabled={pending}
              onChange={(c) => onToggle("pushNotifyTicketStatus", c)}
            />
            <ToggleRow
              label={t("news")}
              checked={prefs.pushNotifyNews}
              disabled={pending}
              onChange={(c) => onToggle("pushNotifyNews", c)}
            />
            <ToggleRow
              label={t("debt")}
              checked={prefs.pushNotifyDebt}
              disabled={pending}
              onChange={(c) => onToggle("pushNotifyDebt", c)}
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span className="text-slate-800 dark:text-slate-200">{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
