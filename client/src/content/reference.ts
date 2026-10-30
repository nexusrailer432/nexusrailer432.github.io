/**
 * The NOVA 1.0.0 language reference.
 *
 * This is the single source of truth for the documentation pages and for
 * site search. Every `code` block that declares `output` is executed against
 * the released interpreter by `scripts/verify-docs.ts`, so the site cannot
 * drift from the language. If you change a block, run `pnpm verify:docs`.
 *
 * Text supports three inline forms: `code`, **bold**, and [label](/path).
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "code"; file?: string; code: string; output?: string; input?: string; lang?: "nova" | "bash" }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "list"; items: string[] }
  | { kind: "note"; text: string };

export type Section = {
  id: string;
  title: string;
  summary: string;
  blocks: Block[];
};

export const sections: Section[] = [
  {
    id: "installing",
    title: "Installing and running",
    summary: "NOVA needs Python 3.10 or newer and nothing else.",
    blocks: [
      {
        kind: "p",
        text: "NOVA is a plain folder of Python files. There are no dependencies to install and no build step. Download the release from [Downloads](/downloads), unpack it, and you are ready.",
      },
      { kind: "p", text: "Open a terminal inside the folder and run a program:" },
      {
        kind: "code",
        lang: "bash",
        file: "terminal",
        code: "python nova.py examples/01_hello.nova",
        output: "Hello world!\nWelcome to NOVA.",
      },
      {
        kind: "p",
        text: "On macOS and Linux the command is often `python3` instead of `python`. Two other commands are useful:",
      },
      {
        kind: "code",
        lang: "bash",
        file: "terminal",
        code: "python nova.py --version\npython nova.py --help",
        output:
          "NOVA 1.0.0\nNOVA 1.0.0 - programming that feels like texting\n\nUsage:\n  nova <file.nova>     run a NOVA program\n  nova --version       show the version\n  nova --help          show this message\n\nExample:\n  nova examples/01_hello.nova\n\nNOVA programs are plain text files ending in .nova.\nDocumentation: see README.md",
      },
      {
        kind: "note",
        text: "A NOVA program is a plain text file ending in `.nova`. Write it in any text editor — there is nothing to compile.",
      },
    ],
  },
  {
    id: "first-program",
    title: "Your first program",
    summary: "One line, one result.",
    blocks: [
      { kind: "p", text: "Create a file called `hello.nova` containing this single line:" },
      { kind: "code", file: "hello.nova", code: 'say "Hello world!"' },
      { kind: "p", text: "Run it, and you should see:" },
      { kind: "code", lang: "bash", file: "terminal", code: "python nova.py hello.nova", output: "Hello world!" },
    ],
  },
  {
    id: "syntax",
    title: "Syntax basics",
    summary: "The five rules that cover most of the language.",
    blocks: [
      {
        kind: "list",
        items: [
          "One instruction per line.",
          "Blank lines are ignored.",
          "A line starting with `#` is a note for people, and NOVA skips it.",
          "Indentation is optional. NOVA uses `done` to end a block, not spacing — but indenting makes programs much easier to read.",
          "Keywords work in any capitalisation: `say`, `SAY` and `Say` are the same. Names are case-insensitive too, so `name` and `NAME` are one value.",
        ],
      },
      {
        kind: "code",
        file: "syntax.nova",
        code: '# A note, ignored by NOVA\nSAY "Keywords ignore case"\nSay "so these three lines"\nsay "do the same thing"',
        output: "Keywords ignore case\nso these three lines\ndo the same thing",
      },
    ],
  },
  {
    id: "values",
    title: "Values",
    summary: "Four kinds of value, and they never change kind on their own.",
    blocks: [
      {
        kind: "table",
        head: ["Kind", "Examples"],
        rows: [
          ["text", '`"Alex"`, `"Hello world"`, `""`'],
          ["number", "`15`, `-8`, `3.14`"],
          ["true/false", "`true`, `false`"],
          ["list", '`["Apple", 15, [1, 2]]`'],
        ],
      },
      {
        kind: "p",
        text: "A value keeps its kind. NOVA never quietly turns one kind into another, so the number `18` and the text `\"18\"` are different values. `true` is not `1`.",
      },
    ],
  },
  {
    id: "variables",
    title: "Variables",
    summary: "remember names a value. copy duplicates one.",
    blocks: [
      { kind: "p", text: "`remember` gives a value a name:" },
      {
        kind: "code",
        file: "variables.nova",
        code: 'remember my name as Alex\nremember my age as 15\nremember my prices as [3, 5, 8]\nsay name\nsay age\nsay prices',
        output: "Alex\n15\n[3, 5, 8]",
      },
      {
        kind: "p",
        text: "Simple text doesn't need quotes, so `remember my name as Alex` stores the text `Alex`. Quotes are needed when the text contains something NOVA would otherwise read as an instruction, and for text with leading or trailing spaces.",
      },
      { kind: "p", text: "Remembering a name again replaces the value. To give an existing value a second name, use `copy`:" },
      {
        kind: "code",
        file: "copy.nova",
        code: 'remember my price as 10\ncopy price as backup\nsay backup',
        output: "10",
      },
      {
        kind: "note",
        text: "This distinction matters. `remember my backup as price` stores the *word* `price`, not the value `10`. `copy` is the way to duplicate a value.",
      },
    ],
  },
  {
    id: "input",
    title: "Input",
    summary: "ask shows a question and keeps the answer.",
    blocks: [
      {
        kind: "code",
        file: "input.nova",
        code: 'ask "What\'s your name?" and remember answer as name\nsay "Hello " + name',
        input: "Alex\n",
        output: "What's your name? Hello Alex",
      },
      { kind: "p", text: "If the answer must be a number, add `as a number`. NOVA keeps asking until it gets one:" },
      {
        kind: "code",
        file: "numbers-in.nova",
        code: 'ask "How old are you?" and remember answer as age as a number\nsay "Next year you\'ll be " + (age + 1)',
        input: "15\n",
        output: "How old are you? Next year you'll be 16",
      },
      {
        kind: "p",
        text: "Without `as a number`, something typed as `15` still becomes the number 15, but `hello` stays text. Values with leading zeros, like `007`, stay text so codes and phone numbers survive.",
      },
      {
        kind: "note",
        text: "`ask` needs a question written in quotes. It cannot take a variable or a computed value in NOVA 1.0.0.",
      },
    ],
  },
  {
    id: "output",
    title: "Output",
    summary: "say prints one line.",
    blocks: [
      {
        kind: "code",
        file: "output.nova",
        code: 'remember my name as Alex\nsay "Hello"\nsay name\nsay 2 + 3\nsay ["a", "b"]',
        output: 'Hello\nAlex\n5\n["a", "b"]',
      },
    ],
  },
  {
    id: "numbers",
    title: "Numbers and maths",
    summary: "Familiar arithmetic, with words available too.",
    blocks: [
      {
        kind: "code",
        file: "maths.nova",
        code: "say 2 + 3\nsay 10 - 4\nsay 3 * 5\nsay 10 / 4",
        output: "5\n6\n15\n2.5",
      },
      { kind: "p", text: "The same operations can be written as words:" },
      {
        kind: "code",
        file: "words.nova",
        code: "say 10 plus 5\nsay 20 minus 3\nsay 4 times 5\nsay 20 divided by 4",
        output: "15\n17\n20\n5",
      },
      { kind: "p", text: "Multiplication and division happen before addition and subtraction, and brackets work as usual:" },
      {
        kind: "code",
        file: "precedence.nova",
        code: "say 2 + 3 * 4\nsay (2 + 3) * 4\nsay -10 + 3",
        output: "14\n20\n-7",
      },
      {
        kind: "p",
        text: "Whole results are shown without a trailing `.0`, so `4 / 2` shows `2`. Long decimals are shown to ten places, so `1 / 3` gives `0.3333333333`.",
      },
      {
        kind: "code",
        file: "decimals.nova",
        code: "say 4 / 2\nsay 1 / 3",
        output: "2\n0.3333333333",
      },
      { kind: "p", text: "Dividing by zero stops the program with a clear message rather than a strange number." },
    ],
  },
  {
    id: "text",
    title: "Text",
    summary: "Join text with +, and watch the order.",
    blocks: [
      {
        kind: "code",
        file: "text.nova",
        code: 'say "Hello " + "world"\nsay "Age: " + 15',
        output: "Hello world\nAge: 15",
      },
      {
        kind: "p",
        text: "When `+` has a number on both sides it adds. If either side is text, it joins, turning the other value into text. Joining happens left to right, so brackets matter:",
      },
      {
        kind: "code",
        file: "joining.nova",
        code: 'say "Total: " + 1 + 2\nsay "Total: " + (1 + 2)\nsay 15 + "1"',
        output: "Total: 12\nTotal: 3\n151",
      },
      {
        kind: "note",
        text: 'NOVA does not use backslash escape codes. `"a\\nb"` is the four characters `a`, `\\`, `n`, `b`. See [newline](#newline) for line breaks.',
      },
      {
        kind: "p",
        text: "Text has no `length` and no positions in NOVA 1.0.0 — lists are how you work through items one at a time.",
      },
    ],
  },
  {
    id: "booleans",
    title: "true and false",
    summary: "Answers to yes/no questions.",
    blocks: [
      { kind: "p", text: "`true` and `false` answer yes/no questions, and `file exists` gives one back:" },
      {
        kind: "code",
        file: "booleans.nova",
        code: 'remember my ready as true\nsay ready\n\nif ready is true\n    say "Let\'s go"\ndone',
        output: "true\nLet's go",
      },
      {
        kind: "p",
        text: "They can be stored, passed to functions, returned, put in lists, joined into text, and compared with `is` and `is not`. They are not numbers, so `true` is not `1`, and they cannot be added or ordered.",
      },
    ],
  },
  {
    id: "conditions",
    title: "Conditions",
    summary: "if, otherwise, and the seven ways to compare.",
    blocks: [
      {
        kind: "code",
        file: "conditions.nova",
        code: 'remember my age as 20\n\nif age is 18 or more\n    say "Adult"\notherwise\n    say "Minor"\ndone',
        output: "Adult",
      },
      { kind: "p", text: "Every `if` ends with `done`. The `otherwise` part is optional." },
      {
        kind: "table",
        head: ["Form", "Meaning"],
        rows: [
          ["`x is y`", "equal"],
          ["`x is not y`", "not equal"],
          ["`x is greater than y`", "bigger (also `is above`)"],
          ["`x is less than y`", "smaller (also `is below`)"],
          ["`x is y or more`", "bigger or equal"],
          ["`x is y or less`", "smaller or equal"],
        ],
      },
      {
        kind: "p",
        text: 'Numbers compare with numbers and text compares with text. Text comparison is alphabetical and equality is exact, so `"Alex"` is not `"alex"`. Lists are equal when they hold equal items in the same order; they cannot be put in order with `greater than`.',
      },
      { kind: "p", text: "An `if` checks one thing. To check two, put one `if` inside another:" },
      {
        kind: "code",
        file: "nested.nova",
        code: 'remember my age as 15\n\nif age is less than 13\n    say "You\'re a child."\notherwise\n    if age is below 20\n        say "You\'re a teenager."\n    otherwise\n        say "You\'re an adult."\n    done\ndone',
        output: "You're a teenager.",
      },
      {
        kind: "note",
        text: "There is no general `and` or `or` between conditions in NOVA 1.0.0. `is 18 or more` is a single comparison, not a joined one.",
      },
    ],
  },
  {
    id: "loops",
    title: "Loops",
    summary: "repeat a count, or while something stays true.",
    blocks: [
      {
        kind: "code",
        file: "repeat.nova",
        code: 'repeat 3 times\n    say "Hello"\ndone',
        output: "Hello\nHello\nHello",
      },
      {
        kind: "p",
        text: "The count can be any expression that gives a whole number, including `length of items`. Zero or fewer means the block doesn't run.",
      },
      { kind: "p", text: "Repeat while something stays true:" },
      {
        kind: "code",
        file: "while.nova",
        code: 'remember my count as 1\n\nwhile count is 5 or less\n    say count\n    remember my count as count + 1\ndone',
        output: "1\n2\n3\n4\n5",
      },
      {
        kind: "note",
        text: "The question is checked again before every round, so something inside the loop has to change it. Every loop ends with `done`.",
      },
    ],
  },
  {
    id: "functions",
    title: "Functions",
    summary: "define names steps. return gives a value back.",
    blocks: [
      {
        kind: "code",
        file: "greet.nova",
        code: 'define greet(name)\n    say "Hello " + name\ndone\n\ngreet("Alex")',
        output: "Hello Alex",
      },
      {
        kind: "code",
        file: "square.nova",
        code: "define square(x)\n    return x * x\ndone\n\nsay square(5)",
        output: "25",
      },
      {
        kind: "list",
        items: [
          "Inputs are called parameters; the values you pass in are arguments.",
          "Each call gets its own variables. A function can read values from the main program, but anything it remembers stays inside the function.",
          "Functions can call other functions, including themselves.",
          "A function can be used before the line that defines it.",
          "Recursion is allowed to a depth of 10,000 calls.",
        ],
      },
      {
        kind: "code",
        file: "compose.nova",
        code: "define double(x)\n    return x * 2\ndone\n\ndefine quadruple(x)\n    return double(double(x))\ndone\n\nsay quadruple(5)",
        output: "20",
      },
    ],
  },
  {
    id: "lists",
    title: "Lists",
    summary: "Values in order, changed with set, add and remove.",
    blocks: [
      {
        kind: "code",
        file: "lists.nova",
        code: 'remember my fruits as ["Apple", "Banana", "Mango"]\nsay fruits\nsay length of fruits\nsay fruits[0]\nsay fruits[2]',
        output: '["Apple", "Banana", "Mango"]\n3\nApple\nMango',
      },
      { kind: "p", text: "Positions start at 0. Lists can be changed in three ways:" },
      {
        kind: "code",
        file: "changing.nova",
        code: 'remember my fruits as ["Apple", "Banana", "Mango"]\nset fruits[0] as "Orange"\nadd "Grapes" to fruits\nremove fruits[1]\nsay fruits',
        output: '["Orange", "Mango", "Grapes"]',
      },
      { kind: "p", text: "Lists can hold any values, including other lists:" },
      {
        kind: "code",
        file: "nested-lists.nova",
        code: "remember my grid as [[1, 2], [3, 4]]\nsay grid[0][1]",
        output: "2",
      },
      {
        kind: "p",
        text: "Lists are values, not shared boxes. Copying a list or passing it to a function gives that name its own copy, so changing one never changes the other:",
      },
      {
        kind: "code",
        file: "copies.nova",
        code: "remember my a as [1, 2]\ncopy a as b\nadd 3 to b\nsay a\nsay b",
        output: "[1, 2]\n[1, 2, 3]",
      },
      {
        kind: "note",
        text: "Going past the end of a list, or using a negative or fractional position, stops the program with a message saying which positions are valid.",
      },
    ],
  },
  {
    id: "files",
    title: "Files",
    summary: "Plain UTF-8 text in, plain UTF-8 text out.",
    blocks: [
      {
        kind: "code",
        file: "files.nova",
        code: 'write "Shopping list:" + newline to "notes.txt"\nappend "Milk" + newline to "notes.txt"\nsay read "notes.txt"\n\nif file exists "notes.txt"\n    say "The file is there."\ndone',
        output: "Shopping list:\nMilk\n\nThe file is there.",
      },
      {
        kind: "list",
        items: [
          "`write text to path` replaces the whole file, creating it if needed.",
          "`append text to path` adds to the end, creating it if needed.",
          "`read path` gives the whole file back as text.",
          "`file exists path` gives `true` or `false`. A folder is not a file.",
        ],
      },
      {
        kind: "p",
        text: 'The text and the path can be any expression. Text goes in and comes out exactly as stored: nothing is trimmed and no separators are added. A plain name like `"notes.txt"` means a file in the folder you ran NOVA from, not the folder the program is saved in.',
      },
      {
        kind: "note",
        text: "NOVA has the same file permissions as the person running it, and there is no sandbox, so run programs you trust. A file's contents are only ever text: NOVA never runs what it reads.",
      },
    ],
  },
  {
    id: "newline",
    title: "Line breaks: newline",
    summary: "One built-in text value for a line break.",
    blocks: [
      {
        kind: "code",
        file: "newline.nova",
        code: 'say "Hello" + newline + "World"',
        output: "Hello\nWorld",
      },
      {
        kind: "p",
        text: "`newline` holds exactly one line break (U+000A). It is ordinary text, so it works anywhere text works. NOVA does not use backslash escapes, so `newline` is how line breaks are written.",
      },
    ],
  },
  {
    id: "errors",
    title: "Understanding errors",
    summary: "Checked before it runs, explained in plain words.",
    blocks: [
      {
        kind: "p",
        text: "NOVA checks a whole program before running any of it, so mistakes in spelling and structure are reported before anything happens — even inside parts that would never run. An error names the line, shows it, explains the problem, and usually suggests a fix.",
      },
      {
        kind: "code",
        file: "index.nova",
        code: 'remember my fruits as ["Apple", "Banana", "Mango"]\nsay fruits[5]',
        output:
          "NOVA error on line 2:\n    say fruits[5]\n  fruits has 3 items, so the index must be from 0 to 2, but it was 5.\n  Hint: Indexes start at 0, so the last item is at 2.",
      },
      {
        kind: "p",
        text: "Some problems can only be found while running, because they depend on real values: a missing file, a list position that turns out to be too big, dividing by zero, or using a name before it has a value. Those stop the program at the line where they happen and explain what went wrong.",
      },
      {
        kind: "code",
        file: "missing.nova",
        code: 'say read "no_such_file.txt"',
        output:
          'NOVA error on line 1:\n    say read "no_such_file.txt"\n  I couldn\'t read "no_such_file.txt" because the file does not exist.\n  Hint: Check the filename, or create the file first with write.',
      },
      {
        kind: "note",
        text: "You will never see a Python traceback. If a NOVA program stops, it stops with a message written for a person. Press Ctrl+C to stop a running program.",
      },
    ],
  },
  {
    id: "reserved",
    title: "Reserved words",
    summary: "Which words you cannot reuse, in three tiers.",
    blocks: [
      { kind: "p", text: "NOVA reserves words in three tiers, so you always know which names are free:" },
      {
        kind: "table",
        head: ["Tier", "Words", "Can it be a variable?", "Can it be a function?"],
        rows: [
          ["Always reserved", "`true`, `false`, `newline`, `read`", "No", "No"],
          [
            "Command words",
            "`say`, `remember`, `ask`, `copy`, `if`, `otherwise`, `done`, `repeat`, `while`, `define`, `return`, `is`, `and`, `or`",
            "Yes",
            "No",
          ],
          [
            "Grammar words",
            "`set`, `add`, `remove`, `write`, `append`, `file`, `exists`, `length`, `of`, `to`, `answer`, `not`, `above`, `below`, `greater`, `less`, `more`, `times`, `plus`, `minus`, `divided`",
            "Yes",
            "Yes",
          ],
        ],
      },
      {
        kind: "note",
        text: "Names are case-insensitive, so `Say` is reserved exactly like `say`.",
      },
    ],
  },
  {
    id: "limits",
    title: "What NOVA does not have",
    summary: "Recorded honestly rather than hidden.",
    blocks: [
      {
        kind: "p",
        text: "NOVA 1.0 is deliberately small. It does not have classes or objects, modules or imports, exceptions, `for` loops, `break` or `continue`, dictionaries, text positions or text length, general `and`/`or` in conditions, networking, or a package manager.",
      },
      { kind: "p", text: "Known limits of this release, recorded honestly rather than hidden:" },
      {
        kind: "list",
        items: [
          "There is no installer yet. NOVA is run with `python nova.py program.nova`. A standalone `nova` command is future work.",
          "There is no way to turn text into a number, so a number read from a file comes back as text. Lesson 10 shows a workaround.",
          "`ask` takes a question written in quotes, not a value worked out while running.",
          "Text has no length and no positions, so lists are the way to work through items one at a time.",
          "There are no trailing comments on a line that already has code — a `#` note gets its own line.",
        ],
      },
      {
        kind: "p",
        text: "Some of these may arrive later. NOVA 1.0 is meant to be learnable in an afternoon, and every feature above is fully implemented and tested rather than partly working.",
      },
    ],
  },
];

export const sectionById = new Map(sections.map((section) => [section.id, section]));

/** Plain text for one block, used by the search index. */
export function blockText(block: Block): string {
  switch (block.kind) {
    case "p":
    case "note":
      return block.text;
    case "code":
      return `${block.code} ${block.output ?? ""}`;
    case "list":
      return block.items.join(" ");
    case "table":
      return [...block.head, ...block.rows.flat()].join(" ");
  }
}
