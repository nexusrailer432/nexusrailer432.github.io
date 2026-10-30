import { lessonsData } from "@/content/lessons.generated";
import { blockText, sections } from "@/content/reference";

export type SearchEntry = {
  kind: "docs" | "lesson";
  title: string;
  section: string;
  href: string;
  text: string;
};

export type SearchHit = SearchEntry & {
  score: number;
  snippet: string;
  matched: string[];
};

/**
 * The search index is built from the same content the pages render, so a
 * result can never point at text that isn't on the site.
 */
export const searchIndex: SearchEntry[] = [
  ...sections.map((section) => ({
    kind: "docs" as const,
    title: section.title,
    section: "Reference",
    href: `/docs#${section.id}`,
    text: [section.summary, ...section.blocks.map(blockText)].join(" "),
  })),
  ...lessonsData.lessons.map((lesson) => ({
    kind: "lesson" as const,
    title: `Lesson ${lesson.number}: ${lesson.title}`,
    section: "Learn NOVA",
    href: `/learn#lesson-${lesson.number}`,
    text: [lesson.summary, lesson.code, lesson.output].join(" "),
  })),
];

const MAX_SNIPPET = 180;

function snippetFor(text: string, term: string): string {
  const at = text.toLowerCase().indexOf(term);
  if (at === -1) return text.slice(0, MAX_SNIPPET).trim();

  const start = Math.max(0, at - Math.floor(MAX_SNIPPET / 3));
  const end = Math.min(text.length, start + MAX_SNIPPET);
  const body = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
}

export function search(query: string, limit = 20): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const entry of searchIndex) {
    const title = entry.title.toLowerCase();
    const text = entry.text.toLowerCase();
    const matched: string[] = [];
    let score = 0;

    for (const term of terms) {
      let termScore = 0;
      if (title.includes(term)) termScore += 12;
      const occurrences = text.split(term).length - 1;
      if (occurrences > 0) termScore += Math.min(occurrences, 6) * 2;
      if (termScore > 0) {
        matched.push(term);
        score += termScore;
      }
    }

    // Require every word, unless nothing at all would match.
    if (matched.length === 0) continue;

    hits.push({
      ...entry,
      score: score + (matched.length === terms.length ? 10 : 0),
      snippet: snippetFor(entry.text, matched[0]),
      matched,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const searchCorpusSize = searchIndex.length;
