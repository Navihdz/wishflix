"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ContentDetailModal from "@/components/discover/content-detail-modal";
import {
  buildLoopRenderItems,
  getLoopResetScrollLeft,
  mergeUniqueRailItems
} from "@/lib/ui/explore-rail";
import { scrollRailByDirection } from "@/lib/ui/rail-scroll";

function getSearchPlaceholder(pageType) {
  if (pageType === "movies") return "Busca una película";
  if (pageType === "series") return "Busca una serie";
  if (pageType === "books") return "Busca un libro";
  if (pageType === "comics") return "Busca un cómic";
  return "Busca tu contenido";
}

const SEARCH_FILTERS = [
  { id: "all", label: "Todo" },
  { id: "movie", label: "Películas" },
  { id: "tv", label: "Series" },
  { id: "book", label: "Libros" },
  { id: "comic", label: "Cómics" }
];

function ExploreCard({ item, onOpen, onSave, saving, already }) {
  return (
    <article className="card explore-card">
      {item.poster_image ? (
        <img className="poster" src={item.poster_image} alt={item.title} loading="lazy" />
      ) : (
        <div className="poster" aria-hidden="true" />
      )}
      <div className="card-body">
        <p className="card-title">{item.title}</p>
        <p className="meta">
          {item.type}
          {item.year ? ` · ${item.year}` : ""}
        </p>
        <div className="card-actions">
          <button className="btn btn-primary" disabled={already || saving} onClick={() => onSave(item)}>
            {already ? "Ya en wishlist" : saving ? "..." : "Guardar"}
          </button>
          <button className="btn btn-ghost" onClick={() => onOpen(item)}>
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}

function SearchResultsPanel({
  items,
  loading,
  error,
  query,
  onClear,
  onOpen,
  onSave,
  savingId,
  existingKeys,
  pageType
}) {
  const showTypeFilters = pageType === "home";
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setActiveFilter("all");
  }, [query, pageType]);

  const counts = useMemo(() => {
    const map = { all: items.length, movie: 0, tv: 0, book: 0, comic: 0 };
    for (const item of items) {
      if (item?.type && map[item.type] !== undefined) map[item.type] += 1;
    }
    return map;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (!showTypeFilters || activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [activeFilter, items, showTypeFilters]);

  return (
    <section>
      <div className="header-row search-results-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Resultados
          </h2>
          <p className="row-sub search-results-subtitle">
            {query ? `Mostrando resultados para "${query}"` : "Busca para descubrir contenido nuevo"}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          Volver a explorar
        </button>
      </div>

      {showTypeFilters && !loading && !error && items.length ? (
        <div className="search-filter-row" role="tablist" aria-label="Filtrar resultados por tipo">
          {SEARCH_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.id}
              className={`search-filter-chip ${activeFilter === filter.id ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span>{filter.label}</span>
              <span className="search-filter-count">{counts[filter.id] || 0}</span>
            </button>
          ))}
        </div>
      ) : null}

      {loading ? <p className="empty">Buscando contenido...</p> : null}
      {error ? (
        <div className="empty-panel">
          <p className="empty" style={{ margin: 0 }}>
            {error}
          </p>
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Limpiar búsqueda
          </button>
        </div>
      ) : null}
      {!loading && !error && !items.length ? <p className="empty">No se encontraron resultados.</p> : null}
      {!loading && !error && items.length && !visibleItems.length ? (
        <p className="empty">No hay resultados en este filtro.</p>
      ) : null}

      {!loading && !error && visibleItems.length ? (
        <div className="search-results-grid">
          {visibleItems.map((item, index) => {
            const key = `${item.type}:${item.source}:${item.external_id}`;
            return (
              <ExploreCard
                key={`${key}-${index}`}
                item={item}
                onOpen={onOpen}
                onSave={onSave}
                saving={savingId === key}
                already={existingKeys.has(key)}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

const TMDB_INCREMENTAL_MAX_PAGE = 3;

function ExploreRail({ section, onOpen, onSave, savingId, existingKeys, pageType, queryActive }) {
  const railRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const requestedPagesRef = useRef(new Set([1]));
  const maxLoadedPageRef = useRef(1);
  const [localItems, setLocalItems] = useState(section?.items || []);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  if (!section?.items?.length) return null;

  const incrementalEndpoint =
    !queryActive && pageType === "movies"
      ? "/api/discover/movies"
      : !queryActive && pageType === "series"
        ? "/api/discover/series"
        : !queryActive && pageType === "home"
          ? "/api/discover"
          : "";
  const canIncrement = Boolean(incrementalEndpoint) && section?.supportsIncremental !== false;

  useEffect(() => {
    setLocalItems(section.items || []);
    setLoadingMore(false);
    setLoopEnabled(false);
    requestedPagesRef.current = new Set([1]);
    maxLoadedPageRef.current = 1;
    loadingMoreRef.current = false;
  }, [section.id, section.items, queryActive]);

  const renderItems = useMemo(
    () => buildLoopRenderItems(localItems, canIncrement && loopEnabled),
    [canIncrement, localItems, loopEnabled]
  );

  function scroll(direction) {
    scrollRailByDirection(railRef.current, direction);
  }

  async function requestMore(page) {
    if (!canIncrement) return;
    if (page <= 1 || page > TMDB_INCREMENTAL_MAX_PAGE) return;
    if (loadingMoreRef.current) return;
    if (requestedPagesRef.current.has(page)) return;

    requestedPagesRef.current.add(page);
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const response = await fetch(`${incrementalEndpoint}?section=${encodeURIComponent(section.id)}&page=${page}`);
      if (!response.ok) {
        requestedPagesRef.current.delete(page);
        return;
      }
      const data = await response.json();
      const incoming = data?.section?.items || [];
      setLocalItems((prev) => mergeUniqueRailItems(prev, incoming));
      maxLoadedPageRef.current = Math.max(maxLoadedPageRef.current, page);
    } catch {
      requestedPagesRef.current.delete(page);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  function handleRailScroll() {
    const rail = railRef.current;
    if (!rail) return;

    const wrappedScrollLeft = getLoopResetScrollLeft({
      scrollLeft: rail.scrollLeft,
      scrollWidth: rail.scrollWidth,
      loopEnabled: canIncrement && loopEnabled
    });
    if (wrappedScrollLeft !== null) {
      rail.scrollLeft = wrappedScrollLeft;
      return;
    }

    if (!canIncrement || loadingMoreRef.current) return;

    const remaining = rail.scrollWidth - (rail.scrollLeft + rail.clientWidth);
    const threshold = Math.max(rail.clientWidth * 0.9, 280);
    if (remaining > threshold) return;

    const nextPage = maxLoadedPageRef.current + 1;
    if (nextPage <= TMDB_INCREMENTAL_MAX_PAGE) {
      requestMore(nextPage);
      return;
    }

    if (!loopEnabled && localItems.length > 1) {
      setLoopEnabled(true);
    }
  }

  return (
    <section className="rail">
      <div className="header-row">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {section.title}
        </h2>
        <span className="badge">
          {localItems.length} items{loadingMore ? " +..." : ""}
        </span>
      </div>
      <div className="rail-track-wrap">
        <button
          type="button"
          className="rail-nav rail-nav-left"
          aria-label={`Mover carrusel ${section.title} a la izquierda`}
          onClick={() => scroll("prev")}
        >
          ‹
        </button>
        <div ref={railRef} className="rail-row" onScroll={handleRailScroll}>
          {renderItems.map((item, index) => {
            const key = `${item.type}:${item.source}:${item.external_id}`;
            const isLoopCopy = loopEnabled && index >= localItems.length;
            return (
              <ExploreCard
                key={`${section.id}-${key}-${isLoopCopy ? "loop" : "base"}-${index}`}
                item={item}
                onOpen={onOpen}
                onSave={onSave}
                saving={savingId === key}
                already={existingKeys.has(key)}
              />
            );
          })}
        </div>
        <button
          type="button"
          className="rail-nav rail-nav-right"
          aria-label={`Mover carrusel ${section.title} a la derecha`}
          onClick={() => scroll("next")}
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default function ExploreRailsView({
  payload,
  loading,
  error,
  query,
  onQueryChange,
  afterHero = null,
  userName = "",
  modalItem,
  onOpen,
  onClose,
  onSave,
  savingId,
  existingKeys,
  pageType,
  onRetry,
  searchResults = [],
  searchLoading = false,
  searchError = ""
}) {
  const sections = payload?.sections || [];
  const hasSections = sections.some((section) => section.items?.length);
  const queryTrimmed = query.trim();
  const searchMode = Boolean(queryTrimmed);
  const showTmdbHint =
    !loading &&
    !error &&
    !hasSections &&
    payload?.meta?.tmdbEnabled === false &&
    (pageType === "movies" || pageType === "series");
  const firstName = String(userName || "").trim().split(/\s+/)[0] || "";
  const heroTitle = pageType === "home" && firstName ? `Hola ${firstName}! Descubre algo hoy.` : payload?.hero?.title;

  return (
    <div>
      {payload?.hero ? (
        <section className={`hero hero-${pageType || "generic"}`}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-kicker">WishFlix</p>
            <h1 className="hero-title">{heroTitle}</h1>
            {payload.hero.subtitle ? <p className="hero-subtitle">{payload.hero.subtitle}</p> : null}
          </div>
        </section>
      ) : null}
      {afterHero}

      {onQueryChange ? (
        <div className="search-toolbar">
          <input
            className="search"
            placeholder={getSearchPlaceholder(pageType)}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && queryTrimmed) {
                onQueryChange("");
                e.currentTarget.blur();
              }
            }}
          />
          {searchMode ? (
            <button type="button" className="btn btn-ghost search-clear-btn" onClick={() => onQueryChange("")}>
              Volver a explorar
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? <p className="empty">Cargando carruseles...</p> : null}
      {error ? (
        <div className="empty-panel">
          <p className="empty" style={{ margin: 0 }}>
            No se pudo cargar esta sección.
          </p>
          <button className="btn btn-ghost" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : null}

      {showTmdbHint ? (
        <div className="empty-panel">
          <p className="empty" style={{ margin: 0 }}>
            Configura `TMDB_API_KEY` en `.env` para ver películas y series desde TMDB.
          </p>
        </div>
      ) : null}

      {!loading && !error && !searchMode && !hasSections ? <p className="empty">No hay resultados para mostrar.</p> : null}

      {!loading && !error && searchMode ? (
        <SearchResultsPanel
          items={searchResults}
          loading={searchLoading}
          error={searchError}
          query={queryTrimmed}
          onClear={() => onQueryChange("")}
          onOpen={onOpen}
          onSave={onSave}
          savingId={savingId}
          existingKeys={existingKeys}
          pageType={pageType}
        />
      ) : null}

      {!loading && !error && !searchMode
        ? sections.map((section) => (
            <ExploreRail
              key={section.id}
              section={section}
              onOpen={onOpen}
              onSave={onSave}
              savingId={savingId}
              existingKeys={existingKeys}
              pageType={pageType}
              queryActive={false}
            />
          ))
        : null}

      <ContentDetailModal
        item={modalItem}
        onClose={onClose}
        onSave={onSave}
        saving={savingId === `${modalItem?.type}:${modalItem?.source}:${modalItem?.external_id}`}
        already={
          modalItem ? existingKeys.has(`${modalItem.type}:${modalItem.source}:${modalItem.external_id}`) : false
        }
      />
    </div>
  );
}
