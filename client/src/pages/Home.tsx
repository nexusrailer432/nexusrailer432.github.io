import { ArrowRight, BookOpen, Code2, Download, ShieldCheck, Users } from "lucide-react";
import { Link } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import { lessonsData } from "@/content/lessons.generated";
import { releaseData } from "@/content/downloads.generated";
import { sections } from "@/content/reference";

const features = [
  {
    icon: BookOpen,
    title: "Readable by design",
    body: "Actions are written as short instructions — remember my name as Alex — while expressions keep the shape of maths.",
  },
  {
    icon: ShieldCheck,
    title: "Checked before it runs",
    body: "A whole program is validated before anything happens, so mistakes are reported with the line, the reason and a suggestion.",
  },
  {
    icon: Users,
    title: "Small on purpose",
    body: "Four kinds of value, no classes, no imports. Every feature that exists is fully implemented and tested.",
  },
];

const stats = [
  ["1061", "tests, zero failing"],
  [String(lessonsData.lessons.length), "numbered lessons"],
  [String(sections.length), "reference sections"],
  ["4", "kinds of value"],
];

export default function Home() {
  const firstLesson = lessonsData.lessons[0];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">NOVA 1.0.0 · first stable release</p>
            <h1>
              Programming that feels like <em>texting.</em>
            </h1>
            <p className="hero-lede">
              NOVA is a beginner-friendly programming language. Actions read like short
              instructions, expressions keep the shape of maths, and the whole language
              fits in an afternoon.
            </p>
            <div className="hero-actions">
              <Link href="/learn" className="button primary">
                Start learning <ArrowRight size={17} />
              </Link>
              <Link href="/docs" className="button secondary">
                Read the reference
              </Link>
            </div>
            <p className="status-line">
              <span className="status-dot" />
              Source release available <span className="separator">·</span> Python 3.10+ ·
              no dependencies
            </p>
          </div>

          <div className="hero-art">
            <div className="art-rule" />
            <img src="/assets/nova-banner.jpg" alt="The NOVA wordmark" width={640} height={360} />
            <div className="art-caption">The official NOVA mark</div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="code-section">
        <div className="container code-grid">
          <div>
            <p className="eyebrow light">A first look</p>
            <h2>
              Start with words
              <br />
              you already know.
            </h2>
            <p className="light-copy">
              This is the first lesson from the release, run exactly as it ships. Every
              program on this site is executed against the interpreter before the site is
              built.
            </p>
            <Link href="/learn" className="button light-button">
              See all {lessonsData.lessons.length} lessons <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-code">
            <CodeBlock
              code={firstLesson.code}
              file={firstLesson.file}
              output={firstLesson.output}
            />
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container split">
          <div>
            <p className="eyebrow">Why NOVA</p>
            <h2>A gentle path into serious programming.</h2>
          </div>
          <div className="intro-copy">
            <p>
              NOVA is for people who want to understand how software works without first
              having to decode an intimidating syntax. It is not a replacement for Python
              and is not trying to be one — it is a first language.
            </p>
            <p>
              Ten lessons cover everything it does, ending with a quiz that saves your best
              score to a file. Nothing is half-built: every feature is implemented, tested
              and documented.
            </p>
            <Link href="/about" className="text-link">
              Read about the project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The NOVA approach</p>
              <h2>Friendly first. Capable next.</h2>
            </div>
            <p>Built for learners, with a foundation that can grow with them.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, body }) => (
              <article className="feature" key={title}>
                <Icon size={24} strokeWidth={1.7} />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="next-section">
        <div className="container next-grid">
          <div>
            <p className="eyebrow">Keep going</p>
            <h2>Everything you need is here.</h2>
            <p>
              Read the lessons in order, look up the exact rule when you need it, or take
              the release and start writing your own programs.
            </p>
          </div>
          <div className="link-list">
            <Link href="/learn">
              <span>
                <BookOpen size={19} />
                <b>Learn NOVA</b>
                <small>Ten lessons, each with real output</small>
              </span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/docs">
              <span>
                <Code2 size={19} />
                <b>Documentation</b>
                <small>{sections.length} sections, every sample verified</small>
              </span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/downloads">
              <span>
                <Download size={19} />
                <b>Download {releaseData.version}</b>
                <small>Source release with a published checksum</small>
              </span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
