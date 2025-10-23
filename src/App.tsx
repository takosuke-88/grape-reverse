// web/src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { reverseGrape, type ReverseInput, type ReverseResult } from "./lib/reverse";

function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

export default function GrapeReverseApp() {
  const [coins, setCoins] = usePersistedState<number>("coins", 15000);
  const [bonus, setBonus] = usePersistedState<number>("bonus", 6720);
  const [cherry, setCherry] = usePersistedState<number>("cherry", 0);
  const [series, setSeries] = usePersistedState<"ime" | "other">("series", "ime");

  // アイム＝BIG252、その他＝BIG240。ぶどう払い出し7枚固定。
  const bigPayout = useMemo(() => (series === "ime" ? 252 : 240), [series]);

  const params: ReverseInput = useMemo(
    () => ({
      coins,
      bonus,
      cherry,
      payout: 7, // ぶどう1回あたりの払い出し（既定7枚）
    }),
    [coins, bonus, cherry]
  );

  const result: ReverseResult | null = useMemo(() => {
    try {
      return reverseGrape(params);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [params]);

  const probText =
    result && isFinite(result.grapeProb) ? `1/${result.grapeProb}` : "—";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>ぶどう逆算ツール（grape-reverse Web）</h1>
        <p style={styles.sub}>スマホ最適化 / リアルタイム計算</p>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.h2}>入力</h2>

          <div style={styles.field}>
            <label style={styles.label}>投入枚数（coins）</label>
            <input
              type="number"
              inputMode="numeric"
              value={coins}
              onChange={(e) =>
                setCoins(Number(e.target.value.replace(/[^\d.-]/g, "")) || 0)
              }
              style={styles.input}
              placeholder="例: 15000"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>ボーナス関連（bonus）</label>
            <input
              type="number"
              inputMode="numeric"
              value={bonus}
              onChange={(e) =>
                setBonus(Number(e.target.value.replace(/[^\d.-]/g, "")) || 0)
              }
              style={styles.input}
              placeholder="例: 6720"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>チェリー回数（任意）</label>
            <input
              type="number"
              inputMode="numeric"
              value={cherry}
              onChange={(e) =>
                setCherry(Number(e.target.value.replace(/[^\d.-]/g, "")) || 0)
              }
              style={styles.input}
              placeholder="例: 267"
            />
          </div>

          <div style={styles.fieldRow}>
            <label style={styles.label}>シリーズ</label>
            <div style={styles.segment}>
              <button
                onClick={() => setSeries("ime")}
                aria-pressed={series === "ime"}
                style={{
                  ...styles.segBtn,
                  ...(series === "ime" ? styles.segBtnActive : {}),
                }}
              >
                アイム（BIG252）
              </button>
              <button
                onClick={() => setSeries("other")}
                aria-pressed={series === "other"}
                style={{
                  ...styles.segBtn,
                  ...(series === "other" ? styles.segBtnActive : {}),
                }}
              >
                その他（BIG240）
              </button>
            </div>
          </div>

          <p style={styles.hint}>
            ※ `reverseGrape()` はCLI版と同じ計算ロジックを使用。入力を変更すると即座に結果が更新されます。
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.h2}>結果</h2>
          <div style={styles.resultGrid}>
            <div style={styles.resultItem}>
              <div style={styles.resultLabel}>推定ぶどう回数</div>
              <div style={styles.resultValue}>
                {result ? result.grapeCount.toLocaleString() : "—"}
              </div>
            </div>
            <div style={styles.resultItem}>
              <div style={styles.resultLabel}>ぶどう確率</div>
              <div style={styles.resultValue}>{probText}</div>
            </div>
          </div>
          <p style={styles.hintSmall}>
            計算式は <code>reverseGrape()</code>（CLI版と同一）を使用。
          </p>
        </section>
      </main>

      <footer style={styles.footer}>
        <small>© grape-reverse</small>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    background: "#0b0c10",
    color: "#e8f0fe",
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #1f2833",
    background: "linear-gradient(180deg, rgba(31,40,51,0.5), rgba(31,40,51,0))",
  },
  title: { fontSize: 18, margin: 0 },
  sub: { opacity: 0.8, margin: "4px 0 0", fontSize: 12 },
  main: {
    flex: 1,
    padding: 16,
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr",
    maxWidth: 640,
    width: "100%",
    margin: "0 auto",
  },
  card: {
    background: "#121317",
    border: "1px solid #1f2833",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
  },
  h2: { margin: "0 0 12px 0", fontSize: 16 },
  field: { display: "grid", gap: 6, marginBottom: 12 },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 6,
    marginBottom: 8,
  },
  label: { fontSize: 12, opacity: 0.9 },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2b3542",
    background: "#0f1115",
    color: "inherit",
    outline: "none",
  },
  segment: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  segBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    background: "#0f1115",
    border: "1px solid #2b3542",
    color: "inherit",
    cursor: "pointer",
  },
  segBtnActive: {
    background: "#1f2833",
    borderColor: "#66fcf1",
    boxShadow: "0 0 0 3px rgba(102,252,241,0.2) inset",
  },
  hint: { fontSize: 12, opacity: 0.8, marginTop: 4 },
  hintSmall: { fontSize: 11, opacity: 0.7, marginTop: 8 },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  resultItem: {
    background: "#0f1115",
    border: "1px solid #2b3542",
    borderRadius: 12,
    padding: 12,
  },
  resultLabel: { fontSize: 12, opacity: 0.85 },
  resultValue: { fontSize: 22, fontWeight: 700, marginTop: 6 },
  footer: {
    padding: 12,
    borderTop: "1px solid #1f2833",
    opacity: 0.8,
    textAlign: "center",
  },
};
