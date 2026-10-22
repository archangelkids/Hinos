"""Rebuild the offline catalogue from the five supplied PDFs and saved OCR inputs.
Requires pdfplumber. Canta is intentionally stored per PDF page: OCR is not a
validated song index. No printed hymn number is invented or reassigned.
"""
import argparse,hashlib,json,re
from pathlib import Path
import pdfplumber
root=Path(__file__).resolve().parent
assets=root.parent/'app/src/main/assets'
config=[('louvai','Louvai ao Senhor',2),('cantor','Cantor Cristão',1),('harpa','Harpa Cristã',1),('metrosul','Hinário Metrosul',1)]
books={};report=[]
for key,name,columns in config:
    occurrences=[];current=None;stop=False;page_count=0
    with pdfplumber.open(root/'pdfs'/f'{key}.pdf') as pdf:
        page_count=len(pdf.pages)
        for pn,page in enumerate(pdf.pages,1):
            if stop:break
            if key=='harpa' and pn<11:continue # The first ten pages are the table of contents.
            for ci in range(columns):
                part=page.crop((ci*page.width/columns,0,(ci+1)*page.width/columns,page.height))
                prev=None
                for line in part.extract_text_lines(x_tolerance=2,y_tolerance=3):
                    text=line['text'].strip()
                    if key=='louvai' and text.startswith('ÍNDICE DE ASSUNTOS'):stop=True;break
                    pattern=r'^(\d{1,3})\.\s+(.+)$' if key=='louvai' else r'^(\d{1,3})\s*[-–]\s*(.+)$'
                    if key=='harpa':pattern=r'^(\d{1,3})\.?\s+(.+)$'
                    match=re.match(pattern,text)
                    if key=='harpa' and (max(c['size'] for c in line['chars'])<14 or (match and sum(c.islower() for c in match[2])>2)):match=None
                    if match and (key=='harpa' or not occurrences or int(match[1])>occurrences[-1]['number']):
                        current={'number':int(match[1]),'title':match[2],'page':pn,'sourcePages':[pn],'lines':[],'flags':[],'reviewed':False}
                        occurrences.append(current);prev=None;continue
                    if not current or not text or re.fullmatch(r'\d+',text):continue
                    if pn not in current['sourcePages']:current['sourcePages'].append(pn)
                    if prev is not None and line['top']-prev>(12 if key=='metrosul' else 4.5):current['lines'].append('')
                    current['lines'].append(text);prev=line['bottom']
    by_number={}
    for h in occurrences:
        h['lyrics']='\n'.join(h.pop('lines')).strip()
        if h['number'] in by_number:
            original=by_number[h['number']]
            if 'variants' not in original:
                original['variants']=[{'page':original['page'],'lyrics':original['lyrics']}]
            original['variants'].append({'page':h['page'],'lyrics':h['lyrics']})
            original['sourcePages']=sorted(set(original['sourcePages']+h['sourcePages']))
            original['sourceNote']='Este número aparece duas vezes no PDF. As duas versões foram preservadas abaixo.'
            original['lyrics']='\n\n'.join(f"Versão {i+1} — página {v['page']} do PDF\n\n{v['lyrics']}" for i,v in enumerate(original['variants']))
        else:by_number[h['number']]=h
    hymns=list(by_number.values())
    for h in hymns:
        assert h['title'].strip() and h['lyrics'].strip(),(key,h['number'])
        assert '\ufffd' not in h['lyrics'] and '(cid:' not in h['lyrics'],(key,h['number'])
        h['sections']=[{'label':f'Trecho {i+1}','text':s} for i,s in enumerate(re.split(r'\n\s*\n',h['lyrics'])) if s.strip()]
    nums=[h['number'] for h in hymns]
    books[key]={'name':name,'kind':'hymns','hymns':hymns}
    report.append({'key':key,'book':name,'pages':page_count,'count':len(hymns),'first':min(nums),'last':max(nums),'missing_numbers':[n for n in range(min(nums),max(nums)+1) if n not in nums],'repeated_numbers':[h['number'] for h in hymns if h.get('variants')]})
# Canta's source is photographed, so the page image is the primary reading view.
# Number is a PDF page identifier, not an assigned hymn number.
scans=[]
with pdfplumber.open(root/'pdfs/canta.pdf') as pdf:
    out=assets/'scans/canta';out.mkdir(parents=True,exist_ok=True)
    for pn,page in enumerate(pdf.pages,1):
        text=(root/'ocr/canta'/f'{pn:02}.txt').read_text(encoding='utf-8').strip()
        full=out/f'{pn:02}-completa.jpg';crop=out/f'{pn:02}.jpg'
        if not full.exists():page.to_image(resolution=220).original.convert('RGB').save(full,quality=85,optimize=True)
        if not crop.exists():
            box=(85,65,515,660) if pn<=3 else (85,65,400,500)
            page.crop(box).to_image(resolution=260).original.convert('RGB').save(crop,quality=88,optimize=True)
        scans.append({'number':pn,'page':pn,'title':f'Página {pn} do PDF','lyrics':text or 'Texto não reconhecido. Consulte a imagem original.','scan':f'scans/canta/{pn:02}.jpg','fullScan':f'scans/canta/{pn:02}-completa.jpg','flags':['OCR não revisado; leitura principal na imagem original'],'reviewed':False})
books['canta']={'name':'Canta Alegria','kind':'pages','notice':'PDF fotografado: navegação por página. A numeração dos cânticos está nas imagens originais. A busca usa texto reconhecido automaticamente e pode falhar. Favoritos, Culto de Hoje, categorias e edições deste hinário se referem às páginas.','hymns':scans}
report.append({'key':'canta','book':'Canta Alegria','pages':len(scans),'count':len(scans),'unit':'PDF pages, not hymn numbers','ocr_reviewed':False})
# Keep the two original choices first, followed by the three additions.
books={k:books[k] for k in ['louvai','cantor','canta','harpa','metrosul']}
(root/'catalogo-original.json').write_text(json.dumps(books,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'extracao.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(assets/'hymns.js').write_text('window.HYMN_BOOKS='+json.dumps(books,ensure_ascii=False)+';',encoding='utf-8')
(root/'SHA256.json').write_text(json.dumps({f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in (root/'pdfs').glob('*.pdf')},indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))
