"use client";

import { useMemo, useState } from "react";
import WishlistView from "@/components/wishlist/wishlist-view";

const FILTERS = [
  { id: "all", label: "Todos", type: "" },
  { id: "movie", label: "Peliculas", type: "movie" },
  { id: "tv", label: "Series", type: "tv" },
  { id: "book", label: "Libros", type: "book" },
  { id: "comic", label: "Comics", type: "comic" }
];

export default function PeliculasPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const selected = useMemo(
    () => FILTERS.find((filter) => filter.id === activeFilter) || FILTERS[0],
    [activeFilter]
  );

  return (
    <WishlistView
      type={selected.type}
      title={`Wishlist ${selected.label}`}
      filters={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
    />
  );
}

