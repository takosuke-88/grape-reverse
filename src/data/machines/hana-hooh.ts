import type { MachineConfig } from '../../types/machine-schema';

/**
 * ハナハナホウオウ～天翔～の設定判別データ
 */
export const hanaHoohConfig: MachineConfig = {
  id: 'hana-hooh',
  name: 'ハナハナホウオウ～天翔～',
  type: 'A-type',
  themeColor: 'bg-rose-600',
  sections: [
    {
      id: 'basic-data',
      title: '基本データ',
      elements: [
        {
          id: 'total-games',
          label: '総ゲーム数',
          type: 'counter',
          context: {
            description: '実際に回した総ゲーム数',
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
      id: 'bonus-section',
      title: 'ボーナス確率',
      elements: [
        {
          id: 'big-count',
          label: 'BIG回数',
          type: 'counter',
          context: {
            duringBonus: 'big',
            description: 'BIGボーナスの回数を入力',
          },
          settingValues: {
            1: 297,
            2: 284,
            3: 273,
            4: 262,
            5: 250,
            6: 236,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.5,
        },
        {
          id: 'reg-count',
          label: 'REG回数',
          type: 'counter',
          context: {
            duringBonus: 'reg',
            description: 'REGボーナスの回数を入力',
          },
          settingValues: {
            1: 496,
            2: 464,
            3: 436,
            4: 407,
            5: 372,
            6: 337,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 2.0,
        },
      ],
    },
    {
      id: 'normal-role-section',
      title: '通常時小役',
      elements: [
        {
          id: 'bell-count',
          label: 'ベル回数',
          type: 'counter',
          context: {
            description: 'ベル（8枚役）の成立回数',
          },
          settingValues: {
            1: 7.50,
            2: 7.45,
            3: 7.39,
            4: 7.36,
            5: 7.25,
            6: 7.07,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.2,
        },
      ],
    },
    {
      id: 'big-role-section',
      title: 'BIG中小役',
      elements: [
        {
          id: 'big-suika-count',
          label: 'BIG中スイカ回数',
          type: 'counter',
          context: {
            duringBonus: 'big',
            description: 'BIG中のスイカ成立回数',
          },
          settingValues: {
            1: 48.5,
            2: 47.0,
            3: 45.0,
            4: 42.0,
            5: 38.0,
            6: 32.0,
          },
          isDiscriminationFactor: true,
          discriminationWeight: 1.8,
        },
      ],
    },
  ],
  specs: {
    baseGamesPerMedal: 39, // 50枚あたり約39回転
    payoutRatio: [97.8, 99.9, 102.0, 104.2, 107.0, 110.0], // 設定1〜6の機械割
  },
};
