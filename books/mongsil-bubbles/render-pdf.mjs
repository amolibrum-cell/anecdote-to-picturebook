// index.html을 PDF 두 개(한 장 요약, 크게 보기)로 만듭니다.
// 사용법: 이 폴더에서 `node render-pdf.mjs`
//   - Playwright가 필요합니다. 전역 설치라면 PLAYWRIGHT_MODULE에 index.mjs 경로를 지정하세요.
//   - 손글씨 글꼴(Gaegu, Gowun Dodum)을 내려받아 fonts/abs.css로 두면 그 글꼴을 씁니다.
//     없으면 Google Fonts에서 직접 불러옵니다.
import { existsSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const localFonts = existsSync('fonts/abs.css');
const b = await chromium.launch(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {});
async function open(vp){
  const pg = await b.newPage({colorScheme:'light',viewport:vp});
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  if(localFonts) await pg.route('https://fonts.googleapis.com/**', r=>r.abort());
  await pg.goto('file://'+process.cwd()+'/index.html');
  if(localFonts) await pg.addStyleTag({path:'fonts/abs.css'});
  await pg.evaluate(async()=>{await document.fonts.load('700 20px Gaegu','몽실');await document.fonts.load('20px "Gowun Dodum"','그림책');await document.fonts.ready});
  pg.errs=errs;return pg;
}
const common=`html,body{background:#fff!important}.tabs,#v-flip,#v-cast,.tip{display:none!important}#v-grid{display:block!important}
.wrap{max-width:none;padding:0}.spreadbox{box-shadow:none;outline:.3mm solid #aaa}.cell{break-inside:avoid}`;
// 1) one sheet, A4 landscape, 3x3
let pg=await open({width:1100,height:800});
await pg.addStyleTag({content:common+`@page{size:A4 landscape;margin:7mm 8mm}
header{display:flex;align-items:baseline;gap:4mm;margin-bottom:2mm}header h1{font-size:18pt}header p{font-size:9pt;margin:0}
.grid{grid-template-columns:repeat(3,1fr);gap:2mm 5mm;align-items:start}.row .lab{margin-bottom:.6mm}
.row .lab{font-size:9pt;margin-bottom:1mm}.cap{margin-top:1.2mm;font-size:10.5pt;line-height:1.25}.cap p{margin:0 0 .8mm}.cap b{font-size:7.5pt}`});
await pg.waitForTimeout(500);
await pg.pdf({path:'storyboard-one-sheet.pdf',preferCSSPageSize:true,printBackground:true});
// 2) large: one spread per A4 landscape page, with composition note
pg=await open({width:1100,height:800});
await pg.addStyleTag({content:common+`@page{size:A4 landscape;margin:10mm}
header{display:none}.grid{grid-template-columns:1fr;gap:0}
.cell{break-after:page}.row .lab{font-size:14pt;font-family:Gaegu;font-weight:700;color:#22303b}
.rmemo{display:block;margin-top:5mm;font-size:11pt;color:#444;line-height:1.5}`});
await pg.waitForTimeout(500);
await pg.pdf({path:'storyboard-large.pdf',preferCSSPageSize:true,printBackground:true});
await b.close();
