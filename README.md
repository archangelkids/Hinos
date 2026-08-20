# Louvai ao Senhor

Aplicativo Android offline com os 180 hinos do PDF original. Inclui busca por número, nome ou trecho, favoritos, recentes, Culto de Hoje, categorias pessoais (inicialmente vazias), edição segura das letras, modo leitura, ajuste da fonte e modo escuro.

A leitura separa visualmente as estrofes, destaca os coros e delimita trechos marcados como Bis ou repetição, indicando claramente o começo e o fim.

O botão ou gesto **Voltar** navega dentro do aplicativo. Na tela inicial, é necessário apertar duas vezes em até dois segundos para sair.

## Enviar ao GitHub

1. Extraia este ZIP.
2. Abra o repositório vazio no GitHub e escolha **Add file > Upload files**.
3. Envie o conteúdo extraído. Na raiz devem aparecer diretamente `app`, `.github`, `build.gradle`, `settings.gradle`, `gradle.properties` e `README.md`.
4. Confirme em **Commit changes** na branch `main`.

## Gerar e baixar o APK

1. Abra **Actions > Gerar APK**.
2. Aguarde o build automático ou use **Run workflow**.
3. Quando ficar verde, abra a execução e baixe o artifact **LouvaiAoSenhor-APK**.
4. Extraia o artifact para obter `LouvaiAoSenhor.apk`.

O APK é uma versão de teste instalável. O projeto usa Java 17, Android Gradle Plugin 8.7.3 e Gradle 8.9, sem plugin ou biblioteca Kotlin.
