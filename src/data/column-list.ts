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
    id: "myjuggler5-setting6-behavior",
    title:
      "【マイジャグ5】設定6はこう動く！ボーナス確率よりも「ぶどう」を信じるべき数学的理由",
    description:
      "「合算1/120の台が空いた！」←実はそれ、罠かもしれません。AIシミュレーションと実戦データから導き出した、マイジャグ5の本当の狙い方を解説します。",
    tags: ["juggler", "myjuggler5"],
    date: "2026-02-20",
    path: "/columns/myjuggler5-setting6-behavior",
  },
  {
    id: "funky2-setting6-behavior",
    title:
      "ファンキージャグラー2の設定6は別格？BIG先行の罠と、本当に見るべき「単独REG」の正体",
    description:
      "BIG確率だけで設定判別していませんか？ファンキー2で勝つために見落とされがちな「単独REG」と「ぶどう」の重要性を徹底解説。",
    tags: ["juggler", "funky2"],
    date: "2026-02-20",
    path: "/columns/funky2-setting6-behavior",
  },
  {
    id: "imjuggler-setting4-behavior",
    title: "設定4のネオアイムジャグラーは打つ価値あり？データで徹底検証",
    description:
      "夕方のホールで「合算1/142前後、RBもそこそこ出てる空き台」を見つけたとき、「これ設定4っぽいな」と感じたことはないだろうか。設定4が入っていたとして、果たしてそれは打ち続ける価値があるのか——今回はデータをもとにシビアに答えを出す。",
    tags: ["juggler", "im-juggler"],
    date: "2026-02-24",
    path: "/columns/imjuggler-setting4-behavior",
  },
  {
    id: "mrjuggler-expectations",
    title:
      "今さら聞けないミスタージャグラー、結局勝てるの？データで正直に評価する",
    description:
      "「なんか難しそう」でスルーしてきた人、正直多いんじゃないか。ミスタージャグラーはピエロ重複だの中押し攻略だの、調べると情報がわんさか出てきて初見だと確かに面倒くさそうに見える。ただ結論から言うと、チェリー狙いさえできればアイムジャグラーと変わらない感覚で打てる。",
    tags: ["juggler", "mr"],
    date: "2026-02-25",
    path: "/columns/mrjuggler-expectations",
  },
];
