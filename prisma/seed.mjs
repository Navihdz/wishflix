import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash("12345678", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "yo@example.com" },
    update: { name: "Yo", passwordHash: pwd },
    create: { name: "Yo", email: "yo@example.com", passwordHash: pwd }
  });

  const user2 = await prisma.user.upsert({
    where: { email: "esposa@example.com" },
    update: { name: "Esposa", passwordHash: pwd },
    create: { name: "Esposa", email: "esposa@example.com", passwordHash: pwd }
  });

  const space = await prisma.space.upsert({
    where: { id: "hogar-main-space" },
    update: { name: "Hogar", joinCode: "HOGAR1" },
    create: { id: "hogar-main-space", name: "Hogar", joinCode: "HOGAR1" }
  });

  await prisma.spaceMember.upsert({
    where: { spaceId_userId: { spaceId: space.id, userId: user1.id } },
    update: { role: "owner" },
    create: { spaceId: space.id, userId: user1.id, role: "owner" }
  });

  await prisma.spaceMember.upsert({
    where: { spaceId_userId: { spaceId: space.id, userId: user2.id } },
    update: { role: "member" },
    create: { spaceId: space.id, userId: user2.id, role: "member" }
  });

  await prisma.user.update({
    where: { id: user1.id },
    data: { activeSpaceId: space.id }
  });

  await prisma.user.update({
    where: { id: user2.id },
    data: { activeSpaceId: space.id }
  });

  console.log("Seed completado");
}

main().finally(async () => {
  await prisma.$disconnect();
});
