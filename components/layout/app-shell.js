import SideBar from "@/components/layout/sidebar";
import BottomNav from "@/components/layout/bottom-nav";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <SideBar />
      <main className="main">{children}</main>
      <BottomNav />
    </div>
  );
}
