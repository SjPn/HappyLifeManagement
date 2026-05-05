import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PageTitle, Card } from "@/components/Ui";
import { BoardEditForm } from "@/components/BoardEditForm";

export default async function BoardEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const locale = await getLocale();
  if (session!.user!.role === "MODERATOR") {
    redirect(`/${locale}/chair`);
  }

  const post = await prisma.boardPost.findUnique({ where: { id } });
  if (!post) notFound();

  const canEdit =
    post.userId === session!.user!.id || session!.user!.role === "CHAIR";
  if (!canEdit) {
    redirect(`/${locale}/community/board`);
  }

  const t = await getTranslations("board");
  return (
    <>
      <PageTitle title={t("editTitle")} subtitle={t("editSubtitle")} />
      <Card>
        <BoardEditForm
          id={post.id}
          category={post.category}
          title={post.title}
          body={post.body}
        />
      </Card>
    </>
  );
}

