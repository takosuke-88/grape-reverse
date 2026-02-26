const fs = require("fs");

const data = [
  {
    s: 1,
    big: 297,
    reg: 496,
    bell: 7.5,
    b_suika: 47.127,
    r_b: 0.36,
    r_y: 0.24,
    r_g: 0.24,
    r_r: 0.16,
    f_lamp: 10.24,
    retro: 16.15,
  },
  {
    s: 2,
    big: 284,
    reg: 458,
    bell: 7.45,
    b_suika: 42.864,
    r_b: 0.232,
    r_y: 0.348,
    r_g: 0.168,
    r_r: 0.252,
    f_lamp: 9.47,
    retro: 13.49,
  },
  {
    s: 3,
    big: 273,
    reg: 425,
    bell: 7.4,
    b_suika: 39.667,
    r_b: 0.336,
    r_y: 0.224,
    r_g: 0.264,
    r_r: 0.176,
    f_lamp: 8.53,
    retro: 12.46,
  },
  {
    s: 4,
    big: 262,
    reg: 397,
    bell: 7.35,
    b_suika: 36.991,
    r_b: 0.216,
    r_y: 0.323,
    r_g: 0.184,
    r_r: 0.275,
    f_lamp: 7.75,
    retro: 10.7,
  },
  {
    s: 5,
    big: 249,
    reg: 366,
    bell: 7.298,
    b_suika: 34.707,
    r_b: 0.311,
    r_y: 0.207,
    r_g: 0.287,
    r_r: 0.191,
    f_lamp: 7.1,
    retro: 9.5,
  },
  {
    s: 6,
    big: 236,
    reg: 337,
    bell: 7.22,
    b_suika: 31.266,
    r_b: 0.248,
    r_y: 0.248,
    r_g: 0.248,
    r_r: 0.248,
    f_lamp: 6.39,
    retro: 7.73,
  },
];

const bigGames = 24;

const out = {
  big: {},
  reg: {},
  bell: {},
  b_suika: {},
  r_b: {},
  r_y: {},
  r_g: {},
  r_r: {},
  f_lamp: {},
  retro: {},
};

data.forEach((d) => {
  out.big[d.s] = d.big;
  out.reg[d.s] = d.reg;
  out.bell[d.s] = d.bell;

  // BIG中のスイカ: (BIG確率の分母 / 24) * BIG中スイカの分母
  out.b_suika[d.s] = parseFloat(((d.big / bigGames) * d.b_suika).toFixed(2));

  // REGランプ: REG確率の分母 / 発生割合
  out.r_b[d.s] = parseFloat((d.reg / d.r_b).toFixed(2));
  out.r_y[d.s] = parseFloat((d.reg / d.r_y).toFixed(2));
  out.r_g[d.s] = parseFloat((d.reg / d.r_g).toFixed(2));
  out.r_r[d.s] = parseFloat((d.reg / d.r_r).toFixed(2));

  // フェザーランプ (BIG後): BIG確率の分母 * 合算確率分母
  out.f_lamp[d.s] = parseFloat((d.big * d.f_lamp).toFixed(2));

  // レトロサウンド (BIG後): BIG確率の分母 * レトロサウンド確率分母
  // Wait, is retro sound BIG+REG? usually BIG is 1/16, REG is 1/128 etc.
  // Assuming it's based on BIG.
  out.retro[d.s] = parseFloat((d.big * d.retro).toFixed(2));
});

console.log(JSON.stringify(out, null, 2));
