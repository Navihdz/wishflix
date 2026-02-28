import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const standaloneRoot = path.resolve(".next", "standalone");

function findServerFile(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isFile() && entry === "server.js") {
      return fullPath;
    }
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      const nested = findServerFile(fullPath);
      if (nested) return nested;
    }
  }

  return null;
}

let serverPath;
try {
  serverPath = findServerFile(standaloneRoot);
} catch (error) {
  console.error("No se pudo leer .next/standalone. Ejecuta `npm run build` primero.");
  console.error(error);
  process.exit(1);
}

if (!serverPath) {
  console.error("No se encontro server.js en .next/standalone.");
  process.exit(1);
}

const child = spawn(process.execPath, [serverPath], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
