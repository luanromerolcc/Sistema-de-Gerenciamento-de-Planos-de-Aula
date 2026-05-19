# Roteiro — Vídeo de Apresentação (5 minutos)

**Ritmo:** fala pausada, ~130 palavras/minuto  
**Formato:** gravação de tela com voz. Câmera no canto é opcional.

---

## [0:00 – 0:20] Abertura

*Tela: listagem de planos no browser*

> "Vou apresentar minha solução para o desafio de Gerenciamento de Planos de Aula. É uma aplicação completa — backend, frontend, banco de dados e cache — que sobe com um único comando. Vou falar sobre como organizei o projeto, as escolhas que fiz, o que foi difícil e o que entreguei além do pedido."

---

## [0:20 – 1:00] Organização do projeto

*Tela: pasta do backend aberta no editor*

> "O backend é dividido em camadas bem definidas. A rota só recebe a requisição, o controller só faz a leitura dos dados, o service só aplica as regras de negócio, e o repository só fala com o banco. Cada parte tem uma responsabilidade única — o que também facilita muito na hora de testar."

*Tela: pasta do frontend*

> "No frontend a separação é parecida: páginas, componentes visuais e hooks separados para buscar dados e gerenciar estado. O componente em si não sabe de onde os dados vêm."

---

## [1:00 – 1:50] Escolhas técnicas

*Tela: terminal com os 4 serviços rodando*

> "Algumas escolhas que fiz conscientemente."

> "Usei Fastify em vez de Express porque ele é mais rápido e já vem com um sistema de log estruturado embutido — sem precisar configurar nada, os logs saem no formato que o desafio pede."

> "A busca usa o mecanismo de texto completo do próprio PostgreSQL. Cada campo tem um peso diferente: o título importa mais que a disciplina, que importa mais que o conteúdo. O resultado é ordenado por relevância, não por data."

> "O streaming da IA funciona com um protocolo chamado SSE — a resposta vai chegando em pedaços em vez de esperar tudo pronto. Seria possível usar WebSocket, mas esse protocolo é feito para comunicação nos dois sentidos, e aqui o servidor só precisa enviar. SSE é a escolha mais simples e correta."

> "Chamadas repetidas para a IA com os mesmos dados retornam do cache em menos de 5 milissegundos."

---

## [1:50 – 3:15] Demo

*Tela: formulário de criação com título "Introdução ao OSPF" e disciplina "Redes" já preenchidos*

> "Vou mostrar o Smart Assist. Título e disciplina preenchidos — clicando em Gerar Recomendações."

*[~15 segundos de pausa — mostrar a resposta chegando em pedaços na tela]*

> "A resposta foi chegando em tempo real. Vou clicar de novo com os mesmos dados."

*[~5 segundos de pausa — mostrar o badge de cache aparecendo]*

> "Dessa vez voltou em menos de 5ms direto do cache. O badge aparece na tela e o log no terminal confirma."

*Tela: mostrar o log no terminal*

*Tela: listagem de planos — interagir com filtro de disciplina e campo de busca*

> "O CRUD tem filtros por disciplina, tags e busca, com paginação. Uma decisão que fiz aqui: as regras de validação do formulário ficam definidas em um único lugar e valem tanto para o que o usuário vê quanto para o que o servidor aceita. Não tem como os dois divergirem."

---

## [3:15 – 3:55] Dificuldades

*Tela: pode ficar na listagem*

> "Três problemas que encontrei no caminho."

> "O primeiro foi nos testes. Quando você usa módulos modernos do JavaScript com Jest, os mocks precisam ser configurados antes de importar o código que vai ser testado — e errar essa ordem não dá nenhuma mensagem de erro útil. Levei um tempo para entender o que estava acontecendo."

> "O segundo: o campo que deveria alimentar a busca por texto nunca era preenchido. A estrutura estava criada no banco, mas nada atualizava esse campo quando um plano era salvo. A busca retornava zero resultados para qualquer coisa. Resolvi criando uma rotina automática no banco que preenche esse campo a cada salvamento."

> "O terceiro: os testes de integração travavam com timeout sem explicar o porquê. Depois de investigar, descobri que a aplicação precisava de uma chamada a mais durante a inicialização para que estivesse pronta para receber requisições nos testes."

---

## [3:55 – 4:35] Itens bônus

*Tela: GitHub Actions com pipeline verde*

> "Dois fluxos de integração contínua separados. O primeiro roda a cada commit: análise de código, testes e build — resposta em dois minutos. O segundo sobe tudo com Docker e roda os testes de ponta a ponta, mas só antes de ir para a branch principal."

*Tela: Swagger UI ou listagem*

> "Versionamento: antes de qualquer edição, o sistema guarda uma cópia do estado anterior. Dá para voltar para qualquer versão com um clique. Também tem exportação em PDF e para calendário, e um registro de todas as ações feitas no sistema."

---

## [4:35 – 5:00] Encerramento

*Tela: aplicação rodando*

> "O que deixei de fora foi autenticação — sem um modelo de usuário definido no desafio, achei que seria adicionar complexidade sem necessidade real. Está explicado no README."

> "Se fosse começar de novo, usaria TypeScript desde o início. Senti falta da tipagem em vários momentos do desenvolvimento."

> "Tem um arquivo no repositório chamado TECHNICAL_DECISIONS.md com mais detalhes sobre cada escolha. Obrigada."

---

## Guia de gravação

**Antes de ligar o REC:**
1. Aplicação rodando com `docker-compose up`
2. Browser em `/plans` com alguns planos visíveis — rode o seed se precisar: `docker exec backend-dev node prisma/seed.js`
3. Terminal lateral aberto com os logs do backend em tempo real
4. GitHub Actions aberto com o último pipeline verde
5. Formulário de criação já aberto com título e disciplina preenchidos

**Smart Assist — atenção:**
Faça uma chamada **antes** de gravar para aquecer o cache. Na gravação: a primeira chamada mostra a resposta chegando aos poucos, a segunda mostra o retorno instantâneo do cache. Se fizer ao contrário, não consegue demonstrar os dois comportamentos.

**Se estourar o tempo:** corte a última frase da seção de escolhas técnicas — a do cache de 5ms. É o detalhe menos crítico.
