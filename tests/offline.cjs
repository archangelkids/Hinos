const {chromium}=require('playwright');
const assert=require('assert'),path=require('path');
(async()=>{const browser=await chromium.launch({...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{}),headless:true});const context=await browser.newContext({viewport:{width:412,height:915},offline:true});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('app/src/main/assets/index.html').replaceAll('\\','/'));
assert(await p.locator('#selectionView').isVisible());
await p.locator('[data-book=louvai]').click();assert.equal(await p.locator('.hymn-row').count(),180);
await p.evaluate(()=>openHymn(1));await p.locator('#favoriteBtn').click();await p.locator('#todayBtn').click();await p.locator('#editBtn').click();await p.locator('#editTitle').fill('Título de teste');await p.locator('#editLyrics').fill('Letra de teste\n\nSegunda estrofe');await p.getByRole('button',{name:'Revisar alteração',exact:true}).click();await p.getByRole('button',{name:'Confirmar e salvar',exact:true}).click();
assert.equal(await p.locator('#hymnTitle').innerText(),'Título de teste');await p.evaluate(()=>window.handleAndroidBack());await p.locator('#categoriesBtn').click();await p.locator('#addCategoryBtn').click();await p.locator('#catName').fill('Batismo');await p.getByRole('button',{name:'Adicionar',exact:true}).click();assert((await p.locator('#categoryList').innerText()).includes('Batismo'));
await p.evaluate(()=>selection());await p.locator('[data-book=cantor]').click();assert.equal(await p.locator('.hymn-row').count(),578);await p.evaluate(()=>openHymn(239));await p.locator('#nextBtn').click();assert.equal(await p.locator('#hymnNumber').innerText(),'HINO 241');await p.locator('#prevBtn').click();assert.equal(await p.locator('#hymnNumber').innerText(),'HINO 239');await p.evaluate(()=>openHymn(1));assert.notEqual(await p.locator('#hymnTitle').innerText(),'Título de teste');assert.equal(await p.locator('#favoriteBtn').innerText(),'☆');
await p.evaluate(()=>goHome(true));await p.locator('[data-list=favorites]').click();assert.equal(await p.locator('.hymn-row').count(),0);await p.locator('#selectionBtn').click();await p.locator('[data-book=louvai]').click();await p.locator('[data-list=favorites]').click();assert.equal(await p.locator('.hymn-row').count(),1);await p.locator('.hymn-row').click();assert.equal(await p.locator('#hymnTitle').innerText(),'Título de teste');await p.locator('#fontUp').click();await p.locator('#themeBtn').click();await p.reload();assert(await p.locator('#selectionView').isVisible());assert(await p.locator('body').evaluate(x=>x.classList.contains('dark')));await p.locator('[data-book=louvai]').click();await p.evaluate(()=>openHymn(1));assert.equal(await p.locator('#fontLabel').innerText(),'110%');assert.equal(await p.locator('#hymnTitle').innerText(),'Título de teste');
await p.evaluate(()=>goHome(true));await p.locator('#searchInput').fill('Antífona');assert.equal(await p.locator('.hymn-row').count(),0);await p.evaluate(()=>selection());await p.locator('[data-book=cantor]').click();await p.locator('#searchInput').fill('Antífona');assert((await p.locator('.hymn-row').count())>0);await p.locator('.hymn-row').first().click();
// Verify every new hymnal in the same offline session, including scoped persistence.
await p.evaluate(()=>selection());
assert.equal(await p.locator('[data-book]').count(),5);
assert.equal(await p.locator('#selectionView h1').innerText(),'Escolha o hinário');
for (const [key,count] of [['harpa',524],['metrosul',105],['canta',48]]) {
 await p.locator(`[data-book=${key}]`).click();
 assert.equal(await p.locator('.hymn-row').count(),count,key);
 await p.evaluate(()=>openHymn(1));
 assert.equal(await p.locator('#favoriteBtn').innerText(),'☆',key+' isolated favorites');
 await p.locator('#favoriteBtn').click();await p.locator('#todayBtn').click();
 const originalTitle=await p.locator('#hymnTitle').innerText();
 await p.locator('#editBtn').click();await p.locator('#editTitle').fill('Teste '+key);await p.locator('#editLyrics').fill('Letra editada '+key);
 await p.getByRole('button',{name:'Revisar alteração',exact:true}).click();await p.getByRole('button',{name:'Confirmar e salvar',exact:true}).click();
 assert.equal(await p.locator('#hymnTitle').innerText(),'Teste '+key);
 await p.evaluate(()=>goHome(true));await p.locator('[data-list=today]').click();assert.equal(await p.locator('.hymn-row').count(),1);
 await p.evaluate(()=>selection());await p.locator(`[data-book=${key}]`).click();await p.locator('[data-list=favorites]').click();assert.equal(await p.locator('.hymn-row').count(),1);await p.locator('.hymn-row').click();
 assert.equal(await p.locator('#hymnTitle').innerText(),'Teste '+key);
 await p.locator('#editBtn').click();await p.getByRole('button',{name:'Restaurar original',exact:true}).click();await p.getByRole('button',{name:'Confirmar',exact:true}).click();assert.equal(await p.locator('#hymnTitle').innerText(),originalTitle);
 await p.evaluate(()=>selection());
}
await p.locator('[data-book=harpa]').click();
for(const n of [117,136,212,524]) {await p.evaluate(n=>openHymn(n),n);assert.equal(await p.locator('#hymnNumber').innerText(),'HINO '+n);}
await p.evaluate(()=>openHymn(200));assert((await p.locator('#lyrics').innerText()).includes('Versão 2'));
await p.evaluate(()=>selection());await p.locator('[data-book=metrosul]').click();await p.locator('#searchInput').fill('Isaias');assert((await p.locator('.hymn-row').count())>=1);await p.locator('.hymn-row').first().click();assert.equal(await p.locator('#hymnNumber').innerText(),'HINO 1');
await p.evaluate(()=>selection());await p.locator('[data-book=canta]').click();assert(await p.locator('#bookNotice').isVisible());
await p.locator('#searchInput').fill('Adoro um Cristo');assert((await p.locator('.hymn-row').count())>=1);await p.locator('.hymn-row').first().click();
assert.equal(await p.locator('#hymnNumber').innerText(),'PÁGINA DO PDF 4');
await p.waitForFunction(()=>document.getElementById('scanImage').complete&&document.getElementById('scanImage').naturalWidth>0);
assert(!(await p.locator('#lyrics').isVisible()));
await p.locator('#fontUp').click();assert.equal(await p.locator('#fontLabel').innerText(),'125% imagem');
await p.locator('#fullPageBtn').click();await p.waitForFunction(()=>document.getElementById('scanImage').complete&&document.getElementById('scanImage').naturalWidth>0);assert((await p.locator('#scanImage').getAttribute('src')).includes('completa'));
await p.locator('#fullPageBtn').click();
await p.locator('.ocr-details summary').click();assert(await p.locator('.ocr-text').isVisible());
await p.locator('#nextBtn').click();assert.equal(await p.locator('#hymnNumber').innerText(),'PÁGINA DO PDF 5');await p.locator('#prevBtn').click();assert.equal(await p.locator('#hymnNumber').innerText(),'PÁGINA DO PDF 4');
// All original-page images must be available without the network.
const imgFailures=await p.evaluate(async()=>{const records=window.HYMN_BOOKS.canta.hymns;const bad=[];for(const h of records){for(const src of [h.scan,h.fullScan]){await new Promise(resolve=>{const i=new Image();i.onload=resolve;i.onerror=()=>{bad.push(src);resolve()};i.src=src})}}return bad});assert.deepEqual(imgFailures,[]);
if(process.env.SCREENSHOT_DIR){const fs=require('fs');fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await p.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'canta-leitura.png')});}
await p.reload();assert(await p.locator('#selectionView').isVisible());assert.equal(await p.locator('[data-book]').count(),5);
if(process.env.SCREENSHOT_DIR)await p.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'cinco-hinarios.png')});
assert.equal(errors.length,0,errors.join('\n'));await browser.close();console.log('PASS: five hymnals, Harpa 524, Metrosul 105, Canta 48 scans and 96 offline images, OCR search, image zoom, original number checks, scoped edits/favorites/today, plus offline, selection/reload, 180/578, scope, isolated favorites/edits/categories, today, original gaps navigation, theme/font persistence, Android back callback.');})().catch(e=>{console.error(e);process.exit(1)});
