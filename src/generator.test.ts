// wip

import { Generator } from "./generator.ts";

{
  const g = new Generator();
  const pattern = "(abc|def)(ghi|jkl)";
  g.add(pattern, "I am $0 or $2.");
  const search = " cn ";
  console.log(
    `expand ${pattern} and enumerate candidates matched to "${search}":`,
  );
  g.filter(
    search,
    (a, cmd) => console.log("\t", a, `=> ${cmd}`),
    2,
  );
}

{
  const g = new Generator();
  const pattern = "a(b)*c";
  g.add(pattern, "b is $1");
  const search = " b ";
  console.log(
    `expand ${pattern} and enumerate candidates matched to "${search}":`,
  );
  console.log("\t", g.filter(search));
}

{
  const g = new Generator();
  const pattern = "a(b)*c";
  g.add(pattern, "b is $1");
  const search = " b ";
  g.filter(
    search,
    (_, cmd) => console.log("\t", cmd),
  );
}
