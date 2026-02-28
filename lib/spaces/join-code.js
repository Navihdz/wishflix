const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateJoinCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function generateUniqueJoinCode(prisma, length = 6, maxAttempts = 20) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generateJoinCode(length);
    const existing = await prisma.space.findUnique({ where: { joinCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un codigo unico");
}

