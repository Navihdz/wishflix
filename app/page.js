import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/current-user";

export default async function Home() {
  const ctx = await getCurrentUserContext();
  redirect(ctx ? "/inicio" : "/login");
}
