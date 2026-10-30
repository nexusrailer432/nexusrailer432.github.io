#!/usr/bin/env python3
"""
Capture the real output of the ten official NOVA lessons.

The website never invents what a program prints. This script runs each
example through the released interpreter and records stdout, so the lesson
pages can show output that genuinely came from NOVA 1.0.0.

Lessons that ask questions get scripted answers on stdin, and the answers
are recorded too, so the page can show the session honestly.

Usage:
    python3 scripts/capture-lessons.py [--nova PATH]

Writes: client/src/content/lessons.generated.ts
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LESSONS = [
    {
        "file": "01_hello.nova",
        "title": "Hello world",
        "summary": "Print text with say, and see how comments work.",
        "stdin": None,
    },
    {
        "file": "02_variables.nova",
        "title": "Variables",
        "summary": "Give values a name with remember, and duplicate them with copy.",
        "stdin": None,
    },
    {
        "file": "03_input.nova",
        "title": "Input",
        "summary": "Ask a question and keep the answer — including a number.",
        "stdin": "Alex\n15\n",
    },
    {
        "file": "04_calculator.nova",
        "title": "A calculator",
        "summary": "Arithmetic, brackets and precedence, with a guard against dividing by zero.",
        "stdin": "12\n4\n",
    },
    {
        "file": "05_conditions.nova",
        "title": "Conditions",
        "summary": "Make decisions with if, otherwise and nested comparisons.",
        "stdin": "20\nblue\n",
    },
    {
        "file": "06_loops.nova",
        "title": "Loops",
        "summary": "Repeat a fixed number of times, and loop while something stays true.",
        "stdin": None,
    },
    {
        "file": "07_functions.nova",
        "title": "Functions",
        "summary": "Name your steps with define, return values, and build one function from another.",
        "stdin": None,
    },
    {
        "file": "08_lists.nova",
        "title": "Lists",
        "summary": "Store values in order, change them, and walk through them.",
        "stdin": None,
    },
    {
        "file": "09_files.nova",
        "title": "Files",
        "summary": "Write, append and read real text files, and check whether one exists.",
        "stdin": None,
    },
    {
        "file": "10_quiz.nova",
        "title": "A complete program",
        "summary": "A quiz that combines everything above and remembers your best score in a file.",
        "stdin": "4\nblue\n7\n",
    },
]


def find_nova(explicit: str | None) -> Path:
    if explicit:
        candidate = Path(explicit).resolve()
        if candidate.is_file():
            return candidate
        sys.exit(f"No interpreter found at {candidate}")

    for candidate in (ROOT.parent / "nova" / "nova.py", ROOT / "nova" / "nova.py"):
        if candidate.is_file():
            return candidate.resolve()

    sys.exit(
        "Could not find nova.py. Pass it explicitly:\n"
        "  python3 scripts/capture-lessons.py --nova /path/to/nova/nova.py"
    )


def run_lesson(nova: Path, example: Path, stdin_text: str | None) -> dict:
    """Run one example in an empty folder so file-writing lessons stay tidy."""
    with tempfile.TemporaryDirectory(prefix="nova-lesson-") as workdir:
        result = subprocess.run(
            [sys.executable, str(nova), str(example)],
            input=stdin_text or "",
            capture_output=True,
            text=True,
            cwd=workdir,
            timeout=120,
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )
        written = sorted(p.name for p in Path(workdir).iterdir())

    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exitCode": result.returncode,
        "filesWritten": written,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--nova", help="path to nova.py (default: ../nova/nova.py)")
    parser.add_argument(
        "--examples",
        help="folder holding the .nova lessons (default: ../nova/examples)",
    )
    args = parser.parse_args()

    nova = find_nova(args.nova)
    examples = Path(args.examples).resolve() if args.examples else nova.parent / "examples"
    if not examples.is_dir():
        sys.exit(f"Examples folder not found: {examples}")

    version = subprocess.run(
        [sys.executable, str(nova), "--version"],
        capture_output=True,
        text=True,
        timeout=60,
    ).stdout.strip()

    lessons = []
    for index, lesson in enumerate(LESSONS, start=1):
        source = examples / lesson["file"]
        if not source.is_file():
            sys.exit(f"Missing lesson file: {source}")

        captured = run_lesson(nova, source, lesson["stdin"])
        if captured["exitCode"] != 0:
            sys.exit(
                f"{lesson['file']} failed with exit {captured['exitCode']}:\n"
                f"{captured['stderr']}"
            )

        lessons.append(
            {
                "number": index,
                "file": lesson["file"],
                "title": lesson["title"],
                "summary": lesson["summary"],
                "code": source.read_text(encoding="utf-8").rstrip("\n"),
                "stdin": lesson["stdin"],
                "output": captured["stdout"].rstrip("\n"),
                "filesWritten": captured["filesWritten"],
            }
        )
        print(f"  captured {lesson['file']} ({len(captured['stdout'])} bytes of output)")

    target = ROOT / "client" / "src" / "content" / "lessons.generated.ts"
    target.parent.mkdir(parents=True, exist_ok=True)
    payload = {"novaVersion": version, "lessons": lessons}
    target.write_text(
        "// Generated by scripts/capture-lessons.py — do not edit by hand.\n"
        f"// Captured from {version} on the released interpreter.\n"
        f"export const lessonsData = {json.dumps(payload, indent=2, ensure_ascii=False)} as const;\n",
        encoding="utf-8",
    )
    print(f"\nWrote {target.relative_to(ROOT)} from {version}")


if __name__ == "__main__":
    main()
