import type { MachineConfig } from "../../types/machine-schema";

/**
 * ファンキージャグラー2の設定判別データ
 */
export const funkyJuggler2Config: MachineConfig = {
  id: "funky-juggler-2",
  name: "ファンキージャグラー2",
  type: "A-type",
  themeColor: "bg-fuchsia-600",
  sections: [
    {
      id: "basic-data",
      title: "基本データ",
      elements: [
        {
          id: "total-games",
          label: "総ゲーム数",
          type: "counter",
          context: {
            description: "実際に回した総ゲーム数",
          },
          settingValues: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
          },
          isDiscriminationFactor: false,
          discriminationWeight: 0,
        },
      ],
    },
    {
      id: "bonus-section",
      title: "ボーナス確率",
      elements: [
        {
          id: "big-count",
          label: "BIG回数",
          type: "counter",
          context: {
            duringBonus: "big",
            description: "BIGボーナスの回数を入力",
          },
          settingValues: {
            1: 266.4,
            2: 259.0,
            3: 256.0,
            4: 249.2,
            5: 240.1,
            6: 219.9,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.0,
        },
        {
          id: "reg-count",
          label: "REG回数",
          type: "counter",
          context: {
            duringBonus: "reg",
            description: "REGボーナスの回数を入力",
          },
          settingValues: {
            1: 439.8,
            2: 407.1,
            3: 366.1,
            4: 322.8,
            5: 299.3,
            6: 262.1,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 2.5,
        },
      ],
    },
    {
      id: "normal-role-section",
      title: "通常時小役",
      elements: [
        {
          id: "grape-count",
          label: "ブドウ回数",
          type: "counter",
          context: {
            description: "ブドウの成立回数",
          },
          settingValues: {
            1: 5.95,
            2: 5.92,
            3: 5.88,
            4: 5.83,
            5: 5.76,
            6: 5.66,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 42, // 推定コイン持ち
    payoutRatio: [97.0, 98.5, 99.8, 102.0, 104.3, 109.0], // 設定1〜6の機械割
  },
};
