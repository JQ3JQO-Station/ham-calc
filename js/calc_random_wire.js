// ランダムワイヤー長計算（バンドごと）

const BANDS = [
  { name: '7 MHz (40m)',   f: 7 },
  { name: '10 MHz (30m)',  f: 10 },
  { name: '14 MHz (20m)',  f: 14 },
  { name: '18 MHz (17m)',  f: 18 },
  { name: '21 MHz (15m)',  f: 21 },
  { name: '24 MHz (12m)',  f: 24 },
  { name: '27 MHz (CB)',   f: 27 },
  { name: '28 MHz (10m)',  f: 28 },
  { name: '50 MHz (6m)',   f: 50 },
];

const VELOCITY_FACTOR = 0.95;
const AVOID_MARGIN = 0.05; // ±5%

function initRandomWire() {
  document.getElementById('rw-len')?.addEventListener('input', calcRandomWire);
  calcRandomWire();
}

function calcRandomWire() {
  const userLen = parseFloat(document.getElementById('rw-len')?.value);
  const tbody = document.getElementById('rw-table-body');
  const tbody2 = document.getElementById('rw-avoid-body');

  // 全バンドのハーフウェーブ長を計算
  const rows = BANDS.map(band => {
    const halfWave = (150 / band.f) * VELOCITY_FACTOR; // m
    return { band, halfWave };
  });

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.band.name}</td>
      <td>${r.halfWave.toFixed(2)} m</td>
    </tr>
  `).join('');

  // ユーザー入力長の評価
  if (!isNaN(userLen) && userLen > 0) {
    let badBands = [];
    rows.forEach(r => {
      for (let n = 1; n <= 15; n++) {
        const resLen = r.halfWave * n;
        if (Math.abs(userLen - resLen) / resLen <= AVOID_MARGIN) {
          badBands.push(`${r.band.name} の ${n}λ/2 (${resLen.toFixed(2)} m)`);
        }
      }
    });
    const warn = document.getElementById('rw-warn');
    if (badBands.length > 0) {
      warn.innerHTML = `<div class="warn-box">⚠ <strong>${userLen} m</strong> は以下の共振長に近いため注意：<br>` +
        badBands.map(s => `・${s}`).join('<br>') + '</div>';
    } else {
      warn.innerHTML = `<div class="ok-box">✓ <strong>${userLen} m</strong> は全バンドで共振を避けられます</div>`;
    }
  } else {
    document.getElementById('rw-warn').innerHTML = '';
  }

  // 推奨長候補表（5〜30mの範囲でバンド全て回避できる長さ）
  const candidates = [];
  for (let len = 5.0; len <= 41.0; len += 0.5) {
    let ok = true;
    outer: for (const r of rows) {
      for (let n = 1; n <= 15; n++) {
        const resLen = r.halfWave * n;
        if (Math.abs(len - resLen) / resLen <= AVOID_MARGIN) {
          ok = false;
          break outer;
        }
      }
    }
    if (ok) candidates.push(len);
  }

  // 推奨候補を5m間隔でグループ化して代表値を表示
  if (tbody2) {
    const groups = [];
    let group = [];
    for (let i = 0; i < candidates.length; i++) {
      group.push(candidates[i]);
      if (i === candidates.length - 1 || candidates[i + 1] - candidates[i] > 1.5) {
        groups.push(group);
        group = [];
      }
    }
    tbody2.innerHTML = groups.slice(0, 15).map(g => {
      const mid = g[Math.floor(g.length / 2)];
      return `<tr><td>${mid.toFixed(1)} m</td><td>${g[0].toFixed(1)}〜${g[g.length-1].toFixed(1)} m</td></tr>`;
    }).join('');
  }
}
