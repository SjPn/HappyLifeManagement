import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { NotificationProvider } from "@/components/NotificationProvider";

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
  if (session.user.status !== "APPROVED") {
    redirect(`/${locale}/pending`);
  }

  return (
    <NotificationProvider>
      <AppShell>{children}</AppShell>
    </NotificationProvider>
  );
}
