import { useParams } from "react-router-dom";
import MachinePageFactory from "../components/dynamic-ui/MachinePageFactory";
import Seo from "../components/Seo";
import { AVAILABLE_MACHINES } from "../data/machine-list";
import { CONFIG_MAP as configMap } from "../data/machine-config-map";

/**
 * 動的UIファクトリーのプレビューページ
 * URLパラメータから機種IDを取得し、対応する設定を読み込んでレンダリングする
 */
export default function MachinePagePreview() {
  const { machineId } = useParams<{ machineId: string }>();

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
                  <a href={`/${id}`} className="text-blue-600 hover:underline">
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

  const machineInfo = AVAILABLE_MACHINES.find((m) => m.id === config.id);
  const isJuggler = machineInfo?.category === "juggler";
  const roleName = isJuggler ? "ぶどう" : "ベル";

  const seoTitle = `【${config.name}】設定判別・小役逆算ツール｜GrapeReverse`;
  const seoDescription = `${config.name}の${roleName}確率を差枚数とボーナス回数から逆算！設定6の挙動や勝つための立ち回りポイントも徹底解説。スマホでサクサク使える完全無料の設定推測ツールです。`;

  return (
    <>
      <Seo
        pageTitle={seoTitle}
        pageDescription={seoDescription}
        pagePath={`/${machineId}`}
      />
      <MachinePageFactory key={config.id} config={config} />
    </>
  );
}
