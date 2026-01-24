import { Link } from 'react-router-dom';
import Header from '../../components/Header';

const Funky2Column = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-purple-700 dark:text-purple-400">
          ファンキージャグラー2の設定6は別格？BIG先行の罠と、本当に見るべき「単独REG」の正体
        </h1>

        <div className="prose dark:prose-invert max-w-none leading-relaxed">
          {/* 導入 */}
          <p className="mb-4">
            ファンキージャグラー2の設定6って、実際どんな挙動をするか知ってますか？<br />
            派手なGOGOランプとBIGの連打。これがファンキーの魅力ですよね。
          </p>
          <p className="mb-4">
            でも、私には苦い経験があるんです。<br />
            「今日はBIG絶好調！設定6間違いなし！」そう確信して打ち続けた結果…。<br />
            気づいたら5万円が消えてました。財布の中身を見たとき、マジで膝から崩れ落ちそうになりましたよ。
          </p>
          <p className="mb-8 font-bold">
            ファンキージャグラー2で勝つには、派手さの裏にある「地味な数字」を見なきゃダメなんです。
          </p>

          {/* H2: BIG確率 */}
          <h2 className="text-xl font-bold mt-10 mb-4 border-b-2 border-purple-200 dark:border-purple-800 pb-2">
            BIG確率は無視してOK！設定1でも引けちゃうんです
          </h2>
          <p className="mb-4">
            いきなりショッキングなことを言います。<strong>BIG確率だけで設定6を判別するのは、ほぼ不可能です。</strong>
          </p>
          
          <div className="my-6 overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 border-b dark:border-gray-700">設定</th>
                  <th className="px-4 py-2 border-b dark:border-gray-700">BIG確率</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-2 border-b dark:border-gray-700">設定1</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">1/266</td>
                </tr>
                <tr className="bg-purple-50 dark:bg-gray-800 font-bold">
                  <td className="px-4 py-2 border-b dark:border-gray-700">設定6</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700 text-purple-600 dark:text-purple-300">1/219</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            正直、そこまで大きな差がないんですよね。料理に例えるなら<strong>「隠し味」程度の違い</strong>です。塩をひとつまみ足したかどうか、くらい。
          </p>
          <p className="mb-4">
            短期的な勝負なら、設定1でも平気で1/200を切ってきます。「BIGが走ってるから高設定」という考え方。これが私がボコボコにされた原因でした。
          </p>

          {/* H2: 単独REG */}
          <h2 className="text-xl font-bold mt-10 mb-4 border-b-2 border-purple-200 dark:border-purple-800 pb-2">
            ファンキージャグラー2の設定6判別は「単独REG」がカギ！
          </h2>
          <p className="mb-4">
            じゃあ、何を見ればいいのか？答えは<strong>「単独REG」</strong>です。<br />
            これに設定差の塊が詰まってるんですよね。
          </p>

          <div className="my-6 overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 border-b dark:border-gray-700">設定</th>
                  <th className="px-4 py-2 border-b dark:border-gray-700">単独REG確率</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-2 border-b dark:border-gray-700">設定1</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">約 1/460</td>
                </tr>
                <tr className="bg-purple-50 dark:bg-gray-800 font-bold">
                  <td className="px-4 py-2 border-b dark:border-gray-700">設定6</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700 text-purple-600 dark:text-purple-300">約 1/330</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            1.4倍近い差があります。例えるなら、同じ距離を走るのに<strong>設定6は下り坂、設定1は上り坂</strong>。体感できるレベルで違います。
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 my-4">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">ホールのデータ機の落とし穴</h3>
            <p className="text-sm">
              データ機では「単独」か「チェリー重複」か見抜けないことが多いです。でも、打っているあなたなら分かりますよね？<br />
              <strong>レバーオンでGOGO! → 単独</strong>です。これをスマホのメモ帳などで必ずカウントしましょう。
            </p>
          </div>

          {/* H2: ぶどう確率 */}
          <h2 className="text-xl font-bold mt-10 mb-4 border-b-2 border-purple-200 dark:border-purple-800 pb-2">
            ファンキージャグラー2はぶどう確率も裏切らない
          </h2>
          <p className="mb-4">
            もう一つ、見逃せない数字があります。<strong>ぶどう確率</strong>です。
          </p>

          <div className="my-6 overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 border-b dark:border-gray-700">設定</th>
                  <th className="px-4 py-2 border-b dark:border-gray-700">ぶどう確率</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-2 border-b dark:border-gray-700">設定1</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700">約 1/5.85</td>
                </tr>
                <tr className="bg-purple-50 dark:bg-gray-800 font-bold">
                  <td className="px-4 py-2 border-b dark:border-gray-700">設定6</td>
                  <td className="px-4 py-2 border-b dark:border-gray-700 text-purple-600 dark:text-purple-300">約 1/5.60</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            「たった0.25の差？」と思うかもしれませんが、月に数回打つなら年間で<strong>14万円以上の差</strong>になります。
          </p>
          <p className="mb-8">
            ぶどうが良い台は、コイン持ちが良くて「あれ？1000円で結構回るな」と体感できます。この感覚を、ツールを使って「数値」で確認しましょう。
          </p>

          {/* まとめ & CTA */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl mt-10">
            <h2 className="text-xl font-bold mb-4">まとめ</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>BIG確率は参考程度（設定差が小さい）</li>
              <li><strong>単独REG確率</strong>が最重要（1/460 vs 1/330）</li>
              <li>ぶどう確率も要チェック（年間収支に直結）</li>
            </ul>
            
            <p className="mb-6 font-bold text-center">
              感覚打ちは今日で卒業しましょう！
            </p>
            
            <div className="text-center">
              <Link 
                to="/funky2" 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105"
              >
                ファンキー2 判別ツールを使う
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Funky2Column;
