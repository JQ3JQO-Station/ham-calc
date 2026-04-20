// 周波数↔波長 変換
const SPEEDS = {
  em_approx:  299792458,
  vacuum:     299792458,
  sound_air:  340.29,
  sound_sea:  1531.0,
};

function initFreqWave() {
  const inputs = ['fw-freq-val','fw-freq-unit','fw-speed','fw-wave-val','fw-wave-unit'];
  inputs.forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcFreqWave);
    document.getElementById(id)?.addEventListener('change', calcFreqWave);
  });
  calcFreqWave();
}

function calcFreqWave() {
  const speed = SPEEDS[document.getElementById('fw-speed').value];
  const freqVal = parseFloat(document.getElementById('fw-freq-val').value);
  const freqUnit = document.getElementById('fw-freq-unit').value;
  const waveVal = parseFloat(document.getElementById('fw-wave-val').value);
  const waveUnit = document.getElementById('fw-wave-unit').value;

  const freqMult = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 };
  const waveMult = { mm: 1e-3, cm: 1e-2, m: 1, km: 1e3 };

  const resultF = document.getElementById('fw-result-from-freq');
  const resultW = document.getElementById('fw-result-from-wave');

  // 周波数→波長
  if (!isNaN(freqVal) && freqVal > 0) {
    const f = freqVal * freqMult[freqUnit];
    const lambda = speed / f;
    resultF.innerHTML = `
      <tr><td>λ (全波長)</td><td>${fmt(lambda)} m</td></tr>
      <tr><td>λ/2 (半波長)</td><td>${fmt(lambda/2)} m</td></tr>
      <tr><td>λ/4 (1/4波長)</td><td>${fmt(lambda/4)} m</td></tr>
      <tr><td>λ/6 (1/6波長)</td><td>${fmt(lambda/6)} m</td></tr>
    `;
  } else {
    resultF.innerHTML = '<tr><td colspan="2">周波数を入力してください</td></tr>';
  }

  // 波長→周波数
  if (!isNaN(waveVal) && waveVal > 0) {
    const lam = waveVal * waveMult[waveUnit];
    const f = speed / lam;
    let fStr, unit;
    if (f >= 1e9) { fStr = fmt(f/1e9); unit = 'GHz'; }
    else if (f >= 1e6) { fStr = fmt(f/1e6); unit = 'MHz'; }
    else if (f >= 1e3) { fStr = fmt(f/1e3); unit = 'kHz'; }
    else { fStr = fmt(f); unit = 'Hz'; }
    resultW.innerHTML = `<tr><td>周波数</td><td>${fStr} ${unit}</td></tr>`;
  } else {
    resultW.innerHTML = '<tr><td colspan="2">波長を入力してください</td></tr>';
  }
}

function fmt(v) {
  if (v === 0) return '0';
  if (Math.abs(v) >= 1000 || Math.abs(v) < 0.001) return v.toExponential(4);
  return parseFloat(v.toPrecision(5)).toString();
}
