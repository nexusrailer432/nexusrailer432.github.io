import { ArrowRight, BookOpen, GraduationCap, Search as SearchIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { search, searchCorpusSize } from "@/lib/search";

const SUGGESTIONS = ["lists", "newline", "if", "ask", "file exists", "repeat"];

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        terms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export default function Search() {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  // Keep the query in the URL so a search can be shared or bookmarked.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [query]);

  const results = useMemo(() => search(query), [query]);
  const trimmed = query.trim();

  return (
    <section className="page-shell">
      <div className="container narrow">
        <p className="eyebrow">Search</p>
        <h1>Find your way around.</h1>
        <p className="lede">
          Search runs in your browser across all {searchCorpusSize} pages of reference and
          lessons. Nothing is sent anywhere.
        </p>

        <form
          className="search-form"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const first = results[0];
            if (first) window.location.assign(first.href);
          }}
        >
          <SearchIcon size={19} />
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
            placeholder="Try “lists”, “newline”, or “file exists”"
            aria-label="Search the documentation and lessons"
            autoComplete="off"
            spellCheck={false}
          />
          {trimmed && (
            <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
          <button type="submit" className="search-submit">
            Search
          </button>
        </form>

        {!trimmed && (
          <div className="search-idle">
            <p className="search-hint">Try one of these:</p>
            <div className="suggestion-row">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => setQuery(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {trimmed && (
          <div className="search-results">
            <p className="search-count">
              {results.length === 0
                ? "No matches."
                : `${results.length} ${results.length === 1 ? "result" : "results"} for “${trimmed}”`}
            </p>

            {results.length === 0 ? (
              <div className="search-empty">
                <SearchIcon size={22} />
                <h2>Nothing matched “{trimmed}”.</h2>
                <p>
                  NOVA 1.0 is a small language, so a term that isn’t here may be a feature
                  that does not exist yet. Check{" "}
                  <Link href="/docs#limits">what NOVA does not have</Link>, or browse the{" "}
                  <Link href="/docs">reference</Link>.
                </p>
              </div>
            ) : (
              <ul className="result-list">
                {results.map((hit) => (
                  <li key={`${hit.href}-${hit.title}`}>
                    <Link href={hit.href} className="result">
                      <span className="result-kind">
                        {hit.kind === "docs" ? <BookOpen size={13} /> : <GraduationCap size={13} />}
                        {hit.section}
                      </span>
                      <strong>{hit.title}</strong>
                      <p>
                        <Highlight text={hit.snippet} terms={hit.matched} />
                      </p>
                      <ArrowRight size={16} className="result-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
