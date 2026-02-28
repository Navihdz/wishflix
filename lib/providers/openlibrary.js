function normalizeOpenLibrary(doc, forcedType = null) {
  const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null;
  const joinedSubjects = Array.isArray(doc.subject) ? doc.subject.join(" ") : "";
  const isComic = /comic|graphic novel|manga/i.test(`${joinedSubjects} ${doc.title || ""}`);
  const normalizedType = forcedType || (isComic ? "comic" : "book");
  return {
    title: doc.title || "Sin titulo",
    poster_image: cover,
    type: normalizedType,
    source: "openlibrary",
    external_id: doc.key || String(doc.cover_i || Math.random()),
    year: doc.first_publish_year ? String(doc.first_publish_year) : "",
    published_at_year: doc.first_publish_year ? Number(doc.first_publish_year) : null,
    overview: ""
  };
}

const EXTERNAL_API_TIMEOUT_MS = Number(process.env.EXTERNAL_API_TIMEOUT_MS || 8000);

function normalizeSubjectWork(work, forcedType = "book") {
  return {
    title: work.title || "Sin titulo",
    poster_image: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` : null,
    type: forcedType,
    source: "openlibrary",
    external_id: work.key || String(work.cover_id || Math.random()),
    year: work.first_publish_year ? String(work.first_publish_year) : "",
    published_at_year: work.first_publish_year ? Number(work.first_publish_year) : null,
    overview: ""
  };
}

export const OPENLIBRARY_BOOK_SUBJECTS = [
  { id: "fiction", title: "Ficcion popular", slug: "fiction" },
  { id: "fantasy", title: "Fantasia", slug: "fantasy" },
  { id: "science-fiction", title: "Ciencia ficcion", slug: "science_fiction" },
  { id: "romance", title: "Romance", slug: "romance" },
  { id: "mystery", title: "Misterio", slug: "mystery" },
  { id: "history", title: "Historia", slug: "history" },
  { id: "young-adult", title: "Juvenil", slug: "young_adult_fiction" },
  { id: "classics", title: "Clasicos", slug: "classic_literature" }
];

export const OPENLIBRARY_COMIC_SUBJECTS = [
  { id: "comic-books-strips", title: "Comic books & strips", slug: "comic_books_strips" },
  { id: "graphic-novels", title: "Graphic novels", slug: "graphic_novels" },
  { id: "manga", title: "Manga", slug: "manga" },
  { id: "superheroes", title: "Superheroes", slug: "superheroes" },
  { id: "fantasy-comics", title: "Fantasy comics", slug: "fantasy_comics" },
  { id: "science-fiction-comics", title: "Sci-fi comics", slug: "science_fiction_comics" },
  { id: "kids-comics", title: "Kids comics", slug: "childrens_comics" }
];

export async function searchOpenLibrary(query, limit = 20, forcedType = null) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(EXTERNAL_API_TIMEOUT_MS)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.docs || []).map((doc) => normalizeOpenLibrary(doc, forcedType));
  } catch {
    return [];
  }
}

export async function discoverOpenLibrarySubject(subject, type = "book", limit = 24, page = 1) {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Math.floor(Number(page)) : 1;
  const offset = (safePage - 1) * limit;
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=${limit}&offset=${offset}`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(EXTERNAL_API_TIMEOUT_MS)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.works || []).map((work) => normalizeSubjectWork(work, type));
  } catch {
    return [];
  }
}

export async function discoverBooks() {
  return discoverOpenLibrarySubject("fiction", "book", 24);
}

export async function discoverComics() {
  return discoverOpenLibrarySubject("comic_books_strips", "comic", 24);
}
