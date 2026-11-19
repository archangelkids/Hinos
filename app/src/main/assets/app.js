const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
let selectedBook=null;
const unit=(n)=>`hino${n===1?'':'s'}`;

let originals=[], hymns=[], active=null, listMode='all';
let sequenceMode=store.get('sequenceMode',false), segmentIndex=0;
let favorites=store.get('favorites',[]), recent=store.get('recent',[]), today=store.get('today',[]);
let edits=store.get('edits',{}), customAssignments=store.get('assignments',{});
let categoryNames=store.get('categoryNames',[]), fontScale=store.get('fontScale',1);

const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const unique=a=>[...new Set(a)];
function currentCategories(h){return customAssignments[h.number]??[]}
function currentBookEntries(){return Object.entries(window.HYMN_BOOKS).filter(([k])=>window.HYMN_BOOKS[k].kind!=='pages')}
function orderedBookEntries(){const entries=currentBookEntries(),preferred=store.get('initialBook','louvai');return entries.sort(([a],[b])=>a===preferred?-1:b===preferred?1:0)}
function bookSet(k,v){store.set(['fontScale'].includes(k)?k:selectedBook+':'+k,v)}
function loadBookState(){
 const read=(k,d)=>store.get(selectedBook+':'+k,selectedBook==='louvai'?store.get(k,d):d);
 favorites=read('favorites',[]);recent=read('recent',[]);today=read('today',[]);edits=read('edits',{});customAssignments=read('assignments',{});categoryNames=read('categoryNames',[]);
}
function chooseBook(key){
 const book=window.HYMN_BOOKS[key];if(!book)return;
 selectedBook=key;originals=book.hymns;loadBookState();hydrate();
 $('.brand').textContent=book.name;$('#homeView .hero h1').textContent=book.name;
 $('#bookDescription').textContent='Encontre rapidamente um hino pelo número, nome ou trecho da letra.';
 $('#bookNotice').textContent=book.notice||'';$('#bookNotice').classList.toggle('hidden',!book.notice);
 $('#searchInput').placeholder='Número, nome ou trecho...';$('#fontDown').textContent='A−';$('#fontUp').textContent='A+';
 $('#editBtn').textContent='Editar título e letra';$('#hymnCategoriesBtn').textContent='Categorias deste hino';$('#favoriteBtn').setAttribute('aria-label','Favoritar');
 goHome(true);
 populateFilters();
}
function selection(){listMode='all';$('#searchInput').value='';selectedBook=null;active=null;hymns=[];closeModal();document.body.classList.remove('reading');$('.brand').textContent='Hinários offline';show('#selectionView')}
function persist(){bookSet('favorites',favorites);bookSet('recent',recent);bookSet('today',today);bookSet('edits',edits);bookSet('assignments',customAssignments);bookSet('categoryNames',categoryNames);bookSet('fontScale',fontScale)}
function hydrate(){hymns=originals.map(h=>({...h,...(edits[h.number]||{}),categories:[]}))}
async function boot(){
  applyVisualSettings();
  document.documentElement.style.setProperty('--font-scale',fontScale);
  bind(); selection();
}
function bind(){
 $('#bookChoices').innerHTML=orderedBookEntries().map(([key,b])=>`<button class="book-choice" data-book="${key}"><strong>${escapeHtml(b.name)}</strong><span>${b.hymns.length} hinos</span></button>`).join('');
 $$('[data-book]').forEach(b=>b.onclick=()=>chooseBook(b.dataset.book));
 $('#selectionBtn').onclick=selection;
  $('#searchInput').addEventListener('input',()=>{listMode='search';renderList()});
  $$('.quick-grid [data-list]').forEach(b=>b.onclick=()=>{listMode=b.dataset.list;$('#searchInput').value='';renderList()});
  $('#categoriesBtn').onclick=showCategories; $('#backBtn').onclick=handleInternalBack;
  $('#themeBtn').onclick=toggleDark; $('#settingsQuickBtn').onclick=showSettings; $('#settingsBtn').onclick=showSettings;
  $('#favoriteBtn').onclick=toggleFavorite; $('#todayBtn').onclick=toggleToday;
  $('#prevBtn').onclick=()=>move(-1); $('#nextBtn').onclick=()=>move(1);
  $('#fontDown').onclick=()=>setFont(-.1); $('#fontUp').onclick=()=>setFont(.1);
  $('#readingBtn').onclick=()=>document.body.classList.add('reading');
  $('#lyrics').onclick=()=>document.body.classList.remove('reading');
  $('#editBtn').onclick=openEditor; $('#hymnCategoriesBtn').onclick=openHymnCategories;
  $('#addCategoryBtn').onclick=addCategory;
  $('#scopeFilter').onchange=applyFilterControls;$('#categoryFilter').onchange=()=>{listMode='category';renderList()};$('#numberFilter').oninput=()=>{listMode='number';renderList()};
  $('#bookFilter').onchange=()=>chooseBook($('#bookFilter').value);
  $('#sequenceBtn').onclick=toggleSequence;
  $('#darkSetting').onchange=toggleDark;$('#contrastSetting').onchange=()=>{document.body.classList.toggle('high-contrast',$('#contrastSetting').checked);store.set('contrast', $('#contrastSetting').checked)};
  $('#sansSetting').onchange=()=>{document.body.classList.toggle('sans',$('#sansSetting').checked);store.set('sans',$('#sansSetting').checked)};
  $('#fontScaleSelect').onchange=()=>{fontScale=+$('#fontScaleSelect').value;store.set('fontScale',fontScale);updateFont()};
  $('#initialBookSelect').onchange=()=>store.set('initialBook',$('#initialBookSelect').value);
  $('#exportBtn').onclick=exportBackup;$('#importBtn').onclick=()=>$('#importFile').click();$('#importFile').onchange=importBackup;$('#resetBtn').onclick=resetVisualSettings;
}
function show(view){$$('.view').forEach(v=>v.classList.add('hidden'));$(view).classList.remove('hidden');$('#backBtn').classList.toggle('hidden',view==='#selectionView');window.scrollTo(0,0)}
function currentView(){return $('.view:not(.hidden)')?.id||'homeView'}
function goHome(resetList=false){document.body.classList.remove('reading');active=null;if(resetList){listMode='all';$('#searchInput').value=''}show('#homeView');renderList()}
function populateFilters(){
 const opts=currentBookEntries().map(([k,b])=>`<option value="${k}">${escapeHtml(b.name)}</option>`).join('');
 $('#bookFilter').innerHTML=opts;$('#bookFilter').value=selectedBook;
 $('#initialBookSelect').innerHTML=opts;$('#initialBookSelect').value=store.get('initialBook','louvai');
 $('#categoryFilter').innerHTML='<option value="">Escolha uma categoria</option>'+categoryNames.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('');
}
function applyVisualSettings(){document.body.classList.toggle('dark',store.get('dark',false));document.body.classList.toggle('high-contrast',store.get('contrast',false));document.body.classList.toggle('sans',store.get('sans',false));fontScale=store.get('fontScale',1)}
function toggleDark(){const on=!document.body.classList.contains('dark');document.body.classList.toggle('dark',on);store.set('dark',on);if($('#darkSetting'))$('#darkSetting').checked=on}
function showSettings(){populateFilters();$('#darkSetting').checked=document.body.classList.contains('dark');$('#contrastSetting').checked=document.body.classList.contains('high-contrast');$('#sansSetting').checked=document.body.classList.contains('sans');$('#fontScaleSelect').value=String(fontScale);$('#versionInfo').textContent='Hinários offline · versão 12.0';show('#settingsView')}
function resetVisualSettings(){store.set('dark',false);store.set('contrast',false);store.set('sans',false);store.set('fontScale',1);applyVisualSettings();showSettings()}
function exportBackup(){const payload={version:1,exportedAt:new Date().toISOString(),books:{}};for(const [key] of currentBookEntries()){payload.books[key]={favorites:store.get(key+':favorites',key==='louvai'?store.get('favorites',[]):[]),today:store.get(key+':today',[]),recent:store.get(key+':recent',[]),edits:store.get(key+':edits',{}),assignments:store.get(key+':assignments',{}),categoryNames:store.get(key+':categoryNames',[])}}const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hinarios-backup.json';a.click();URL.revokeObjectURL(a.href)}
function importBackup(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const p=JSON.parse(reader.result);Object.entries(p.books||{}).forEach(([key,v])=>Object.entries(v).forEach(([k,val])=>store.set(key+':'+k,val)));alert('Backup importado. Escolha o hinário novamente para carregar os dados.');if(selectedBook)chooseBook(selectedBook)}catch{alert('Arquivo de backup inválido.')}};reader.readAsText(file)}
function filterState(){const scope=$('#scopeFilter').value;if(scope==='favorites'||scope==='today'||scope==='recent')listMode=scope;else if(scope==='category')listMode='cat:'+$('#categoryFilter').value;else if(scope==='number')listMode='number';else listMode='all';renderList()}
function applyFilterControls(){const s=$('#scopeFilter').value;$('#categoryFilter').classList.toggle('hidden',s!=='category');$('#numberFilter').classList.toggle('hidden',s!=='number');filterState()}
function handleInternalBack(){
  if(!$('#modal').classList.contains('hidden')){closeModal();return true}
  if(document.body.classList.contains('reading')){document.body.classList.remove('reading');return true}
  if(currentView()==='detailView'||currentView()==='categoriesView'){goHome(false);return true}
  if(currentView()==='settingsView'){if(selectedBook)goHome(false);else selection();return true}
  if(listMode!=='all'||$('#searchInput').value){goHome(true);return true}
  if(selectedBook){selection();return true}
  return false
}
window.handleAndroidBack=()=>handleInternalBack()?'handled':'home';
function filtered(){
  const q=norm($('#searchInput').value.trim()); let nums=null, title='Todos os hinos';
  if(listMode==='favorites'){nums=favorites;title='Favoritos'}
  if(listMode==='recent'){nums=recent;title='Recentes'}
  if(listMode==='today'){nums=today;title='Culto de Hoje'}
  if(listMode.startsWith('cat:')){const c=listMode.slice(4);nums=hymns.filter(h=>currentCategories(h).includes(c)).map(h=>h.number);title=c}
  if(listMode==='number'){const n=String($('#numberFilter').value||'').trim();nums=n?[+n]:[];title=`Número ${n||'exato'}`}
  let rows=nums?nums.map(n=>hymns.find(h=>h.number===n)).filter(Boolean):hymns;
  if(q)rows=rows.filter(h=>String(h.number)===q||norm(`${h.number} ${h.title} ${h.lyrics}`).includes(q));
  return {rows,title:q?'Resultados da busca':title}
}
function renderList(){
  show('#homeView'); const {rows,title}=filtered(); $('#listTitle').textContent=title;$('#count').textContent=`${rows.length} ${unit(rows.length)}`;
  $('#searchInfo').textContent=$('#searchInput').value?`${rows.length} resultado${rows.length===1?'':'s'}`:`${hymns.length} ${unit(hymns.length)} disponíveis offline`;
  $('#hymnList').innerHTML=rows.length?rows.map(h=>{const term=$('#searchInput').value.trim();const excerpt=term?findExcerpt(h,term):'';return `<button class="hymn-row" data-n="${h.number}" aria-label="${escapeAttr(`${h.number} ${h.title}`)}"><span class="number">${h.number}</span><span><span class="name">${highlight(h.title,term)}</span>${excerpt?`<span class="excerpt">${highlight(excerpt,term)}</span>`:''}<span class="cats">${escapeHtml(currentCategories(h).join(' · ')||'Sem categoria')}</span></span><span class="fav" aria-label="${favorites.includes(h.number)?'Favorito':''}">${favorites.includes(h.number)?'★':''}</span></button>`}).join(''):'<div class="empty">Nenhum resultado encontrado.</div>';
  $$('.hymn-row').forEach(b=>b.onclick=()=>openHymn(+b.dataset.n));
}
function openHymn(n){
  active=hymns.find(h=>h.number===n); if(!active)return; segmentIndex=0; recent=[n,...recent.filter(x=>x!==n)].slice(0,20);persist();
  $('#hymnNumber').textContent=`HINO ${n}`;$('#hymnTitle').textContent=active.title;renderContent();
  $('#favoriteBtn').textContent=favorites.includes(n)?'★':'☆';$('#todayBtn').textContent=today.includes(n)?'Remover do Culto de Hoje':'Adicionar ao Culto de Hoje';
  $('#prevBtn').disabled=!sequenceMode&&active===hymns[0];$('#nextBtn').disabled=!sequenceMode&&active===hymns[hymns.length-1];updateSequenceUi();updateFont();show('#detailView');
}
function segments(h){let stanza=0;return String(h.lyrics||'').split(/\n\s*\n/).filter(Boolean).map(text=>{const kind=/^(coro|cor[oô]:|estribilho)/i.test(text.trim())?'Coro':`Estrofe ${++stanza}`;return {text,kind}})}
function move(delta){if(!active)return;if(sequenceMode){const parts=segments(active);const next=segmentIndex+delta;if(next>=0&&next<parts.length){segmentIndex=next;renderContent();updateSequenceUi();return}}const i=hymns.indexOf(active);openHymn(hymns[i+delta]?.number)}
function toggleSequence(){sequenceMode=!sequenceMode;store.set('sequenceMode',sequenceMode);segmentIndex=0;renderContent();updateSequenceUi()}
function updateSequenceUi(){if(!$('#sequenceBtn'))return;$('#sequenceBtn').setAttribute('aria-pressed',String(sequenceMode));$('#sequenceBtn').textContent=`Avanço por estrofe e coro: ${sequenceMode?'ativado':'desativado'}`;const parts=active?segments(active):[];$('#sequenceInfo').textContent=sequenceMode&&parts.length?`${parts[segmentIndex].kind} ${segmentIndex+1} de ${parts.length}`:'';if(sequenceMode){$('#prevBtn').disabled=segmentIndex===0;$('#nextBtn').disabled=segmentIndex===parts.length-1}}
function toggleFavorite(){const n=active.number;favorites=favorites.includes(n)?favorites.filter(x=>x!==n):[...favorites,n];persist();openHymn(n)}
function toggleToday(){const n=active.number;today=today.includes(n)?today.filter(x=>x!==n):[...today,n];persist();openHymn(n)}
function setFont(delta){fontScale=Math.min(1.8,Math.max(.8,Math.round((fontScale+delta)*10)/10));persist();updateFont()}
function updateFont(){document.documentElement.style.setProperty('--font-scale',fontScale);$('#fontLabel').textContent=`${Math.round(fontScale*100)}%`}
function renderContent(){
 $('#sourceNote').textContent=active.sourceNote||'';$('#sourceNote').classList.toggle('hidden',!active.sourceNote);const part=sequenceMode?segments(active)[segmentIndex]:null;$('#lyrics').innerHTML=part?formatLyrics(part.text,part.kind):formatLyrics(active.lyrics);
}
function openEditor(){
  modal('Editar hino',`<label>Título</label><input id="editTitle" type="text" value="${escapeAttr(active.title)}"><label>Letra</label><textarea id="editLyrics">${escapeHtml(active.lyrics)}</textarea>`,[
    ['Cancelar',closeModal],['Restaurar original',()=>confirmAction('Restaurar texto original?',()=>{delete edits[active.number];persist();hydrate();closeModal();openHymn(active.number)})],['Revisar alteração',reviewEdit,'primary']]);
}
function reviewEdit(){const title=$('#editTitle').value.trim(),lyrics=$('#editLyrics').value.trim();if(!title||!lyrics)return alert('Preencha o título e a letra.');modal('Confirmar alteração',`<p>Revise antes de salvar:</p><div class="card" style="padding:12px"><strong>${escapeHtml(title)}</strong><pre style="white-space:pre-wrap">${escapeHtml(lyrics)}</pre></div>`,[['Voltar',openEditor],['Confirmar e salvar',()=>{edits[active.number]={title,lyrics};persist();hydrate();closeModal();openHymn(active.number)},'primary']])}
function showCategories(){renderCategories();show('#categoriesView')}
function renderCategories(){
  $('#categoryList').innerHTML=categoryNames.length?categoryNames.map(c=>{const count=hymns.filter(h=>currentCategories(h).includes(c)).length;return `<div class="category-row"><button class="cat-main" data-open="${escapeAttr(c)}"><strong>${escapeHtml(c)}</strong><small>${count} ${unit(count)}</small></button><button class="mini" data-ren="${escapeAttr(c)}">Renomear</button><button class="mini" data-del="${escapeAttr(c)}">Excluir</button></div>`}).join(''):'<div class="empty">Nenhuma categoria criada. Toque em “+ Nova” para começar.</div>';
  $$('[data-open]').forEach(b=>b.onclick=()=>{listMode='cat:'+b.dataset.open;$('#searchInput').value='';renderList()});
  $$('[data-ren]').forEach(b=>b.onclick=()=>renameCategory(b.dataset.ren));$$('[data-del]').forEach(b=>b.onclick=()=>deleteCategory(b.dataset.del));
}
function addCategory(){modal('Nova categoria','<label>Nome</label><input id="catName" type="text" placeholder="Ex.: Batismo">',[['Cancelar',closeModal],['Adicionar',()=>{const n=$('#catName').value.trim();if(n&&!categoryNames.includes(n)){categoryNames.push(n);categoryNames.sort((a,b)=>a.localeCompare(b,'pt-BR'));persist();closeModal();renderCategories()}},'primary']])}
function renameCategory(old){modal('Renomear categoria',`<label>Novo nome</label><input id="catName" type="text" value="${escapeAttr(old)}">`,[['Cancelar',closeModal],['Salvar',()=>{const n=$('#catName').value.trim();if(!n)return;categoryNames=categoryNames.map(c=>c===old?n:c);hymns.forEach(h=>{const cats=currentCategories(h);if(cats.includes(old))customAssignments[h.number]=unique(cats.map(c=>c===old?n:c))});persist();closeModal();renderCategories()},'primary']])}
function deleteCategory(c){confirmAction(`Excluir a categoria “${c}”?`,()=>{categoryNames=categoryNames.filter(x=>x!==c);hymns.forEach(h=>{if(currentCategories(h).includes(c))customAssignments[h.number]=currentCategories(h).filter(x=>x!==c)});persist();closeModal();renderCategories()})}
function openHymnCategories(){const chosen=currentCategories(active);const body=categoryNames.length?`<div class="check-list">${categoryNames.map(c=>`<label><input type="checkbox" value="${escapeAttr(c)}" ${chosen.includes(c)?'checked':''}> ${escapeHtml(c)}</label>`).join('')}</div>`:'<div class="empty">Nenhuma categoria criada. Crie categorias na tela Categorias.</div>';modal('Categorias deste hino',body,[['Cancelar',closeModal],['Salvar',()=>{customAssignments[active.number]=[...$('#modalBody').querySelectorAll('input:checked')].map(x=>x.value);persist();closeModal();openHymn(active.number)},'primary']])}
function modal(title,body,actions){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modalActions').innerHTML='';actions.forEach(([label,fn,cls])=>{const b=document.createElement('button');b.textContent=label;if(cls)b.classList.add(cls);b.onclick=fn;$('#modalActions').appendChild(b)});$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden')}
function confirmAction(text,fn){modal('Confirmação',`<p>${escapeHtml(text)}</p>`,[['Cancelar',closeModal],['Confirmar',fn,'primary']])}
function formatLyrics(text,forcedKind=''){return String(text).split(/\n\s*\n/).map(block=>{const clean=block.trim();const chorus=forcedKind==='Coro'||/^(coro|cor[oô]:|estribilho)/i.test(clean);const body=clean.replace(/^coro\s*:\s*/i,'');const lines=body.split(/\n/).map(line=>{const m=line.match(/^(.*?)(\s*\((?:[^)]*[-–]\s*[MHBT])\))$/i);if(!m)return escapeHtml(line);return `${escapeHtml(m[1])}<span class="voice-line"><span class="voice-tag">${escapeHtml(m[2])}</span></span>`}).join('<br>');return `<div class="${chorus?'chorus-block':'stanza'}" role="${chorus?'region':'article'}" aria-label="${chorus?'Coro':'Estrofe'}">${chorus?'<div class="chorus-label">CORO</div>':''}${lines}</div>`}).join('')}
function highlight(text,term){const safe=escapeHtml(text);if(!term)return safe;const re=new RegExp(escapeRegExp(term),'ig');return safe.replace(re,m=>`<mark>${m}</mark>`)}
function findExcerpt(h,term){const raw=String(h.lyrics||'').replace(/\s+/g,' ');const i=norm(raw).indexOf(norm(term));if(i<0)return '';return raw.slice(Math.max(0,i-45),Math.min(raw.length,i+110))}
function escapeRegExp(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function escapeHtml(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/"/g,'&quot;')}
boot().catch(e=>{$('#hymnList').innerHTML=`<div class="empty">Não foi possível carregar o hinário: ${escapeHtml(e.message)}</div>`});

