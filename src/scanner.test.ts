/// <reference lib="deno.unstable" />
import { Scanner } from "./scanner.ts";
import { assertEquals, assertStrictEquals } from "./deps.ts";

Deno.test("Scanner", async (t) => {
  const testData = [
    // only ascii characters
    ["abcde", ["abcde"]],
    // with pipeline
    ["ab|cd|ef", ["ab", "|", "cd", "|", "ef"]],
    // with several kinds of symbols
    ["a(bc|de)?fg", ["a", "(", "bc", "|", "de", ")", "?", "fg"]],
    // with several kinds of symbols
    ["It (i|wa)s (tomorrow|yesterday) at 1?[0-9] o'clock", [
      "It ",
      "(",
      "i",
      "|",
      "wa",
      ")",
      "s ",
      "(",
      "tomorrow",
      "|",
      "yesterday",
      ")",
      " at 1",
      "?",
      "[",
      "0-9",
      "]",
      " o'clock",
    ]],
    // escape sequence
    ["ab\tab\nab(cd|ef)+g*e\\tcommand $1 $2\\nthis is a(n apple| pen)", [
      "ab\tab\nab",
      "(",
      "cd",
      "|",
      "ef",
      ")",
      "+",
      "g",
      "*",
      "e",
      "\t",
      "command $1 $2",
      "\n",
      "this is a",
      "(",
      "n apple",
      "|",
      " pen",
      ")",
    ]],
  ] as [string, string[]][];

  await t.step("get tokens one by one", async (t) => {
    for (const [regText, tokens] of testData) {
      await t.step(regText, () => {
        const scanner = new Scanner(regText);
        for (const token of tokens) {
          assertStrictEquals(scanner.getToken(), token);
        }
      });
    }
  });

  await t.step("get the next token", async (t) => {
    for (const [regText, tokens] of testData) {
      await t.step(regText, () => {
        const scanner = new Scanner(regText);
        assertStrictEquals(scanner.nextToken, "");
        for (const token of tokens) {
          scanner.getToken();
          assertStrictEquals(scanner.nextToken, token);
        }
        scanner.getToken();
        assertStrictEquals(scanner.nextToken, "");
      });
    }
  });

  await t.step("unget token", () => {
    const scanner = new Scanner(testData[0][0]);
    scanner.getToken();
    scanner.unGetToken();
    assertStrictEquals(scanner.getToken(), testData[0][1][0]);
  });
});
