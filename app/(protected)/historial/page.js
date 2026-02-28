import WishlistView from "@/components/wishlist/wishlist-view";

export default function HistorialPage({ searchParams }) {
  const status = searchParams?.status === "discarded" ? "discarded" : "completed";
  return <WishlistView type="" status={status} title={`Historial (${status})`} />;
}
