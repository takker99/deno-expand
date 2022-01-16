import { RegExpParser } from "./regexp.ts";
import { Scanner } from "./scanner.ts";
import { Node, resetId } from "./node.ts";

visualize("");
visualize("a");
visualize("abc");
// RangeError: Maximum call stack size exceeded
//visualize("a(b)*c");
visualize("a(bc|de)?ef");
visualize("(abc|def)(ghi|jkl)");

function visualize(pattern: string) {
  const parser = new RegExpParser();
  const [start] = parser.regExp(new Scanner(pattern), true);

  console.log(`pattern: ${pattern}`);
  console.log(`tree:`);
  for (const text of toString(start)) {
    console.log(`\t${text}`);
  }

  resetId();
}

function toString(node: Node): string[] {
  if (node.children.length === 0) {
    return [
      `{${JSON.stringify(node.pars)}, ${node.id}${
        node.accept == undefined ? "" : `, ${node.accept}`
      }}`,
    ];
  }
  return node.children.flatMap((trans) =>
    toString(trans.dest).map((text) =>
      `{${JSON.stringify(node.pars)}, ${node.id}${
        node.accept == undefined ? "" : `, ${node.accept}`
      }} -${trans.str ? `"${trans.str}"-` : ""}> ${text}`
    )
  );
}
