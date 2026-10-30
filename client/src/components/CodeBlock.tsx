import { Check, Copy, Terminal } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  code: string;
  file?: string;
  lang?: "nova" | "bash";
  output?: string;
  /** Answers supplied to an interactive program, shown so the session reads correctly. */
  answers?: string;
};

/** NOVA words worth colouring. Kept in one place so the palette stays honest. */
const NOVA_KEYWORDS = new Set([
  "say", "remember", "my", "as", "ask", "answer", "copy", "if", "otherwise", "done",
  "repeat", "times", "while", "define", "return", "is", "not", "and", "or", "set",
  "add", "to", "remove", "write", "append", "read", "file", "exists", "length", "of",
  "true", "false", "newline", "plus", "minus", "divided", "by", "greater", "than",
  "less", "above", "below", "more",
]);

/**
 * A deliberately small highlighter: strings first, then words, then numbers.
 * It never tries to be a parser — it just makes NOVA readable at a glance.
 */
function highlightLine(line: string, lang: "nova" | "bash"): ReactNode {
  if (lang === "nova" && line.trimStart().startsWith("#")) {
    return <span className="tok-comment">{line}</span>;
  }

  const parts: ReactNode[] = [];
  // Split on quoted text so keywords inside a string are left alone.
  const pieces = line.split(/("[^"]*")/g);
  let key = 0;

  for (const piece of pieces) {
    if (piece.startsWith('"') && piece.endsWith('"') && piece.length > 1) {
      parts.push(
        <span className="tok-string" key={key++}>
          {piece}
        </span>,
      );
      continue;
    }

    // Within unquoted text, colour whole words and numbers.
    const words = piece.split(/(\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b)/g);
    for (const word of words) {
      if (!word) continue;
      const lower = word.toLowerCase();
      if (/^\d/.test(word)) {
        parts.push(
          <span className="tok-number" key={key++}>
            {word}
          </span>,
        );
      } else if (NOVA_KEYWORDS.has(lower)) {
        parts.push(
          <span className="tok-keyword" key={key++}>
            {word}
          </span>,
        );
      } else {
        parts.push(word);
      }
    }
  }

  return <>{parts}</>;
}

/**
 * A code panel with a working copy button.
 *
 * When `output` is present it shows what the released interpreter actually
 * printed — those outputs are checked by `pnpm verify:docs`, not written by hand.
 */
export function CodeBlock({ code, file, lang = "nova", output, answers }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard access can be blocked; fall back to a temporary textarea.
      const area = document.createElement("textarea");
      area.value = code;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }, [code]);

  const lines = code.split("\n");

  return (
    <figure className="code-figure">
      <div className="code-figure-bar">
        <span className="code-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code-filename">{file ?? (lang === "bash" ? "terminal" : "program.nova")}</span>
        <button type="button" className="copy-button" onClick={copy} aria-label="Copy this code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="code-body">
        <pre tabIndex={0} aria-label={`${file ?? "code"} source`}>
          <code>
            {lines.map((line, index) => (
              <span className="code-line" key={index}>
                <span className="line-number" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="line-text">{line ? highlightLine(line, lang) : "\u00a0"}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      {output !== undefined && (
        <div className="code-output">
          <div className="code-output-bar">
            <Terminal size={13} />
            <span>Output</span>
            {answers && <span className="answers">typed: {answers}</span>}
          </div>
          <pre>{output}</pre>
        </div>
      )}
    </figure>
  );
}
