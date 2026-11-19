# Hinários offline — Android 13.0

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
| Louvai ao Senhor | 181 hinos, incluindo “A Igreja é Franca” |
| Cantor Cristão | 578 hinos, mantendo a numeração original até 581 |
| Harpa Cristã | 524 números; as duas versões de 200 e 201 presentes no PDF foram preservadas |
| Hinário Metrosul | 105 hinos |

O Canta Alegria foi removido da seleção, dos assets e dos dados carregados pelo aplicativo. Hinos que também aparecem em outro hinário continuam nos dois. O Cantor mantém as lacunas 240, 374 e 443 do PDF fornecido; nenhum número novo foi atribuído a esses espaços.

A seleção aparece ao iniciar e ao voltar do segundo plano. Pesquisa, filtros por hinário, categoria, favoritos, Culto de Hoje e número, anterior/próximo, categorias e edições ficam limitados ao hinário escolhido. Resultados da pesquisa exibem trecho da letra com destaque. Há botão explícito para trocar. Voltar fecha modal, sai da leitura, retorna à lista e à seleção; na seleção, dois toques saem.

Favoritos, listas, categorias e edições anteriores de Louvai e Cantor continuam nas mesmas chaves. A tela Configurações reúne modo escuro, contraste extra, fonte sem serifa, tamanho da fonte, hinário preferido, exportação/importação de backup e versão. O identificador do aplicativo foi mantido e o versionCode subiu para 13.

Os coros aparecem em blocos próprios. Marcas de vozes como `-M`, `-H`, `-B` e `-T` ficam destacadas. O botão “Avanço por estrofe e coro” alterna entre navegar por trechos e navegar por hinos.

## Fontes e extração

fontes/pdfs contém cópias dos PDFs usados na extração. Canta Alegria ficou apenas como material antigo de conferência e não é carregado pelo app. Os PDFs são fontes de conferência e não são incluídos como PDFs no APK.

O extrator fontes/extrair-catalogo.py requer pdfplumber e recria o catálogo, o relatório e hymns.js. Ele processa as duas colunas do Louvai em separado, ignora o índice inicial da Harpa, reconhece os títulos sem ponto e distingue estrofes de títulos pelos tamanhos de fonte e pelas maiúsculas. Mantém as duas ocorrências completas de 200 e 201 como versões identificadas do mesmo número, sem repetir incorretamente suas continuações.

O extrator não depende de OCR para compilar o aplicativo. Leia VALIDACAO.md para os testes e limites.

## Testes

Na raiz: npm install --no-save playwright@1.55.1; npx playwright install chromium; node tests/offline.cjs. Opcionalmente defina BROWSER_PATH com o caminho de um navegador compatível. GitHub Actions executa esses testes antes de compilar com Java 17 e Gradle 8.9. A máquina local não possui Java/SDK Android, portanto o APK ainda deve ser compilado e verificado no Android.
