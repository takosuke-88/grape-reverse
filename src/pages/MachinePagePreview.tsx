import { useParams } from "react-router-dom";
import MachinePageFactory from "../components/dynamic-ui/MachinePageFactory";
import { hanaHoohConfig } from "../data/machines/hana-hooh";
import { funkyJuggler2Config } from "../data/machines/funky-juggler-2";
import { myJuggler5Config } from "../data/machines/juggler-my5";
import { imJugglerExConfig } from "../data/machines/juggler-im-ex";
import { gogoJuggler3Config } from "../data/machines/juggler-gogo3";
import { girlsSsConfig } from "../data/machines/juggler-girls-ss";
import { mrJugglerConfig } from "../data/machines/juggler-mr";
import { miracleJugglerConfig } from "../data/machines/juggler-miracle";
import { happyV3Config } from "../data/machines/juggler-happy-v3";
import type { MachineConfig } from "../types/machine-schema";

/**
 * 動的UIファクトリーのプレビューページ
 * URLパラメータから機種IDを取得し、対応する設定を読み込んでレンダリングする
 */
export default function MachinePagePreview() {
  const { machineId } = useParams<{ machineId: string }>();

  // 機種IDと設定ファイルのマッピング
  const configMap: Record<string, MachineConfig> = {
    "hana-hooh": hanaHoohConfig,
    "funky-juggler-2": funkyJuggler2Config,
    "my-juggler-5": myJuggler5Config,
    "im-juggler-ex": imJugglerExConfig,
    gogo3: gogoJuggler3Config,
    "girls-ss": girlsSsConfig,
    mr: mrJugglerConfig,
    miracle: miracleJugglerConfig,
    "happy-v3": happyV3Config,
  };

  const config = machineId ? configMap[machineId] : null;

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Config not found
          </h1>
          <p className="text-slate-600 mb-4">
            機種ID{" "}
            <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">
              {machineId}
            </code>{" "}
            に対応する設定ファイルが見つかりません。
          </p>
          <div className="text-left bg-slate-50 rounded-lg p-4 text-sm">
            <p className="font-bold text-slate-700 mb-2">利用可能な機種ID:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              {Object.keys(configMap).map((id) => (
                <li key={id}>
                  <a
                    href={`/v2/preview/${id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <MachinePageFactory config={config} />;
}
