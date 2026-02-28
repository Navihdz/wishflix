import AppShell from "@/components/layout/app-shell";

export default function ProtectedLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
