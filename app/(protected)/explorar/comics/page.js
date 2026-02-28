import TypeExplorePage from "@/components/discover/type-explore-page";

export default function ExplorarComicsPage() {
  return <TypeExplorePage endpoint="/api/discover/comics" pageType="comics" />;
}
