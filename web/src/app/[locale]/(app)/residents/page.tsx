import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/Ui";
import { AvatarInitials, HubContentCard, HubSection } from "@/components/hub/hubUi";
import { getTranslations } from "next-intl/server";
import { TenancyType } from "@/lib/audience";
import { communityWhere, requireCommunityId } from "@/lib/tenant";

function ResidentRow({
  name,
  address,
  tenancyLabel,
  tone,
}: {
  name: string;
  address: string;
  tenancyLabel: string;
  tone: "blue" | "emerald";
}) {
  return (
    <HubContentCard>
      <div className="flex items-center gap-3">
        <AvatarInitials name={name} tone={tone} />
        <span className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{name}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {address} · {tenancyLabel}
          </p>
        </span>
      </div>
    </HubContentCard>
  );
}

export default async function ResidentsPage() {
  const session = await auth();
  const communityId = requireCommunityId(session!.user!);
  const t = await getTranslations("residents");
  const tt = await getTranslations("categories.tenancy");
  const isStaff =
    session?.user?.role === "MODERATOR" || session?.user?.role === "CHAIR";
  const backHref = "/community";
  const backLabel = (await getTranslations("board"))("back");

  const users = await prisma.user.findMany({
    where: {
      ...communityWhere(communityId),
      status: "APPROVED",
      role: "RESIDENT",
    },
    orderBy: [{ street: "asc" }, { houseNumber: "asc" }, { name: "asc" }],
    select: { id: true, name: true, street: true, houseNumber: true, tenancyType: true },
  });

  const owners = users.filter((u) => u.tenancyType === TenancyType.OWNER);
  const tenants = users.filter((u) => u.tenancyType === TenancyType.TENANT);

  return (
    <>
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <HubSection title={t("owners")} className="!mt-4">
        {owners.map((u) => (
          <ResidentRow
            key={u.id}
            name={u.name}
            address={`${u.street} ${u.houseNumber}`}
            tenancyLabel={tt("OWNER")}
            tone="blue"
          />
        ))}
        {owners.length === 0 && (
          <HubContentCard>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("emptyOwners")}</p>
          </HubContentCard>
        )}
      </HubSection>

      <HubSection title={t("tenants")}>
        {tenants.map((u) => (
          <ResidentRow
            key={u.id}
            name={u.name}
            address={`${u.street} ${u.houseNumber}`}
            tenancyLabel={tt("TENANT")}
            tone="emerald"
          />
        ))}
        {tenants.length === 0 && (
          <HubContentCard>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("emptyTenants")}</p>
          </HubContentCard>
        )}
      </HubSection>

      {isStaff && (
        <HubContentCard className="mt-8 border-blue-200/80 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30">
          <p className="text-sm text-blue-900 dark:text-blue-100">{t("moderatorHint")}</p>
        </HubContentCard>
      )}

      <p className="mt-8 text-center text-sm">
        <Link href={backHref} className="text-blue-700 hover:underline">
          {backLabel}
        </Link>
      </p>
    </>
  );
}
