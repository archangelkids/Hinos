# Verificação — 21/10/2026

## Catálogos

- Os cinco PDFs foram abertos localmente. Louvai e Cantor têm os mesmos hashes SHA-256 dos arquivos anteriores, portanto os dois hinários não foram duplicados. A sequência número/título/letra de todos os hinos desses dois catálogos foi comparada à versão anterior e é idêntica.
- Louvai: 180 números únicos, 1–180, extraídos por coluna esquerda antes da direita.
- Cantor: 578 números únicos até 581; mantidas as lacunas 240, 374 e 443 do PDF, conferidas na versão anterior.
- Harpa: 294 páginas, índice ignorado nas primeiras 10; 524 números únicos, 1–524. Foram reconhecidos os títulos 117, 136 e 212 sem ponto, assim como os títulos com erros de caixa no texto embutido. Uma estrofe de fonte maior no hino 85 não foi confundida com o título do hino 20.
- Os números 200 e 201 da Harpa aparecem duas vezes no PDF, com pequenas diferenças. Foram mantidas ambas as versões completas, em blocos identificados dentro do mesmo número. As continuações que cruzam as páginas 121–123 não foram descartadas nem anexadas ao hino errado.
- Metrosul: 45 páginas, 105 números únicos, 1–105; continuações entre páginas mantidas.
- Nenhum hino extraído está sem título/letra nem contém caractere de substituição Unicode ou marcador cid. Não houve eliminação de hinos por repetirem em outro hinário.

## Canta Alegria

- 48 páginas fotografadas. Todas preservadas offline em imagens completas e em recortes do conteúdo; há botão para alternar.
- Busca auxiliar por reconhecimento automático em português, com OCR separado por coluna nas páginas de duas colunas. O texto reconhecido tem erros e NÃO foi validado como letra definitiva.
- As imagens originais são a leitura principal. Os números nos cartões são páginas do PDF; a numeração dos cânticos permanece como impressa nas imagens. Favoritos, categorias e listas deste hinário operam por página. Não se promete um índice individual dos cânticos.
- Páginas representativas do começo, meio e final inspecionadas visualmente. A exposição e o foco variam no próprio PDF; esses problemas da fonte permanecem visíveis nas imagens.

## Testes offline

Microsoft Edge, sem rede, janela de 412 × 915. Passaram: cinco opções sem duplicação; seleção inicial após recarga; contagens; isolamento da busca e das edições/favoritos/Culto de Hoje; persistência; restauração do original; categorias do aplicativo anterior; modo escuro e fonte; callbacks do Voltar Android; navegação pelas lacunas do Cantor; títulos especiais e versões repetidas da Harpa; busca auxiliar no Canta; leitura de páginas, zoom e alternância da página completa. Todas as 96 imagens do Canta carregaram offline. Sem erros JavaScript. Telas de seleção e leitura inspecionadas visualmente.

## Limites

Não houve revisão humana integral de todas as letras, pontuação ou divisões de estrofes. As fotografias e o texto reconhecido do Canta exigem conferência antes de usar uma letra. Não há Java/SDK Android local; o APK não foi compilado nem executado em aparelho/emulador. O workflow GitHub Actions continua preparado para rodar os testes e gerar APK, mas ainda deve ser executado no repositório do usuário. Retorno do segundo plano e navegação por gesto/botão precisam de verificação em Android real.
