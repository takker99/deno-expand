/// <reference lib="deno.unstable" />
import { getNode, Node, Trans } from "./node.ts";
import { assertEquals, assertStrictEquals } from "./deps.ts";

Deno.test("Trans", async (t) => {
  const node = new Node();
  await t.step("Trans.str", async (t) => {
    await t.step("is equal to pattern without \\t", () => {
      assertStrictEquals(new Trans("abcde", node).str, "abcde");
      assertStrictEquals(new Trans(" rewfe", node).str, " rewfe");
    });

    await t.step("is equal to the parts of pattern including \\t", () => {
      assertStrictEquals(new Trans("abcde\tdef", node).str, "abcde");
      assertStrictEquals(new Trans(" rewfe\tcommand\taaa", node).str, " rewfe");
    });
  });

  await t.step("Trans.arg", async (t) => {
    await t.step(
      "is equal to the command part of pattern if it  includes \\t",
      () => {
        assertStrictEquals(
          new Trans("abcde\tcommand $1 $2", node).arg,
          "command $1 $2",
        );
        assertStrictEquals(
          new Trans("def\tnot command $1\tcommand $1", node).arg,
          "command $1",
        );
      },
    );

    await t.step("is equal to pattern if it doesn't include \\t", () => {
      assertStrictEquals(new Trans("abcde", node).arg, "abcde");
      assertStrictEquals(new Trans("12  3  45", node).arg, "12  3  45");
    });
  });

  await t.step(
    "Trans.dist is equal to the node passed to the constructor",
    () => {
      const n = new Node();
      assertStrictEquals(new Trans("pattern", n).dest, n);
    },
  );
});

Deno.test("Node", async (t) => {
  await t.step("Check ID", () => {
    const n0 = new Node();
    const n1 = new Node();
    assertEquals(n0.id, 0);
    assertEquals(n1.id, 1);
  });

  await t.step("Get a node by id", () => {
    for (let i = 0; i < 10; i++) {
      const node = new Node();
      assertStrictEquals(getNode(node.id), node);
    }
  });
});
