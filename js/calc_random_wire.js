// ランダムワイヤー長計算（バンド選択式）

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
  const container = document.getElementById('rw-band-checks');
  if (!container) return;
  BANDS.forEach((band, i) => {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.875rem;color:var(--text)';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `rw-cb-${i}`;
    cb.checked = true;
    cb.addEventListener('change', calcRandomWire);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(band.name));
    container.appendChild(label);
  });
  calcRandomWire();
}

function rwSelectAll(val) {
  BANDS.forEach((_, i) => {
    const cb = document.getElementById(`rw-cb-${i}`);
    if (cb) cb.checked = val;
  });
  calcRandomWire();
}

function calcRandomWire() {
  const tbody  = document.getElementById('rw-table-body');
  const tbody2 = document.getElementById('rw-avoid-body');

  // 選択バンドを取得
  const selectedRows = BANDS
    .map((band, i) => {
      const cb = document.getElementById(`rw-cb-${i}`);
      if (!cb?.checked) return null;
      const halfWave = (150 / band.f) * VELOCITY_FACTOR;
      return { band, halfWave };
    })
    .filter(r => r !== null);

  // λ/2 テーブル
  tbody.innerHTML = selectedRows.length === 0
    ? '<tr><td colspan="2" style="color:var(--text2);padding:0.5rem 0.6rem">バンドを選択してください</td></tr>'
    : selectedRows.map(r => `
        <tr>
          <td>${r.band.name}</td>
          <td>${r.halfWave.toFixed(2)} m</td>
        </tr>
      `).join('');

  if (!tbody2) return;

  if (selectedRows.length === 0) {
    tbody2.innerHTML = '<tr><td colspan="2" style="color:var(--text2);padding:0.5rem 0.6rem">バンドを選択してください</td></tr>';
    return;
  }

  // 推奨長候補（選択バンドの共振を全て回避できる長さ）
  const candidates = [];
  for (let len = 5.0; len <= 41.0; len += 0.5) {
    let ok = true;
    outer: for (const r of selectedRows) {
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

  if (candidates.length === 0) {
    tbody2.innerHTML = '<tr><td colspan="2" style="color:var(--warn);padding:0.5rem 0.6rem">条件を満たす長さが見つかりません</td></tr>';
    return;
  }

  // 連続する候補をグループ化して代表値を表示
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
