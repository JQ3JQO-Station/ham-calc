# DEVLOG — ham-calc

## 2026-04-20 初回セッション

### 作業内容
- GitHubリポジトリ作成: JQ3JQO-Station/ham-calc
- プロジェクト新規作成（全7種の計算ツールを初回実装）

### 実装ファイル
- `index.html` — メインページ、タブナビゲーション、全ツールのHTML
- `css/style.css` — ダークテーマ、レスポンシブ対応
- `js/calc_freq_wave.js` — 周波数↔波長変換（4種の伝搬速度対応）
- `js/calc_coil.js` — ソレノイドコイル L/N（長岡係数・AGM法楕円積分）
- `js/calc_loading.js` — バリコン→コイル巻数 + センターローディングコイル
- `js/calc_lc.js` — LC共振周波数（3モード）
- `js/calc_random_wire.js` — ランダムワイヤー長（共振回避候補表）
- `js/calc_unun.js` — UnUn/BalUn コア巻数（FT140/240-43/61プリセット）

### 技術メモ
- 長岡係数: AGM（算術幾何平均）法で第一種・第二種完全楕円積分を実装
  - K(k), E(k) 各50回反復、精度1e-12
- バリコン→コイル巻数: b=N×wireD の反復収束法（線材径指定時）
- UnUn XL基準: XL ≥ 4×Z（一般的な実用基準）
- ランダムワイヤー: 短縮率0.95, 半波長×1〜15倍の±5%を共振近接として警告

### 次回やること
- ブラウザ動作確認・バグ修正
- GitHub Pages設定（Settings → Pages → main/(root)）
- センターローディング計算式の検証・精度改善（必要に応じて）
