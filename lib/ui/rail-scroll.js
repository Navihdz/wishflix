export function getRailScrollStep(clientWidth) {
  const width = Number(clientWidth) || 0;
  if (width <= 0) return 240;
  return Math.max(240, Math.round(width * 0.8));
}

export function scrollRailByDirection(railElement, direction = "next") {
  if (!railElement || typeof railElement.scrollBy !== "function") return;
  const step = getRailScrollStep(railElement.clientWidth);
  const sign = direction === "prev" ? -1 : 1;
  railElement.scrollBy({ left: sign * step, behavior: "smooth" });
}
