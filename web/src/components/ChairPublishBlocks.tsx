import { Card } from "@/components/Ui";
import { NewsCreateForm } from "@/components/NewsCreateForm";
import { VoteCreateForm } from "@/components/VoteCreateForm";

const sectionHeadingClass =
  "mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500";

export function ChairPublishBlocks({
  newsEyebrow,
  voteEyebrow,
}: {
  newsEyebrow: string;
  voteEyebrow: string;
}) {
  return (
    <>
      <h2 className={sectionHeadingClass}>{newsEyebrow}</h2>
      <Card className="mb-8">
        <NewsCreateForm />
      </Card>

      <h2 className={sectionHeadingClass}>{voteEyebrow}</h2>
      <Card className="mb-8">
        <VoteCreateForm />
      </Card>
    </>
  );
}
