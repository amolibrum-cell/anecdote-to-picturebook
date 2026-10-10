// art.js + scenes.js 를 페이지 안에 넣어 파일 하나로 만듭니다.  사용법: node build.mjs sample.src.html style-sample.html
import { readFileSync, writeFileSync } from 'node:fs';
const [src, out] = process.argv.slice(2);
const js = readFileSync('art.js', 'utf8') + '\n' + readFileSync('scenes.js', 'utf8');
writeFileSync(out, readFileSync(src, 'utf8').replace('/*ART*/', () => js));
