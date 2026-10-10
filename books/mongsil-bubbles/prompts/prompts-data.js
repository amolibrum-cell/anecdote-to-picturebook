/* 몽실몽실 비눗방울 — 이미지 생성 프롬프트 원본 데이터
   장면 프롬프트 = 공통 화풍 + 등장하는 인물 설명 + 장면 설명 + 금지 사항 (자동으로 이어 붙임) */

const STYLE = `Children's picture book illustration, hand-painted look: soft transparent watercolor washes with light colored-pencil lines on textured paper. Warm autumn palette (persimmon orange, mustard yellow, maple red, soft olive green, clear sky blue). Light, airy, gentle mood. Simple rounded characters with small dot eyes, rosy cheeks and natural, relaxed, lively poses. Consistent character designs.`;

const AVOID = `No text, no letters, no numbers, no watermark, no signature. Not photorealistic, not 3D render.`;

const CAST = {
  nari:  { ko: '나리',  en: `NARI: 6-year-old Korean girl, straight black chin-length bob with blunt bangs, one yellow hair clip on the right side, purple tracksuit jacket and pants with white stripes down the sleeves and legs, white sneakers.` },
  sol:   { ko: '솔이',  en: `SOL: 6-year-old Korean girl, high black ponytail with a single mint-green streak, pink long-sleeve top, light sky-blue pants, white sneakers.` },
  dahong:{ ko: '다홍',  en: `DAHONG: 6-year-old Korean girl, dark brown shoulder-length hair with bangs, one red hair clip on the left side, light gray sweatshirt, red-and-navy plaid pants, navy shoes.` },
  dad:   { ko: '나리 아빠', en: `NARI'S DAD: Korean man in his 30s, green zip-up jacket, round glasses, short black hair.` },
  narimom:{ ko: '나리 엄마', en: `NARI'S MOM: Korean woman in her 30s, beige trench coat, black bob haircut.` },
  solmom:{ ko: '솔이 엄마', en: `SOL'S MOM: Korean woman in her 30s, mustard-yellow cardigan, long straight black hair, carries a big green tote bag.` },
  hongmom:{ ko: '다홍 엄마', en: `DAHONG'S MOM: Korean woman in her 30s, navy wool coat, dark brown hair in a bun.` }
};

/* size: single = 한 쪽(가로 약 10:7), spread = 펼침면(아주 긴 가로 20:7) */
const SCENES = [
  { id: 'sheet-kids', label: '먼저: 아이들 설정표', size: 'sheet', cast: ['nari', 'sol', 'dahong'],
    scene: `Character reference sheet on a plain white background. The three girls NARI, SOL and DAHONG standing side by side, each shown three times: front view, side view, back view. Neutral friendly expressions. Even spacing, full body, nothing overlapping.`,
    why: '장면을 만들기 전에 이 그림부터 뽑아요. 마음에 드는 설정표 한 장을 정한 뒤, 모든 장면에 이 이미지를 같이 첨부하면 아이들 얼굴과 옷이 장면마다 덜 달라져요.' },
  { id: 'sheet-adults', label: '먼저: 어른들 설정표', size: 'sheet', cast: ['dad', 'narimom', 'solmom', 'hongmom'],
    scene: `Character reference sheet on a plain white background. The four adults standing side by side, front view and back view, full body, calm smiles, nothing overlapping.`,
    why: '어른은 배경에 작게 나오지만, 옷 색이 바뀌면 누가 누군지 헷갈려요. 아이들 설정표와 같은 화풍으로 한 번 뽑아 두세요.' },

  { id: 'cover', label: '표지 · 앞표지 (오른쪽)', size: 'single', cast: ['sol', 'nari', 'dahong'],
    scene: `Front cover. An autumn park under a clear blue sky, red and orange trees at both edges, golden grass with fallen leaves. The three girls stand in a row in the lower half, each in a different pose: SOL (left) on tiptoe, laughing, popping a bubble with one finger; NARI (center) gently blowing through a yellow bubble wand, cheeks puffed; DAHONG (right) mid-hop, eyes closed with joy, waving a red bubble wand high. A stream of soap bubbles rises to the upper right. Keep the top third of the sky completely empty for the book title.`,
    why: '제목이 들어갈 위쪽 하늘을 비워 둬요. 세 아이의 자세를 모두 다르게 해서 표지만 봐도 성격이 보이게 했어요.' },
  { id: 'back', label: '표지 · 뒤표지 (왼쪽)', size: 'single', cast: [],
    scene: `Back cover. Plain warm cream paper background. In the center, a small open lunchbox filled with red and yellow autumn leaves, two acorns and one pinecone. A few fallen leaves scattered below, one soap bubble floating in the upper right. Very quiet, lots of empty space.`,
    why: '앞표지가 북적이니 뒤표지는 조용하게. 솔이의 \'가을 도시락\'을 미리 살짝 보여 줘요.' },
  { id: 'endpaper', label: '1쪽 왼쪽 · 면지 (선택)', size: 'single', cast: [],
    scene: `Endpaper pattern: pale mustard-yellow paper with small autumn leaves and tiny soap bubbles scattered evenly as a loose repeating pattern. No characters.`,
    why: '면지는 빈 색지만으로도 충분해요. 무늬를 넣고 싶을 때만 쓰세요.' },
  { id: 'p1', label: '1쪽 · 가을 공원에 도착', size: 'single', cast: ['nari', 'dad'],
    scene: `Wide view of an autumn park with red and yellow trees and a path curving into the distance. NARI holds her dad's hand and walks into the park along the path, seen from behind at a slight three-quarter angle, small in the frame. Fallen leaves on the path. Leave the upper sky area empty for text.`,
    why: '첫 장은 넓게 보여 줘서 \'어디에서 일어난 이야기인지\'를 알려 줘요. 길이 안쪽으로 이어져 이야기 속으로 들어가는 느낌이에요.' },
  { id: 'p2', label: '2쪽 · 우연히 만남', size: 'single', cast: ['nari', 'sol', 'dahong', 'solmom', 'hongmom'],
    scene: `In the autumn park, NARI stands in the center. From the left, SOL walks in with her mom; from the right, DAHONG walks in with her mom. All three girls are surprised and delighted: wide eyes, open mouths, pointing at each other. The moms smile in the background. Leave the upper area empty for text.`,
    why: '나리를 가운데 두고 양쪽에서 친구들이 다가오게 해서 \'우연히 마주친 순간\'을 보여 줘요.' },
  { id: 'p3', label: '3쪽 · "짜잔!" 비눗방울 세 개', size: 'single', cast: ['sol', 'nari', 'dahong', 'solmom'],
    scene: `Medium shot. SOL'S MOM proudly lifts three small bubble bottles high out of her big green tote bag ("ta-da" pose). The three girls look up at the bottles with sparkling eyes and excited smiles. Leave the lower area empty for text.`,
    why: '아래에서 위로 들어 올리는 동작이라 아이들 시선도 위로 모여요. 읽는 사람 눈도 비눗방울 통에 꽂혀요.' },
  { id: 'p4', label: '4쪽 · 셋이 함께 후—', size: 'single', cast: ['nari', 'sol', 'dahong'],
    scene: `The three girls stand side by side and blow bubbles at the same time, each with her own wand. Many bubbles stream from left to the upper right corner, filling the sky and flowing off the edge of the page. Leave the upper left area empty for text.`,
    why: '방울이 오른쪽 위로 흘러가며 페이지 밖으로 나가요. 눈이 자연스럽게 다음 쪽으로 넘어가요.' },
  { id: 'p5', label: '5쪽 · 솔이의 가을 도시락', size: 'single', cast: ['sol', 'nari', 'dahong'],
    scene: `Quiet, close scene on the grass. SOL crouches and carefully puts red and yellow leaves, acorns and a pinecone into an open lunchbox. NARI hands her a red leaf, DAHONG hands her an acorn. Soft afternoon light, calm, focused faces. Leave the top area empty for text.`,
    why: '앞쪽이 신나는 장면이었으니 여기서는 쉬어 가요. 그림책은 빠른 장면과 느린 장면이 번갈아 나와야 리듬이 생겨요.' },
  { id: 's6', label: '6–7쪽 펼침면 · 비눗방울 알사탕 제조법', size: 'spread', cast: ['nari', 'sol', 'dahong'],
    scene: `Double-page spread. LEFT HALF: a page from a child's notebook (lined paper, slightly wrinkled, taped corners) with four small step illustrations in a 2x2 grid: 1) a bubble wand dipped into bubble liquid, 2) a child blowing very gently, 3) a small bubble landing on an open palm, 4) the bubble held up to the sunlight with a rainbow shimmer. Leave the lined areas blank for handwritten text to be added later. RIGHT HALF: the three girls sit close together, each holding a tiny bubble on her palm like a candy and pretending to pop it into her mouth, playful giggling faces. Keep the vertical center line free of important details.`,
    why: '\'만드는 순서\'를 공책 한 장에 차례로 보여 줘서 놀이가 의식처럼 느껴지게 해요. 글자는 나중에 직접 넣으세요. 이미지 도구는 한글을 잘 못 써요.' },
  { id: 'p8', label: '8쪽 · 나리 엄마 합류', size: 'single', cast: ['nari', 'narimom', 'dad', 'solmom', 'hongmom'],
    scene: `NARI'S MOM walks into the park waving happily. NARI runs toward her holding a tiny bubble on her palm. In the background, the other adults sit small on a park bench. Leave the upper area empty for text.`,
    why: '이야기 중간에 새 인물이 들어오는 장면이에요. 나머지 어른은 뒤쪽에 작게 두어 아이들이 계속 주인공이게 해요.' },
  { id: 'p9', label: '9쪽 · "저기 그네다!"', size: 'single', cast: ['nari', 'sol', 'dahong'],
    scene: `The three girls run together from left to right toward a swing set visible far away on the right side. Strong sense of motion: hair flying, legs mid-stride, leaves swirling behind them. Leave the upper left area empty for text.`,
    why: '아이들이 오른쪽으로 달려가요. 오른쪽은 책장을 넘기는 방향이라 \'빨리 다음 장을 보고 싶게\' 만들어요.' },
  { id: 'p10', label: '10쪽 · 밀고, 타고, 불고', size: 'single', cast: ['nari', 'sol', 'dahong'],
    scene: `Wide shot of the whole swing set in the autumn park. DAHONG pushes the swing from behind, SOL rides the swing, NARI stands to the side blowing bubbles toward SOL. The three girls form a triangle composition. Leave the upper area empty for text.`,
    why: '세 아이가 각자 다른 일을 하는 장면이라 삼각형으로 배치했어요. 셋이 한눈에 보이고 서로 이어져 보여요.' },
  { id: 'p11', label: '11쪽 · "잡았다!"', size: 'single', cast: ['sol'],
    scene: `Close-up from a low angle. SOL on the swing at the very top of the arc against the bright blue sky, ponytail flying, laughing, reaching out one hand to pop a bubble. Small sparkle where the bubble pops. Leave one corner of the sky empty for text.`,
    why: '앞 장의 넓은 그림 다음에 한 아이를 크게 당겨요. 멀리서 보다가 가까이 다가가는 \'줌인\'이라 순간이 짜릿해져요.' },
  { id: 's12', label: '12–13쪽 펼침면 · 파란 하늘 (절정)', size: 'spread', cast: ['sol', 'nari', 'dahong', 'dad', 'narimom', 'solmom', 'hongmom'],
    scene: `Double-page spread, the climax. Almost the entire image is a vast, clear blue autumn sky filled with soap bubbles of all sizes rising from the lower left toward the upper right, getting bigger as they rise. At the very bottom, a thin strip of golden grass and soft distant autumn trees. The three girls are tiny, seen from behind at the lower left, standing side by side holding hands and looking up. The adults are very small on a bench far to the right. Keep the vertical center line free of characters. Leave the upper left sky empty for text.`,
    why: '아이들은 아주 작게, 하늘은 아주 크게. 뒷모습이라 읽는 사람이 아이들 뒤에 서서 함께 올려다보는 기분이 들어요.' },
  { id: 'p14', label: '14쪽 · 하품이 옮아요', size: 'single', cast: ['sol', 'nari', 'dahong', 'dad', 'narimom', 'solmom', 'hongmom'],
    scene: `Sunset, warm orange sky. SOL yawns widely first, then NARI and DAHONG yawn too, rubbing their eyes. Each girl leans against her own family; the families are gathering to go home. Sleepy, cozy mood. Leave the upper area empty for text.`,
    why: '하늘색을 파랑에서 주황으로 바꿔 하루가 끝나 감을 알려 줘요. 집에 가자는 말이 졸린 아이에게서 나오는 게 이 이야기의 포인트예요.' },
  { id: 'p15', label: '15쪽 · "내일 또 만나!" (끝)', size: 'single', cast: ['sol', 'nari', 'dahong', 'dad', 'narimom', 'solmom', 'hongmom'],
    scene: `Evening in the park. The three girls wave goodbye to each other as they walk away in different directions with their families, small in the frame. High in the soft evening sky, one last soap bubble still floats. Calm, warm ending. Leave the upper area around the bubble mostly empty for text.`,
    why: '마지막 비눗방울 하나를 하늘에 남겨 두면, 이야기가 끝나도 여운이 남아요.' }
];

const SIZE = {
  sheet: { ko: '가로 3:2', en: 'Wide landscape format (3:2).' },
  single: { ko: '가로 약 10:7 (3:2로 만들어도 괜찮아요)', en: 'Landscape format, about 10:7 (3:2 is fine).' },
  spread: { ko: '아주 긴 가로 20:7 (안 되면 16:9로 만든 뒤 양옆을 늘리기)', en: 'Very wide panoramic double-page spread, 20:7 (or 16:9).' }
};

function buildPrompt(sc) {
  const who = sc.cast.map(c => CAST[c].en).join('\n');
  return [STYLE, who, sc.scene, SIZE[sc.size].en, AVOID].filter(Boolean).join('\n\n');
}
if (typeof module !== 'undefined') module.exports = { STYLE, AVOID, CAST, SCENES, SIZE, buildPrompt };
