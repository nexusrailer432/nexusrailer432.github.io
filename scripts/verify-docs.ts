/**
 * Verify the documentation against the released interpreter.
 *
 * Every code block in client/src/content/reference.ts that declares `output`
 * is executed here. If the interpreter prints something different, this
 * script fails and prints both versions. That is the whole point: the site
 * must never claim behaviour NOVA does not have.
 *
 * Usage:
 *   pnpm verify:docs                 # uses ../nova/nova.py
 *   pnpm verify:docs -- --nova PATH  # explicit interpreter
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { sections, type Block } from "../client/src/content/reference";

const ROOT = path.resolve(import.meta.dirname, "..");

function findNova(): string {
  const flag = process.argv.indexOf("--nova");
  if (flag !== -1) {
    const explicit = path.resolve(process.argv[flag + 1] ?? "");
    if (fs.existsSync(explicit)) return explicit;
    fail(`No interpreter at ${explicit}`);
  }
  const candidates = [path.join(ROOT, "..", "nova", "nova.py"), path.join(ROOT, "nova", "nova.py")];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return path.resolve(candidate);
  }
  return fail(
    "Could not find nova.py. Pass it with: pnpm verify:docs -- --nova /path/to/nova/nova.py",
  );
}

function fail(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/** Trim only the trailing newline a terminal would not show. */
function normalise(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

type Result = { stdout: string; stderr: string; status: number };

function run(args: string[], input: string | undefined, cwd: string): Result {
  try {
    const stdout = execFileSync(process.env.PYTHON ?? "python3", args, {
      input: input ?? "",
      // Keep a failing program's stderr out of the verifier's own output;
      // it is compared against the expected message instead.
      stdio: ["pipe", "pipe", "pipe"],
      cwd,
      encoding: "utf-8",
      timeout: 60_000,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    return { stdout, stderr: "", status: 0 };
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
      status: failure.status ?? 1,
    };
  }
}

function check(
  block: Block,
  nova: string,
  label: string,
  stage: (workdir: string) => void,
): boolean {
  if (block.kind !== "code" || block.output === undefined) return true;

  const expected = normalise(block.output);
  const isError = expected.startsWith("NOVA error on line");
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-docs-"));
  stage(workdir);

  let result: Result;

  if (block.lang === "bash") {
    // Terminal blocks are real commands; strip the "python nova.py" prefix.
    const commands = block.code
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const outputs: string[] = [];
    let status = 0;
    for (const command of commands) {
      const match = command.match(/^python3? nova\.py\s*(.*)$/);
      if (!match) {
        fail(`${label}: cannot verify shell command "${command}"`);
      }
      const args = [nova, ...match[1].split(/\s+/).filter(Boolean)];
      const step = run(args, undefined, workdir);
      outputs.push(step.stdout);
      status = step.status;
      if (status !== 0) break;
    }
    result = { stdout: outputs.join(""), stderr: "", status };
  } else {
    const file = path.join(workdir, "verify.nova");
    fs.writeFileSync(file, `${block.code}\n`, "utf-8");
    result = run([nova, file], block.input, workdir);
  }

  const actual = normalise(isError ? result.stderr : result.stdout);
  const ok = actual === expected && (isError ? result.status !== 0 : result.status === 0);

  if (!ok) {
    console.error(`\n  FAIL  ${label}`);
    console.error(`  ── expected ──\n${indent(expected)}`);
    console.error(`  ── actual (exit ${result.status}) ──\n${indent(actual)}`);
    if (result.stderr && !isError) console.error(`  ── stderr ──\n${indent(result.stderr)}`);
  }

  fs.rmSync(workdir, { recursive: true, force: true });
  return ok;
}

function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
}

function main(): void {
  const nova = findNova();
  const version = execFileSync(process.env.PYTHON ?? "python3", [nova, "--version"], {
    encoding: "utf-8",
  }).trim();

  let checked = 0;
  let failed = 0;

  for (const section of sections) {
    // Terminal blocks are real sessions: stage the files the section talks
    // about, plus the release's own examples folder, so they can actually run.
    const stage = (workdir: string) => {
      for (const block of section.blocks) {
        if (block.kind === "code" && block.lang !== "bash" && block.file) {
          fs.writeFileSync(path.join(workdir, block.file), `${block.code}\n`, "utf-8");
        }
      }
      const examples = path.join(path.dirname(nova), "examples");
      if (fs.existsSync(examples)) {
        fs.cpSync(examples, path.join(workdir, "examples"), { recursive: true });
      }
    };

    for (const [index, block] of section.blocks.entries()) {
      if (block.kind !== "code" || block.output === undefined) continue;
      checked += 1;
      if (!check(block, nova, `${section.id} › block ${index + 1}`, stage)) failed += 1;
    }
  }

  if (failed > 0) {
    fail(`${failed} of ${checked} documented outputs do not match ${version}.`);
  }

  console.log(`  ${checked} documented outputs match ${version} exactly.`);
}

main();
