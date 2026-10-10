/* 몽실몽실 비눗방울 — 색종이 콜라주 화풍 그림 도구
   - 검은 테두리 선 없이, 색 면(종이 조각)만으로 그립니다.
   - 조각마다 가장자리를 살짝 흔들고(가위로 오린 느낌) 그림자를 깔아 종이를 겹쳐 붙인 것처럼 보이게 합니다.
   - 팔다리는 직선 막대가 아니라 관절에서 휘는 곡선 모양이라 동작이 부드럽습니다. */

const D = Math.PI / 180;
const R = n => Math.round(n * 10) / 10;
let P = '';                                   // 그림마다 다른 id 접두어 (한 페이지에 그림이 여러 장이라 겹치지 않게)
const INK = '#4a3428';                         // 눈·입 같은 작은 선에만 쓰는 진한 밤색
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

/* ---------- 기본 모양 ---------- */
function smooth(pts, closed = true) {
  const n = pts.length, g = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${R(pts[0].x)},${R(pts[0].y)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${R(p1.x + (p2.x - p0.x) / 6)},${R(p1.y + (p2.y - p0.y) / 6)} ${R(p2.x - (p3.x - p1.x) / 6)},${R(p2.y - (p3.y - p1.y) / 6)} ${R(p2.x)},${R(p2.y)}`;
  }
  return d + (closed ? 'Z' : '');
}
const pts = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push({ x: a[i], y: a[i + 1] }); return o };
function jit(p, j, seed) { const r = rng(seed); return p.map(q => ({ x: q.x + (r() - .5) * 2 * j, y: q.y + (r() - .5) * 2 * j })) }
const shape = (a, j = 0, seed = 1) => smooth(jit(pts(a), j, seed));
function blobD(cx, cy, rx, ry, seed = 1, j = .07, n = 11) {
  const r = rng(seed), p = [];
  for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI, f = 1 + (r() - .5) * 2 * j; p.push({ x: cx + Math.cos(a) * rx * f, y: cy + Math.sin(a) * ry * f }) }
  return smooth(p);
}
/* 화풍: 'collage'(색종이) · 'pencil'(색연필 선) · 'water'(수채화 번짐) */
let MODE = 'collage';
function darken(c, f = .68) {
  if (!/^#[0-9a-f]{6}$/i.test(c)) return '#4a3f52';
  const n = parseInt(c.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f));
  return '#' + ch.map(v => v.toString(16).padStart(2, '0')).join('');
}
function tint(c, f = .14) {
  if (!/^#[0-9a-f]{6}$/i.test(c)) return c;
  const n = parseInt(c.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * f));
  return '#' + ch.map(v => v.toString(16).padStart(2, '0')).join('');
}
const path = (d, fill, extra = '') => {
  if (MODE === 'collage' || fill === 'none' || /opacity|filter/.test(extra)) return `<path d="${d}" fill="${fill}" ${extra}/>`;
  if (MODE === 'pencil') return `<g ${extra}><path d="${d}" fill="${fill}"/><path d="${d}" fill="none" stroke="${darken(fill, .6)}" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" opacity=".92"/></g>`;
  // water: 물감이 겹치면 비쳐 보이게 살짝 투명 + 가장자리가 진하게 마르는 느낌 + 연필 밑그림 선이 살짝 어긋나게
  return `<g ${extra}><path d="${d}" fill="${tint(fill)}" stroke="${darken(fill, .74)}" stroke-opacity=".55" stroke-width="2.6"/><path d="${d}" fill="none" stroke="#5e4a3c" stroke-width="1.1" stroke-opacity=".5" transform="translate(1.8,-1.4)"/></g>`;
};
const blob = (cx, cy, rx, ry, fill, seed, j, extra = '') => path(blobD(cx, cy, rx, ry, seed, j), fill, extra);
const pol = (p, deg, len) => ({ x: p.x + Math.cos(deg * D) * len, y: p.y + Math.sin(deg * D) * len });

/* 휘어지는 팔다리: a(어깨/엉덩이) → e(팔꿈치/무릎) → b(손/발)을 지나는 곡선 위에 굵기를 입힙니다 */
function qp(a, c, b, t) { const u = 1 - t; return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y } }
function qt(a, c, b, t) { const u = 1 - t, x = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x), y = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y), l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l } }
function tubeD(a, e, b, w0, w1, n = 8) {
  const c = { x: 2 * e.x - (a.x + b.x) / 2, y: 2 * e.y - (a.y + b.y) / 2 }, L = [], Rt = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = qp(a, c, b, t), g = qt(a, c, b, t), w = (w0 + (w1 - w0) * t) / 2;
    L.push({ x: p.x - g.y * w, y: p.y + g.x * w }); Rt.push({ x: p.x + g.y * w, y: p.y - g.x * w });
  }
  const te = qt(a, c, b, 1), ts = qt(a, c, b, 0);
  return smooth([...L, { x: b.x + te.x * w1 * .42, y: b.y + te.y * w1 * .42 }, ...Rt.reverse(), { x: a.x - ts.x * w0 * .42, y: a.y - ts.y * w0 * .42 }]);
}
function lineD(a, e, b) { const c = { x: 2 * e.x - (a.x + b.x) / 2, y: 2 * e.y - (a.y + b.y) / 2 }; return `M${R(a.x)},${R(a.y)} Q${R(c.x)},${R(c.y)} ${R(b.x)},${R(b.y)}` }

/* ---------- 종이 질감·그림자 ---------- */
function defs() {
  return `<defs>
${MODE === 'collage' ? `<filter id="${P}cut" x="-12%" y="-12%" width="124%" height="128%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="7" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feDropShadow in="d" dx="1.4" dy="2.4" stdDeviation="1.6" flood-color="#5b3b1f" flood-opacity=".26"/>
</filter>` : MODE === 'pencil' ? `<filter id="${P}cut" x="-12%" y="-12%" width="124%" height="128%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="9" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency=".75 .07" numOctaves="2" seed="4" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .99  0 0 0 0 .96  0 0 0 2.4 -1.2" result="m"/>
 <feComposite in="m" in2="d" operator="in" result="st"/>
 <feMerge><feMergeNode in="d"/><feMergeNode in="st"/></feMerge>
</filter>` : `<filter id="${P}cut" x="-12%" y="-12%" width="124%" height="128%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="6" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feGaussianBlur in="d" stdDeviation=".55" result="b"/>
 <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="12" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .35  0 0 0 -1.1 .62" result="gm"/>
 <feComposite in="gm" in2="b" operator="in" result="gr"/>
 <feBlend in="gr" in2="b" mode="multiply"/>
</filter>`}
<filter id="${P}soft" x="-12%" y="-12%" width="124%" height="128%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="3" result="t"/>
 <feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="${P}grain" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="11"/>
 <feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .32  0 0 0 0 .22  0 0 0 -1.25 .78"/>
</filter>
<filter id="${P}wash" x="0" y="0" width="100%" height="100%">
 <feTurbulence type="fractalNoise" baseFrequency=".004 .012" numOctaves="3" seed="5"/>
 <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1"/>
</filter>
<pattern id="${P}check" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(6)">
 <rect width="14" height="14" fill="#d2544c"/><rect width="7" height="14" fill="#2f3b63" opacity=".55"/><rect width="14" height="7" fill="#2f3b63" opacity=".55"/></pattern>
<linearGradient id="${P}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc2ea"/><stop offset="1" stop-color="#d9eef8"/></linearGradient>
<linearGradient id="${P}deep" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#4f95d6"/><stop offset=".65" stop-color="#93c6ec"/><stop offset="1" stop-color="#cfe7f4"/></linearGradient>
</defs>`;
}
const cut = s => `<g filter="url(#${P}cut)">${s}</g>`;
/* 마지막에 그림 전체에 덮는 종이 결(가는 알갱이) + 물감 번짐(큰 얼룩) */
const paper = (w, h) => (MODE === 'water' ? `<rect width="${w}" height="${h}" fill="#fffaf0" opacity=".16"/>` : '') + `<rect width="${w}" height="${h}" filter="url(#${P}wash)" opacity=".22" style="mix-blend-mode:soft-light"/><rect width="${w}" height="${h}" filter="url(#${P}grain)" opacity=".5" style="mix-blend-mode:multiply"/>`;

/* ---------- 배경 조각 ---------- */
function skyWash(w, h, id = 'sky', seed = 1) {
  const r = rng(seed); let s = `<rect width="${w}" height="${h}" fill="url(#${P}${id})"/>`;
  for (let i = 0; i < 7; i++) s += blob(r() * w, r() * h * .7, 140 + r() * 220, 26 + r() * 30, i % 2 ? '#ffffff' : '#3f86cc', seed + i, .18, `opacity="${i % 2 ? .16 : .08}" filter="url(#${P}soft)"`);
  return s;
}
function cloud(x, y, s, seed = 1) {
  const r = rng(seed); let g = '';
  [[-46, 6, 34, 20], [-12, -8, 40, 30], [30, 0, 36, 24], [0, 10, 64, 18]].forEach(([dx, dy, rx, ry], i) => g += blob(dx, dy, rx, ry, '#fffdf8', seed * 7 + i, .1));
  return `<g transform="translate(${x},${y}) scale(${s})" opacity=".95">${g}</g>`;
}
function hill(w, h, y, amp, fill, seed) {
  const r = rng(seed), p = [{ x: -20, y: h + 20 }];
  for (let i = 0; i <= 8; i++) p.push({ x: -20 + i * (w + 40) / 8, y: y + Math.sin(i * 1.3 + seed) * amp + (r() - .5) * amp * .6 });
  p.push({ x: w + 20, y: h + 20 });
  return path(smooth(p), fill);
}
const AUT = [['#e98a3f', '#f2b445', '#d65a35'], ['#f0c24e', '#e6a238', '#d97a33'], ['#d9533b', '#ec8a48', '#b84535'], ['#c96f3c', '#e3a24a', '#a8502f']];
function tree(x, y, s, pal = AUT[0], seed = 1) {
  const r = rng(seed);
  let g = path(tubeD({ x: 0, y: 0 }, { x: -3, y: -60 }, { x: 4, y: -112 }, 18, 9), '#8b5a3a');
  g += path(tubeD({ x: 0, y: -70 }, { x: 18, y: -92 }, { x: 34, y: -108 }, 7, 4), '#8b5a3a');
  [[-34, -122, 46, 40], [36, -128, 46, 40], [0, -162, 56, 46], [-8, -110, 40, 28]].forEach(([dx, dy, rx, ry], i) => g += blob(dx, dy, rx, ry, pal[i % 3], seed * 5 + i, .12));
  for (let i = 0; i < 6; i++) g += leaf(-50 + r() * 100, -180 + r() * 90, r() * 360, pal[(i + 1) % 3], .8);
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}
function leaf(x, y, rot, c, sz = 1) {
  return `<g transform="translate(${R(x)},${R(y)}) rotate(${R(rot)}) scale(${sz})"><path d="M0,-11 Q9,-2 0,11 Q-9,-2 0,-11Z" fill="${c}"/><path d="M0,-8 V9" stroke="#fff3df" stroke-opacity=".55" stroke-width="1.2"/></g>`;
}
function leaves(n, x0, y0, x1, y1, seed, sz = 1) {
  const r = rng(seed), cs = ['#e98a3f', '#f2b445', '#d65a35', '#f0c24e', '#c96f3c']; let s = '';
  for (let i = 0; i < n; i++) s += leaf(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), r() * 360, cs[Math.floor(r() * cs.length)], sz * (.7 + r() * .5));
  return s;
}
const acorn = (x, y, s = 1) => `<g transform="translate(${R(x)},${R(y)}) scale(${s})">${blob(0, 4, 7, 8.5, '#b9824c', 3, .05)}${path('M-8,1 Q0,-9 8,1 Q0,4 -8,1Z', '#6f4a2c')}<path d="M0,-5 V-9" stroke="#6f4a2c" stroke-width="2" stroke-linecap="round"/></g>`;
const pinecone = (x, y, s = 1) => `<g transform="translate(${R(x)},${R(y)}) scale(${s})">${blob(0, 0, 9, 12, '#9a6440', 4, .05)}<path d="M-6,-5 Q0,-1 6,-5 M-8,1 Q0,6 8,1 M-6,7 Q0,10 6,7" stroke="#6f4429" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;

/* ---------- 비눗방울 (투명한 셀로판 느낌) ---------- */
function bubble(x, y, r) {
  const sw = Math.max(1.4, r * .055);
  const arc = (a0, a1, c, wd, op) => { const p0 = { x: x + Math.cos(a0 * D) * r * .86, y: y + Math.sin(a0 * D) * r * .86 }, p1 = { x: x + Math.cos(a1 * D) * r * .86, y: y + Math.sin(a1 * D) * r * .86 }; return `<path d="M${R(p0.x)},${R(p0.y)} A${R(r * .86)},${R(r * .86)} 0 0 1 ${R(p1.x)},${R(p1.y)}" stroke="${c}" stroke-width="${R(wd)}" stroke-opacity="${op}" fill="none" stroke-linecap="round"/>` };
  return `<g><circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" fill="#ffffff" fill-opacity=".16"/>`
    + arc(15, 95, '#ffc3e4', r * .1, .7) + arc(150, 205, '#b6f2dc', r * .08, .7) + arc(240, 275, '#fff1a8', r * .06, .6)
    + `<circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="${R(sw)}"/>`
    + `<ellipse cx="${R(x - r * .42)}" cy="${R(y - r * .42)}" rx="${R(r * .2)}" ry="${R(r * .11)}" fill="#fff" opacity=".9" transform="rotate(-42 ${R(x - r * .42)} ${R(y - r * .42)})"/></g>`;
}
/* 시작점에서 끝점까지 흘러가는 비눗방울 줄기 (점점 커지고 퍼짐) */
function stream(n, from, to, r0, r1, spread, seed, avoid) {
  const r = rng(seed), got = []; let s = '', k = 0, t = 0;
  while (k < n && t < n * 60) {
    t++; const u = Math.pow(r(), .85), x = from.x + (to.x - from.x) * u + (r() - .5) * spread * (.3 + u), y = from.y + (to.y - from.y) * u + (r() - .5) * spread * (.3 + u) * .7;
    const rr = r0 + (r1 - r0) * u * (.45 + r() * .7);
    if (avoid && avoid(x, y, rr)) continue;
    if (got.some(b => Math.hypot(b.x - x, b.y - y) < (b.r + rr) * .62)) continue;   // 너무 많이 겹치지 않게
    got.push({ x, y, r: rr }); s += bubble(x, y, rr); k++;
  }
  return s;
}
function popMark(x, y, s = 1, c = '#ffffff') {
  let g = ''; for (let i = 0; i < 8; i++) { const a = i * 45 + 20; g += `<path d="M${R(x + Math.cos(a * D) * 12 * s)},${R(y + Math.sin(a * D) * 12 * s)} L${R(x + Math.cos(a * D) * 20 * s)},${R(y + Math.sin(a * D) * 20 * s)}" stroke="${c}" stroke-width="${R(2.6 * s)}" stroke-linecap="round"/>` }
  return g;
}

/* ---------- 등장인물 ---------- */
const K = {
  nari: { top: '#8b62c6', pants: '#8b62c6', stripe: '#fbf7ff', hair: '#3a2a20', style: 'bob', pin: '#f6c624', skin: '#f6d6bd', shoe: '#f4efe6', wand: '#f6c624' },
  sol: { top: '#f3a0bd', pants: '#8db8e2', hair: '#2c1f17', style: 'pony', streak: '#56d2b2', tie: '#f3a0bd', skin: '#f4d1b4', shoe: '#ffffff', wand: '#ef6f9c' },
  dahong: { top: '#a9adb4', pants: 'check', hair: '#4b3122', style: 'long', pin: '#e23d3a', skin: '#f8dbc6', shoe: '#3a3f58', wand: '#e23d3a' }
};
const A = {
  dad: { coat: '#5d8a5e', pants: '#454a58', hair: '#2d231d', style: 'short', glasses: true, skin: '#f0cdb0' },
  narimom: { coat: '#dcc39b', pants: '#6a5c72', hair: '#3b2b22', style: 'bob', skin: '#f6d6bd' },
  solmom: { coat: '#dda53e', pants: '#4b5a72', hair: '#2b1f19', style: 'long', skin: '#f2cfb2', bag: '#4f9e7f' },
  hongmom: { coat: '#34507a', pants: '#7d6c5c', hair: '#4b3122', style: 'bun', skin: '#f7d8c2' }
};

/* 얼굴: 머리 가운데가 (0,0). turn은 얼굴이 좌우로 살짝 돌아간 정도, gaze는 눈동자 방향 */
function face(m = 'smile', turn = 0, gaze = [0, 0]) {
  const t = turn, ex = 11, ey = 3, gx = gaze[0], gy = gaze[1];
  const dot = (x, r = 3.3) => `<ellipse cx="${R(x + t + gx)}" cy="${R(ey + gy)}" rx="${r}" ry="${R(r * 1.15)}" fill="${INK}"/>`;
  const ln = (d, w = 2.4) => `<path d="${d}" stroke="${INK}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const X = v => R(v + t);
  const brow = (lift = 0, tilt = 0) => ln(`M${X(-ex - 5)},${R(-8 - lift + tilt)} Q${X(-ex)},${R(-11 - lift)} ${X(-ex + 5)},${R(-8 - lift - tilt)} M${X(ex - 5)},${R(-8 - lift - tilt)} Q${X(ex)},${R(-11 - lift)} ${X(ex + 5)},${R(-8 - lift + tilt)}`, 1.8);
  let s = '', ck = .7, cr = 6;
  if (m === 'blow') { s = dot(-ex) + dot(ex) + brow(0) + `<ellipse cx="${X(4)}" cy="17" rx="3.4" ry="3.8" fill="#c7564e"/>`; ck = .95; cr = 8 }
  else if (m === 'laugh') { s = ln(`M${X(-ex - 4.5)},${ey + 1} Q${X(-ex)},${ey - 5} ${X(-ex + 4.5)},${ey + 1} M${X(ex - 4.5)},${ey + 1} Q${X(ex)},${ey - 5} ${X(ex + 4.5)},${ey + 1}`) + brow(2) + `<path d="M${X(-8)},12 Q${X(0)},11 ${X(8)},12 Q${X(6)},24 ${X(0)},24 Q${X(-6)},24 ${X(-8)},12Z" fill="#c7564e"/><path d="M${X(-4)},20.5 Q${X(0)},18 ${X(4)},20.5 Q${X(0)},23.5 ${X(-4)},20.5Z" fill="#f29b8f"/>` }
  else if (m === 'joy') { s = ln(`M${X(-ex - 4.5)},${ey} Q${X(-ex)},${ey + 4} ${X(-ex + 4.5)},${ey} M${X(ex - 4.5)},${ey} Q${X(ex)},${ey + 4} ${X(ex + 4.5)},${ey}`) + brow(1) + ln(`M${X(-8)},13 Q${X(0)},21 ${X(8)},13`, 2.6) }
  else if (m === 'wow') { s = dot(-ex, 4.2) + dot(ex, 4.2) + `<circle cx="${X(-ex + 1.4 + gx)}" cy="${ey - 1.6 + gy}" r="1.4" fill="#fff"/><circle cx="${X(ex + 1.4 + gx)}" cy="${ey - 1.6 + gy}" r="1.4" fill="#fff"/>` + brow(3) + `<ellipse cx="${X(0)}" cy="17" rx="4.2" ry="5.4" fill="#c7564e"/>` }
  else { s = dot(-ex) + dot(ex) + brow(0) + ln(`M${X(-6)},14 Q${X(0)},19 ${X(6)},14`) }
  s += `<ellipse cx="${X(-19)}" cy="11" rx="${cr}" ry="${R(cr * .6)}" fill="#f3958f" opacity="${ck}"/><ellipse cx="${X(19)}" cy="11" rx="${cr}" ry="${R(cr * .6)}" fill="#f3958f" opacity="${ck}"/>`;
  return s;
}

/* 머리카락. 머리 가운데 (0,0), 반지름 약 30 */
function hairBehind(k, o) {
  const h = k.hair;
  if (o.back) {
    let s = '';
    if (k.style === 'bob') s += path(shape([-32, -4, -31, -24, -18, -36, 0, -39, 18, -36, 31, -24, 32, -4, 33, 18, 22, 25, 0, 23, -22, 25, -33, 18], 1.2, 21), h);
    if (k.style === 'long') s += path(shape([-32, -4, -31, -24, -18, -36, 0, -39, 18, -36, 31, -24, 32, -4, 35, 30, 28, 46, 10, 40, -10, 42, -28, 46, -35, 30], 1.2, 22), h);
    if (k.style === 'pony') {
      s += path(blobD(0, -3, 31, 31, 23, .03), h);
      const sw = o.pony ?? 0, a = { x: 0, y: -14 }, e = { x: 3 + sw * .4, y: 10 }, b = { x: 4 + sw, y: 36 };
      s += path(tubeD(a, e, b, 15, 6), h) + `<path d="${lineD({ x: 3, y: -8 }, { x: 6 + sw * .4, y: 12 }, { x: 6 + sw, y: 32 })}" stroke="${k.streak}" stroke-width="4" fill="none" stroke-linecap="round"/>` + `<circle cx="0" cy="-15" r="5.5" fill="${k.tie}"/>`;
    }
    if (k.pin) s += `<rect x="${k.style === 'bob' ? -26 : 8}" y="-26" width="15" height="5.5" rx="2.7" fill="${k.pin}" transform="rotate(${k.style === 'bob' ? 22 : -22} ${k.style === 'bob' ? -18 : 15} -23)"/>`;
    return s;
  }
  if (k.style === 'bob') return path(shape([-31, -6, -33, -26, -18, -37, 0, -39, 18, -37, 33, -26, 31, -6, 34, 16, 27, 24, 18, 18, -18, 18, -27, 24, -34, 16], 1, 31), h);
  if (k.style === 'long') return path(shape([-31, -6, -33, -26, -18, -37, 0, -39, 18, -37, 33, -26, 31, -6, 35, 26, 30, 44, 20, 36, 18, 14, -18, 14, -20, 36, -30, 44, -35, 26], 1, 32), h);
  // 포니테일: 머리 뒤로 묶은 꼬리가 몸짓에 따라 흔들림 (pony 값)
  const sw = o.pony ?? 0, a = { x: 20, y: -26 }, e = { x: 44 + sw * .3, y: -24 + Math.abs(sw) * .1 }, b = { x: 50 + sw, y: 6 - Math.abs(sw) * .3 };
  return path(tubeD(a, e, b, 16, 6), h) + `<path d="${lineD({ x: 26, y: -24 }, { x: 44 + sw * .3, y: -18 }, { x: 48 + sw * .9, y: 2 })}" stroke="${k.streak}" stroke-width="4" fill="none" stroke-linecap="round"/>` + path(blobD(0, -4, 31, 30, 33, .03), h);
}
function hairFront(k, o) {
  if (o.back) return '';
  const h = k.hair; let s = '';
  if (k.style === 'bob') { s += path(shape([-31, -1, -32, -20, -18, -35, 0, -38, 18, -35, 32, -20, 31, -1, 25, -11, 15, -7, 5, -12, -6, -7, -16, -12, -26, -7], .8, 41), h); s += `<rect x="9" y="-27" width="16" height="6" rx="3" fill="${k.pin}" transform="rotate(-24 17 -24)"/>` }
  if (k.style === 'long') { s += path(shape([-31, -1, -32, -20, -18, -35, 0, -38, 18, -35, 32, -20, 31, -1, 26, -10, 13, -12, 0, -10, -13, -12, -26, -10], .8, 42), h); s += `<rect x="-25" y="-27" width="16" height="6" rx="3" fill="${k.pin}" transform="rotate(24 -17 -24)"/>` }
  if (k.style === 'pony') { s += path(shape([-31, 0, -32, -20, -18, -35, 0, -38, 18, -35, 32, -20, 31, -4, 22, -17, 8, -21, -10, -16, -24, -6], .8, 43), h); s += `<circle cx="22" cy="-27" r="5.5" fill="${k.tie}"/>` }
  return s;
}

/* 아이 한 명. (x,y)는 두 발 사이 바닥. 각도는 SVG 기준(0=오른쪽, 90=아래, -90=위).
   o = { s:크기, back:뒷모습, lean:몸 기울기, tilt:고개 기울기, turn:얼굴 돌림, gaze:[x,y], mood,
         aL/aR:[윗팔, 아랫팔] 각도, lL/lR:[허벅지, 정강이] 각도, pony:꼬리 흔들림, holdL/holdR:(손위치,팔방향)=>그림 } */
function kid(id, x, y, o = {}) {
  const k = K[id], s = o.s || 1;
  const pf = k.pants === 'check' ? `url(#${P}check)` : k.pants;
  const hipY = -60, sh = -106;
  const lL = o.lL || [97, 92], lR = o.lR || [83, 88], aL = o.aL || [104, 96], aR = o.aR || [76, 84];
  let g = '';
  // 다리
  const leg = (side, [t1, t2]) => {
    const hp = { x: side * 8, y: hipY }, kn = pol(hp, t1, 31), ft = pol(kn, t2, 29);
    let L = path(tubeD(hp, kn, ft, 15, 12), pf);
    if (k.stripe) L += `<path d="${lineD({ x: hp.x + side * 4, y: hp.y + 4 }, { x: kn.x + side * 4.5, y: kn.y }, { x: ft.x + side * 4, y: ft.y - 4 })}" stroke="${k.stripe}" stroke-width="1.8" fill="none" opacity=".9"/>`;
    const toe = Math.cos(t2 * D) * 4 + side * 3;
    L += path(blobD(ft.x + toe, ft.y + 3, 10.5, 6, 57, .03), k.shoe, `transform="rotate(${R((t2 - 90) * .5)} ${R(ft.x + toe)} ${R(ft.y + 3)})"`);
    return L;
  };
  g += leg(-1, lL) + leg(1, lR);
  // 윗몸 (엉덩이를 축으로 기울어짐)
  let u = '';
  const arm = (side, [t1, t2], hold) => {
    const sp = { x: side * 16, y: sh }, el = pol(sp, t1, 26), hd = pol(el, t2, 24);
    let A2 = path(tubeD(sp, el, hd, 13, 10.5), k.top);
    if (k.stripe) A2 += `<path d="${lineD({ x: sp.x, y: sp.y + 4 }, el, hd)}" stroke="${k.stripe}" stroke-width="1.6" fill="none" opacity=".85" transform="translate(${side * 2.5},0)"/>`;
    A2 += path(blobD(hd.x, hd.y, 6.4, 6.4, 58, .03), k.skin);
    if (hold) A2 += hold(hd, t2);
    return A2;
  };
  const headAt = inner => `<g transform="translate(0,${sh - 32}) rotate(${o.tilt || 0} 0 26)">${inner}</g>`;
  // 순서: 뒷머리 → 몸 → 얼굴·앞머리 → 팔 (팔을 머리 위로 들어도 머리카락에 가려지지 않게)
  if (!o.back) u += headAt(hairBehind(k, o));
  // 바지 윗부분(엉덩이)
  u += path(shape([-19, hipY - 10, 19, hipY - 10, 21, hipY + 4, 0, hipY + 7, -21, hipY + 4], .6, 51), pf);
  // 윗옷
  u += path(shape([-9, sh - 9, -18, sh - 3, -21, sh + 14, -24, -55, -11, -51, 0, -53, 11, -51, 24, -55, 21, sh + 14, 18, sh - 3, 9, sh - 9], .7, 52), k.top);
  if (k.stripe && !o.back) u += `<path d="M0,${sh - 7} V-54" stroke="${k.stripe}" stroke-width="1.8"/>`;
  if (!o.back) u += `<path d="M-8,${sh - 8} Q0,${sh - 2} 8,${sh - 8}" stroke="${k.skin}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  // 얼굴과 앞머리
  let hd = o.back ? hairBehind(k, o) : '';
  if (!o.back) {
    hd += path(blobD(0, 1, 29, 27.5, 61, .02), k.skin);
    hd += face(o.mood, o.turn || 0, o.gaze || [0, 0]);
  }
  hd += hairFront(k, o);
  u += headAt(hd);
  u += arm(-1, aL, o.holdL) + arm(1, aR, o.holdR);
  if (o.front) u += o.front;
  g += `<g transform="rotate(${o.lean || 0} 0 ${hipY})">${u}</g>`;
  return `<g transform="translate(${R(x)},${R(y)}) scale(${s})" filter="url(#${P}cut)">${g}</g>`;
}

/* 비눗방울 막대: 손 위치 h에서 dir 방향으로 */
const wand = (c, dir = -90, len = 24) => (h) => {
  const e = pol(h, dir, len * .55), b = pol(h, dir, len), ring = pol(h, dir, len + 9);
  return path(tubeD(h, e, b, 3.6, 3), c) + `<circle cx="${R(ring.x)}" cy="${R(ring.y)}" r="9" fill="#ffffff" fill-opacity=".35" stroke="${c}" stroke-width="3.4"/>`;
};
const bottle = (c, cap) => (h) => `<g transform="translate(${R(h.x)},${R(h.y + 2)})"><rect x="-8" y="-6" width="16" height="22" rx="5" fill="#fff6fb" opacity=".95"/><rect x="-6" y="-12" width="12" height="7" rx="2" fill="${cap}"/><rect x="-6" y="4" width="12" height="9" rx="3" fill="${c}" opacity=".45"/></g>`;

/* 어른 (주로 작게 배경에). sit:true면 앉은 모습 */
function adult(id, x, y, o = {}) {
  const a = A[id], s = o.s || 1; let g = '';
  const hipY = o.sit ? -62 : -112, sh = hipY - 92;
  if (o.sit) {
    [-1, 1].forEach(sd => { g += path(tubeD({ x: sd * 11, y: hipY }, { x: sd * 11 + 26, y: hipY + 2 }, { x: sd * 9 + 46, y: hipY + 4 }, 20, 17), a.pants); g += path(tubeD({ x: sd * 9 + 46, y: hipY + 4 }, { x: sd * 9 + 48, y: hipY + 32 }, { x: sd * 9 + 48, y: -6 }, 16, 14), a.pants); g += `<ellipse cx="${sd * 9 + 54}" cy="-4" rx="13" ry="6" fill="#5a463c"/>` });
  } else {
    [-1, 1].forEach(sd => { const hp = { x: sd * 11, y: hipY }, kn = pol(hp, 90 - sd * 3, 56), ft = pol(kn, 90 - sd * 2, 54); g += path(tubeD(hp, kn, ft, 20, 16), a.pants); g += `<ellipse cx="${R(ft.x + sd * 3)}" cy="${R(ft.y + 2)}" rx="13" ry="6" fill="#5a463c"/>` });
  }
  if (a.style === 'long') g += path(shape([-29, sh - 30, -31, sh - 54, 0, sh - 64, 31, sh - 54, 29, sh - 30, 33, sh + 14, 20, sh + 20, -20, sh + 20, -33, sh + 14], 1, 71), a.hair);
  if (a.style === 'bob') g += path(shape([-29, sh - 30, -31, sh - 54, 0, sh - 64, 31, sh - 54, 29, sh - 30, 31, sh - 6, 18, sh - 8, -18, sh - 8, -31, sh - 6], 1, 72), a.hair);
  if (a.style === 'bun') g += blob(0, sh - 62, 13, 12, a.hair, 73, .05);
  g += path(shape([-15, sh - 2, -27, sh + 6, -32, hipY + 30, -34, hipY + 46, 0, hipY + 44, 34, hipY + 46, 32, hipY + 30, 27, sh + 6, 15, sh - 2], .8, 74), a.coat);
  g += `<path d="M0,${sh} V${hipY + 42}" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`;
  const arm = (sd, [t1, t2]) => { const sp = { x: sd * 22, y: sh + 8 }, el = pol(sp, t1, 46), hd = pol(el, t2, 42); return path(tubeD(sp, el, hd, 17, 14), a.coat) + `<circle cx="${R(hd.x)}" cy="${R(hd.y)}" r="8" fill="${a.skin}"/>` };
  g += arm(-1, o.aL || [102, 96]) + arm(1, o.aR || [78, 84]);
  if (a.bag) g += `<g transform="translate(${o.sit ? 70 : 38},${hipY + 10})">${path('M-20,-34 Q-20,-52 0,-52 Q20,-52 20,-34', 'none', `stroke="${a.bag}" stroke-width="4"`)}${blob(0, -12, 26, 24, a.bag, 75, .05)}</g>`;
  g += path(blobD(0, sh - 26, 25, 26, 76, .02), a.skin);
  if (a.style === 'short') g += path(shape([-26, sh - 26, -27, sh - 44, -12, sh - 54, 6, sh - 55, 24, sh - 46, 26, sh - 30, 16, sh - 40, 0, sh - 41, -14, sh - 38], .8, 77), a.hair);
  if (a.style === 'long' || a.style === 'bob') g += path(shape([-26, sh - 22, -27, sh - 42, 0, sh - 54, 27, sh - 42, 26, sh - 22, 16, sh - 36, -6, sh - 38, -20, sh - 32], .8, 78), a.hair);
  if (a.style === 'bun') g += path(shape([-26, sh - 22, -27, sh - 42, 0, sh - 53, 27, sh - 42, 26, sh - 22, 14, sh - 38, -14, sh - 38], .8, 79), a.hair);
  g += `<circle cx="-9" cy="${sh - 24}" r="2.6" fill="${INK}"/><circle cx="9" cy="${sh - 24}" r="2.6" fill="${INK}"/><path d="M-5,${sh - 13} Q0,${sh - 9} 5,${sh - 13}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (a.glasses) g += `<g fill="none" stroke="${INK}" stroke-width="1.8"><circle cx="-9" cy="${sh - 24}" r="7"/><circle cx="9" cy="${sh - 24}" r="7"/><path d="M-2,${sh - 25} H2"/></g>`;
  return `<g transform="translate(${R(x)},${R(y)}) scale(${s})" filter="url(#${P}cut)">${g}</g>`;
}
function bench(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#${P}cut)"><rect x="-100" y="-48" width="11" height="48" rx="3" fill="#7d5034"/><rect x="89" y="-48" width="11" height="48" rx="3" fill="#7d5034"/>${path(shape([-112, -96, 112, -96, 112, -80, -112, -80], .8, 81), '#b97b4c')}${path(shape([-116, -58, 116, -58, 116, -42, -116, -42], .8, 82), '#cf9058')}</g>`;
}
