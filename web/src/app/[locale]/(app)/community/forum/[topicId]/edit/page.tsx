import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PageTitle, Card } from "@/components/Ui";
import { ForumTopicEditForm } from "@/components/ForumTopicEditForm";

export default async function ForumTopicEditPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const session = await auth();
  const { topicId } = await params;
  const locale = await getLocale();
  if (session!.user!.role === "MODERATOR") {
    redirect(`/${locale}/chair`);
  }

  const topic = await prisma.forumTopic.findUnique({
    where: { id: topicId },
    include: { posts: { orderBy: { createdAt: "asc" }, take: 1 } },
  });
  if (!topic) notFound();

  const canEdit =
    topic.userId === session!.user!.id || session!.user!.role === "CHAIR";
  if (!canEdit) {
    redirect(`/${locale}/community/forum/${topicId}`);
  }

  const first = topic.posts[0];
  const t = await getTranslations("forum");

  return (
    <>
      <PageTitle title={t("editTitle")} subtitle={t("editSubtitle")} />
      <Card>
        <ForumTopicEditForm
          topicId={topicId}
          title={topic.title}
          body={first?.body ?? ""}
          audience={topic.audience}
        />
      </Card>
    </>
  );
}

