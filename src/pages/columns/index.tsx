import { Link } from "react-router-dom";
import { ALL_COLUMNS } from "../../data/column-content";
import Seo from "../../components/Seo";

// 一覧カード左端のアクセント帯の色（話題タグ → 色）。
// tags 配列で最初に現れる話題タグの色を使う。機種ID・シリーズ・旧形式のタグはここに無いので読み飛ばされる。
// 色は補助情報で、タグ名はカード上にそのまま表示している。
const TOPIC_ACCENT_PURPLE = "bg-violet-500 dark:bg-violet-400";
const TOPIC_ACCENT_BLUE = "bg-blue-500 dark:bg-blue-400";
const TOPIC_ACCENT_ORANGE = "bg-amber-600 dark:bg-amber-500";
const TOPIC_ACCENT_NEUTRAL = "bg-slate-300 dark:bg-slate-600";

const TOPIC_ACCENTS: Record<string, string> = {
  ユーザー心理: TOPIC_ACCENT_PURPLE,
  "収支・資金管理": TOPIC_ACCENT_PURPLE,
  "稼働・立ち回り": TOPIC_ACCENT_PURPLE,
  "機種・新台": TOPIC_ACCENT_PURPLE,
  "業界・市場": TOPIC_ACCENT_BLUE,
  ホール運営: TOPIC_ACCENT_BLUE,
  来店演者: TOPIC_ACCENT_BLUE,
  "メーカー・開発": TOPIC_ACCENT_BLUE,
  "事件・トラブル": TOPIC_ACCENT_ORANGE,
};

const topicAccentClass = (tags: string[]): string => {
  const topic = tags.find((tag) => tag in TOPIC_ACCENTS);
  return topic ? TOPIC_ACCENTS[topic] : TOPIC_ACCENT_NEUTRAL;
};

// カード背景の交互配色。記事の表示順（index）だけで決める。
// 1列（スマホ）は1枚ごと、2列（md以上）は1行＝2枚ごとに切り替える。
const CARD_BG_BASE = "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700";
// ダークモードの交互色は濃い紫（2026-10-13）。当初の slate-700/60 は基準カード（slate-800）と
// 明るさ・色味ともほぼ同じで（コントラスト比1.10、RGB差23）見分けがつかなかった。暗い背景では
// 明るさの差を大きく付けると文字が読みにくくなるため、色味の差（RGB差83）で区別する。
// 説明文（slate-400）のコントラストは 5.17 → 5.94 と、むしろ上がる。
const CARD_BG_ALT =
  "bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800";
const CARD_BG_MD_BASE =
  "md:bg-white md:border-slate-200 md:dark:bg-slate-800 md:dark:border-slate-700";
const CARD_BG_MD_ALT =
  "md:bg-violet-50 md:border-violet-200 md:dark:bg-violet-950 md:dark:border-violet-800";

const cardBackgroundClass = (index: number): string => {
  const mobile = index % 2 === 0 ? CARD_BG_BASE : CARD_BG_ALT;
  const desktop = Math.floor(index / 2) % 2 === 0 ? CARD_BG_MD_BASE : CARD_BG_MD_ALT;
  return `${mobile} ${desktop}`;
};

const ColumnIndexPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-12">
      <Seo
        pageTitle="パチスロ攻略コラム｜GrapeReverse"
        pageDescription="データと数学から導き出された、ジャグラー・ハナハナの「本当の狙い方」。独自シミュレーションや実戦データに基づく攻略情報を掲載しています。"
        pagePath="/columns"
      />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-white">
            パチスロ攻略コラム
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            データと数学から導き出された、ジャグラー・ハナハナの「本当の狙い方」
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_COLUMNS.map((entry, index) => (
            <Link
              key={entry.slug}
              to={`/columns/${entry.slug}`}
              className={`group relative flex flex-col border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 ${cardBackgroundClass(index)}`}
            >
              {/* 左端のアクセント帯。absolute なので本文の余白（p-6）は変わらない */}
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-1 ${topicAccentClass(entry.frontmatter.tags)}`}
              />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {entry.frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="px-2 py-1 text-slate-400 text-xs ml-auto">
                    {entry.frontmatter.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {entry.frontmatter.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                  {entry.frontmatter.description}
                </p>
                <div className="mt-auto flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  記事を読む <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ColumnIndexPage;
