//
//          ( (  )  )  ( (    ) (  (  )  ) (   )  )  | (  (  )  )
//  pars   [1]
//           [1,2]
//                    [3]
//                     [3,4]
//                             [3,5]

import { Scanner } from "./scanner.ts";
import { RegExpParser } from "./regexp.ts";
import { getNode } from "./node.ts";
import { INITSTATE, moveState, preparePatterns, State } from "./asearch/mod.ts";
import { range } from "./range.ts";

class GenNode {
  constructor(
    /** 対応するノードのID */ private _id: number,
    /** 対応する状態遷移機械 */ private _state: State,
    private _s = "",
    private _subStrings = [] as string[],
    /** マッチしたら`true` */ public accept: number | undefined = 0,
  ) {
  }

  public get id() {
    return this._id;
  }
  public get subStrings() {
    return this._subStrings;
  }
  public get s() {
    return this._s;
  }
  public get state() {
    return this._state;
  }
}

export type Callback = (a: string[], cmd: string) => void;
export class Generator {
  private s: string[];
  private commands: string[];

  constructor(_s = "", command = "") {
    this.s = [_s];
    this.commands = [command];
  }

  public add(pat: string, command: string) {
    if (this.s[0] === "") {
      this.s = [pat];
    } else {
      this.s.push(pat);
    }

    if (this.commands[0] === "") {
      this.commands = [command];
    } else {
      this.commands.push(command);
    }
  }

  public delete() {
    this.s.pop();
    this.commands.pop();
  }

  /** ルールを解析して状態遷移機械を作成し、`pattern`にマッチするもののリストを返す */
  public filter(
    pattern: string,
    func?: Callback,
    maxAmbig: 0 | 1 | 2 = 2,
  ): [[string, string][], [string, string][], [string, string][]] {
    /** 曖昧度0,1,2のマッチ結果 */
    const res = [[], [], []] as [
      [string, string][],
      [string, string][],
      [string, string][],
    ];

    const [shiftpat, epsilon, acceptpat] = preparePatterns(pattern);
    const regExp = new RegExpParser();
    const scanner = new Scanner(this.s.join("|")); // 正規表現を全てつなぐ

    // HelpDataで指定した状態遷移機械を生成
    //  少し時間がかかる
    const [start] = regExp.regExp(scanner, true);

    // 状態遷移機械からDepth-Firstで文字列を生成する
    // `n`個のノードを経由して生成される状態集合を`lists[n]`に入れる
    // 生成しながらマッチングも計算する
    const lists = [[
      // 初期状態
      new GenNode(
        start.id,
        INITSTATE,
      ),
    ]] as GenNode[][];
    const listed = [{}, {}, {}] as [
      Record<string, boolean>,
      Record<string, boolean>,
      Record<string, boolean>,
    ];
    const funcListed = {} as Record<string, boolean>;

    // 最大9999でノードの探索を打ち切る
    for (let i = 0; i < 10000; i++) {
      const list = lists[i];
      const newList = [];
      for (const entry of list) {
        const srcNode = getNode(entry.id);
        if (!srcNode) {
          throw Error("Can't find the node specified by `entry.id`");
        }
        if (list.length * srcNode.children.length >= 100000) continue;
        for (const trans of srcNode.children) {
          const ss = [...entry.subStrings];
          for (const i of srcNode.pars) {
            ss[i - 1] ??= "";
            ss[i - 1] += trans.arg;
          }
          // 新しいマッチング状態を計算してノードに保存する
          const newState = moveState(
            trans.str,
            shiftpat,
            epsilon,
            entry.state,
          );
          const s = entry.s + trans.str;
          const acceptNo = trans.dest.accept;
          newList.push(
            new GenNode(
              trans.dest.id,
              newState,
              s,
              ss,
              acceptNo,
            ),
          );

          // この時点で、マッチしているかどうかを`newState`と`acceptpat`で判断できる
          // マッチしていたら出力リストに加えるか`func`を呼び出す
          if (acceptNo === undefined) continue;
          for (let ambig = 0; ambig <= maxAmbig; ambig++) {
            if (
              !((func && !funcListed[s]) ||
                (!func && !listed[ambig][s]))
            ) {
              continue;
            }
            if ((newState[ambig] & acceptpat) === 0) continue;
            listed[ambig][s] = true;
            funcListed[s] = true;
            const match = ss.length > 0
              ? ss.join("\t").match(
                [...range(0, ss.length - 1)].map(() => "(.*)").join("\t"),
              )
              : [];
            let command = this.commands[acceptNo] ?? "";
            let m: RegExpMatchArray | null;
            while ((m = command.match(/^(.*)\$(\d+)(.*)$/))) {
              command = `${m[1]}${match?.[parseInt(m[2])]}${m[3]}`;
            }
            if (func) {
              func([s, ...ss], command);
            } else {
              res[ambig].push([s, command]);
            }
          }
        }
      }
      if (newList.length == 0) break;
      lists.push(newList);
      // 完全一致した候補が十分多ければ中断する
      if (res[0].length > 100) break;
    }
    return res;
  }
}

export function expand(str: string, filterPat: string, func: Callback): void;
export function expand(str: string, filterPat: string): string[];
export function expand(
  str: string,
  filterPat = " ",
  func?: Callback,
): string[] | void {
  const generator = new Generator(str, "");

  if (func) {
    generator.filter(filterPat, func);
    return;
  }
  const m = generator.filter(filterPat);
  const matched = m[0].length > 0 ? m[0] : m[1].length > 0 ? m[1] : m[2];
  return matched.map((r) => r[0]);
}
