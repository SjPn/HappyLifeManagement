import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const title = "Добро пожаловать в Happy Life";
  const body =
    "Это демо-посёлок. Новости, заявки и голосования доступны после входа. Тестовые учётки: chair@hlm.kiev.ua / mod@hlm.kiev.ua / neighbor@happylife.demo.";

  const res = await prisma.newsPost.deleteMany({
    where: {
      title,
      body,
    },
  });

  console.log("Deleted demo news posts:", res.count);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

