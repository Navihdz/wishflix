function getItemKey(item) {
  return `${item?.type || ""}:${item?.source || ""}:${item?.external_id || item?.externalId || ""}`;
}

export function mergeUniqueRailItems(current = [], incoming = []) {
  const out = [...(current || [])];
  const seen = new Set(out.map(getItemKey));

  for (const item of incoming || []) {
    const key = getItemKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export function buildLoopRenderItems(items = [], loopEnabled = false) {
  if (!loopEnabled || !Array.isArray(items) || items.length < 2) return items || [];
  return [...items, ...items];
}

export function getLoopResetScrollLeft({ scrollLeft = 0, scrollWidth = 0, loopEnabled = false } = {}) {
  if (!loopEnabled) return null;
  if (!scrollWidth || scrollWidth <= 0) return null;
  const midpoint = scrollWidth / 2;
  if (scrollLeft < midpoint) return null;
  return scrollLeft - midpoint;
}
