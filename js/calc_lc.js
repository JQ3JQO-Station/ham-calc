// LC共振周波数計算

function initLC() {
  document.getElementById('lc-mode')?.addEventListener('change', toggleLCMode);
  const ids = ['lc-L','lc-C','lc-f-lc','lc-f-fc','lc-f-fl','lc-C2','lc-L2'];
  ids.forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcLC);
  });
  toggleLCMode();
}

function toggleLCMode() {
  const mode = document.getElementById('lc-mode').value;
  ['lc-group-lc','lc-group-fc','lc-group-fl'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('lc-group-' + mode).style.display = 'block';
  calcLC();
}

function calcLC() {
  const mode = document.getElementById('lc-mode').value;
  const result = document.getElementById('lc-result');

  if (mode === 'lc') {
    const L = parseFloat(document.getElementById('lc-L').value) * 1e-6;  // μH → H
    const C = parseFloat(document.getElementById('lc-C').value) * 1e-12; // pF → F
    if (isNaN(L) || L <= 0 || isNaN(C) || C <= 0) { result.innerHTML = '<p>L と C を入力してください</p>'; return; }
    const f = 1 / (2 * Math.PI * Math.sqrt(L * C));
    result.innerHTML = `
      <table class="result-table">
        <tr><td>共振周波数</td><td><strong>${fmtFreq(f)}</strong></td></tr>
        <tr><td>角周波数 ω</td><td>${fmtN(2*Math.PI*f)} rad/s</td></tr>
      </table>`;
  } else if (mode === 'fc') {
    const f = parseFloat(document.getElementById('lc-f-fc').value) * 1e6; // MHz → Hz
    const C = parseFloat(document.getElementById('lc-C2').value) * 1e-12;
    if (isNaN(f) || f <= 0 || isNaN(C) || C <= 0) { result.innerHTML = '<p>f と C を入力してください</p>'; return; }
    const L = 1 / (4 * Math.PI * Math.PI * f * f * C);
    result.innerHTML = `
      <table class="result-table">
        <tr><td>インダクタンス L</td><td><strong>${fmtN(L*1e6)} μH</strong></td></tr>
      </table>`;
  } else {
    const f = parseFloat(document.getElementById('lc-f-fl').value) * 1e6;
    const L = parseFloat(document.getElementById('lc-L2').value) * 1e-6;
    if (isNaN(f) || f <= 0 || isNaN(L) || L <= 0) { result.innerHTML = '<p>f と L を入力してください</p>'; return; }
    const C = 1 / (4 * Math.PI * Math.PI * f * f * L);
    result.innerHTML = `
      <table class="result-table">
        <tr><td>静電容量 C</td><td><strong>${fmtN(C*1e12)} pF</strong></td></tr>
      </table>`;
  }
}

function fmtFreq(f) {
  if (f >= 1e9) return `${fmtN(f/1e9)} GHz`;
  if (f >= 1e6) return `${fmtN(f/1e6)} MHz`;
  if (f >= 1e3) return `${fmtN(f/1e3)} kHz`;
  return `${fmtN(f)} Hz`;
}

function fmtN(v) {
  if (isNaN(v) || !isFinite(v)) return '—';
  if (Math.abs(v) >= 10000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(4);
  return parseFloat(v.toPrecision(5)).toString();
}
