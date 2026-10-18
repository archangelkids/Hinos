# Hinários offline — Android 11.0

Projeto baseado no Android anterior, mantendo o identificador com.louvaiaosenhor.app. Android 6 ou superior. Nenhuma conexão é necessária para usar os hinos.

## Gerar o APK no GitHub

1. Extraia este pacote e envie TODO o conteúdo da pasta Hinarios-Android para a raiz de um repositório GitHub. Inclua a pasta oculta .github.
2. Abra Actions → Gerar APK → Run workflow. Também executa ao enviar alterações para main ou master.
3. Ao terminar, baixe o artefato Hinarios-Offline-APK e extraia Hinarios-Offline.apk.
4. Transfira para o Android e permita a instalação desse arquivo quando solicitado.

O APK produzido é de depuração, assinado automaticamente para instalação e testes. Para distribuir atualizações permanentes, configure uma chave de assinatura própria. O projeto não inclui uma chave privada. Uma instalação antiga com outra assinatura exige a assinatura original para atualizar sem desinstalar. Desinstalar apaga os dados locais.

## Comportamento

A seleção Louvai ao Senhor / Cantor Cristão aparece ao iniciar e ao retornar do segundo plano. Pesquisa, lista, anterior/próximo, favoritos, recentes, Culto de Hoje, categorias e edições ficam limitados ao hinário escolhido. Há botão explícito para trocar de hinário. Voltar fecha modal, sai do modo leitura, retorna à lista e à seleção; na seleção, dois toques saem.

São 180 hinos do Louvai e 578 do Cantor. O Cantor vai até 581 e o PDF fornecido não contém 240, 374 e 443. Nenhum hino foi renumerado nem eliminado por repetir em outro hinário.

Favoritos, listas, edições e categorias anteriores do Louvai são reaproveitados das chaves locais antigas. Modo escuro e tamanho da fonte são globais. As letras preservam as quebras extraídas do PDF sem impor estrofes de quatro linhas.

## Fontes e verificação

fontes/pdfs/louvai.pdf corresponde ao louvaiaosenhor.pdf de 52 páginas e duas colunas; cantor.pdf ao cantorcristao(2).pdf de 322 páginas. Os nomes foram normalizados no projeto anterior. A extração reproduzível está em fontes/extrair-catalogo.py e exige pdfplumber. O catálogo original e relatório estão na mesma pasta. Rodar o extrator regenera os arquivos de referência nessa pasta; hymns.js inclui também o campo lyrics, formado pela união das seções.

Leia VALIDACAO.md para os resultados e limites. Os PDFs são fontes de conferência e não entram no APK; as letras já estão incluídas nos assets.

## Testes

Na raiz: npm install --no-save playwright@1.55.1; npx playwright install chromium; node tests/offline.cjs. Opcionalmente defina BROWSER_PATH com o caminho de um navegador compatível. GitHub Actions executa esses testes antes de compilar com Java 17 e Gradle 8.9. A máquina local não possui Java/SDK Android, portanto o APK ainda deve ser compilado e verificado no Android.
