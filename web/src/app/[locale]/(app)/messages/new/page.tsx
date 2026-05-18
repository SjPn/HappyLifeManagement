import { auth } from "@/auth";
import { PageTitle, Card } from "@/components/Ui";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { communityWhere, requireCommunityId } from "@/lib/tenant";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function NewMessagePage() {
  const session = await auth();
  if (session!.user!.role === Role.MODERATOR) redirect("/chair");

  const t = await getTranslations("messages");
  const communityId = requireCommunityId(session!.user!);
  const userId = session!.user!.id;

  const residents = await prisma.user.findMany({
    where: {
      ...communityWhere(communityId),
      status: "APPROVED",
      role: { in: [Role.RESIDENT, Role.CHAIR] },
      id: { not: userId },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, street: true, houseNumber: true },
  });

  return (
    <>
      <PageTitle title={t("pickResident")} />
      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {residents.map((u) => (
            <li key={u.id}>
              <Link
                href={`/messages/${u.id}`}
                className="block px-4 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-zinc-500">
                  {u.street} {u.houseNumber}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      {residents.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">{t("noResidents")}</p>
      )}
    </>
  );
}
