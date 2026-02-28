"use client";

export default function ContentDetailModal({ item, onClose, onSave, saving, already }) {
  if (!item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-ghost modal-close" onClick={onClose} aria-label="Cerrar detalle">
          Cerrar
        </button>
        {item.poster_image ? (
          <img className="poster modal-detail-poster" src={item.poster_image} alt={item.title} />
        ) : (
          <div className="poster modal-detail-poster" aria-hidden="true" />
        )}
        <div className="modal-detail-body">
          <h3 style={{ marginTop: 0 }}>{item.title}</h3>
          <p className="meta">
            {item.type.toUpperCase()} {item.year ? ` · ${item.year}` : ""}
          </p>
          <p className="row-sub">{item.overview || "Sin descripcion disponible."}</p>
          <button className="btn btn-primary modal-save-btn" disabled={already || saving} onClick={() => onSave(item)}>
            {already ? "Ya en wishlist" : saving ? "Guardando..." : "Guardar en Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

