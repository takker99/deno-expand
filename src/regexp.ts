import { Node } from "./node.ts";
import { Scanner } from "./scanner.ts";

/** 正規表現をパースして状態遷移機械を作るクラス
 *
 *             n1     n2
 *         +-->□.....□--+
 *  start /                \  end
 *      □ --->□.....□---> □
 *        \                /
 *         +-->□.....□--+
 *
 *           ( (  )  )  ( (    ) (  (  )  ) (   )  )  | (  (  )  )
 *   pars   [1]
 *            [1,2]
 *                     [3]
 *                      [3,4]
 *                              [3,5]
 */
export class RegExpParser {
  private pars = [] as number[];
  /** 出現した開き括弧の数 */
  private parNo = 0;
  private ruleId = 0;

  /** 状態遷移機械を作成する */
  public regExp(s: Scanner, topLevel = false): [Node, Node] {
    const start = new Node(this.pars);
    const end = new Node(this.pars);

    const [n1, n2] = this.regCat(s);

    // start -> n1 -> ... -> n2 -> end とつなぐ
    start.addTrans("", n1);
    if (topLevel) {
      n2.accept = this.ruleId;
    }
    n2.addTrans("", end);

    // `|`でつながれた正規表現を`|`ごとに分割して木構造にし、`start`と`end`の間に全て入れる
    while (
      s.getToken() === "|" &&
      s.nextToken !== ""
    ) {
      if (topLevel) {
        this.pars = [];
        this.parNo = 0;
        this.ruleId++;
      }
      // start -> n3 -> ... -> n4 -> end
      const [n3, n4] = this.regCat(s);
      start.addTrans("", n3);
      if (topLevel) {
        n4.accept = this.ruleId;
      }
      n4.addTrans("", end);
    }
    // `regCat()`の仕様より、`s`が次に返すトークンは閉じ括弧か空文字のどちらかであることが保証される
    s.unGetToken();

    return [start, end];
  }

  /** 閉じ括弧か正規表現の終わりまで変換し続ける */
  public regCat(s: Scanner): [Node, Node] {
    let [start, end] = this.regFactor(s);
    while (
      ![")", "]", "|"].includes(s.getToken()) &&
      s.nextToken !== ""
    ) {
      s.unGetToken();
      const [n1, n2] = this.regFactor(s);
      end.addTrans("", n1);
      end = n2;
    }
    s.unGetToken();
    return [start, end];
  }

  /** 数量子を変換する */
  public regFactor(s: Scanner): [Node, Node] {
    // 文字列を読む
    const [start, end] = this.regTerm(s);
    const token = s.getToken();
    switch (token) {
      case "?":
        // 読み飛ばし
        start.addTrans("", end);
        break;
      case "+":
        // ループ
        end.addTrans("", start);
        break;
      case "*": {
        const node = new Node();
        // start -> end -> node -> start
        start.addTrans("", end);
        end.addTrans("", node);
        node.addTrans("", start);
        break;
      }
      default:
        // 記号以外の時は何もしない
        // 状態を元に戻す
        s.unGetToken();
        break;
    }
    return [start, end];
  }

  /** 文字列とキャプチャグループを変換する */
  public regTerm(s: Scanner): [Node, Node] {
    const token = s.getToken();
    if (token === "(") {
      this.parNo++;
      this.pars.push(this.parNo);
      // `(`と`)`の間にある文字を解析する
      const [start, end] = this.regExp(s);
      start.pars = [...this.pars];
      const close = s.getToken();
      // this.regExp(s)を実行し終えた時点で、次のtokenは
      // 閉じ括弧かEOFになっている
      if (close !== ")") {
        throw SyntaxError("missing )");
      }
      this.pars.pop();
      end.pars = [...this.pars];
      return [start, end];
    }
    // start -"token"-> end
    const start = new Node([...this.pars]);
    const end = new Node([...this.pars]);
    start.addTrans(token, end);
    return [start, end];
  }
}
