// バリコン+周波数 → コイル巻数 & センターローディングコイル計算

// --- バリコン + 周波数 → コイル巻数 ---
function initVaricap() {
  const ids = ['vc-cap','vc-freq','vc-mu','vc-diam','vc-len-mode','vc-len','vc-wire-d'];
  ids.forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcVaricap);
    document.getElementById(id)?.addEventListener('change', calcVaricap);
  });
  calcVaricap();
}

function calcVaricap() {
  const C = parseFloat(document.getElementById('vc-cap').value) * 1e-12; // pF → F
  const f = parseFloat(document.getElementById('vc-freq').value) * 1e3;  // kHz → Hz
  const mu = parseFloat(document.getElementById('vc-mu').value) || 1;
  const a = parseFloat(document.getElementById('vc-diam').value) / 2 / 1000; // 半径 m
  const wireD = parseFloat(document.getElementById('vc-wire-d').value) / 1000; // m
  const result = document.getElementById('vc-result');

  if (isNaN(C) || C <= 0 || isNaN(f) || f <= 0 || isNaN(a) || a <= 0) {
    result.innerHTML = '<p>全項目を入力してください</p>';
    return;
  }

  // LC共振: f = 1/(2π√(LC)) → L = 1/(4π²f²C)
  const L = 1 / (4 * Math.PI * Math.PI * f * f * C);

  // 長さの推定（巻数既知でないと厳密計算困難なので反復法）
  // 仮の巻数から開始してb=N*wireD or 指定長
  const lenMode = document.getElementById('vc-len-mode').value;
  let b;
  if (lenMode === 'length') {
    b = parseFloat(document.getElementById('vc-len').value) / 1000;
    if (isNaN(b) || b <= 0) { result.innerHTML = '<p>長さを入力してください</p>'; return; }
    const K = nagaokaL(a, b);
    const N = Math.sqrt(L * b / (mu * MU0 * K * Math.PI * a * a));
    showVCResult(result, N, wireD, a, L);
  } else {
    if (isNaN(wireD) || wireD <= 0) { result.innerHTML = '<p>線材径を入力してください</p>'; return; }
    // 反復: N_0 仮定 → b = N*wireD → K → N_1 → 収束
    let N = 10;
    for (let i = 0; i < 100; i++) {
      const bTmp = N * wireD;
      const K = nagaokaL(a, bTmp);
      const N1 = Math.sqrt(L * bTmp / (mu * MU0 * K * Math.PI * a * a));
      if (Math.abs(N1 - N) < 0.0001) { N = N1; break; }
      N = N1;
    }
    showVCResult(result, N, wireD, a, L);
  }
}

function showVCResult(result, N, wireD, a, L) {
  const wireLen = N * Math.PI * 2 * a;
  let weightStr = '';
  if (!isNaN(wireD) && wireD > 0) {
    const vol = Math.PI * (wireD / 2) * (wireD / 2) * wireLen * 1e6;
    weightStr = `<tr><td>重量(銅線)</td><td>${fmtN(vol * 8.96)} g</td></tr>`;
  }
  result.innerHTML = `
    <table class="result-table">
      <tr><td>必要インダクタンス L</td><td>${fmtN(L*1e6)} μH</td></tr>
      <tr><td>巻数 N</td><td><strong>${fmtN(N)} 回</strong></td></tr>
      <tr><td>線材長</td><td>${fmtN(wireLen)} m</td></tr>
      ${weightStr}
    </table>`;
}

// nagaoka(), MU0, ellipK(), ellipE() は calc_coil.js で定義済み
function nagaokaL(a, b) { return nagaoka(a, b); }

// --- センターローディングコイル L計算 ---
function initCenterLoading() {
  const ids = ['cl-freq','cl-h2','cl-h1','cl-diam'];
  ids.forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcCenterLoading);
  });
  calcCenterLoading();
}

function calcCenterLoading() {
  const f = parseFloat(document.getElementById('cl-freq').value) * 1e6; // MHz → Hz
  const h2 = parseFloat(document.getElementById('cl-h2').value); // m
  const h1 = parseFloat(document.getElementById('cl-h1').value); // m
  const d = parseFloat(document.getElementById('cl-diam').value) / 1000; // mm → m
  const result = document.getElementById('cl-result');

  if ([f, h2, h1, d].some(v => isNaN(v) || v <= 0)) {
    result.innerHTML = '<p>全項目を入力してください</p>';
    return;
  }

  const lambda = 3e8 / f;
  const beta = 2 * Math.PI / lambda;

  // Ka: 上部エレメントの放射抵抗成分
  const Ka = 60 * (Math.log(2 * h2 / d) - 1) +
              60 * (Math.log(2 * h1 / d) - 1) * Math.pow(h1 / (h1 + h2), 2);

  // XL: ローディングコイルに必要なリアクタンス
  // アンテナハンドブック近似式
  const tanBh2 = Math.tan(beta * h2);
  const cotBh1h2 = 1 / Math.tan(beta * (h1 + h2));
  const XL = Ka * tanBh2 - (60 / Math.tan(beta * (h1 + h2))) *
              (Math.log(2 * h1 / d) - 1) * Math.sin(beta * h1) * Math.sin(beta * h1);

  // L (μH)
  const omega = 2 * Math.PI * f;
  const L = XL / omega * 1e6;

  const physLen = (h1 + h2) / lambda;

  result.innerHTML = `
    <table class="result-table">
      <tr><td>物理長 / λ</td><td>${fmtN(physLen)} λ</td></tr>
      <tr><td>Ka (放射抵抗成分)</td><td>${fmtN(Ka)} Ω</td></tr>
      <tr><td>必要リアクタンス XL</td><td>${fmtN(XL)} Ω</td></tr>
      <tr><td>必要インダクタンス L</td><td><strong>${fmtN(L)} μH</strong></td></tr>
    </table>`;
}

function fmtN(v) {
  if (isNaN(v) || !isFinite(v)) return '—';
  if (Math.abs(v) >= 10000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(3);
  return parseFloat(v.toPrecision(5)).toString();
}
