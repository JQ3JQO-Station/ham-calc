# ham-calc プロジェクト

## 概要
JQ3JQO Ham Radio Calculator
URL: https://jq3jqo-station.github.io/ham-calc/
静的HTML+CSS+JS、GitHub Pages配信

## セッション開始時
1. このCLAUDE.mdを読む
2. DEVLOG.mdを読む
3. git pull で最新コードを取得

## セッション終了時
1. DEVLOG.mdに作業内容を追記
2. git add / commit / push origin main

## ファイル構成
```
ham-calc/
├── index.html          # メインページ（全ツールを1ページに収録）
├── css/
│   └── style.css       # ダークテーマ、レスポンシブ
├── js/
│   ├── calc_freq_wave.js   # ① 周波数↔波長
│   ├── calc_coil.js        # ② ソレノイドコイル（長岡係数・楕円積分）
│   ├── calc_loading.js     # ③ バリコン→コイル巻数 / ④ センターローディングコイル
│   ├── calc_lc.js          # ⑤ LC共振周波数
│   ├── calc_random_wire.js # ⑥ ランダムワイヤー長
│   └── calc_unun.js        # ⑦ UnUn/BalUn コア巻数
└── README.md
```

## 実装済み計算ツール（全7種）
1. **周波数↔波長変換** - 電磁波/音波対応、λ/λ2/λ4/λ6出力
2. **ソレノイドコイル L/N** - 長岡係数（AGM法楕円積分）による厳密計算
3. **バリコン+周波数→コイル巻数** - 反復収束法で線材径から自動算出
4. **センターローディングコイル** - アンテナハンドブック準拠の近似式
5. **LC共振周波数** - 3モード (L+C→f / f+C→L / f+L→C)
6. **ランダムワイヤー長** - 共振回避候補を自動算出（短縮率0.95、±5%マージン）
7. **UnUn/BalUn 巻数計算** - FT140/240-43/61プリセット、XL≥4×50Ω基準

## 技術仕様
- フレームワークなし（純HTML+CSS+JS）
- 入力値変更でリアルタイム計算
- ダークテーマ固定
- スマホ/PC両対応レスポンシブ

## デプロイ
GitHub Pages (main ブランチのルート)
Settings → Pages → Source: Deploy from a branch → main / (root)
