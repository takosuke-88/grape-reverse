// 破壊的操作（全体リセット）の確認モーダル。
//
// window.confirm をやめた理由（2026-09-22）:
//  - ブラウザが「{オリジン} の内容」という見出しを強制的に付ける。消せない
//  - 装飾が一切効かないため、追加した警告文（前任者ページの内容も消える等）が
//    プレーンテキストに埋もれて読み飛ばされる
//  - 同じダイアログを繰り返すと「このページでこれ以上ダイアログを表示しない」
//    が出て、チェックされると confirm() が無言で false を返し続ける。
//    リセットボタンが原因不明で効かなくなる
//
// div で自前実装せず HTML標準の <dialog>（showModal）を使っているのは、
// フォーカストラップ・Escキー・背面の不活性化・top layer への描画を
// ブラウザ側が処理してくれるため。特に top layer に出るので、サイトの
// sticky ヘッダー（z-50）との z-index 競合が構造的に起こらない。
//
// showModal 非対応（iOS Safari 15.3 以前）では window.confirm へ落とす。

import { useCallback, useEffect, useRef, useState } from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  /** 見落とすと困る副作用（例: 別ページのデータも消える）。任意 */
  warning?: string;
  /** 実行側ボタンの文言（例: リセット） */
  confirmLabel: string;
}

function supportsDialog(): boolean {
  return (
    typeof HTMLDialogElement !== "undefined" &&
    typeof HTMLDialogElement.prototype.showModal === "function"
  );
}

/**
 * `const { confirm, confirmDialog } = useConfirmDialog();` の形で使う。
 * confirm() は Promise<boolean> を返すので、呼び出し側は
 * `if (!(await confirm({...}))) return;` と書く。
 */
export function useConfirmDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  // 応答を待っている Promise の resolve。二重解決を防ぐため使ったら null に戻す
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  const settle = useCallback((ok: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setOptions(null);
    dialogRef.current?.close();
    resolve?.(ok);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    // 非対応端末はネイティブへフォールバック（警告文は改行で連結する）
    if (!supportsDialog()) {
      const text = opts.warning
        ? `${opts.message}\n\n${opts.warning}`
        : opts.message;
      return Promise.resolve(window.confirm(text));
    }
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  // options がセットされたら showModal する（DOMに出てから呼ぶ必要がある）
  useEffect(() => {
    if (options && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [options]);

  // Esc など、こちらの close() を経由しない閉じ方はキャンセル扱いにする
  const handleClose = useCallback(() => {
    if (resolveRef.current) settle(false);
  }, [settle]);

  // 背景（::backdrop）のタップで閉じる。dialog 要素自身が押された＝
  // 中身のパネルの外側を押した、という判定にしている
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) settle(false);
    },
    [settle],
  );

  const confirmDialog = (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-transparent p-0 backdrop:bg-black/50"
    >
      {options && (
        <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <h2
            id="confirm-dialog-title"
            className="mb-2 text-base font-extrabold text-slate-900 dark:text-white"
          >
            {options.title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {options.message}
          </p>

          {options.warning && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold leading-relaxed text-amber-800 dark:bg-amber-900/25 dark:text-amber-200">
              {options.warning}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => settle(false)}
              className="min-h-[48px] flex-1 rounded-xl bg-slate-200 font-bold text-slate-700 transition-opacity active:opacity-70 dark:bg-slate-700 dark:text-slate-100"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => settle(true)}
              className="min-h-[48px] flex-1 rounded-xl bg-red-600 font-semibold text-white shadow-md transition-opacity active:opacity-70"
            >
              {options.confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );

  return { confirm, confirmDialog };
}
