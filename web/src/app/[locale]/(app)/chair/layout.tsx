import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ChairSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "CHAIR" && role !== "MODERATOR") {
    redirect(`/${locale}/dashboard`);
  }
  return <>{children}</>;
}
