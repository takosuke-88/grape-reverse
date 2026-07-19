import type { MachineConfig } from "../types/machine-schema";
import { hanaHoohConfig } from "./machines/hana-hooh";
import { funkyJuggler2Config } from "./machines/funky-juggler-2";
import { myJuggler5Config } from "./machines/juggler-my5";
import { imJugglerExConfig } from "./machines/juggler-im-ex";
import { gogoJuggler3Config } from "./machines/juggler-gogo3";
import { girlsSsConfig } from "./machines/juggler-girls-ss";
import { mrJugglerConfig } from "./machines/juggler-mr";
import { miracleJugglerConfig } from "./machines/juggler-miracle";
import { happyV3Config } from "./machines/juggler-happy-v3";
import { kingHanahanaConfig } from "./machines/king-hanahana";
import { dragonSenkoConfig } from "./machines/dragon-senko";
import { starHanahanaConfig } from "./machines/star-hanahana";
import { newHanahanaGoldConfig } from "./machines/new-hanahana-gold";
import { newKingVConfig } from "./machines/new-king-v";
import { lastUtopiaConfig } from "./machines/last-utopia";
import { haihaiSiosai2Config } from "./machines/haihai-siosai2";
import { haihaiSiosaiConfig } from "./machines/haihai-siosai";

/**
 * 機種ID → MachineConfig の対応表。
 * GrapeReversePage / MachineSpecPage / MachinePagePreview で共通利用する。
 * 新機種を追加する場合はこのファイルのみを更新すればよい。
 */
export const CONFIG_MAP: Record<string, MachineConfig> = {
  "hana-hooh": hanaHoohConfig,
  funky2: funkyJuggler2Config,
  myjuggler5: myJuggler5Config,
  aimex: imJugglerExConfig,
  gogo3: gogoJuggler3Config,
  girlsss: girlsSsConfig,
  mr: mrJugglerConfig,
  miracle: miracleJugglerConfig,
  happyv3: happyV3Config,
  "king-hanahana": kingHanahanaConfig,
  "dragon-senko": dragonSenkoConfig,
  "star-hanahana": starHanahanaConfig,
  "new-king-v": newKingVConfig,
  "new-hanahana-gold": newHanahanaGoldConfig,
  "last-utopia": lastUtopiaConfig,
  "haihai-siosai2": haihaiSiosai2Config,
  "haihai-siosai": haihaiSiosaiConfig,
};
