import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function getCurrentUserContext() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;

  const memberships = await prisma.spaceMember.findMany({
    where: { userId: user.id },
    include: { space: true },
    orderBy: { id: "asc" }
  });
  if (!memberships.length) return null;

  const activeMembership =
    memberships.find((membership) => membership.spaceId === user.activeSpaceId) ||
    memberships[0];

  return {
    user: { id: user.id, name: user.name, email: user.email },
    space: { id: activeMembership.space.id, name: activeMembership.space.name }
  };
}
