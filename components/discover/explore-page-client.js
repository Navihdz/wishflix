"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExploreRailsView from "@/components/discover/explore-rails-view";

const TYPE_CARDS = [
  {
    href: "/explorar/peliculas",
    title: "Peliculas",
    subtitle: "Estrenos y favoritas",
    icon: "movie"
  },
  {
    href: "/explorar/series",
    title: "Series",
    subtitle: "Maratones y novedades",
    icon: "series"
  },
  {
    href: "/explorar/libros",
    title: "Libros",
    subtitle: "Lecturas recomendadas",
    icon: "book"
  },
  {
    href: "/explorar/comics",
    title: "Comics",
    subtitle: "Manga y graphic novels",
    icon: "comic"
  }
];

function QuickTypeIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  if (name === "movie") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M7 5v14M17 5v14M3 10h18M3 14h18" opacity=".6" />
      </svg>
    );
  }

  if (name === "series") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="m9.5 10 5 2-5 2z" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg {...common}>
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z" />
        <path d="M5 5.5V21" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M6 4h12l-1 14H7z" />
      <path d="m9 7 2.1 3L9.3 10.7 12 14l.7-2.1L15 12l-2.1-3 .3-2L11 9l-2-.5z" />
    </svg>
  );
}

export default function ExplorePageClient({
  endpoint = "/api/discover",
  pageType = "home",
  showTypeCards = false
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({ hero: null, sections: [], meta: {} });
  const [savedItems, setSavedItems] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [savingId, setSavingId] = useState("");
  const modalHistoryPushedRef = useRef(false);
  const [userName, setUserName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [discoverRes, itemsRes] = await Promise.all([fetch(endpoint), fetch("/api/items?status=wishlist")]);
      if (!discoverRes.ok) throw new Error("discover failed");
      if (!itemsRes.ok) throw new Error("items failed");
      const discoverData = await discoverRes.json();
      const itemsData = await itemsRes.json();
      setPayload(discoverData || { hero: null, sections: [] });
      setSavedItems(itemsData.items || []);
    } catch {
      setError("No se pudo cargar");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

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

  useEffect(() => {
    function onPopState() {
      if (!modalHistoryPushedRef.current) return;
      modalHistoryPushedRef.current = false;
      setModalItem(null);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function openModal(item) {
    if (!modalHistoryPushedRef.current) {
      window.history.pushState({ scwModal: true }, "");
      modalHistoryPushedRef.current = true;
    }
    setModalItem(item);
  }

  function closeModal() {
    if (modalHistoryPushedRef.current) {
      window.history.back();
      return;
    }
    setModalItem(null);
  }

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    const scopeMap = {
      home: "home",
      movies: "movies",
      series: "series",
      books: "books",
      comics: "comics"
    };
    const scope = scopeMap[pageType] || "home";
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&scope=${scope}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setSearchResults(data.items || []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setSearchError("No se pudo buscar");
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, pageType]);

  const existingKeys = useMemo(
    () =>
      new Set(savedItems.map((item) => `${item.type}:${item.source}:${item.externalId || item.external_id}`)),
    [savedItems]
  );

  async function onSave(item) {
    const key = `${item.type}:${item.source}:${item.external_id}`;
    setSavingId(key);
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    setSavingId("");
    if (response.ok || response.status === 409) {
      const itemsRes = await fetch("/api/items?status=wishlist");
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setSavedItems(itemsData.items || []);
      }
    }
  }

  return (
    <div>
      {/*
        Render just below the hero (inside ExploreRailsView) so it stays above rails.
      */}
      {showTypeCards ? (
        <ExploreRailsView
          payload={payload}
          loading={loading}
          error={error}
          query={query}
          onQueryChange={setQuery}
          modalItem={modalItem}
          onOpen={openModal}
          onClose={closeModal}
          onSave={onSave}
          savingId={savingId}
          existingKeys={existingKeys}
          pageType={pageType}
          onRetry={load}
          searchResults={searchResults}
          searchLoading={searchLoading}
          searchError={searchError}
          userName={userName}
          afterHero={
            <section className="quick-type-grid" aria-label="Explorar por tipo">
              {TYPE_CARDS.map((card, index) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`quick-type-card quick-type-${card.icon}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="quick-type-icon">
                    <QuickTypeIcon name={card.icon} />
                  </span>
                  <span className="quick-type-text">
                    <strong>{card.title}</strong>
                    <small>{card.subtitle}</small>
                  </span>
                </Link>
              ))}
            </section>
          }
        />
      ) : (
        <ExploreRailsView
          payload={payload}
          loading={loading}
          error={error}
          query={query}
          onQueryChange={setQuery}
          modalItem={modalItem}
          onOpen={openModal}
          onClose={closeModal}
          onSave={onSave}
          savingId={savingId}
          existingKeys={existingKeys}
          pageType={pageType}
          onRetry={load}
          searchResults={searchResults}
          searchLoading={searchLoading}
          searchError={searchError}
          userName={userName}
        />
      )}
    </div>
  );
}
