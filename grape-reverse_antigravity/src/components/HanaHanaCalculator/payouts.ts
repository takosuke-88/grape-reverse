export type HanaHanaPayoutSpec = {
  big: number; // Net payout
  reg: number; // Net payout
  bell: number;
  cherry: number;
  suika: number;
  replay: number; // usually 3 in, 3 out => 0 net cost, but logic subtracts cost?
  // Logic: PayoutTotal = Diff + Invest - PayoutNonBell
  // Invest = Total * 3
  // PayoutNonBell = BigPayout*Big + RegPayout*Reg + ReplayPayout*Replay + CherryPayout*Cherry + SuikaPayout*Suika
  // BellCount = (PayoutTotal) / BellPayout
};

// Default Replay Rate: 1/7.3
export const REPLAY_RATE = 1 / 7.298;
// Default Cherry Rate (approximate for subtraction): 1/48
export const CHERRY_RATE_APPROX = 1 / 48.0; 
// Default Suika Rate (approximate for subtraction): 1/160
export const SUIKA_RATE_APPROX = 1 / 160.0;

export const HANAHANA_PAYOUTS: Record<string, HanaHanaPayoutSpec> = {
  'star-hanahana': {
    big: 240,
    reg: 96,
    bell: 10,
    cherry: 4, 
    suika: 10,
    replay: 3,
  },
  'dragon-hanahana': {
    big: 252,
    reg: 96,
    bell: 10,
    cherry: 4,
    suika: 10,
    replay: 3,
  },
  'king-hanahana': {
    big: 260,
    reg: 120,
    bell: 10,
    cherry: 4,
    suika: 10,
    replay: 3,
  },
  'houoh-tensho': {
    big: 240,
    reg: 120,
    bell: 10,
    cherry: 4,
    suika: 10,
    replay: 3,
  },
  'high-high-shiosai': {
    big: 194,
    reg: 102,
    bell: 5, // 5 coins for Bell
    cherry: 2, // 2 coins for Cherry (3BET)
    suika: 5, // 5 coins for Suika (3BET)
    replay: 3,
  }
};
