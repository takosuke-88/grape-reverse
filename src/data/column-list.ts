export interface ColumnArticle {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  thumbnailUrl?: string;
  path: string;
}

export const ATTACHED_COLUMNS: ColumnArticle[] = [
  {
    id: "king-hanahana-2026",
    title: "キングハナハナはまだ狙えるか？ニューキングV導入後の設定状況と立ち回り",
    description:
      "2026年のキングハナハナはまだ勝てるのか？認定満期やスマスロ『ニューキングハナハナV-30』導入によるホール状況の変化、設定6をツモるための必須条件を徹底解説します。",
    tags: ["column", "hana", "strategy"],
    date: "2026-04-26",
    path: "/columns/king-hanahana-2026",
  },
  {
    id: "pachinko-vs-slot-market-2026",
    title: "パチンコとパチスロ、なぜここまで差がついたのか。2026年春の市場データを読む",
    description:
      "最新のDI調査で明らかになった、パチンコ▲60.0、パチスロ+40.0という衝撃的な稼働格差。なぜここまで差がついたのか？2026年春の市場データを読み解き、ホールがスロットへ投資をシフトする現状と、打ち手が選ぶべき「勝てる環境」の条件を考察します。",
    tags: ["column", "analysis", "market"],
    date: "2026-04-17",
    path: "/columns/pachinko-vs-slot-market-2026",
  },
  {
    id: "remake-boom-analysis",
    title: "なぜ「懐かし台」ばかりリメイクされるのか。吉宗・ミリオンゴッドから読む業界の本音",
    description:
      "2024年以降加速する「懐かし台」のリメイクブーム。吉宗・ミリオンゴッドのスマスロ導入を機に、業界がリメイクを量産する構造的な理由と、ユーザーが陥りがちな心理的ハードルの罠、そして求められる立ち回りの軸について考察します。",
    tags: ["column", "analysis", "strategy"],
    date: "2026-04-17",
    path: "/columns/remake-boom-analysis",
  },
  {
    id: "evening-juggler-strategy",
    title: "仕事帰りのジャグラー、なぜ勝てない？「夕方からの台選び」で絶対にやってはいけない3つのこと",
    description:
      "仕事を終えてホールへ直行。データ機を眺めて「合算1/130、これいけるんじゃね？」と座る。その判断が、実は負けの始まりかもしれません。夕方からの立ち回りで陥りがちな3つの罠と、勝率を劇的に変える「ぶどう逆算」の重要性を解説します。",
    tags: ["column", "juggler", "strategy"],
    date: "2026-03-24",
    path: "/columns/evening-juggler-strategy",
  },
  {
    id: "are-guest-performers-necessary",
    title: "来店演者って「いらなくない？」",
    description:
      "7,000人の応募、数十万人のフォロワー、そしてリークされる「指定台」の疑い。集客の切り札として定着した来店演者バブルの裏側にある歪みと、業界が本当に必要としている『透明性』について考える。",
    tags: ["column", "opinion", "strategy"],
    date: "2026-03-22",
    path: "/columns/are-guest-performers-necessary",
  },
  {
    id: "neo-im-juggler-setting6-behavior",
    title: "ネオアイムジャグラーの設定6、実際どう動くのか？",
    description:
      "設定6引いたら絶対勝てる——そう思ってる人、多い。でも現実はちょっと違う。「ほぼ勝てる。けど、普通に負ける日もある」これが正直なところ。シミュレーションと実戦データから、設定6のリアルな姿を洗い出してみる。",
    tags: ["neo-im-juggler", "setting6", "column"],
    date: "2026-03-19",
    path: "/columns/neo-im-juggler-setting6-behavior",
  },
  {
    id: "myjuggler5-strategy-trap",
    title: "「マイジャグVは負けやすい」の真実。設定2の地雷を避ける立ち回り術",
    description:
      "看板機種ゆえの皮肉。実はフリー打ち設定2で98.0%、確実なマイナス構造に潜む「見えない地雷」を避けるための必須知識を解説します。",
    tags: ["juggler", "myjuggler5", "strategy", "column"],
    date: "2026-03-04",
    path: "/columns/myjuggler5-strategy-trap",
  },
  {
    id: "myjuggler5-setting6-behavior",
    title: "【マイジャグ5】設定6はこう動く！",
    description:
      "「合算1/120の台が空いた！」←実はそれ、罠かもしれません。AIシミュレーションと実戦データから導き出した、マイジャグ5の本当の狙い方を解説します。",
    tags: ["juggler", "myjuggler5"],
    date: "2026-02-20",
    path: "/columns/myjuggler5-setting6-behavior",
  },
  {
    id: "funky2-setting6-behavior",
    title: "ファンキージャグラー2の設定6は別格？",
    description:
      "BIG確率だけで設定判別していませんか？ファンキー2で勝つために見落とされがちな「単独REG」と「ぶどう」の重要性を徹底解説。",
    tags: ["juggler", "funky2"],
    date: "2026-02-20",
    path: "/columns/funky2-setting6-behavior",
  },
  {
    id: "imjuggler-setting4-behavior",
    title: "設定4のネオアイムジャグラーは打つ価値あり？",
    description:
      "夕方のホールで「合算1/142前後、RBもそこそこ出てる空き台」を見つけたとき、「これ設定4っぽいな」と感じたことはないだろうか。設定4が入っていたとして、果たしてそれは打ち続ける価値があるのか——今回はデータをもとにシビアに答えを出す。",
    tags: ["juggler", "im-juggler"],
    date: "2026-02-24",
    path: "/columns/imjuggler-setting4-behavior",
  },
  {
    id: "mrjuggler-expectations",
    title: "今さら聞けないミスタージャグラー、結局勝てるの？",
    description:
      "「なんか難しそう」でスルーしてきた人、正直多いんじゃないか。ミスタージャグラーはピエロ重複だの中押し攻略だの、調べると情報がわんさか出てきて初見だと確かに面倒くさそうに見える。ただ結論から言うと、チェリー狙いさえできればアイムジャグラーと変わらない感覚で打てる。",
    tags: ["juggler", "mr"],
    date: "2026-02-25",
    path: "/columns/mrjuggler-expectations",
  },
  {
    id: "hanahana-losing-patterns",
    title: "ハナハナで負け続ける人には共通点があった！",
    description:
      "ハナハナで負け続ける人の多くは、台が悪いのではなく判断の根拠が演出任せになっています。フラッシュの色に踊らされず、ベル確率を重視するなど、勝つための「判断の癖」を解説します。",
    tags: ["hana", "hanahana", "strategy", "column"],
    date: "2026-03-08",
    path: "/columns/hanahana-losing-patterns",
  },
  {
    id: "hanahana-strategy-differences",
    title: "ハナハナの立ち回り、機種が変わっても同じでいいのか？",
    description:
      "機種が変わってもベル数えてBIG中のスイカ見てフェザーランプ確認して……この流れ自体は変わらない。基本骨格は一緒だ。ただ、「どうせ全部同じハナハナでしょ」って感覚で座ると、機種ごとに仕込まれてる微妙な差異を見逃す。",
    tags: ["hana", "hanahana", "strategy", "column"],
    date: "2026-03-10",
    path: "/columns/hanahana-strategy-differences",
  },
];
