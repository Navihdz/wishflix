"use client";

import { useEffect, useState } from "react";
import WishlistRow from "@/components/wishlist/wishlist-row";

export default function WishlistView({
  type,
  status = "wishlist",
  title,
  filters = [],
  activeFilter = "all",
  onFilterChange = null
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState(null);

  async function reload() {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const response = await fetch(`/api/items?${params.toString()}`);
    const data = await response.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status]);

  async function complete(id) {
    await fetch(`/api/items/${id}/complete`, { method: "PATCH" });
    reload();
  }

  async function discard(id) {
    const ok = window.confirm("¿Descartar este item?");
    if (!ok) return;
    await fetch(`/api/items/${id}/discard`, { method: "PATCH" });
    reload();
  }

  return (
    <section>
      <div className="header-row">
        <h1 style={{ margin: 0 }}>{title}</h1>
      </div>

      {filters.length > 0 && onFilterChange ? (
        <div className="wishlist-type-tabs" role="tablist" aria-label="Filtrar wishlist por tipo">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.id}
              className={`wishlist-type-tab ${activeFilter === filter.id ? "active" : ""}`}
              onClick={() => onFilterChange(filter.id)}
            >
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {loading ? <p className="empty">Cargando lista...</p> : null}
      {!loading && !items.length ? <p className="empty">No hay elementos por ahora.</p> : null}
      <div className="wishlist-list">
        {items.map((item) => (
          <WishlistRow
            key={item.id}
            item={item}
            onComplete={complete}
            onDiscard={discard}
            onView={(selectedItem) => setDetailItem(selectedItem)}
          />
        ))}
      </div>

      {detailItem ? (
        <div className="modal-backdrop" onClick={() => setDetailItem(null)}>
          <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn btn-ghost modal-close" onClick={() => setDetailItem(null)}>
              Cerrar
            </button>
            {detailItem.posterImage ? (
              <img className="poster modal-detail-poster" src={detailItem.posterImage} alt={detailItem.title} />
            ) : (
              <div className="poster modal-detail-poster" aria-hidden="true" />
            )}
            <div className="modal-detail-body">
              <h3 style={{ marginTop: 0 }}>{detailItem.title}</h3>
              <p className="meta">{detailItem.type.toUpperCase()}</p>
              <p className="row-sub">{detailItem.notes || "Sin descripcion disponible."}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

