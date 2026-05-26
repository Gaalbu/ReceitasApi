# LISTA DE CASOS DE USO (RESUMO)

- UC01: Cadastrar Usuário
- UC02: Efetuar Login
- UC03: Criar Receita Própria (CRUD - Create)
- UC04: Listar Minhas Receitas (CRUD - Read)
- UC05: Editar Receita Própria (CRUD - Update)
- UC06: Excluir Receita Própria (CRUD - Delete)
- UC07: Buscar Receita na API Global (TheMealDB)
- UC08: Visualizar Detalhes da Receita Externa
- UC09: Favoritar Receita Externa
- UC10: Criar Plano de Refeição Semanal
- UC11: Adicionar Receita ao Plano de Refeição
- UC12: Remover Receita do Plano de Refeição
- UC13: Gerar Lista de Compras Baseada no Plano
- UC14: Atualizar Perfil de Usuário
- UC15: Excluir Conta e Dados Relacionados

## MATRIZ DE RASTREABILIDADE 1:1

| UC | Implementação no backend |
| --- | --- |
| UC01 | `POST /auth/register` em `AuthController` |
| UC02 | `POST /auth/login` em `AuthController` |
| UC03 | `POST /recipes` em `RecipeController` |
| UC04 | `GET /recipes/me` em `RecipeController` |
| UC05 | `PUT /recipes/{recipeId}` em `RecipeController` |
| UC06 | `DELETE /recipes/{recipeId}` em `RecipeController` |
| UC07 | `GET /recipes/search?name=` em `RecipeController` |
| UC08 | `GET /recipes/external/{externalId}` em `RecipeController` |
| UC09 | `POST /favorites` em `FavoriteController` |
| UC10 | `POST /meal-plans` em `MealPlanController` |
| UC11 | `POST /meal-plans` com `items[]` em `MealPlanController` |
| UC12 | `DELETE /meal-plans/{mealPlanId}/items/{itemId}` em `MealPlanController` |
| UC13 | `GET /meal-plans/{mealPlanId}/shopping-list` em `MealPlanController` |
| UC14 | `PUT /users/me` em `UserController` |
| UC15 | `DELETE /users/me` em `UserController` |

## RASTREABILIDADE DO FRONTEND ATUAL

| UC | Tela / rota | Situação |
| --- | --- | --- |
| UC01 | `/register` | Implementado |
| UC02 | `/login` | Implementado |
| UC03 | `/` e `/create-recipe` | Implementado |
| UC04 | `/` | Implementado |
| UC05 | `/` | Implementado |
| UC06 | `/` | Implementado |
| UC07 | `/` | Implementado |
| UC08 | `/` | Implementado na busca de receitas |
| UC09 | `/` | Implementado na busca de receitas |
| UC10 | `/meal-plans` | Implementado |
| UC11 | `/meal-plans` | Implementado |
| UC12 | `/meal-plans` | Parcial: sem ação dedicada de remoção |
| UC13 | `/meal-plans` | Parcial: sem tela de lista de compras dedicada |
| UC14 | `/profile` | Implementado |
| UC15 | `/profile` | Implementado via exclusão de conta |

# DETALHAMENTO DOS CASOS DE USO

## UC01: Cadastrar Usuário
- Ator: Visitante
- Pré-condições: Acesso à internet e à tela de cadastro.
- Fluxo Principal:
1. O usuário insere nome, e-mail e senha.
2. O sistema valida se o e-mail já está cadastrado.
3. O sistema criptografa a senha e salva o usuário no PostgreSQL.
- Pós-condições: Usuário redirecionado para a tela de login.

## UC02: Efetuar Login
- Ator: Usuário
- Pré-condições: Possuir conta ativa.
- Fluxo Principal:
1. Usuário informa e-mail e senha.
2. Sistema valida as credenciais via Spring Security (JWT).
3. Sistema libera acesso ao Dashboard.
- Pós-condições: Token de autenticação gerado e armazenado no Front-end.

## UC03: Criar Receita Própria
- Ator: Usuário Autenticado
- Pré-condições: Estar logado no sistema.
- Fluxo Principal:
1. Usuário preenche título, ingredientes e modo de preparo.
2. Usuário clica em "Salvar".
3. Sistema valida campos obrigatórios e persiste no banco.
- Pós-condições: Receita adicionada à lista "Minhas Receitas".

## UC04: Listar Minhas Receitas
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Sistema busca no banco de dados todas as receitas vinculadas ao ID do usuário.
2. As receitas são exibidas em cards no Angular.

## UC05: Editar Receita Própria
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário seleciona uma de suas receitas.
2. Altera os dados no formulário.
3. Sistema atualiza o registro no PostgreSQL.

## UC06: Excluir Receita Própria
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário clica no ícone de lixeira em uma receita.
2. Sistema solicita confirmação.
3. Registro é removido do banco de dados.

## UC07: Buscar Receita na API Global (TheMealDB)
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário digita um termo de busca (ex: "Chicken").
2. O Back-end faz uma requisição GET para a API TheMealDB.
3. O sistema processa o JSON retornado e exibe para o usuário.

## UC08: Visualizar Detalhes da Receita Externa
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário clica em uma receita vinda da busca global.
2. Sistema busca os detalhes completos na API externa.
3. Exibe foto, vídeo (se houver) e instruções detalhadas.

## UC09: Favoritar Receita Externa
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário gosta de uma receita da API externa.
2. Clica em "Favoritar".
3. Sistema salva a referência (ID externo) no banco de dados local.

## UC10: Criar Plano de Refeição Semanal
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário cria um novo plano (ex: "Dieta Verão").
2. Sistema reserva um ID de plano vinculado ao usuário.

## UC11: Adicionar Receita ao Plano de Refeição
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário escolhe uma receita (própria ou externa).
2. Define o dia da semana (Segunda a Domingo).
3. Sistema salva o vínculo na tabela de itens do plano.

## UC12: Remover Receita do Plano de Refeição
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário visualiza o calendário semanal.
2. Remove uma refeição específica de um determinado dia.

## UC13: Gerar Lista de Compras Baseada no Plano
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário solicita lista de compras de um plano específico.
2. Sistema varre todos os ingredientes das receitas contidas no plano.
3. Exibe uma lista consolidada para o usuário.

## UC14: Atualizar Perfil de Usuário
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário acessa configurações.
2. Altera nome ou senha.
3. Sistema valida e atualiza os dados cadastrais.

## UC15: Excluir Conta e Dados Relacionados
- Ator: Usuário Autenticado
- Fluxo Principal:
1. Usuário solicita exclusão definitiva.
2. Sistema executa exclusão em cascata (planos, receitas e favoritos).
3. Sessão é encerrada.
- Pós-condições: Dados removidos permanentemente do banco.

# ESTRATÉGIA DE TESTES PARA OS CASOS DE USO

1. Testes Unitários: `api/src/test/java/**/*.java` e `receitasapi-ui/src/**/*.spec.ts` validam regras locais, forms e serviços.
2. Testes de Integração: `api/src/test/java/com/receitasapi/api/service/*IntegrationTest.java` e testes Spring de controller cobrem persistência, segurança e integrações.
3. Testes End-to-End: Cypress em `receitasapi-ui/cypress/e2e/*.cy.js` cobre registro, login, busca, criação de receita, criação de plano e reviews.

# RESULTADOS DE TESTES E COBERTURA

- Backend (Maven): 15 testes executados, 0 falhas, 0 erros. JaCoCo: instruções cobrindo 86.73%, branch coverage 68.18% (relatório em `api/target/site/jacoco/index.html`).
- Frontend (Angular): 25 testes unitários executados, 0 falhas. v8 coverage: statements 57.25%, branches 68.49%, functions 58.33%, lines 58.71% (relatório em `receitasapi-ui/coverage` gerado pelo `ng test`).

## AÇÕES ADICIONAIS EXECUTADAS

- Adicionados testes de integração backend para `RecipeService` e `MealPlanService` em `api/src/test/java/com/receitasapi/api/service/` — validados via `./mvnw.cmd test` e incluídos nos relatórios Surefire/JaCoCo.
- Scaffolded Cypress E2E no frontend: `cypress.config.js`, especificação `cypress/e2e/uc02_uc11_spec.cy.js` e scripts `e2e`/`e2e:run` no `receitasapi-ui/package.json`. Instalei `cypress` como devDependency. Esses testes são E2E smoke flows que assumem `ng serve` e backend em `localhost:8080`.
