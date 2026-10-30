import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { lessonsData } from "@/content/lessons.generated";
import { sections } from "@/content/reference";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-shell">
      <div className="container narrow">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{intro}</p>
        {children}
      </div>
    </section>
  );
}

export function packages() {
  return (
    <PageShell
      eyebrow="Packages"
      title="An ecosystem can come later."
      intro="NOVA has no package manager and no registry. This page exists so the vocabulary is settled before anything is built on it — not to imply that packages are coming soon."
    >
      <div className="empty-state">
        <div className="empty-mark">∅</div>
        <h2>No packages have been published.</h2>
        <p>
          A NOVA program is a single file that uses only built-in commands, so there is
          nothing to install yet. Publishing would need a registry, a versioning scheme
          and a review process — none of which exist.
        </p>
        <span className="placeholder-chip">Registry: not available</span>
      </div>
      <div className="principles">
        <div>
          <b>Discover</b>
          <span>Find packages by name, purpose and documentation.</span>
        </div>
        <div>
          <b>Understand</b>
          <span>See versions, authors, dependencies and licenses.</span>
        </div>
        <div>
          <b>Trust</b>
          <span>Verification status and security context should be visible.</span>
        </div>
      </div>
    </PageShell>
  );
}

export function community() {
  return (
    <PageShell
      eyebrow="Community"
      title="Make NOVA better together."
      intro="There is no official chat server, forum or repository URL yet. Rather than link to channels that do not exist, this page describes how contributions are handled once there is somewhere to send them."
    >
      <div className="community-grid">
        <div>
          <h2>Discussions</h2>
          <p>A place for language questions, ideas and feedback.</p>
          <span className="placeholder-chip">Official channel: not decided</span>
        </div>
        <div>
          <h2>Contribute</h2>
          <p>Improve examples, documentation, error messages and tooling.</p>
          <Link href="/contributing" className="text-link">
            Contribution guide <ArrowRight size={15} />
          </Link>
        </div>
        <div>
          <h2>Source</h2>
          <p>The project is not yet published to a public repository.</p>
          <span className="placeholder-chip">Repository: not published</span>
        </div>
      </div>
    </PageShell>
  );
}

export function news() {
  return (
    <PageShell
      eyebrow="News & updates"
      title="A project in the open."
      intro="Release notes will be posted here. Nothing has been announced yet, so this page stays empty rather than inventing a history."
    >
      <div className="news-empty">
        <span className="news-date">No entries yet</span>
        <h2>There are no published updates.</h2>
        <p>
          The next entry will be the 1.0.0 release announcement, once the repository and
          domain are settled. Until then, the{" "}
          <Link href="/downloads">source release</Link> is the current state of the
          project.
        </p>
      </div>
    </PageShell>
  );
}

export function contributing() {
  const steps = [
    {
      title: "Understand the project",
      body: "Read the language goals and the list of things NOVA deliberately does not do. The language is frozen at 1.0.0, so syntax changes need a design discussion before any code.",
    },
    {
      title: "Find a useful improvement",
      body: "Clear bug reports, better error messages, more example programs and clearer documentation are the four kinds of contribution this project actually wants.",
    },
    {
      title: "Keep the suite green",
      body: "Any change to the interpreter has to keep the whole suite passing and add a test for the behaviour it changes. Nothing merges with a failing test.",
    },
    {
      title: "Send it once there is somewhere to send it",
      body: "The repository and discussion channels are not published yet. Contributions are being collected, not merged.",
    },
  ];

  return (
    <PageShell
      eyebrow="Contributing"
      title="Help shape what NOVA becomes."
      intro="NOVA 1.0.0 is released and the language is frozen. The most useful contributions now are documentation, examples, clearer errors and careful bug reports."
    >
      <div className="contribute-steps">
        {steps.map((step, index) => (
          <div key={step.title}>
            <span>{index + 1}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="doc-note">
        <span className="doc-note-mark" aria-hidden="true">
          !
        </span>
        <p>
          A useful bug report is the shortest possible NOVA program that shows the problem,
          plus what you expected and what happened. That is enough to write a test from.
        </p>
      </div>
    </PageShell>
  );
}

export function about() {
  const facts = [
    ["Version", "1.0.0 — frozen"],
    ["Tests", "1061, zero failing"],
    ["Lessons", `${lessonsData.lessons.length} numbered programs`],
    ["Reference", `${sections.length} sections`],
    ["Requirements", "Python 3.10+, nothing else"],
    ["Runtime", "Pure Python, standard library only"],
  ];

  return (
    <PageShell
      eyebrow="About NOVA"
      title="A more approachable way to begin."
      intro="NOVA is a beginner-friendly programming language built around one idea: programming that feels like texting. Actions read like short instructions, and expressions keep the familiar shape of maths."
    >
      <div className="facts-grid">
        {facts.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="about-prose">
        <h2>What NOVA is for</h2>
        <p>
          NOVA is a first language. It is not a replacement for Python and it is not
          trying to be one. The goal is something you can read on day one and still use
          to build a real, working program — the tenth lesson is a quiz that saves your
          best score to a file.
        </p>

        <h2>How it is built</h2>
        <p>
          The interpreter is pure Python with no third-party dependencies. A program runs
          in four steps: read the structure, register the functions, check the whole
          program, then run it. Validation happens before execution and has no side
          effects, so a typo is reported before anything happens — even inside a branch
          that would never run.
        </p>

        <h2>Security</h2>
        <p>
          The interpreter contains no <code className="inline-code">eval</code>,{" "}
          <code className="inline-code">exec</code>, <code className="inline-code">compile</code>,{" "}
          <code className="inline-code">__import__</code> or subprocess use, and a test in
          the suite asserts it. NOVA never runs the contents of a file it reads. There is
          no sandbox: a program has the same file permissions as the person running it, so
          run programs you trust.
        </p>

        <h2>What is not decided yet</h2>
        <p>
          The official repository, license, domain and security-reporting address have not
          been chosen. Nothing on this site invents them. When they are settled they will
          appear here and in the site footer.
        </p>
      </div>
    </PageShell>
  );
}

export function security() {
  return (
    <PageShell
      eyebrow="Security"
      title="How NOVA handles trust."
      intro="NOVA has a deliberately small attack surface, and one honest limit: it has no sandbox. Both matter if you are deciding whether to run a program."
    >
      <div className="doc-note">
        <span className="doc-note-mark" aria-hidden="true">
          !
        </span>
        <p>
          There is no security-reporting address yet. Do not send sensitive reports through
          this website. This page will name a contact before any public release.
        </p>
      </div>

      <div className="about-prose">
        <h2>What the interpreter will not do</h2>
        <ul className="doc-list">
          <li>
            It never calls <code className="inline-code">eval</code>,{" "}
            <code className="inline-code">exec</code>, <code className="inline-code">compile</code>,{" "}
            <code className="inline-code">__import__</code> or a subprocess. The test suite
            asserts this.
          </li>
          <li>It never runs the contents of a file it reads — file contents are only ever text.</li>
          <li>It has no networking and no package manager, so a program cannot fetch or install anything.</li>
          <li>It reports errors as written messages, never as Python tracebacks that leak internals.</li>
        </ul>

        <h2>What it does not protect you from</h2>
        <p>
          There is no sandbox. A NOVA program can read and write any file your user
          account can, in any folder, using relative or absolute paths. That is a
          deliberate trade for a first language — the same power a shell script has. Run
          programs you trust, and read a program before you run it.
        </p>

        <h2>Download integrity</h2>
        <p>
          Every release is published with a SHA-256 checksum on the{" "}
          <Link href="/downloads">downloads page</Link>. Check it before running anything.
        </p>
        <p className="verified-line">
          <ShieldCheck size={15} /> No third-party dependencies to audit
        </p>
      </div>
    </PageShell>
  );
}

export function legal(title: string) {
  return function LegalPage() {
    const isContact = title.toLowerCase().includes("contact");
    return (
      <PageShell
        eyebrow="Project information"
        title={title}
        intro="This page is a clearly marked placeholder until NOVA's legal and organisational details are established."
      >
        <div className="about-prose">
          <h2>Information to be supplied</h2>
          <p>
            {isContact
              ? "There is no public contact address for the project yet. When one exists it will be published here rather than implied by a form that goes nowhere."
              : "The project owner has not yet selected an official legal entity, jurisdiction, public domain, license or contact address. None of those details are being invented here."}
          </p>
          <span className="placeholder-chip">Draft placeholder — not a final legal document</span>
        </div>
      </PageShell>
    );
  };
}

export function sitemap() {
  const groups: [string, [string, string][]][] = [
    [
      "Start here",
      [
        ["/", "Home"],
        ["/learn", "Learn NOVA"],
        ["/docs", "Documentation"],
        ["/search", "Search"],
      ],
    ],
    [
      "Get NOVA",
      [
        ["/downloads", "Downloads"],
        ["/packages", "Packages"],
      ],
    ],
    [
      "Project",
      [
        ["/community", "Community"],
        ["/news", "News"],
        ["/contributing", "Contributing"],
        ["/about", "About NOVA"],
      ],
    ],
    [
      "Information",
      [
        ["/security", "Security"],
        ["/contact", "Contact"],
        ["/terms", "Terms of Service"],
        ["/privacy", "Privacy Policy"],
        ["/sitemap", "Sitemap"],
      ],
    ],
  ];

  return (
    <PageShell
      eyebrow="Sitemap"
      title="Every page on this site."
      intro="A plain list of the pages that exist today. The machine-readable version is at /sitemap.xml."
    >
      <div className="doc-columns">
        {groups.map(([heading, links]) => (
          <div key={heading}>
            <h2>{heading}</h2>
            {links.map(([href, label]) => (
              <Link key={href} href={href}>
                {label} <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        ))}
      </div>
      <p className="verified-line">
        <Check size={15} /> Every link on this page resolves
      </p>
    </PageShell>
  );
}
