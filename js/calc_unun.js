// 9:1 UnUn / 4:1 BalUn / 1:1 BalUn コア巻数計算

const CORE_PRESETS = {
  'FT114-43': { Al: 603,  name: 'FT114-43 (Mix 43)' },
  'FT140-43': { Al: 885,  name: 'FT140-43 (Mix 43)' },
  'FT240-43': { Al: 1075, name: 'FT240-43 (Mix 43)' },
  'FT140-61': { Al: 195,  name: 'FT140-61 (Mix 61)' },
  'FT240-61': { Al: 230,  name: 'FT240-61 (Mix 61)' },
  'custom':   { Al: null, name: 'カスタム' },
};

const RATIO_FACTOR = { '9:1': 9, '4:1': 4, '1:1': 1 };

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

  // 高インピーダンス側 Zin = 変換比 × Z（XL はこちらの4倍以上が必要）
  const factor = RATIO_FACTOR[ratio] || 1;
  const Zin = factor * Z;
  const XL_min = 4 * Zin; // XL ≥ 4×Zin（高インピーダンス側基準）
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
  // 平均円周長 (mm): π × (OD+ID)/2  各コア実測値
  const coreCircMm = {
    'FT114-43': 75.4,  // OD29 ID19
    'FT140-43': 91.9,  // OD35.5 ID23
    'FT240-43': 151.8, // OD61 ID35.6
    'FT140-61': 91.9,
    'FT240-61': 151.8,
  };
  if (coreCircMm[core]) {
    const turnLen = coreCircMm[core] / 1000; // m/ターン
    const ratioLines = { '9:1': 3, '4:1': 2, '1:1': 2 };
    const lines = ratioLines[ratio] || 2;
    const wireLen = N_ceil * lines * turnLen * 1.1; // 余裕10%
    wireNote = `<tr><td>線材長目安</td><td>≈ ${fmtN(wireLen)} m (×${lines}線)</td></tr>`;
  }

  result.innerHTML = `
    <table class="result-table">
      <tr><td>変換比</td><td>${ratio} &nbsp;(${Z} Ω ↔ ${fmtN(Zin)} Ω)</td></tr>
      <tr><td>必要最低インダクタンス</td><td>${fmtN(L_min*1e6)} μH &nbsp;(XL ≥ ${fmtN(XL_min)} Ω)</td></tr>
      <tr><td>推奨巻数 N</td><td><strong>${N_ceil} 回</strong> &nbsp;(理論値: ${fmtN(N)} 回)</td></tr>
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
