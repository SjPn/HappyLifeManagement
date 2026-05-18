import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileCredentialsForm } from "@/components/ProfileCredentialsForm";
import { Card, PageTitle } from "@/components/Ui";
import { getTranslations } from "next-intl/server";

export default async function PlatformAccountPage() {
  const session = await auth();
  const t = await getTranslations("credentials");

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { email: true },
  });

  return (
    <>
      <PageTitle title={t("accountTitle")} subtitle={t("accountSubtitle")} />
      <Card>
        {user ? <ProfileCredentialsForm currentEmail={user.email} /> : null}
      </Card>
    </>
  );
}
