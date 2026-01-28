import { useEffect } from 'react'

export default function BayesExplanation() {
  useEffect(() => {
    document.title = '【解析の裏側】なぜこのツールは信頼できるのか？「ベイズの定理」超わかりやすい解説 | GrapeReverse'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12 dark:bg-slate-950">
      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 dark:bg-slate-900 dark:ring-slate-800">
        
        {/* ヘッダーエリア */}
        <div className="mb-8 border-b border-slate-100 pb-8 text-center dark:border-slate-800">
          <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            解析の裏側
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-slate-800 sm:text-3xl dark:text-white">
            なぜこのツールは信頼できるのか？
            <br className="hidden sm:block" />
            「ベイズの定理」超わかりやすい解説
          </h1>
        </div>

        {/* 本文エリア */}
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <p className="lead text-lg font-medium text-slate-600 dark:text-slate-300">
            このツールの設定判別には、「ベイズの定理」という統計学の計算式を使っています。
          </p>

          <p>
            「数学」と聞くと難しそうですが、実は私たちが普段ホールでやっている「店選び」や「挙動を見て押し引きを決めること」こそが、ベイズの定理そのものなんです。
          </p>
          <p>
            なぜ単純な割り算ではなく、この計算式を使うのか？ その理由を解説します。
          </p>

          <h2 className="mt-10 mb-4 text-xl font-bold text-slate-800 dark:text-white">
            1. 今までの計算（割り算）との違い
          </h2>
          <p>
            よくあるツールや計算方法は、単純な「割り算」です。
          </p>
          <p>
            例えば、ジャグラーで 1000回転 BIG 3・REG 5（合算1/125） という台があったとします。
            設定6の確率（約1/127）よりも良いので、こう考えがちです。
          </p>
          
          <div className="my-6 rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400">
            <p className="m-0 font-bold text-blue-800 dark:text-blue-200">
              「確率以上に引けているから、設定6の可能性が高い！」
            </p>
          </div>

          <p>
            しかし、ベイズの定理で計算すると、こうなります。<br />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              「今の挙動だと、設定6の可能性はまだ25%くらい。判断するには早すぎる」
            </span>
          </p>

          <p>なぜこうなるのでしょうか？</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong className="text-slate-700 dark:text-slate-200">普通の計算：</strong> 目の前の確率だけを見て、一番近い設定を探す
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-200">ベイズ計算：</strong> 「設定1や2でも、これくらいのマグレは起きうるよね？」という可能性まで考える
            </li>
          </ul>
          <p>
            ベイズの定理は、「低設定のマグレ吹き」や「高設定の不発」といったホールの現実を計算に入れているため、より信頼できる数値が出るのです。
          </p>

          <h2 className="mt-10 mb-4 text-xl font-bold text-slate-800 dark:text-white">
            2. 推理ドラマと同じ仕組み
          </h2>
          <p>
            ベイズの定理は、「犯人探し」に似ています。
          </p>

          <div className="space-y-4 my-6">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 mb-1 dark:text-slate-400">状況</h3>
              <p className="m-0 font-medium">ホールに容疑者（設定1〜6）が6人います。最初は誰が犯人（正解）かわかりません。</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 mb-1 dark:text-slate-400">証拠1：REGを引いた</h3>
              <p className="m-0 text-sm mb-2 text-slate-600 dark:text-slate-400">設定6はREGを引きやすく、設定1は引きにくい。</p>
              <p className="m-0 font-bold text-blue-600 dark:text-blue-400">→ 「お、REGが出たな。設定1の容疑が少し晴れて、設定6の疑いが強まったぞ」</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-500 mb-1 dark:text-slate-400">証拠2：500Gハマった</h3>
              <p className="m-0 text-sm mb-2 text-slate-600 dark:text-slate-400">設定6でもハマりますが、設定1のほうがもっとハマりやすい。</p>
              <p className="m-0 font-bold text-blue-600 dark:text-blue-400">→ 「さっき設定6かもと思ったけど、このハマり方は設定1っぽいな。6の可能性を下げて、1の可能性を上げよう」</p>
            </div>
          </div>

          <p>
            このように、1回転まわすごとにリアルタイムで各設定の可能性を更新し続けるのが、このツールの特徴です。
          </p>

          <h2 className="mt-10 mb-4 text-xl font-bold text-slate-800 dark:text-white">
            3. 少ない回転数でも使える理由
          </h2>
          <p>
            「3000回転、5000回転も回せば確率は収束するから、計算なんていらない」<br />
            これは正論です。
          </p>
          <p>
            でも、本当に知りたいのは「仕事帰りの1000回転」や「朝イチの500回転」で打つべきかどうか、ではないでしょうか。
          </p>
          <p>
            回転数が少ないうちは、確率は暴れます。設定1でも、最初の500回転でREGを3回引くことはよくあります。
          </p>
          <p>
            単純な割り算だと「REG確率1/166！ 設定6だ！」と判定してしまいますが、このツールは冷静です。<br />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              「まだ回転数が少ないから、設定1の偶然も否定できないよ。信頼度は40%くらいにしておこう」
            </span>
          </p>
          <p>
            この「統計的な慎重さ」が、無駄な投資を減らし、収支アップに繋がる最大の要素なのです。
          </p>

          <hr className="my-10 border-slate-200 dark:border-slate-800" />

          <h2 className="mt-0 mb-4 text-xl font-bold text-slate-800 dark:text-white">
            まとめ
          </h2>
          <p>
            このツールが表示する「設定6期待度〇〇%」という数字は、ただの勘ではありません。
          </p>
          <p>
            過去の膨大なデータに基づき、「今の台の挙動は、統計的にどの設定に一番近いか」を計算した結果です。
          </p>
          <p>
            100%当てることは不可能ですが、自分の「期待」や「願望」を捨てて、「台の客観的な状態」を見るためのパートナーとして使ってみてください。
          </p>
        </div>
        
      </article>
      
      {/* フッターナビ */}
      <div className="mt-10 text-center">
        <a href="/" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
          ← トップページに戻る
        </a>
      </div>
    </div>
  )
}
