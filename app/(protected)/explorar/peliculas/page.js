import TypeExplorePage from "@/components/discover/type-explore-page";

export default function ExplorarPeliculasPage() {
  return <TypeExplorePage endpoint="/api/discover/movies" pageType="movies" />;
}
