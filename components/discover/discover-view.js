"use client";

import ExplorePageClient from "@/components/discover/explore-page-client";

export default function DiscoverView() {
  return <ExplorePageClient endpoint="/api/discover" pageType="home" showTypeCards />;
}
