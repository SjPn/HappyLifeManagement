import "dotenv/config";
import { PrismaClient as PgPrismaClient } from "@prisma/client";
import { PrismaClient as SqlitePrismaClient } from "../src/generated/sqlite-client";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function main() {
  // Postgres URL is read by @prisma/client from DATABASE_URL.
  // For Neon, for schema ops / bulk copy it can be more reliable to use a direct endpoint.
  const pgUrl =
    process.env.POSTGRES_DATABASE_URL?.trim() || mustEnv("DATABASE_URL");
  // SQLite URL is read by generated sqlite client from SQLITE_DATABASE_URL
  mustEnv("SQLITE_DATABASE_URL");

  const sqlite = new SqlitePrismaClient();
  const pg = new PgPrismaClient({ datasources: { db: { url: pgUrl } } });

  try {
    console.log("Reading from SQLite…");

    const [
      users,
      news,
      votes,
      voteOptions,
      voteResponses,
      tickets,
      boardPosts,
      forumTopics,
      forumPosts,
      reports,
      meterReadings,
    ] = await Promise.all([
      sqlite.user.findMany(),
      sqlite.newsPost.findMany(),
      sqlite.vote.findMany(),
      sqlite.voteOption.findMany(),
      sqlite.voteResponse.findMany(),
      sqlite.ticket.findMany(),
      sqlite.boardPost.findMany(),
      sqlite.forumTopic.findMany(),
      sqlite.forumPost.findMany(),
      sqlite.confidentialReport.findMany(),
      sqlite.meterReading.findMany(),
    ]);

    console.log("Writing to Postgres…");

    await pg.$transaction(
      async (tx) => {
        // Order matters for FK constraints
        await tx.user.createMany({ data: users as any, skipDuplicates: true });
        await tx.newsPost.createMany({
          data: news as any,
          skipDuplicates: true,
        });
        await tx.vote.createMany({ data: votes as any, skipDuplicates: true });
        await tx.voteOption.createMany({
          data: voteOptions as any,
          skipDuplicates: true,
        });
        await tx.voteResponse.createMany({
          data: voteResponses as any,
          skipDuplicates: true,
        });
        await tx.ticket.createMany({
          data: tickets as any,
          skipDuplicates: true,
        });
        await tx.boardPost.createMany({
          data: boardPosts as any,
          skipDuplicates: true,
        });
        await tx.forumTopic.createMany({
          data: forumTopics as any,
          skipDuplicates: true,
        });
        await tx.forumPost.createMany({
          data: forumPosts as any,
          skipDuplicates: true,
        });
        await tx.confidentialReport.createMany({
          data: reports as any,
          skipDuplicates: true,
        });
        await tx.meterReading.createMany({
          data: meterReadings as any,
          skipDuplicates: true,
        });
      },
      { timeout: 120_000 },
    );

    console.log("Done.");
    console.log({
      users: users.length,
      news: news.length,
      votes: votes.length,
      voteOptions: voteOptions.length,
      voteResponses: voteResponses.length,
      tickets: tickets.length,
      boardPosts: boardPosts.length,
      forumTopics: forumTopics.length,
      forumPosts: forumPosts.length,
      reports: reports.length,
      meterReadings: meterReadings.length,
    });
  } finally {
    await Promise.allSettled([sqlite.$disconnect(), pg.$disconnect()]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

