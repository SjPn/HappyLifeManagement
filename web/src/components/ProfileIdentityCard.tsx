import { AvatarInitials } from "@/components/hub/hubUi";

export function ProfileIdentityCard({
  name,
  email,
  address,
  roleLabel,
  tenancyLabel,
}: {
  name: string;
  email: string;
  address: string;
  roleLabel: string;
  tenancyLabel: string;
}) {
  return (
    <div className="hl-glass mb-6 flex items-start gap-4 rounded-2xl p-4 sm:p-5">
      <AvatarInitials name={name} tone="blue" />
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {email}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          {address}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {roleLabel} · {tenancyLabel}
        </p>
      </div>
    </div>
  );
}
