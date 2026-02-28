import TypeExplorePage from "@/components/discover/type-explore-page";

export default function ExplorarLibrosPage() {
  return <TypeExplorePage endpoint="/api/discover/books" pageType="books" />;
}
