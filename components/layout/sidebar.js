"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const exploreNav = [
  { href: "/inicio", label: "Inicio", icon: "home", tone: "home" },
  { href: "/explorar/peliculas", label: "Explorar Películas", icon: "movie", tone: "movie" },
  { href: "/explorar/series", label: "Explorar Series", icon: "series", tone: "series" },
  { href: "/explorar/libros", label: "Explorar Libros", icon: "book", tone: "book" },
  { href: "/explorar/comics", label: "Explorar Cómics", icon: "comic", tone: "comic" }
];

const wishlistNav = [
  { href: "/peliculas", label: "Wishlist", icon: "wishlist-movie", tone: "movie" }
];

function IconGlyph({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  const heart = <path d="M12 20.5 4.8 13.9a4.6 4.6 0 0 1 6.4-6.6L12 8.1l.8-.8a4.6 4.6 0 0 1 6.4 6.6z" />;

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      );
    case "movie":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M7 5v14M17 5v14M3 10h18M3 14h18" opacity=".6" />
        </svg>
      );
    case "series":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <path d="m9.5 10 5 2-5 2z" />
          <path d="M8 3.5 6.5 6M16 3.5 17.5 6" opacity=".7" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z" />
          <path d="M5 5.5V21" />
          <path d="M9 7.5h6M9 11h6" opacity=".7" />
        </svg>
      );
    case "comic":
      return (
        <svg {...common}>
          <path d="M6 4h12l-1 14H7z" />
          <path d="m9 7 2.1 3L9.3 10.7 12 14l.7-2.1L15 12l-2.1-3 .3-2L11 9l-2-.5z" />
          <path d="M8 18h8" opacity=".7" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3.5 12A8.5 8.5 0 1 0 6 6.1" />
          <path d="M3 4v4h4" />
          <path d="M12 7.5v5l3 1.8" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
          <path d="M14 16l4-4-4-4" />
          <path d="M9 12h9" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.2" />
          <path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4.7a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1L5 6.1 3 9.5l2 1.6a7 7 0 0 0 0 2L3 14.7l2 3.4 2.4-.7a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4.7 2-3.4-2-1.6c.1-.3.1-.7.1-1z" />
        </svg>
      );
    case "wishlist-movie":
    case "wishlist-series":
    case "wishlist-book":
    case "wishlist-comic": {
      const base = name.replace("wishlist-", "");
      return (
        <svg {...common}>
          <g transform="translate(0 0) scale(.88) translate(1.6 1.6)">{heart}</g>
          <g transform="translate(9.2 9.2) scale(.55)">
            {base === "movie" && (
              <>
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M7 5v14M17 5v14M3 10h18M3 14h18" opacity=".6" />
              </>
            )}
            {base === "series" && (
              <>
                <rect x="3" y="6" width="18" height="12" rx="2.5" />
                <path d="m9.5 10 5 2-5 2z" />
              </>
            )}
            {base === "book" && (
              <>
                <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z" />
                <path d="M5 5.5V21" />
              </>
            )}
            {base === "comic" && (
              <>
                <path d="M6 4h12l-1 14H7z" />
                <path d="m9 7 2.1 3L9.3 10.7 12 14l.7-2.1L15 12l-2.1-3 .3-2L11 9l-2-.5z" />
              </>
            )}
          </g>
        </svg>
      );
    }
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function NavIcon({ icon, tone }) {
  return (
    <span className={`nav-icon nav-icon-${tone}`}>
      <IconGlyph name={icon} />
    </span>
  );
}

function NavGroup({ title, items, pathname, collapsed }) {
  return (
    <div className="nav-group">
      {!collapsed ? <p className="nav-group-title">{title}</p> : null}
      {items.map((item) => {
        const active = pathname === item.href || (item.href.startsWith("/explorar/") && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} title={item.label}>
            <NavIcon icon={item.icon} tone={item.tone} />
            {!collapsed ? <span className="nav-label">{item.label}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export default function SideBar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setUserName(data?.user?.name || "");
      } catch {
        if (!cancelled) setUserName("");
      }
    }
    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = String(userName || "").trim().split(/\s+/)[0] || "";

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div>
          <div className="brand">{collapsed ? "WF" : "WishFlix"}</div>
          {!collapsed && firstName ? <p className="sidebar-greeting">Hola {firstName}!</p> : null}
        </div>
        <button
          type="button"
          className="btn btn-ghost sidebar-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <NavGroup title="Explorar" items={exploreNav} pathname={pathname} collapsed={collapsed} />
      <NavGroup title="Mi Wishlist" items={wishlistNav} pathname={pathname} collapsed={collapsed} />

      <div className="nav-group" style={{ marginTop: "auto" }}>
        <Link
          href="/historial"
          className={`nav-link ${pathname === "/historial" ? "active" : ""}`}
          title="Historial"
        >
          <NavIcon icon="history" tone="history" />
          {!collapsed ? <span className="nav-label">Historial</span> : null}
        </Link>
        <Link
          href="/ajustes"
          className={`nav-link ${pathname === "/ajustes" ? "active" : ""}`}
          title="Ajustes"
        >
          <NavIcon icon="settings" tone="history" />
          {!collapsed ? <span className="nav-label">Ajustes</span> : null}
        </Link>
        <form action="/api/auth/logout" method="post" style={{ marginTop: ".8rem" }}>
          <button className="btn btn-ghost sidebar-logout sidebar-logout-btn" type="submit">
            <span className="sidebar-logout-icon">
              <IconGlyph name="logout" />
            </span>
            {!collapsed ? <span>Salir</span> : null}
          </button>
        </form>
      </div>
    </aside>
  );
}

