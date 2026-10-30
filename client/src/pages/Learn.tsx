import { ArrowRight, Check, CircleCheck, FileText, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import { lessonsData } from "@/content/lessons.generated";

const STORAGE_KEY = "nova-lessons-done";

function useCompletedLessons() {
  const [done, setDone] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // Private browsing can block storage; progress simply won't persist.
    }
  }, [done]);

  const toggle = useCallback((lesson: number) => {
    setDone((current) =>
      current.includes(lesson) ? current.filter((n) => n !== lesson) : [...current, lesson],
    );
  }, []);

  const reset = useCallback(() => setDone([]), []);

  return { done, toggle, reset };
}

export default function Learn() {
  const { done, toggle, reset } = useCompletedLessons();
  const lessons = lessonsData.lessons;
  const progress = Math.round((done.length / lessons.length) * 100);

  return (
    <section className="page-shell learn-shell">
      <div className="container">
        <div className="docs-head">
          <p className="eyebrow">Learn NOVA · {lessons.length} lessons</p>
          <h1>Start with the essentials.</h1>
          <p className="lede">
            Ten programs that build on each other, taken straight from the release and
            run against it. Read one, run it yourself, then change something and see
            what happens — that is the fastest way to learn a language.
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-copy">
            <strong>
              {done.length} of {lessons.length} lessons marked done
            </strong>
            <span>Progress is stored in this browser only.</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <button type="button" className="ghost-button" onClick={reset} disabled={done.length === 0}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="docs-layout">
          <nav className="docs-nav" aria-label="Lesson list">
            <p className="docs-nav-title">Lessons</p>
            <ol>
              {lessons.map((lesson) => (
                <li key={lesson.number}>
                  <a href={`#lesson-${lesson.number}`}>
                    {done.includes(lesson.number) && <CircleCheck size={13} className="done-mark" />}
                    {lesson.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="docs-body">
            {lessons.map((lesson) => {
              const isDone = done.includes(lesson.number);
              return (
                <article className="lesson-block" id={`lesson-${lesson.number}`} key={lesson.number}>
                  <header className="lesson-header">
                    <span className="lesson-badge">{String(lesson.number).padStart(2, "0")}</span>
                    <div>
                      <h2>{lesson.title}</h2>
                      <p className="doc-summary">{lesson.summary}</p>
                    </div>
                    <button
                      type="button"
                      className={isDone ? "done-button on" : "done-button"}
                      onClick={() => toggle(lesson.number)}
                      aria-pressed={isDone}
                    >
                      <Check size={14} />
                      {isDone ? "Done" : "Mark done"}
                    </button>
                  </header>

                  <p className="run-line">
                    <FileText size={14} />
                    <code>examples/{lesson.file}</code>
                    <span className="run-sep">·</span>
                    <code>python nova.py examples/{lesson.file}</code>
                  </p>

                  <CodeBlock
                    code={lesson.code}
                    file={lesson.file}
                    output={lesson.output}
                    answers={lesson.stdin ? lesson.stdin.trim().split("\n").join(", ") : undefined}
                  />

                  {lesson.filesWritten.length > 0 && (
                    <p className="lesson-files">
                      This lesson creates {lesson.filesWritten.map((name) => (
                        <code key={name}>{name}</code>
                      ))}{" "}
                      in the folder you run it from.
                    </p>
                  )}
                </article>
              );
            })}

            <div className="lesson-finish">
              <h2>That is the whole language.</h2>
              <p>
                Ten lessons cover every feature NOVA 1.0.0 has. From here, read the{" "}
                <Link href="/docs">reference</Link> when you need the exact rule, or
                grab the <Link href="/downloads">source release</Link> and start writing
                your own programs.
              </p>
              <div className="hero-actions">
                <Link href="/docs" className="button primary">
                  Read the reference <ArrowRight size={16} />
                </Link>
                <Link href="/downloads" className="button secondary">
                  Download NOVA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
