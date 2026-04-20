# JQ3JQO Ham Radio Calculator

アマチュア無線向け計算ツール集。静的HTML+CSS+JSで動作し、GitHub Pages で公開。

## ツール一覧

| # | ツール名 | 概要 |
|---|---------|------|
| ① | 周波数↔波長変換 | 電磁波/音波対応、λ/2/4/6を一括表示 |
| ② | ソレノイドコイル L/N | 長岡係数（楕円積分厳密計算）による巻数⇔L変換 |
| ③ | バリコン+周波数→コイル巻数 | LC共振条件から必要巻数を算出 |
| ④ | センターローディングコイル | アンテナハンドブック準拠の L 計算 |
| ⑤ | LC共振周波数 | L+C→f / f+C→L / f+L→C の3モード |
| ⑥ | ランダムワイヤー長 | 各バンドの共振回避候補長を自動算出 |
| ⑦ | UnUn/BalUn コア巻数 | FT140/240-43/61プリセット対応 |

## 使用方法

https://jq3jqo-station.github.io/ham-calc/ をブラウザで開くだけ。インストール不要。

## ローカル実行

```bash
git clone https://github.com/JQ3JQO-Station/ham-calc.git
cd ham-calc
# 任意のHTTPサーバーで開く（例）
python3 -m http.server 8080
```

## ライセンス

MIT
