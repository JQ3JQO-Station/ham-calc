// 9:1 UnUn / 4:1 BalUn / 1:1 BalUn コア巻数計算

const CORE_PRESETS = {
  'FT140-43': { Al: 885,  name: 'FT140-43 (Mix 43)' },
  'FT240-43': { Al: 1075, name: 'FT240-43 (Mix 43)' },
  'FT140-61': { Al: 195,  name: 'FT140-61 (Mix 61)' },
  'FT240-61': { Al: 230,  name: 'FT240-61 (Mix 61)' },
  'custom':   { Al: null, name: 'カスタム' },
};

const RATIO_ZIN = {
  '9:1': 450, // 9 × 50Ω
  '4:1': 200, // 4 × 50Ω
  '1:1': 50,
};

function initUnun() {
  document.getElementById('un-core')?.addEventListener('change', onCoreChange);
  ['un-core','un-al','un-freq-low','un-freq-high','un-ratio','un-z'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcUnun);
    document.getElementById(id)?.addEventListener('change', calcUnun);
  });
  onCoreChange();
}

function onCoreChange() {
  const core = document.getElementById('un-core').value;
  const alInput = document.getElementById('un-al');
  const preset = CORE_PRESETS[core];
  if (preset && preset.Al !== null) {
    alInput.value = preset.Al;
    alInput.readOnly = true;
  } else {
    alInput.readOnly = false;
    alInput.value = '';
  }
  calcUnun();
}

function calcUnun() {
  const Al = parseFloat(document.getElementById('un-al').value); // nH/N²
  const fLow = parseFloat(document.getElementById('un-freq-low').value) * 1e6;  // MHz → Hz
  const fHigh = parseFloat(document.getElementById('un-freq-high').value) * 1e6;
  const ratio = document.getElementById('un-ratio').value;
  const Z = parseFloat(document.getElementById('un-z').value) || 50; // Ω
  const result = document.getElementById('un-result');

  if (isNaN(Al) || Al <= 0 || isNaN(fLow) || fLow <= 0) {
    result.innerHTML = '<p>Al値と周波数を入力してください</p>';
    return;
  }

  // 必要最低インダクタンス: XL ≥ 4×Z（入力インピーダンス）
  const Zin = RATIO_ZIN[ratio] || Z;
  const XL_min = 4 * Z; // XL ≥ 4×50Ω が一般的基準
  const omega = 2 * Math.PI * fLow;
  const L_min = XL_min / omega; // H
  const L_min_nH = L_min * 1e9;

  // 巻数: N = √(L[nH] / Al[nH/N²])
  const N = Math.sqrt(L_min_nH / Al);
  const N_ceil = Math.ceil(N);

  // 実際のLをN_ceilで再計算
  const L_actual_nH = Al * N_ceil * N_ceil;
  const L_actual = L_actual_nH * 1e-9;
  const XL_actual_low = 2 * Math.PI * fLow * L_actual;
  let XL_high_str = '';
  if (!isNaN(fHigh) && fHigh > 0) {
    XL_high_str = `<tr><td>XL (上限周波数)</td><td>${fmtN(2*Math.PI*fHigh*L_actual)} Ω</td></tr>`;
  }

  // 線材長目安（巻数×コア平均周長）
  const core = document.getElementById('un-core').value;
  let wireNote = '';
  const coreSizes = {
    'FT140-43': 35.5, 'FT240-43': 53.4,
    'FT140-61': 35.5, 'FT240-61': 53.4,
  };
  if (coreSizes[core]) {
    const cCirc = coreSizes[core] / 10; // cm → (そのまま cm)
    // 変成器は1次+2次なので巻数×2、UnUnは3線式
    const ratioLines = { '9:1': 3, '4:1': 2, '1:1': 2 };
    const lines = ratioLines[ratio] || 2;
    const wireLen = N_ceil * lines * (cCirc / 100) * 1.1; // 余裕10%
    wireNote = `<tr><td>線材長目安</td><td>≈ ${fmtN(wireLen)} m (×${lines}線)</td></tr>`;
  }

  result.innerHTML = `
    <table class="result-table">
      <tr><td>変換比</td><td>${ratio}</td></tr>
      <tr><td>必要最低インダクタンス</td><td>${fmtN(L_min*1e6)} μH (XL ≥ ${XL_min} Ω)</td></tr>
      <tr><td>推奨巻数 N</td><td><strong>${N_ceil} 回</strong> (理論値: ${fmtN(N)} 回)</td></tr>
      <tr><td>実際のインダクタンス</td><td>${fmtN(L_actual_nH/1000)} μH</td></tr>
      <tr><td>XL (下限周波数)</td><td>${fmtN(XL_actual_low)} Ω</td></tr>
      ${XL_high_str}
      ${wireNote}
    </table>`;
}

function fmtN(v) {
  if (isNaN(v) || !isFinite(v)) return '—';
  if (Math.abs(v) >= 10000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(3);
  return parseFloat(v.toPrecision(4)).toString();
}
