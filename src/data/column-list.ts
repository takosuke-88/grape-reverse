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
      "BIG確率だけで設定判別していませんか？ファンキー2で勝つために見落としがちな「単独REG」と「ぶどう」の重要性を徹底解説。",
    tags: ["juggler", "funky2"],
    date: "2026-02-20",
    path: "/columns/funky2-setting6-behavior",
  },
];
