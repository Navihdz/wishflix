"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/inicio", label: "Explorar", icon: "home", tone: "home" },
  { href: "/peliculas", label: "Wishlist", icon: "wishlist", tone: "wishlist" },
  { href: "/historial", label: "Historial", icon: "history", tone: "history" },
  { href: "/ajustes", label: "Ajustes", icon: "settings", tone: "history" }
];

function BottomIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg {...common}>
        <path d="M3.5 12A8.5 8.5 0 1 0 6 6.1" />
        <path d="M3 4v4h4" />
        <path d="M12 7.5v5l3 1.8" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="2.2" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4.7a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1L5 6.1 3 9.5l2 1.6a7 7 0 0 0 0 2L3 14.7l2 3.4 2.4-.7a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4.7 2-3.4-2-1.6c.1-.3.1-.7.1-1z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 20.5 4.8 13.9a4.6 4.6 0 0 1 6.4-6.6L12 8.1l.8-.8a4.6 4.6 0 0 1 6.4 6.6z" />
      <rect x="11.5" y="10.8" width="7.5" height="5.5" rx="1.2" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href === "/inicio" && pathname.startsWith("/explorar/"));
        return (
          <Link key={item.href} href={item.href} className={`bottom-nav-link ${active ? "active" : ""}`}>
            <span className={`bottom-nav-icon bottom-nav-icon-${item.tone}`}>
              <BottomIcon name={item.icon} />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
