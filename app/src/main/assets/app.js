const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
let originals=[], hymns=[], active=null, listMode='all';
let favorites=store.get('favorites',[]), recent=store.get('recent',[]), today=store.get('today',[]);
let edits=store.get('edits',{}), customAssignments=store.get('assignments',{});
let categoryNames=store.get('categoryNames',[]), fontScale=store.get('fontScale',1);

const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const unique=a=>[...new Set(a)];
function currentCategories(h){return customAssignments[h.number]??[]}
function persist(){store.set('favorites',favorites);store.set('recent',recent);store.set('today',today);store.set('edits',edits);store.set('assignments',customAssignments);store.set('categoryNames',categoryNames);store.set('fontScale',fontScale)}
function hydrate(){hymns=originals.map(h=>({...h,...(edits[h.number]||{}),categories:[]}))}
function migrateCategories(){
  if(store.get('categorySchema',0)<2){
    categoryNames=[]; customAssignments={}; store.set('categorySchema',2); persist();
  }
}

async function boot(){
  originals=window.LOUVAI_HYMNS||[];
  if(originals.length!==180)throw new Error('dados dos hinos incompletos');
  migrateCategories(); hydrate();
  document.body.classList.toggle('dark',store.get('dark',false));
  document.documentElement.style.setProperty('--font-scale',fontScale);
  bind(); renderList();
}
function bind(){
  $('#searchInput').addEventListener('input',()=>{listMode='search';renderList()});
  $$('.quick-grid [data-list]').forEach(b=>b.onclick=()=>{listMode=b.dataset.list;$('#searchInput').value='';renderList()});
  $('#categoriesBtn').onclick=showCategories; $('#backBtn').onclick=handleInternalBack;
  $('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');store.set('dark',document.body.classList.contains('dark'))};
  $('#favoriteBtn').onclick=toggleFavorite; $('#todayBtn').onclick=toggleToday;
  $('#prevBtn').onclick=()=>openHymn(Math.max(1,active.number-1)); $('#nextBtn').onclick=()=>openHymn(Math.min(180,active.number+1));
  $('#fontDown').onclick=()=>setFont(-.1); $('#fontUp').onclick=()=>setFont(.1);
  $('#readingBtn').onclick=()=>document.body.classList.add('reading');
  $('#lyrics').onclick=()=>document.body.classList.remove('reading');
  $('#editBtn').onclick=openEditor; $('#hymnCategoriesBtn').onclick=openHymnCategories;
  $('#addCategoryBtn').onclick=addCategory;
}
function show(view){$$('.view').forEach(v=>v.classList.add('hidden'));$(view).classList.remove('hidden');$('#backBtn').classList.toggle('hidden',view==='#homeView');window.scrollTo(0,0)}
function currentView(){return $('.view:not(.hidden)')?.id||'homeView'}
function goHome(resetList=false){document.body.classList.remove('reading');active=null;if(resetList){listMode='all';$('#searchInput').value=''}show('#homeView');renderList()}
function handleInternalBack(){
  if(!$('#modal').classList.contains('hidden')){closeModal();return true}
  if(document.body.classList.contains('reading')){document.body.classList.remove('reading');return true}
  if(currentView()==='detailView'||currentView()==='categoriesView'){goHome(false);return true}
  if(listMode!=='all'||$('#searchInput').value){goHome(true);return true}
  return false
}
window.handleAndroidBack=()=>handleInternalBack()?'handled':'home';
function filtered(){
  const q=norm($('#searchInput').value.trim()); let nums=null, title='Todos os hinos';
  if(listMode==='favorites'){nums=favorites;title='Favoritos'}
  if(listMode==='recent'){nums=recent;title='Recentes'}
  if(listMode==='today'){nums=today;title='Culto de Hoje'}
  if(listMode.startsWith('cat:')){const c=listMode.slice(4);nums=hymns.filter(h=>currentCategories(h).includes(c)).map(h=>h.number);title=c}
  let rows=nums?nums.map(n=>hymns[n-1]).filter(Boolean):hymns;
  if(q)rows=rows.filter(h=>String(h.number)===q||norm(`${h.number} ${h.title} ${h.lyrics}`).includes(q));
  return {rows,title:q?'Resultados da busca':title}
}
function renderList(){
  show('#homeView'); const {rows,title}=filtered(); $('#listTitle').textContent=title;$('#count').textContent=`${rows.length} hino${rows.length===1?'':'s'}`;
  $('#searchInfo').textContent=$('#searchInput').value?`${rows.length} resultado${rows.length===1?'':'s'}`:'180 hinos disponíveis offline';
  $('#hymnList').innerHTML=rows.length?rows.map(h=>`<button class="hymn-row" data-n="${h.number}"><span class="number">${h.number}</span><span><span class="name">${escapeHtml(h.title)}</span><span class="cats">${escapeHtml(currentCategories(h).join(' · ')||'Sem categoria')}</span></span><span class="fav">${favorites.includes(h.number)?'★':''}</span></button>`).join(''):'<div class="empty">Nenhum hino encontrado.</div>';
  $$('.hymn-row').forEach(b=>b.onclick=()=>openHymn(+b.dataset.n));
}
function openHymn(n){
  active=hymns[n-1]; if(!active)return; recent=[n,...recent.filter(x=>x!==n)].slice(0,20);persist();
  $('#hymnNumber').textContent=`HINO ${n}`;$('#hymnTitle').textContent=active.title;$('#lyrics').innerHTML=formatLyrics(active.lyrics);
  $('#favoriteBtn').textContent=favorites.includes(n)?'★':'☆';$('#todayBtn').textContent=today.includes(n)?'Remover do Culto de Hoje':'Adicionar ao Culto de Hoje';
  $('#prevBtn').disabled=n===1;$('#nextBtn').disabled=n===180;updateFont();show('#detailView');
}
function toggleFavorite(){const n=active.number;favorites=favorites.includes(n)?favorites.filter(x=>x!==n):[...favorites,n];persist();openHymn(n)}
function toggleToday(){const n=active.number;today=today.includes(n)?today.filter(x=>x!==n):[...today,n];persist();openHymn(n)}
function setFont(delta){fontScale=Math.min(1.8,Math.max(.8,Math.round((fontScale+delta)*10)/10));persist();updateFont()}
function updateFont(){document.documentElement.style.setProperty('--font-scale',fontScale);$('#fontLabel').textContent=`${Math.round(fontScale*100)}%`}
function openEditor(){
  modal('Editar hino',`<label>Título</label><input id="editTitle" type="text" value="${escapeAttr(active.title)}"><label>Letra</label><textarea id="editLyrics">${escapeHtml(active.lyrics)}</textarea>`,[
    ['Cancelar',closeModal],['Restaurar original',()=>confirmAction('Restaurar texto original?',()=>{delete edits[active.number];persist();hydrate();closeModal();openHymn(active.number)})],['Revisar alteração',reviewEdit,'primary']]);
}
function reviewEdit(){const title=$('#editTitle').value.trim(),lyrics=$('#editLyrics').value.trim();if(!title||!lyrics)return alert('Preencha o título e a letra.');modal('Confirmar alteração',`<p>Revise antes de salvar:</p><div class="card" style="padding:12px"><strong>${escapeHtml(title)}</strong><pre style="white-space:pre-wrap">${escapeHtml(lyrics)}</pre></div>`,[['Voltar',openEditor],['Confirmar e salvar',()=>{edits[active.number]={title,lyrics};persist();hydrate();closeModal();openHymn(active.number)},'primary']])}
function showCategories(){renderCategories();show('#categoriesView')}
function renderCategories(){
  $('#categoryList').innerHTML=categoryNames.length?categoryNames.map(c=>{const count=hymns.filter(h=>currentCategories(h).includes(c)).length;return `<div class="category-row"><button class="cat-main" data-open="${escapeAttr(c)}"><strong>${escapeHtml(c)}</strong><small>${count} hino${count===1?'':'s'}</small></button><button class="mini" data-ren="${escapeAttr(c)}">Renomear</button><button class="mini" data-del="${escapeAttr(c)}">Excluir</button></div>`}).join(''):'<div class="empty">Nenhuma categoria criada. Toque em “+ Nova” para começar.</div>';
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
function formatLyrics(text){
  const lines=String(text).split(/\r?\n/), blocks=[];
  let stanza=[];
  const flush=()=>{if(stanza.length){blocks.push(`<div class="stanza">${stanza.map(line=>`<div>${escapeHtml(line)}</div>`).join('')}</div>`);stanza=[]}};
  for(let i=0;i<lines.length;i++){
    let line=lines[i].trim(), chorus=/^coro\s*:/i.test(line);
    if(/^\(?coro\)?\.?$/i.test(line)){flush();blocks.push('<div class="chorus-return">CANTAR O CORO</div>');continue}
    if(line.includes('{')){
      flush();let gathered=[line];
      while(!/}\s*\((?:bis|\d+\s*vez(?:es)?)\)\s*$/i.test(gathered[gathered.length-1])&&i+1<lines.length)gathered.push(lines[++i].trim());
      const joined=gathered.join('\n');
      const match=joined.match(/^(?:coro\s*:\s*)?{([\s\S]*?)}\s*\((bis|\d+\s*vez(?:es)?)\)\s*$/i);
      if(match){
        const repeat=/^bis$/i.test(match[2])?'2×':match[2].replace(/\s*vez(?:es)?/i,'×');
        blocks.push(`<div class="${chorus?'chorus-block ':''}repeat-block">${chorus?'<div class="chorus-label">CORO</div>':''}<div class="repeat-label">REPETIR ${escapeHtml(repeat)}</div>${match[1].split('\n').map(x=>`<div>${escapeHtml(x)}</div>`).join('')}<div class="repeat-end">FIM DA REPETIÇÃO</div></div>`);
      }else stanza.push(...gathered);
      continue
    }
    if(chorus){
      flush();const chorusLines=[line.replace(/^coro\s*:\s*/i,'')];
      while(chorusLines.length<4&&i+1<lines.length&&!/^\(?coro\)?\.?$/i.test(lines[i+1].trim())&&!lines[i+1].includes('{'))chorusLines.push(lines[++i].trim());
      blocks.push(`<div class="chorus-block"><div class="chorus-label">CORO</div>${chorusLines.map(x=>`<div>${escapeHtml(x)}</div>`).join('')}</div>`);continue
    }
    if(!line){flush();continue}
    stanza.push(line);if(stanza.length===4)flush();
  }
  flush();return blocks.join('');
}
function escapeHtml(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/"/g,'&quot;')}
boot().catch(e=>{$('#hymnList').innerHTML=`<div class="empty">Não foi possível carregar o hinário: ${escapeHtml(e.message)}</div>`});
