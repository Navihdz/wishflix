import ExplorePageClient from "@/components/discover/explore-page-client";

export default function TypeExplorePage({ endpoint, pageType }) {
  return <ExplorePageClient endpoint={endpoint} pageType={pageType} />;
}
