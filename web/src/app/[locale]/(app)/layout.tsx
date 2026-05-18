import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { NotificationProvider } from "@/components/NotificationProvider";
import { Role } from "@/lib/enums";
import { getCommunityForSession } from "@/lib/tenant";

export default async function AppGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role === Role.PLATFORM_ADMIN) {
    redirect(`/${locale}/platform/communities`);
  }

  if (session.user.status !== "APPROVED") {
    redirect(`/${locale}/pending`);
  }

  const community = await getCommunityForSession(session.user);
  if (!community) {
    redirect(`/${locale}/login`);
  }
  if (!community.approvedAt) {
    redirect(`/${locale}/pending?reason=community`);
  }
  if (community.blockedAt) {
    redirect(`/${locale}/blocked`);
  }

  return (
    <NotificationProvider>
      <AppShell communityName={community.name}>{children}</AppShell>
    </NotificationProvider>
  );
}
