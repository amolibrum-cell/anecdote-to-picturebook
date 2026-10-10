/* 장면별 그림. 한 쪽은 800×560, 펼침면은 1600×560 */
const W = 800, H = 560;
const svg = (w, body) => `<svg viewBox="0 0 ${w} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">${defs()}${body}${paper(w, H)}</svg>`;

const S = {};

/* 뒤표지: 솔이의 '가을 도시락' 하나만 조용히 */
S.back = () => {
  let s = `<rect width="${W}" height="${H}" fill="#f1dcb4"/>`;
  s += blob(400, 470, 520, 120, '#e8cc98', 3, .05);
  s += leaves(14, 60, 380, 740, 540, 8, 1.6);
  let box = blob(0, 0, 118, 66, '#7ec4ad', 91, .03);
  box += blob(0, -4, 104, 54, '#fff4e0', 92, .03);
  box += leaf(-60, -10, 40, '#d65a35', 2.6) + leaf(-30, -22, -30, '#f2b445', 2.4) + leaf(-40, 18, 80, '#e98a3f', 2.2);
  box += acorn(8, -16, 2) + acorn(30, 10, 1.8) + pinecone(66, -8, 2.1) + leaf(4, 24, 120, '#f0c24e', 1.8);
  s += cut(`<g transform="translate(400,330) rotate(-4)">${box}</g>`);
  s += cut(blob(400, 254, 132, 22, '#68b39b', 93, .03));
  s += bubble(610, 140, 46) + bubble(668, 96, 18) + bubble(560, 82, 11);
  return svg(W, s);
};

/* 앞표지 */
S.cover = () => {
  let s = skyWash(W, H, 'sky', 4);
  s += cloud(640, 250, .9, 2) + cloud(130, 270, .7, 5);
  s += hill(W, H, 418, 14, '#c2bf6f', 3) + cut(tree(34, 452, 1.15, AUT[2], 4) + tree(772, 448, 1.05, AUT[0], 6));
  s += cut(hill(W, H, 470, 10, '#ddbf6c', 7)) + leaves(18, 20, 485, 780, 548, 9);
  // 솔이: 까치발을 들고 비눗방울을 '톡'
  s += kid('sol', 245, 512, { s: 1.32, lean: -6, tilt: -8, turn: -4, gaze: [-1.5, -2], mood: 'laugh', pony: 16,
    aL: [-115, -100], aR: [32, 18], lL: [101, 99], lR: [85, 92],
    holdL: h => popMark(h.x - 4, h.y - 16, .9) });
  // 나리: 막대를 입에 대고 후—
  s += kid('nari', 400, 512, { s: 1.32, tilt: 5, turn: 4, gaze: [2.5, 0], mood: 'blow',
    aL: [100, 40], aR: [40, -80], lL: [96, 92], lR: [84, 88],
    holdR: wand(K.nari.wand, -150, 12), holdL: bottle('#8b62c6', '#f6c624') });
  // 다홍: 막대를 높이 흔들며 깡충
  s += kid('dahong', 556, 512, { s: 1.32, lean: 6, tilt: 7, turn: 3, gaze: [1, -2], mood: 'joy',
    aL: [128, 112], aR: [-58, -84], lL: [100, 90], lR: [62, 118],
    holdR: wand(K.dahong.wand, -70, 22) });
  // 제목 자리(위쪽 가운데)와 아이들 얼굴은 비워 둠
  const keep = (x, y, r) => (x + r > 110 && x - r < 690 && y - r < 182) || (Math.hypot(x - 556, y - 330) < r + 52) || (Math.hypot(x - 400, y - 330) < r + 30);
  s += stream(26, { x: 440, y: 322 }, { x: 760, y: 60 }, 5, 46, 210, 12, keep);
  s += bubble(640, 236, 12) + bubble(612, 210, 7) + bubble(668, 198, 16);
  s += bubble(186, 292, 14) + bubble(150, 228, 22) + bubble(66, 128, 30) + bubble(96, 54, 12);
  return svg(W, s);
};

/* 12–13쪽 펼침면 (절정) */
S.sky = () => {
  const w = 1600; let s = skyWash(w, H, 'deep', 9);
  s += cloud(1180, 380, .75, 3) + cloud(250, 400, .55, 8) + cloud(1500, 300, .5, 11);
  // 먼 숲: 흐리고 옅게 (멀리 있는 것은 색을 연하게 = 거리감)
  const far = [['#e9c08a', '#f0d39b', '#dfae7d'], ['#e8cf96', '#d9b47f', '#f1d9a4'], ['#e3b07f', '#edc694', '#d9a375']];
  let f = ''; for (let i = 0; i < 26; i++) f += tree(i * 64 + (i % 3) * 14 - 30, 508 + (i % 2) * 6, .42 + (i % 4) * .07, far[i % 3], 20 + i);
  s += `<g opacity=".85">${f}</g>`;
  s += hill(w, H, 496, 6, '#d3bf78', 21) + cut(hill(w, H, 520, 5, '#c9ae62', 22)) + leaves(26, 0, 528, 1600, 556, 23, .8);
  // 어른들: 오른쪽 멀리 벤치에 작게
  s += bench(1396, 546, .42);
  s += adult('dad', 1338, 544, { s: .3, sit: true }) + adult('narimom', 1376, 544, { s: .3, sit: true }) + adult('solmom', 1414, 544, { s: .3, sit: true }) + adult('hongmom', 1452, 544, { s: .3, sit: true, aR: [40, -70] });
  // 세 아이 뒷모습: 손잡고 나란히 서서 올려다봄
  s += kid('sol', 452, 542, { s: .62, back: true, lean: -3, pony: 8, aL: [-112, -100], aR: [45, 20] });
  s += kid('nari', 522, 542, { s: .62, back: true, aL: [135, 160], aR: [-75, -95], holdR: wand(K.nari.wand, -95, 24) });
  s += kid('dahong', 594, 542, { s: .62, back: true, lean: 3, aL: [-122, -104], aR: [-58, -76], lL: [100, 97], lR: [80, 86] });
  // 비눗방울: 왼쪽 아래(아이들) → 오른쪽 위(다음 장 방향)로 점점 크게
  const textBox = (x, y, r) => x - r < 640 && y - r < 250;
  s += stream(40, { x: 532, y: 410 }, { x: 1470, y: 70 }, 5, 74, 420, 31, textBox);
  s += stream(16, { x: 700, y: 330 }, { x: 1560, y: 230 }, 4, 26, 260, 37, textBox);
  // 바람에 날리는 잎
  s += leaf(760, 300, 30, '#e98a3f', 1.6) + leaf(980, 180, -60, '#f2b445', 1.4) + leaf(1250, 330, 75, '#d65a35', 1.5);
  return svg(w, s);
};
