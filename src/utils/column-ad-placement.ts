// ─────────────────────────────────────────────
// コラム本文中の手動広告（1枠）の挿入位置を決める rehype プラグイン
//
// react-markdown + rehype-raw が作った HTML 構造木（hast）のトップレベル要素の
// 並びだけを見て、要素と要素の「間」に広告枠のノードを1つ差し込む
// （本文全体が `<div class="not-prose">` 1つで包まれた記事だけは、その内側の並び）。
// Markdown/HTML 文字列を正規表現で分割しないため、段落・表・リスト・引用・
// 生HTMLブロックの内部が分割されることは構造上起こらない。
// 入力（本文）が同じなら常に同じ位置になる（乱数・時刻・画面幅に依存しない）。
// ─────────────────────────────────────────────

/** 広告枠のプレースホルダー要素名。ColumnDetailPage の components でコンポーネントに差し替える */
export const COLUMN_AD_SLOT_TAG = "gr-column-ad-slot";

/** 本文の表示文字数がこれ未満の記事には広告枠を入れない */
export const MIN_BODY_CHARS_FOR_AD = 1000;

/** 広告の前後それぞれに最低限残す本文の表示文字数 */
export const MIN_CHARS_AROUND_AD = 400;

/** 表示されないため文字数に数えない要素 */
const NON_VISIBLE_TAGS = new Set(["script", "style", "template", "noscript"]);

// rehype が渡す hast のうち、このプラグインが読む最小限の形だけを定義する
// （hast の型パッケージは react-markdown の間接依存のため、直接 import しない）
interface HastText {
  type: "text";
  value: string;
}

interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}

interface HastOther {
  type: "comment" | "doctype" | "raw";
  value?: string;
}

type HastNode = HastText | HastElement | HastOther;

interface HastRoot {
  type: "root";
  children: HastNode[];
}

const isElement = (node: HastNode, tagName?: string): node is HastElement =>
  node.type === "element" && (tagName === undefined || node.tagName === tagName);

/** 空白・改行を除いた文字数（サロゲートペアも1文字として数える） */
const countVisibleChars = (value: string): number =>
  Array.from(value.replace(/\s+/g, "")).length;

const collectText = (node: HastNode): string => {
  if (node.type === "text") return node.value;
  if (isElement(node)) return node.children.map(collectText).join("");
  return "";
};

/**
 * 表示テキストがURLそのもののリンク（`<a href="https://...">https://...</a>`）。
 * 元ネタのX投稿URLなど、本文として読まれる文字ではないため数えない。
 */
const isBareUrlLink = (node: HastElement): boolean =>
  node.tagName === "a" && /^https?:\/\//.test(collectText(node).trim());

/**
 * 画面に表示される本文の文字数。
 * frontmatter は react-markdown に渡る前に取り除かれており、
 * HTMLタグ・属性（リンク先URL含む）・Markdown記号は hast 上でテキストノードにならないため、
 * テキストノードを数えるだけでそれらは自然に除外される。
 */
export const visibleTextLength = (node: HastNode): number => {
  if (node.type === "text") return countVisibleChars(node.value);
  if (!isElement(node)) return 0;
  if (NON_VISIBLE_TAGS.has(node.tagName)) return 0;
  if (isBareUrlLink(node)) return 0;
  return node.children.reduce((sum, child) => sum + visibleTextLength(child), 0);
};

/**
 * 広告枠を差し込むトップレベルの位置（children の index。その要素の直前に入る）を返す。
 * 条件に合う位置が無ければ null（＝広告を出さない）。
 *
 * 1. 本文が MIN_BODY_CHARS_FOR_AD 未満なら出さない
 * 2. 前後に MIN_CHARS_AROUND_AD 以上残る H2 のうち、本文の50%地点に最も近いものの直前
 * 3. 2が無ければ、同じ条件を満たすトップレベル段落（p）のうち、50%地点に最も近いものの直後
 * 4. どちらも無ければ出さない
 * 距離が同じ候補が複数あるときは、先に出てくる（上にある）位置を採る。
 */
export const findAdInsertionIndex = (children: HastNode[]): number | null => {
  const lengths = children.map(visibleTextLength);
  const total = lengths.reduce((sum, n) => sum + n, 0);
  if (total < MIN_BODY_CHARS_FOR_AD) return null;

  // charsBefore[i] = children[i] より前にある本文の文字数
  const charsBefore: number[] = [];
  let running = 0;
  for (const length of lengths) {
    charsBefore.push(running);
    running += length;
  }

  const half = total / 2;
  const hasRoomAround = (before: number) =>
    before >= MIN_CHARS_AROUND_AD && total - before >= MIN_CHARS_AROUND_AD;

  const pickClosest = (candidates: { index: number; before: number }[]) => {
    let best: { index: number; before: number } | null = null;
    for (const candidate of candidates) {
      if (
        best === null ||
        Math.abs(candidate.before - half) < Math.abs(best.before - half)
      ) {
        best = candidate;
      }
    }
    return best === null ? null : best.index;
  };

  const headingCandidates = children
    .map((child, index) => ({ child, index, before: charsBefore[index] }))
    .filter(({ child, before }) => isElement(child, "h2") && hasRoomAround(before))
    .map(({ index, before }) => ({ index, before }));
  const byHeading = pickClosest(headingCandidates);
  if (byHeading !== null) return byHeading;

  const paragraphCandidates = children
    .map((child, index) => ({
      child,
      // 段落の「後」に入れるので、差し込み位置は index + 1、前にある文字数は段落を含めた数
      index: index + 1,
      before: charsBefore[index] + lengths[index],
    }))
    .filter(({ child, before }) => isElement(child, "p") && hasRoomAround(before))
    .map(({ index, before }) => ({ index, before }));
  return pickClosest(paragraphCandidates);
};

/** 記事本文に同名の要素が書かれていても広告枠にならないよう、先に取り除く */
const removeSlotElements = (nodes: HastNode[]): HastNode[] =>
  nodes
    // 戻り値を boolean と明示する（推論で型ガード化されると要素型が除外されてしまう）
    .filter((node): boolean => !isElement(node, COLUMN_AD_SLOT_TAG))
    .map((node) => {
      if (isElement(node)) node.children = removeSlotElements(node.children);
      return node;
    });

const isWhitespaceText = (node: HastNode): boolean =>
  node.type === "text" && node.value.trim() === "";

/** クラスが `not-prose` ただ1つで、style などほかの属性を持たない div */
const isPlainNotProseWrapper = (node: HastNode): node is HastElement => {
  if (!isElement(node, "div")) return false;
  const properties = node.properties ?? {};
  const keys = Object.keys(properties);
  const className = properties.className;
  return (
    keys.length === 1 &&
    keys[0] === "className" &&
    Array.isArray(className) &&
    className.length === 1 &&
    className[0] === "not-prose"
  );
};

/**
 * 広告枠を差し込む対象の並び（親要素の children）を返す。
 *
 * 通常は本文のトップレベル。ただし本文全体が `<div class="not-prose">` 1つで
 * 包まれている古い記事（gogo3 / funky2 / neo-im 系の4本）は、トップレベルに要素が
 * 1つしかなく挿入位置が作れないため、その div の内側を対象にする。
 * 色付きの枠など装飾を持つ div の中には入れないよう、属性が `class="not-prose"`
 * だけの div に限定する。トップレベルに要素が2つ以上ある記事は従来どおり。
 */
const resolveSlotContainer = (tree: HastRoot): { children: HastNode[] } => {
  const meaningful = tree.children.filter(
    (node) => !isWhitespaceText(node) && node.type !== "comment",
  );
  if (meaningful.length === 1 && isPlainNotProseWrapper(meaningful[0])) {
    return meaningful[0];
  }
  return tree;
};

/** react-markdown の rehypePlugins に rehype-raw の後ろで渡す */
export const rehypeColumnAdSlot = () => (tree: HastRoot) => {
  tree.children = removeSlotElements(tree.children);
  const container = resolveSlotContainer(tree);
  const index = findAdInsertionIndex(container.children);
  if (index === null) return;
  const slot: HastElement = {
    type: "element",
    tagName: COLUMN_AD_SLOT_TAG,
    properties: {},
    children: [],
  };
  container.children.splice(index, 0, slot);
};
