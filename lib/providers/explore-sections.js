export function compactSections(sections = []) {
  return sections.filter(
    (section) =>
      section &&
      typeof section.id === "string" &&
      typeof section.title === "string" &&
      Array.isArray(section.items) &&
      section.items.length > 0
  );
}

export function buildExplorePayload({ hero = null, sections = [], meta = {} } = {}) {
  return {
    hero,
    sections: compactSections(sections),
    meta
  };
}
