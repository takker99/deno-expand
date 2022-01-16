//
//  ノードとノード間遷移
//
//  (self)  pat     dest
//    ■ ----------> □
//       ----------> □
//       ----------> □
//

// `pattern`にマッチしたら`dest`に遷移
export class Trans {
  constructor(private pattern: string, private _dest: Node) {}

  /** patternのうち、文字列に当たる部分 */
  public get str() {
    return this.pattern.split(/\t/)[0];
  }

  /** patternのうち、パラメタに当たる部分
   *
   * 最後の`\t`のうしろを`arg`として扱う
   */
  public get arg() {
    const arg = this.pattern.match(/^(.*)\t(.*)$/)?.[2];
    return arg ?? this.pattern;
  }

  /** 遷移先ノード */
  get dest() {
    return this._dest;
  }
}

let globalId = 0;
const nodes = [] as Node[];

/** 正規表現の状態遷移機械のノードを表すクラス */
export class Node {
  private _id = globalId++;
  public accept: number | undefined = undefined;

  // childrenでよくない？
  /** 遷移可能なノードのリスト */
  private transes = [] as Trans[];

  constructor(public pars = [] as number[]) {
    nodes.push(this);
  }

  // append()のほうがよさそう
  /** 遷移先ノードを追加する
   *
   * @param pattern 追加するノードの遷移条件
   * @param dest 追加するノード
   */
  public addTrans(pattern: string, dest: Node) {
    this.transes.push(new Trans(pattern, dest));
  }

  /** ノードのID */
  get id() {
    return this._id;
  }

  /** 遷移先ノードのリスト */
  get children() {
    return this.transes;
  }
}

/** ノードIDからノードを取得する
 *
 * @param id 取得したいノードのID
 */
export function getNode(id: number): Node | undefined {
  return nodes[id];
}

/** for debug */
export function resetId() {
  globalId = 0;
}
