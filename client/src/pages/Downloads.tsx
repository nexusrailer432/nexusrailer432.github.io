import { AlertTriangle, Check, Copy, Download, FileArchive, ShieldCheck, Terminal } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import { releaseData } from "@/content/downloads.generated";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Downloads() {
  const [copied, setCopied] = useState(false);

  const copyChecksum = async () => {
    try {
      await navigator.clipboard.writeText(releaseData.sha256);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="container narrow">
        <p className="eyebrow">Downloads</p>
        <h1>Get NOVA 1.0.0.</h1>
        <p className="lede">
          NOVA is a folder of Python files. It needs Python 3.10 or newer and nothing
          else — no install step, no dependencies, no build.
        </p>

        <div className="download-card">
          <div className="download-main">
            <div className="download-icon">
              <FileArchive size={26} />
            </div>
            <div>
              <span className="release-label">Latest release · source</span>
              <h2>NOVA {releaseData.version}</h2>
              <p>
                {releaseData.fileCount} files · {releaseData.lessonCount} numbered lessons ·{" "}
                {releaseData.exampleCount} example programs · {formatBytes(releaseData.bytes)}
              </p>
            </div>
          </div>
          <a className="button primary download-button" href={releaseData.url} download={releaseData.filename}>
            <Download size={17} /> Download {releaseData.filename}
          </a>
        </div>

        <div className="checksum-row">
          <div>
            <span className="checksum-label">SHA-256</span>
            <code className="checksum">{releaseData.sha256}</code>
          </div>
          <button type="button" className="ghost-button" onClick={copyChecksum}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <h2 className="section-title">Verify what you downloaded</h2>
        <p className="doc-p">
          Compare the hash above with the one your machine computes. If they match, the
          file is exactly what was published.
        </p>
        <CodeBlock
          lang="bash"
          file="terminal"
          code={`# macOS and Linux\nshasum -a 256 ${releaseData.filename}\n\n# Windows PowerShell\nGet-FileHash ${releaseData.filename} -Algorithm SHA256`}
        />

        <h2 className="section-title">Run it</h2>
        <p className="doc-p">Unpack the archive, open a terminal inside it, and run any lesson:</p>
        <CodeBlock
          lang="bash"
          file="terminal"
          code={"unzip nova-1.0.0.zip\ncd nova-1.0.0\npython3 nova.py examples/01_hello.nova"}
        />
        <p className="doc-p">
          On Windows, use <code className="inline-code">python</code> instead of{" "}
          <code className="inline-code">python3</code>. Write your own programs as{" "}
          <code className="inline-code">.nova</code> files and run them the same way.
        </p>

        <h2 className="section-title">What is inside</h2>
        <ul className="doc-list">
          <li>
            <code className="inline-code">nova.py</code> — the command you run.
          </li>
          <li>
            <code className="inline-code">novalang/</code> — the interpreter: tokenizer,
            parser, validation pass, runtime, error messages.
          </li>
          <li>
            <code className="inline-code">examples/</code> — the {releaseData.lessonCount}{" "}
            numbered lessons plus smaller single-feature programs.
          </li>
          <li>
            <code className="inline-code">README.md</code> — the full written reference.
          </li>
        </ul>
        <p className="doc-p">
          The test suite and the Windows packaging scripts are not in this archive; they
          live in the project repository. The interpreter in this download is the same
          code those tests cover.
        </p>

        <h2 className="section-title">What does not exist yet</h2>
        <div className="doc-note warning">
          <span className="doc-note-mark" aria-hidden="true">
            !
          </span>
          <p>
            There is no standalone <code className="inline-code">nova</code> command and no
            installer. A Windows build is prepared but has not been produced, because it
            needs a Windows build machine. Nothing here pretends otherwise: the source
            release is the only download, and it works on Windows, macOS and Linux through
            Python.
          </p>
        </div>

        <div className="download-foot">
          <div>
            <ShieldCheck size={18} />
            <div>
              <strong>Security model</strong>
              <p>
                The interpreter contains no <code className="inline-code">eval</code>,{" "}
                <code className="inline-code">exec</code>, <code className="inline-code">compile</code>{" "}
                or subprocess execution, and a NOVA program can only touch files your own
                user account can.
              </p>
            </div>
          </div>
          <div>
            <Terminal size={18} />
            <div>
              <strong>No install required</strong>
              <p>
                Nothing is added to your PATH and no system files are touched. Deleting the
                folder removes NOVA completely.
              </p>
            </div>
          </div>
          <div>
            <AlertTriangle size={18} />
            <div>
              <strong>License not chosen yet</strong>
              <p>
                Until a license is picked, treat NOVA as source-available for learning and
                evaluation. See <Link href="/about">About NOVA</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
