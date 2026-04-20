// ソレノイドコイル 巻数↔インダクタンス（長岡係数・楕円積分による厳密計算）

// 第一種完全楕円積分 K(k) - AGM法
function ellipK(k) {
  if (k >= 1) return Infinity;
  let a = 1, b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 50; i++) {
    const a1 = (a + b) / 2;
    const b1 = Math.sqrt(a * b);
    a = a1; b = b1;
    if (Math.abs(a - b) < 1e-12) break;
  }
  return Math.PI / (2 * a);
}

// 第二種完全楕円積分 E(k)
function ellipE(k) {
  if (k === 0) return Math.PI / 2;
  if (k >= 1) return 1;
  let a = 1, b = Math.sqrt(1 - k * k), c = k * k / 2, pow2 = 1;
  let sum = 1 - c;
  for (let i = 1; i < 50; i++) {
    const a1 = (a + b) / 2;
    const b1 = Math.sqrt(a * b);
    c = (a - b) * (a - b) / 4;
    pow2 *= 2;
    sum -= pow2 * c;
    a = a1; b = b1;
    if (c < 1e-14) break;
  }
  return Math.PI / (2 * a) * sum;
}

// 長岡係数 K (a=半径m, b=長さm)
function nagaoka(a, b) {
  if (b <= 0 || a <= 0) return NaN;
  // k = a / sqrt(a^2 + (b/2)^2) ... 実際は k^2 = 1/(1+(b/2a)^2)
  // 標準的な長岡の式: K = (4/(3*PI)) * (1/k') * [(2-k^2)*K(k) - 2*E(k)] / k
  // ここで k = 2a / sqrt(4a^2 + b^2)
  const k = 2 * a / Math.sqrt(4 * a * a + b * b);
  const Kk = ellipK(k);
  const Ek = ellipE(k);
  // 長岡の式
  const K = (4 / (3 * Math.PI)) * (1 / k) * ((2 - k * k) * Kk - 2 * Ek);
  return K;
}

// μ0 = 4π×10^-7
const MU0 = 4 * Math.PI * 1e-7;

// 銅線密度 g/cm³
const COPPER_DENSITY = 8.96;

function initCoil() {
  const ids = ['coil-mu','coil-diam','coil-mode','coil-len-mode','coil-len','coil-wire-d','coil-turns','coil-L'];
  ids.forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcCoilAuto);
    document.getElementById(id)?.addEventListener('change', calcCoilAuto);
  });
  document.getElementById('coil-mode')?.addEventListener('change', toggleCoilMode);
  document.getElementById('coil-len-mode')?.addEventListener('change', toggleLenMode);
  toggleCoilMode();
  toggleLenMode();
}

function toggleLenMode() {
  const mode = document.getElementById('coil-len-mode').value;
  document.getElementById('coil-len-row').style.display = (mode === 'length') ? 'flex' : 'none';
}

function toggleCoilMode() {
  const mode = document.getElementById('coil-mode').value;
  document.getElementById('coil-group-turns').style.display = (mode === 'turns2L') ? 'flex' : 'none';
  document.getElementById('coil-group-L').style.display = (mode === 'L2turns') ? 'flex' : 'none';
  calcCoilAuto();
}

function calcCoilAuto() {
  const mode = document.getElementById('coil-mode').value;
  const mu = parseFloat(document.getElementById('coil-mu').value) || 1;
  const a = parseFloat(document.getElementById('coil-diam').value) / 2 / 1000; // 半径 m
  const lenMode = document.getElementById('coil-len-mode').value; // 'length' or 'wire'
  let b, wireD;

  const result = document.getElementById('coil-result');

  if (isNaN(a) || a <= 0) { result.innerHTML = '<p>直径を入力してください</p>'; return; }

  if (lenMode === 'length') {
    b = parseFloat(document.getElementById('coil-len').value) / 1000; // m
    wireD = parseFloat(document.getElementById('coil-wire-d').value) / 1000; // m
  } else {
    wireD = parseFloat(document.getElementById('coil-wire-d').value) / 1000; // m
    const N_tmp = parseFloat(document.getElementById('coil-turns').value) || 1;
    b = N_tmp * wireD;
  }

  if (isNaN(b) || b <= 0) { result.innerHTML = '<p>長さまたは線材径を入力してください</p>'; return; }

  const K = nagaoka(a, b);
  if (isNaN(K)) { result.innerHTML = '<p>計算エラー（パラメータを確認）</p>'; return; }

  if (mode === 'turns2L') {
    const N = parseFloat(document.getElementById('coil-turns').value);
    if (isNaN(N) || N <= 0) { result.innerHTML = '<p>巻数を入力してください</p>'; return; }
    const L = mu * MU0 * K * Math.PI * a * a * N * N / b; // H
    const Luh = L * 1e6;
    const wireLen = N * Math.PI * 2 * a; // m
    let weightG = 0;
    if (!isNaN(wireD) && wireD > 0) {
      const vol = Math.PI * (wireD / 2) * (wireD / 2) * wireLen * 1e6; // cm³
      weightG = vol * COPPER_DENSITY;
    }
    result.innerHTML = `
      <table class="result-table">
        <tr><td>インダクタンス L</td><td><strong>${fmtN(Luh)} μH</strong></td></tr>
        <tr><td>長岡係数 K</td><td>${fmtN(K)}</td></tr>
        <tr><td>線材長</td><td>${fmtN(wireLen)} m</td></tr>
        ${weightG > 0 ? `<tr><td>重量(銅線)</td><td>${fmtN(weightG)} g</td></tr>` : ''}
      </table>`;
  } else {
    // L → 巻数
    const Luh = parseFloat(document.getElementById('coil-L').value);
    if (isNaN(Luh) || Luh <= 0) { result.innerHTML = '<p>インダクタンスを入力してください</p>'; return; }
    const L = Luh * 1e-6;
    const N = Math.sqrt(L * b / (mu * MU0 * K * Math.PI * a * a));
    const wireLen = N * Math.PI * 2 * a;
    let weightG = 0;
    if (!isNaN(wireD) && wireD > 0) {
      const vol = Math.PI * (wireD / 2) * (wireD / 2) * wireLen * 1e6;
      weightG = vol * COPPER_DENSITY;
    }
    result.innerHTML = `
      <table class="result-table">
        <tr><td>巻数 N</td><td><strong>${fmtN(N)} 回</strong></td></tr>
        <tr><td>長岡係数 K</td><td>${fmtN(K)}</td></tr>
        <tr><td>線材長</td><td>${fmtN(wireLen)} m</td></tr>
        ${weightG > 0 ? `<tr><td>重量(銅線)</td><td>${fmtN(weightG)} g</td></tr>` : ''}
      </table>`;
  }
}

function fmtN(v) {
  if (isNaN(v) || !isFinite(v)) return '—';
  if (Math.abs(v) >= 10000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(3);
  return parseFloat(v.toPrecision(5)).toString();
}
