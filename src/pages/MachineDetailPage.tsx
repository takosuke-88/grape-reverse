// 詳細判別ページ（/:machineId/detail。2026-10-14、スマスロ ハナビで導入）。
//
// 設定判別ページでは数えない項目（通常時の小役の内訳・ボーナスの契機・ボーナス中や
// RT中の小役）まで全て数えられるページ。中身は設定判別ページと同じ MachinePageFactory を
// pageMode="detail" で使い、config.detailSections のカードを並べる。入力データと判別結果は
// 設定判別ページと共有する（同じ localStorage キー）ので、どちらで数えても結果は同じになる。
//
// 入力欄が中心でテキストが薄いため、前任者ページと同じく noindex（sitemap にも載せない）。
// 静的HTMLは生成する（直接アクセスで404にしないため）。
import { Navigate, useParams } from "react-router-dom";
import MachinePageFactory from "../components/dynamic-ui/MachinePageFactory";
import Seo from "../components/Seo";
import { CONFIG_MAP } from "../data/machine-config-map";
import { hasDetailPage } from "../data/machine-list";

export default function MachineDetailPage() {
  const { machineId = "" } = useParams<{ machineId: string }>();
  const config = CONFIG_MAP[machineId];

  if (!config || !config.detailSections || !hasDetailPage(machineId)) {
    return <Navigate to={`/${machineId}`} replace />;
  }

  return (
    <>
      <Seo
        pageTitle={`${config.name} 詳細判別｜GrapeReverse`}
        pageDescription={`${config.name}の詳細判別ツール。通常時の小役・ボーナスの契機・ボーナス中やRT中の小役まで全項目を数えて、高設定の可能性を自動計算します。`}
        pagePath={`/${machineId}/detail`}
        noindex
      />
      <MachinePageFactory
        key={`${config.id}-detail`}
        config={config}
        pageMode="detail"
      />
    </>
  );
}
