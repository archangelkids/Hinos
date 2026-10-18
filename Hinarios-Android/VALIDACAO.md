# Verificação em 18/10/2026

- Reextração integral dos PDFs com pdfplumber, processando cada coluna do Louvai separadamente, da esquerda para a direita, antes da página seguinte.
- Louvai: 52 páginas, 180 registros únicos, numeração contínua 1–180.
- Cantor: 322 páginas, 578 registros únicos, numeração original até 581. Lacunas 240, 374, 443 verificadas nas transições das páginas 127, 201–202 e 242–243.
- Todos os registros têm título/seções; nenhum texto vazio, caractere de substituição Unicode ou marcador cid foi detectado. Nenhuma deduplicação entre hinários.
- Conferência visual da primeira página do Louvai: coluna esquerda contém 1–3 e direita 4–6, com a letra de cada hino isolada. Conferência visual das páginas do Cantor junto às lacunas.
- Teste automatizado em Microsoft Edge, modo offline, janela de 412 × 915: seleção inicial e após recarga, contagens, busca isolada, favoritos e edições isolados, categoria criada, Culto de Hoje, navegação 239→241 e retorno, modo escuro e fonte persistentes, callback Voltar Android. Sem erros JavaScript.
- Telas de seleção e leitura inspecionadas visualmente.

Não houve revisão humana integral das 758 letras; pontuação, espaçamento e divisão de estrofes extraídos continuam sujeitos a conferência. Não foi executado em aparelho/emulador Android e o APK não foi compilado localmente, pois não há Java/SDK Android nesta máquina. O workflow foi preparado, mas ainda não executado no GitHub. Retorno do segundo plano e navegação física/gestual exigem teste no Android. O pacote mantém a edição das letras para correções locais.
