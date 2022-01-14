import { assertStrictEquals } from "./deps.ts";
import { range } from "./range.ts";

Deno.test("range()", () => {
  let j = 1;
  for (const i of range(2, 8)) {
    j++;
    assertStrictEquals(i, j);
  }
  assertStrictEquals(j, 8);
});
