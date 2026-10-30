import { ArrowLeft, ArrowRight, BookOpen, Check, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import { Inline } from "@/components/Inline";
import { sections, type Block } from "@/content/reference";

function renderBlock(block: Block, index: number) {
  switch (block.kind) {
    case "p":
      return (
        <p className="doc-p" key={index}>
          <Inline text={block.text} />
        </p>
      );
    case "note":
      return (
        <aside className="doc-note" key={index}>
          <span className="doc-note-mark" aria-hidden="true">
            !
          </span>
          <p>
            <Inline text={block.text} />
          </p>
        </aside>
      );
    case "list":
      return (
        <ul className="doc-list" key={index}>
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="table-scroll" key={index}>
          <table className="doc-table">
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col">
                    <Inline text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <CodeBlock
          key={index}
          code={block.code}
          file={block.file}
          lang={block.lang}
          output={block.output}
          answers={block.input?.trim().replace(/\n/g, ", ")}
        />
      );
  }
}

function useActiveSection() {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Docs() {
  const [location] = useLocation();
  const active = useActiveSection();

  // Jump to the anchor after the page renders (the browser does this too,
  // but client routing means the element may not exist yet on first paint).
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      // Jump straight there: a smooth scroll across a long page takes seconds.
      requestAnimationFrame(() =>
        target.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior }),
      );
    }
  }, [location]);

  const currentIndex = useMemo(
    () => Math.max(0, sections.findIndex((section) => section.id === active)),
    [active],
  );
  const previous = sections[currentIndex - 1];
  const next = sections[currentIndex + 1];

  return (
    <section className="page-shell docs-shell">
      <div className="container">
        <div className="docs-head">
          <p className="eyebrow">Documentation · NOVA 1.0.0</p>
          <h1>The NOVA handbook.</h1>
          <p className="lede">
            The complete language reference for NOVA 1.0.0. Every program on this page
            is executed against the released interpreter before the site is built, so
            the output you read is the output you get.
          </p>
          <p className="verified-line">
            <Check size={15} /> {sections.length} sections · every code sample verified
            against the interpreter
          </p>
        </div>

        <div className="docs-layout">
          <nav className="docs-nav" aria-label="Documentation contents">
            <p className="docs-nav-title">On this page</p>
            <ol>
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={section.id === active ? "active" : ""}
                    aria-current={section.id === active ? "true" : undefined}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
            <Link href="/learn" className="docs-nav-cta">
              <BookOpen size={15} /> Prefer lessons?
            </Link>
          </nav>

          <div className="docs-body">
            {sections.map((section) => (
              <article className="doc-section" id={section.id} key={section.id}>
                <h2>
                  {section.title}
                  <a href={`#${section.id}`} className="anchor" aria-label={`Link to ${section.title}`}>
                    <Link2 size={15} />
                  </a>
                </h2>
                <p className="doc-summary">{section.summary}</p>
                {section.blocks.map(renderBlock)}
              </article>
            ))}

            <div className="doc-pager">
              {previous ? (
                <Link href={`/docs#${previous.id}`} className="pager-link">
                  <ArrowLeft size={16} />
                  <span>
                    <small>Previous</small>
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/docs#${next.id}`} className="pager-link right">
                  <span>
                    <small>Next</small>
                    {next.title}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
