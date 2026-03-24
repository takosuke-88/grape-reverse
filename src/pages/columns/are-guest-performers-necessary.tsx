import { useEffect } from "react";
import { Link } from "react-router-dom";
import ColumnNavigation from "../../components/ColumnNavigation";
import RelatedColumns from "../../components/RelatedColumns";

const AreGuestPerformersNecessaryColumn = () => {
  useEffect(() => {
    document.title =
      "来店演者って「いらなくない？」 -パチスロ攻略コラム｜GrapeReverse";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* パンくずリスト */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link
            to="/"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            ホーム
          </Link>
          <span>/</span>
          <Link
            to="/columns"
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            攻略コラム
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium truncate">
            来店演者の考察
          </span>
        </nav>

        <article>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-10 text-slate-900 dark:text-white leading-[1.2] tracking-tight">
            来店演者って「いらなくない？」
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* リード文: 大きめの文字サイズと少し抑えた色 */}
            <div className="mb-10 text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              <p>
                ——これ、いったい誰のためなんだろう。
                <br />
                最後にホールへ足を運んだのはいつだっただろう。SNSで「今週〇〇さんが来店！」って告知を見て、その日を選んだ経験がある人もいるはずだ。来店演者、気づけばホールの集客戦略の"ど真ん中"に居座ってる。
                <br />
                で、ここでちょっと立ち止まってみたい。この仕組み、本当に誰かを幸せにしてるんだろうか？
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6 border-l-4 border-indigo-500 pl-4 py-1 text-slate-900 dark:text-white">
              7,000人の応募と、膨れ上がる演者市場
            </h2>
            <p className="mb-6 leading-loose">
              「スロパチステーション」が演者募集をかけたときの話だ。応募が<strong>7,000人</strong>。採用されたのは男女各1名。競争率で言えばアイドルのオーディションと変わらない。演者って職業への憧れが強いのはわかる。ただ同時に感じるのは、この市場、もう完全に供給過多だってことだ。
            </p>
            <p className="mb-6 leading-loose">
              なぜこうなったのか。ホールが合法的に打ける集客手段って、実はかなり限られてる。パチスロ業界の広告規制は厳しい。「高設定を入れます」なんて言葉、看板に出せるわけがない。だから演者を呼んで、そのファンが来店する——そういう間接ルートが定着していった。
              <br />
              2024年のパチスロ参加人口は<strong>690万人</strong>。前年比で30万人も増えて、業界はコンテンツ投資を拡大してる局面にある。演者市場はその波に乗って、膨れ上がり続けてきた。
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6 border-l-4 border-indigo-500 pl-4 py-1 text-slate-900 dark:text-white">
              構造上の歪みと、表面化した「疑惑」
            </h2>
            <p className="mb-6 leading-loose">
              ただ、この構造には歪みがある。根っこの部分で。
            </p>
            <p className="mb-6 leading-loose">
              ホールは演者を「招待」という名目で呼び、謝礼を渡す。演者はその台で楽しそうに打って、映像を発信する。視聴者は「あのホールは高設定を使ってる」って印象を受け取って、来店の動機にする。問題は、演者に出させるために高設定台を優遇する——そういうインセンティブが, 構造上どうしたって発生しやすいってことだ。
            </p>
            <p className="mb-6 leading-loose italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-l-2 border-slate-200 dark:border-slate-700">
              「疑惑」の域を出ない話だったはずなんだけどね。2024年、疑惑が"証拠"みたいな形で浮上した。特定の来店演者に対して, 店舗側が指定台を案内したとされるLINEのやり取りが外部にリークされた。「設定を教えることはない」って建前、あっさり崩れかけた瞬間だった。別のケースでは、演者のディレクターが「来店で設定6をツモった」ってSNSで自慢して炎上してる。
            </p>
            <p className="my-8 leading-loose">
              2025年1月。静岡のスロット系媒体「すずスロ」に所属していた演者・幸介氏が<strong>「重大な契約違反」</strong>を理由に解雇され、媒体そのものが解散。そして同年6月、女性演者のしえる氏が突然消息不明になって警察沙汰。来店キャンセルが相次いだ。
              <br />
              個々の事情は違うんだろう。でも、演者っていう不安定な立場に置かれた人間が起こすトラブルが、ホールと視聴者の両方に波及するっていう構造——これ、全然変わってない。
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6 border-l-4 border-indigo-500 pl-4 py-1 text-slate-900 dark:text-white">
              演者は「誰のため」に機能しているのか？
            </h2>
            <p className="mb-6 leading-loose">
              擁護する声もわかる。来店演者がいることで「今日は設定使ってるかも」っていう期待感が生まれるのは事実だ。演者のファンが新たにスロットを始めるきっかけになることもあるし、視聴者がホールを選ぶ際の参考情報になる側面もある。「来店に合わせて設定を入れるホールをリストアップして立ち回る」っていう、ある種の情報戦として活用してる上級者も一定数いる。
            </p>
            <p className="mb-6 leading-loose font-bold text-lg text-indigo-600 dark:text-indigo-400">
              それは確かに「機能」してる。でも、誰のための機能か？
            </p>
            <p className="mb-6 leading-loose text-slate-700 dark:text-slate-300">
              ホールから見ればマーケティングコスト。演者にとっては収入源。メディア側にとっては視聴数と影響力の強化。で、視聴者や来店者は——その構造の上にポンと乗っかった「お客さん」なわけだ。「演者が来た日は高設定が入る」っていうのは期待であって保証じゃない。その期待に乗っかって台に座る行動が毎回正しい立ち回りになるわけ、ないよね。
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6 border-l-4 border-indigo-500 pl-4 py-1 text-slate-900 dark:text-white">
              本当に必要なのは「演者」ではなく「透明性」
            </h2>
            <p className="mb-6 leading-loose">
              というか、業界が本当に必要としてるのは「演者バブル」の継続じゃないと思う。遊技そのものの質と、透明性への信頼じゃないだろうか。
            </p>
            <p className="mb-6 leading-loose">
              来店演者が増え続けることで遊技人口が回復するかって言えば、データはそれを支持してない。2024年に参加人口は30万人増えた。ただ、1回あたりの費用と年間活動回数は減少してる。人は増えてるけど、深く遊ぶ人は減ってる——これ、演者が集めた新規層がホールの常連になってないことを示してると感じる。
            </p>
            <p className="mb-10 leading-loose">
              7,000人が演者を目指す世界で、本当に足りてないのは演者じゃない。<strong>「この店で打って良かった」</strong>っていう経験を積み重ねられるホール環境だ。設定状況の透明性を高めて、GrapeReverseみたいなツールでデータを武器に立ち回れる環境を整える方が、長期的な遊技人口の回復には直結するんじゃないか。
            </p>

            <p className="mt-12 mb-16 pt-10 border-t border-slate-200 dark:border-slate-800 leading-loose text-lg md:text-xl text-slate-700 dark:text-slate-300">
              来店演者は、業界が広告規制っていう制約の中で生み出した「苦肉の策」だったはずだ。その苦肉の策が主役になりすぎてるとしたら——そろそろ問い直す時期に来てると思う。
            </p>
            <ColumnNavigation currentId="are-guest-performers-necessary" />
          </div>

          {/* 関連記事セクション */}
          <RelatedColumns currentId="are-guest-performers-necessary" />
        </article>
      </main>
    </div>
  );
};

export default AreGuestPerformersNecessaryColumn;
