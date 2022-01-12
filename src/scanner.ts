/** 正規表現に使われる記号とマッチする正規表現 */
const symbolsRegExp = /^[\(\)\|\*\+\?\[\]]$/;
/** 正規表現に使われる記号と`\`にマッチする正規表現 */
const allSymbolsRegExp = /^[\(\)\|\*\+\?\[\]\\]$/;

/** 正規表現から1トークンずつ取得するクラス */
export class Scanner {
  private chars = [] as string[];
  private index = 0;
  private token = "";
  private u = "";

  /** トークン分割クラスを作成する
   *
   * @param regText 分割対象の正規表現
   */
  constructor(regText: string) {
    this.chars = regText.split("");
  }

  /** 新しいtokenを取得して返す */
  public getToken() {
    // uをtに移動
    if (this.u !== "") {
      this.token = this.u;
      this.u = "";
      return this.token;
    }
    // aの走査が終わっていたら、tをクリアして返す
    if (this.index >= this.chars.length) {
      this.token = "";
      return this.token;
    }

    this.token = this.chars[this.index];
    if (symbolsRegExp.test(this.token)) {
      // `\`以外の記号なら、それを返して次に進む
      this.index++;
      return this.token;
    } else if (this.token === "\\") {
      // `\n`と`\t`はそれを返す
      this.token = this.chars[++this.index];
      this.token = this.token === "n"
        ? "\n"
        : this.token === "t"
        ? "\t"
        : this.token;
      this.index++;
      return this.token;
    } else {
      // 記号以外の文字をまとめて結合して返す
      // `\`も含む
      this.index++;
      while (
        this.index < this.chars.length &&
        !allSymbolsRegExp.test(this.chars[this.index])
      ) {
        this.token += this.chars[this.index++];
      }
      return this.token;
    }
  }

  /** 最後に生成したtokenを次回も返すようにする
   *
   * 連続して呼び出すことは出来ない
   */
  public unGetToken() {
    if (this.u !== "") {
      throw SyntaxError(
        "unGetToken() can't be called again before getToken() is called at least once.",
      );
    }
    this.u = this.token;
  }

  /** 最後に格納したtokenを返す */
  public get nextToken() {
    return this.token;
  }
}
