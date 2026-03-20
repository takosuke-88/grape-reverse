import { useEffect } from "react";
import { Link } from "react-router-dom";

const NeoImSetting6BehaviorColumn = () => {
  useEffect(() => {
    document.title =
      "ネオアイムジャグラーの設定6、実際どう動くのか？｜GrapeReverse";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-red-700 dark:text-red-400 leading-tight">
          ネオアイムジャグラーの設定6、実際どう動くのか？
        </h1>

        <div className="prose dark:prose-invert max-w-none leading-relaxed">
          {/* リード文 */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 mb-8 rounded-r-lg shadow-sm">
            <p className="text-lg text-purple-900 dark:text-purple-200 m-0">
              設定6引いたら絶対勝てる——そう思ってる人、多い。でも現実はちょっと違う。「ほぼ勝てる。けど、普通に負ける日もある」これが正直なところ。シミュレーションと実戦データから、設定6のリアルな姿を洗い出してみる。
            </p>
          </div>

          <p className="mb-6">
            チェリー狙いで機械割107.3%——これ、高いの？
            <br />
            メーカー公表の適当打ちだと105.5%。チェリーきっちり狙うと107.3%まで伸びる。数字だけ見ると「おお、強い」って感じるんだけど、後で他機種と比べるとちょっと印象変わるかもしれない。
          </p>

          {/* シミュレーション結果 */}
          <h2 className="text-xl font-bold mt-12 mb-6 border-b-2 border-red-200 dark:border-red-800 pb-2 flex items-center gap-2">
            <span className="bg-red-600 text-white p-1 rounded text-sm">DATA</span>
            7000G回したシミュレーション（10万日分）の結果
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">1日平均差枚</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">+1,564枚</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">平均投資</div>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">約10,600円</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">機械割（実測）</div>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">107.45%</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">勝率</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">85.47%</div>
            </div>
          </div>

          <p className="mb-8">
            勝率85.5%。裏を返せば、約15%は負ける。設定6でも7日打ったら1日は負ける計算。これ、意外と見落とされがち。
          </p>

          {/* 判定パターン（勝ち） */}
          <h2 className="text-xl font-bold mt-12 mb-6 border-b-2 border-red-200 dark:border-red-800 pb-2">
            設定6の「勝ちグラフ」、パターンは3つ
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mt-0">
                📈 パターンA：王道の右肩上がり（+2,000〜+3,500枚）
              </h3>
              <p className="text-sm m-0">
                序盤から合算1/125前後でBIGとREGがバランスよく降ってくる。ハマっても200G以内で回収。グラフは小波を描きつつじわじわ上昇。実戦データだと終日平均が+2,100枚くらいに収まる一番気持ちいいパターン。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mt-0">
                📈 パターンB：中盤まで死んで後半に息を吹き返す（+1,000〜+2,000枚）
              </h3>
              <p className="text-sm m-0">
                朝イチから500Gハマりが続いて疑心暗鬼のまま5,000G超えたあたりでREGがポツポツ付き始めて、気づいたらプラス圏内。設定6でも半日マイナス走るのは珍しくない。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mt-0">
                📈 パターンC：淡々とプラス維持（+500〜+1,500枚）
              </h3>
              <p className="text-sm m-0">
                派手さゼロ。BIGもREGも平均的で、ハマりも爆発もない。グラフは「ゆるい上り坂」を描いて終わり。これが一番多いパターンかもしれない。
              </p>
            </div>
          </div>

          {/* 判定パターン（負け） */}
          <h2 className="text-xl font-bold mt-12 mb-6 border-b-2 border-red-200 dark:border-red-800 pb-2">
            「負けグラフ」も存在する——設定6なのに
          </h2>
          <p className="mb-6">
            設定6でも7000Gで負ける確率は約14.5%。具体的にはこんな台。
          </p>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-400 mt-0">
                📉 パターンD：BIG偏りでREG不発（−300〜−800枚）
              </h3>
              <p className="text-sm m-0 text-orange-950 dark:text-orange-200/80">
                BIGはそこそこ引けてるのにREGが1/400超え。合算は軽く見えるけどREG比率が低設定っぽくて「これ設定4じゃね？」って誤認する。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400 mt-0">
                📉 パターンE：終日ハマり連打（−1,000〜−2,000枚）
              </h3>
              <p className="text-sm m-0 text-red-950 dark:text-red-200/80">
                500〜700Gハマりを何度も食らって、ボーナス軽くなる頃には閉店間際。設定6でも大ハマりは普通に来る。
              </p>
            </div>
          </div>

          {/* 比較テーブル */}
          <h2 className="text-xl font-bold mt-12 mb-6 border-b-2 border-red-200 dark:border-red-800 pb-2">
            AT機（東京喰種・からくりサーカス）と並べてみる
          </h2>

          <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 border-b dark:border-gray-700 font-bold">機種</th>
                  <th className="px-4 py-3 border-b dark:border-gray-700 font-bold text-center">設定6機械割</th>
                  <th className="px-4 py-3 border-b dark:border-gray-700 font-bold text-center">設定1機械割</th>
                  <th className="px-4 py-3 border-b dark:border-gray-700 font-bold">特徴</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-yellow-50 dark:bg-yellow-900/20 font-bold border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-4 text-gray-900 dark:text-white">ネオアイム（チェリー狙い）</td>
                  <td className="px-4 py-4 text-center text-red-600 dark:text-red-400">107.3%</td>
                  <td className="px-4 py-4 text-center">97.4%</td>
                  <td className="px-4 py-4">低分散・安定</td>
                </tr>
                <tr className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-4">スマスロ東京喰種</td>
                  <td className="px-4 py-4 text-center">114.9%</td>
                  <td className="px-4 py-4 text-center">97.5%</td>
                  <td className="px-4 py-4">高分散・大量獲得</td>
                </tr>
                <tr className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-4">スマスロからくりサーカス</td>
                  <td className="px-4 py-4 text-center">114.9%</td>
                  <td className="px-4 py-4 text-center">97.5%</td>
                  <td className="px-4 py-4">高分散・上振れ爆発</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            設定6の機械割だけ見ると、ネオアイムは東京喰種・からくりより約7.6ポイント下。時給換算だと東京喰種の設定6が+6,705円（等価交換）に対して、ネオアイムは+1,800〜+2,200円前後が現実ライン。
            <br />
            AT機の設定6は確保が難しいが、ネオアイムは台数多くて確保しやすく、安定して期待値積めるのが強み。
          </p>

          <h2 className="text-xl font-bold mt-12 mb-6 border-b-2 border-red-200 dark:border-red-800 pb-2">
            結論：設定6は「仕事をする台」、でも爆発力は期待するな
          </h2>
          <p className="mb-6">
            ネオアイムの設定6は「ジャグラーとしては最強クラス」のスペック。AT機みたいな爆発はない。
            <br />
            GrapeReverseでぶどう逆算しながら「本当に設定6域のぶどうが出てるか」を確認し続ける——これが終日ぶん回す根拠を保つ作業になる。設定6は「データを積み上げた先にプラスがある台」。そう理解して打つのが正解。
          </p>

          {/* フッター誘導 */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 p-8 rounded-3xl mt-16 text-center border border-red-100 dark:border-red-800/30">
            <h2 className="text-xl font-bold mb-4">確実な設定判別こそが勝利への近道</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              機種の癖を知り、ツールで正確な数値を導き出す。
              <br />
              一時の波に惑わされない、データに基づいた立ち回りを。
            </p>
            <Link
              to="/aimex"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-full shadow-xl transform transition hover:scale-105 active:scale-95"
            >
              <span>🍇</span>
              ぶどう逆算で設定6を見極める
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NeoImSetting6BehaviorColumn;
