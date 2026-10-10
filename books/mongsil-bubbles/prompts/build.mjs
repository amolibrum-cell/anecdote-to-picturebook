// prompts-data.js로 프롬프트 페이지(prompts.html)와 글 파일(prompts.md)을 만듭니다.  사용법: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const data = readFileSync('prompts-data.js', 'utf8');
writeFileSync('prompts.html', readFileSync('prompts.src.html', 'utf8').replace('/*DATA*/', () => data));
const { SCENES, SIZE, buildPrompt } = createRequire(import.meta.url)('./prompts-data.js');
let md = '# 몽실몽실 비눗방울 — 이미지 생성 프롬프트\n\n설정표 두 장을 먼저 만들고, 장면마다 그 그림을 함께 첨부해 쓰세요. 글자는 그림에 넣지 않고 나중에 얹습니다.\n';
for (const sc of SCENES) md += `\n## ${sc.label}\n\n- 비율: ${SIZE[sc.size].ko}\n- 구성 의도: ${sc.why}\n\n\`\`\`text\n${buildPrompt(sc)}\n\`\`\`\n`;
writeFileSync('prompts.md', md);
