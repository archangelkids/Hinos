# Hinários offline — Android 12.0

Projeto baseado no Android anterior, mantendo o identificador com.louvaiaosenhor.app. Android 6 ou superior. Nenhuma conexão é necessária para usar os hinos.

## Gerar o APK no GitHub

1. Extraia este pacote e envie TODO o conteúdo da pasta Hinarios-Android-v12 para a raiz de um repositório GitHub. Inclua a pasta oculta .github.
2. Abra Actions → Gerar APK → Run workflow. Também executa ao enviar alterações para main ou master.
3. Ao terminar, baixe o artefato Hinarios-Offline-APK e extraia Hinarios-Offline.apk.
4. Transfira para o Android e permita a instalação desse arquivo quando solicitado.

O APK produzido é de depuração, assinado automaticamente para instalação e testes. Para distribuir atualizações permanentes, configure uma chave de assinatura própria. O projeto não inclui uma chave privada. Uma instalação antiga com outra assinatura exige a assinatura original para atualizar sem desinstalar. Desinstalar apaga os dados locais.

## Cinco hinários

| Hinário | Conteúdo disponível |
|---|---|
| Louvai ao Senhor | 180 hinos, sem alterar os textos da versão anterior |
| Cantor Cristão | 578 hinos, mantendo a numeração original até 581 |
| Canta Alegria | 48 páginas fotografadas, originais offline com ampliação e busca auxiliar |
| Harpa Cristã | 524 números; as duas versões de 200 e 201 presentes no PDF foram preservadas |
| Hinário Metrosul | 105 hinos |

Os PDFs de Louvai e Cantor enviados novamente são idênticos aos anteriores (ver hashes em fontes/SHA256.json). Por isso não viraram opções duplicadas. Hinos que também aparecem em outro hinário continuam nos dois. O Cantor mantém as lacunas 240, 374 e 443 do PDF fornecido; nenhum número novo foi atribuído a esses espaços.

A seleção aparece ao iniciar e ao voltar do segundo plano. Pesquisa, lista, anterior/próximo, favoritos, recentes, Culto de Hoje, categorias e edições ficam limitados ao hinário escolhido. Há botão explícito para trocar. Voltar fecha modal, sai da leitura, retorna à lista e à seleção; na seleção, dois toques saem.

Favoritos, listas, categorias e edições anteriores de Louvai e Cantor continuam nas mesmas chaves. O modo escuro e a fonte são globais. Os três hinários novos têm dados separados. O identificador do aplicativo foi mantido e o versionCode subiu para 12.

## Canta Alegria: leitura pelas páginas originais

Esse arquivo contém fotografias, com trechos desfocados ou muito claros. Para não apresentar letras incorretas como definitivas, o aplicativo abre a imagem original. A lista identifica PÁGINAS DO PDF, sem atribuir esses números aos hinos. A numeração impressa dos cânticos permanece na imagem.

É possível ampliar de 75% a 400%, deslizar para os lados e alternar entre o conteúdo e a página completa. O texto reconhecido fica recolhido em “Texto reconhecido automaticamente — revisar”. Ele serve de busca auxiliar e pode ser editado, mas não foi revisado integralmente e pode trocar palavras ou deixar de encontrar um trecho. As imagens continuam intactas após editar o texto.

Neste hinário, favoritos, categorias, recentes e Culto de Hoje guardam PÁGINAS, que podem ter mais de um cântico. Ainda não há um catálogo individual confiável das letras do Canta Alegria. Para usar esse hinário com a mesma navegação por hino dos outros quatro, é necessário transcrever/revisar as letras e seu índice, ou fornecer uma versão com texto selecionável de boa qualidade. Todo o conteúdo das 48 páginas já fica disponível offline nesta versão.

## Fontes e extração

fontes/pdfs contém cópias exatas dos cinco PDFs enviados, com nomes internos louvai, cantor, canta, harpa e metrosul. Eles são fontes de conferência e não são incluídos como PDFs no APK. As letras e as imagens necessárias ficam nos assets do aplicativo.

O extrator fontes/extrair-catalogo.py requer pdfplumber e recria o catálogo, o relatório e hymns.js. Ele processa as duas colunas do Louvai em separado, ignora o índice inicial da Harpa, reconhece os títulos sem ponto e distingue estrofes de títulos pelos tamanhos de fonte e pelas maiúsculas. Mantém as duas ocorrências completas de 200 e 201 como versões identificadas do mesmo número, sem repetir incorretamente suas continuações.

O texto auxiliar do Canta está em fontes/ocr/canta, uma transcrição automática por página. Os parâmetros e o procedimento estão em fontes/ocr/LEIA-ME.md. O extrator não depende de OCR para compilar o aplicativo: as entradas e imagens já estão incluídas. Leia VALIDACAO.md para os testes e limites.

## Testes

Na raiz: npm install --no-save playwright@1.55.1; npx playwright install chromium; node tests/offline.cjs. Opcionalmente defina BROWSER_PATH com o caminho de um navegador compatível. GitHub Actions executa esses testes antes de compilar com Java 17 e Gradle 8.9. A máquina local não possui Java/SDK Android, portanto o APK ainda deve ser compilado e verificado no Android.
