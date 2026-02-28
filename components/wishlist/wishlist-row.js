"use client";

import { formatRelative } from "@/lib/date";

function TypeBadge({ type }) {
  const toneMap = {
    movie: { label: "Wishlist Peliculas", tone: "movie", icon: "movie" },
    tv: { label: "Wishlist Series", tone: "series", icon: "series" },
    book: { label: "Wishlist Libros", tone: "book", icon: "book" },
    comic: { label: "Wishlist Comics", tone: "comic", icon: "comic" }
  };
  const config = toneMap[type] || { label: "Wishlist", tone: "neutral", icon: "heart" };

  return (
    <span className={`type-pill type-pill-${config.tone}`}>
      <span className="type-pill-heart" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.5 4.8 13.9a4.6 4.6 0 0 1 6.4-6.6L12 8.1l.8-.8a4.6 4.6 0 0 1 6.4 6.6z" />
        </svg>
      </span>
      <span className="type-pill-icon" aria-hidden="true">
        <TypeGlyph name={config.icon} />
      </span>
      <span className="type-pill-label">{config.label}</span>
    </span>
  );
}

function TypeGlyph({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
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

  if (name === "comic") {
    return (
      <svg {...common}>
        <path d="M6 4h12l-1 14H7z" />
        <path d="m9 7 2.1 3L9.3 10.7 12 14l.7-2.1L15 12l-2.1-3 .3-2L11 9l-2-.5z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export default function WishlistRow({ item, onComplete, onDiscard, onView }) {
  const contributorNames = (item.contributors || [])
    .map((contributor) => contributor?.user?.name)
    .filter(Boolean);
  const uniqueContributorNames = [...new Set(contributorNames)];
  const addedByText =
    uniqueContributorNames.length > 0 ? uniqueContributorNames.join(" y ") : item.addedBy?.name || "N/A";

  return (
    <article className="wishlist-row">
      <img className="row-poster" src={item.posterImage || ""} alt={item.title} loading="lazy" />
      <div>
        <div className="row-meta-top">
          <TypeBadge type={item.type} />
          {item.source ? <span className="source-pill">{String(item.source).toUpperCase()}</span> : null}
        </div>
        <h3 className="row-title">{item.title}</h3>
        <p className="row-sub">Agrego: {addedByText}</p>
        <p className="row-sub">{formatRelative(item.addedAt)}</p>
        <div className="row-actions">
          <button className="btn btn-ghost" onClick={() => onView(item)}>
            Ver
          </button>
          <button className="btn btn-success" onClick={() => onComplete(item.id)}>
            Visto/Leido
          </button>
          <button className="btn btn-danger" onClick={() => onDiscard(item.id)}>
            Descartar
          </button>
        </div>
      </div>
    </article>
  );
}

