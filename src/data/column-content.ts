import fm from "front-matter";

export interface ColumnFrontmatter {
  title: string;
  description: string;
  date: string;
  updatedAt: string;
  tags: string[];
  draft: boolean;
  showRelatedColumns?: boolean;
}

export interface ColumnEntry {
  slug: string;
  frontmatter: ColumnFrontmatter;
  body: string;
}

const rawModules = import.meta.glob("/src/content/columns/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const ALL_COLUMNS: ColumnEntry[] = Object.entries(rawModules)
  .map(([path, raw]) => {
    const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
    const parsed = fm<ColumnFrontmatter>(raw);
    return { slug, frontmatter: parsed.attributes, body: parsed.body };
  })
  .filter((entry) => !entry.frontmatter.draft)
  .sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );

export function getColumnBySlug(slug: string): ColumnEntry | undefined {
  return ALL_COLUMNS.find((entry) => entry.slug === slug);
}

// ─────────────────────────────────────────────
// 関連コラムの候補選定
//
// 時事系コラムが中心で本文へ毎回手動リンクを埋め込めないため、記事末尾に
// 関連する過去コラムを自動表示する。「最新N件」ではなく、記事どうしの
// 実際の関連シグナルだけを根拠にする（無関係なら0件＝非表示）。
// ─────────────────────────────────────────────

/**
 * スコア計算から完全に除外する汎用タグ。
 * 実データでは column 83件 / news 70件 / pachinko 50件 / pachislot 23件（全87件中）と
 * ほぼ全記事に付いており識別力がない。これらだけが一致する記事同士を
 * 「関連」と見なすと、事実上サイト全体が相互リンクしてしまう。
 */
const GENERIC_RELATED_TAGS = new Set([
  "column",
  "news",
  "pachinko",
  "pachislot",
]);

/** titleの共通性判定から除外する汎用語（サイト名・カテゴリ語） */
const GENERIC_TITLE_WORDS = [
  "grapereverse",
  "パチンコ",
  "パチスロ",
  "設定",
  "攻略",
];

/** 本文CTAのカテゴリ一覧リンク（機種単体ではないがカテゴリの明示シグナル） */
const CATEGORY_CTA_HREFS = new Set(["/#juggler", "/#hana"]);

const MAX_RELATED = 3;
/** 同一機種ページへのCTAを共有：最も強い関連シグナル */
const MACHINE_CTA_SCORE = 6;
/** 同一カテゴリ一覧へのCTAを共有 */
const CATEGORY_CTA_SCORE = 2;
/** title 2-gram 一致1個あたりの加点（補助のみ。単独では表示条件を満たさない） */
const TITLE_GRAM_SCORE = 0.25;
/** titleによる加点の上限（偶然の一致でタグ一致を逆転させないため） */
const TITLE_SCORE_CAP = 1.5;
/** これより多くの記事に出現する2-gramは、ありふれた言い回しとみなし無視する */
const TITLE_GRAM_MAX_DF = 8;

interface ColumnProfile {
  /** 汎用タグを除いた固有タグ */
  tags: Set<string>;
  /** 本文CTAから抽出した機種ページのパス（例: /myjuggler5） */
  machines: Set<string>;
  /** 本文CTAから抽出したカテゴリ一覧のパス（例: /#juggler） */
  categories: Set<string>;
  /** 汎用語・記号を除いたtitleの2-gram */
  titleGrams: Set<string>;
}

/** 記号・空白を落とし、かな/カナ/漢字/英数のみを残す */
function normalizeTitle(title: string): string {
  let text = title.toLowerCase();
  for (const word of GENERIC_TITLE_WORDS) {
    text = text.split(word).join("");
  }
  // ひらがな・カタカナ（長音符ーを含む）・漢字・英数のみ残す
  return text.replace(/[^0-9a-z぀-ヿ一-鿿]/g, "");
}

function toBigrams(normalized: string): Set<string> {
  const grams = new Set<string>();
  for (let i = 0; i + 2 <= normalized.length; i++) {
    grams.add(normalized.slice(i, i + 2));
  }
  return grams;
}

/**
 * 本文の `<a ... class="cta-button">` から遷移先を抽出する。
 * frontmatterに機種情報を持たない既存記事から、機種の関連性を得る唯一の手段。
 */
function extractCtaTargets(body: string): {
  machines: Set<string>;
  categories: Set<string>;
} {
  const machines = new Set<string>();
  const categories = new Set<string>();
  for (const match of body.matchAll(/<a\b[^>]*>/g)) {
    const tag = match[0];
    if (!tag.includes("cta-button")) continue;
    const href = /href="([^"]+)"/.exec(tag)?.[1];
    if (!href) continue;
    if (CATEGORY_CTA_HREFS.has(href)) categories.add(href);
    else if (/^\/[a-z0-9-]+$/.test(href)) machines.add(href);
  }
  return { machines, categories };
}

interface RelatedIndex {
  profiles: Map<string, ColumnProfile>;
  /** タグ → そのタグを持つ記事数（IDF重みの算出に使う） */
  tagDocFreq: Map<string, number>;
  /** 2-gram → その2-gramを含む記事数 */
  gramDocFreq: Map<string, number>;
}

let relatedIndex: RelatedIndex | null = null;
const relatedCache = new Map<string, ColumnEntry[]>();

/** 全記事のプロファイルを一度だけ構築する（再描画のたびに再計算しない） */
function ensureRelatedIndex(): RelatedIndex {
  if (relatedIndex) return relatedIndex;

  const profiles = new Map<string, ColumnProfile>();
  const tagDocFreq = new Map<string, number>();
  const gramDocFreq = new Map<string, number>();

  for (const entry of ALL_COLUMNS) {
    const tags = new Set(
      (entry.frontmatter.tags ?? []).filter(
        (tag) => !GENERIC_RELATED_TAGS.has(tag),
      ),
    );
    const { machines, categories } = extractCtaTargets(entry.body);
    const titleGrams = toBigrams(normalizeTitle(entry.frontmatter.title));

    profiles.set(entry.slug, { tags, machines, categories, titleGrams });

    for (const tag of tags) {
      tagDocFreq.set(tag, (tagDocFreq.get(tag) ?? 0) + 1);
    }
    for (const gram of titleGrams) {
      gramDocFreq.set(gram, (gramDocFreq.get(gram) ?? 0) + 1);
    }
  }

  relatedIndex = { profiles, tagDocFreq, gramDocFreq };
  return relatedIndex;
}

/**
 * 関連コラムを最大 limit 件返す。
 *
 * 表示条件（ゲート）: 固有タグ・機種CTA・カテゴリCTA のいずれかが1つ以上一致すること。
 * titleの一致は補助的な加点のみで、単独では候補にならない（偶然の一致による
 * 無関係リンクを防ぐため）。条件を満たす記事がなければ空配列を返し、
 * 最新記事による穴埋めは行わない。
 */
export function getRelatedColumns(
  currentSlug: string,
  limit: number = MAX_RELATED,
): ColumnEntry[] {
  const cacheKey = `${currentSlug}:${limit}`;
  const cached = relatedCache.get(cacheKey);
  if (cached) return cached;

  const { profiles, tagDocFreq, gramDocFreq } = ensureRelatedIndex();
  const current = profiles.get(currentSlug);
  const total = ALL_COLUMNS.length;

  if (!current) {
    relatedCache.set(cacheKey, []);
    return [];
  }

  const scored: { entry: ColumnEntry; score: number }[] = [];

  for (const entry of ALL_COLUMNS) {
    // 自分自身を除外（ALL_COLUMNS は draft 除外済み）
    if (entry.slug === currentSlug) continue;
    const other = profiles.get(entry.slug);
    if (!other) continue;

    // 1. 固有タグの一致（珍しいタグほど高く評価する = IDF重み）
    let tagScore = 0;
    let tagMatches = 0;
    for (const tag of current.tags) {
      if (!other.tags.has(tag)) continue;
      tagMatches++;
      const df = tagDocFreq.get(tag) ?? 1;
      tagScore += Math.log(total / df);
    }

    // 2. 機種CTA・カテゴリCTAの一致
    let ctaScore = 0;
    let ctaMatches = 0;
    for (const machine of current.machines) {
      if (other.machines.has(machine)) {
        ctaScore += MACHINE_CTA_SCORE;
        ctaMatches++;
      }
    }
    for (const category of current.categories) {
      if (other.categories.has(category)) {
        ctaScore += CATEGORY_CTA_SCORE;
        ctaMatches++;
      }
    }

    // ゲート: タグもCTAも一致しないならtitleがどれだけ似ていても関連としない
    if (tagMatches === 0 && ctaMatches === 0) continue;

    // 3. titleの共通性（ありふれた2-gramは除外し、上限を設けた補助スコア）
    let titleScore = 0;
    for (const gram of current.titleGrams) {
      if (!other.titleGrams.has(gram)) continue;
      if ((gramDocFreq.get(gram) ?? 0) > TITLE_GRAM_MAX_DF) continue;
      titleScore += TITLE_GRAM_SCORE;
    }

    scored.push({
      entry,
      score: tagScore + ctaScore + Math.min(titleScore, TITLE_SCORE_CAP),
    });
  }

  // ALL_COLUMNS は日付降順。Array#sort は安定なので、同点なら新しい記事が先に残る
  const result = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit))
    .map((item) => item.entry);

  relatedCache.set(cacheKey, result);
  return result;
}
