# Casos de Uso — ReceitasApi

Este documento lista 15 casos de uso essenciais no formato: nome, ator, pré-condição, fluxo principal e pós-condição. Baseado nos controllers: `Auth`, `Recipe`, `MealPlan`, `RecipeRating`, `SystemReview`.

---

1) Nome: Registrar Usuário
   - Ator: Usuário (anônimo)
   - Pré-condição: Usuário não possui conta; dados mínimos válidos (username, email, senha).
   - Fluxo principal:
     1. Usuário acessa a tela de registro.
     2. Preenche formulário com `username`, `email` e `senha`.
     3. Envia o formulário para `POST /auth/register`.
     4. Sistema valida dados e cria conta.
     5. Sistema retorna confirmação de sucesso.
   - Pós-condição: Conta criada; usuário pode realizar login.

2) Nome: Login
   - Ator: Usuário
   - Pré-condição: Usuário já possui conta e credenciais válidas.
   - Fluxo principal:
     1. Usuário acessa a tela de login.
     2. Informa `username/email` e `senha`.
     3. Envia para `POST /auth/login`.
     4. Sistema autentica e retorna JWT.
     5. Cliente armazena token e redireciona para dashboard.
   - Pós-condição: Sessão autenticada (token válido).

3) Nome: Logout
   - Ator: Usuário autenticado
   - Pré-condição: Usuário autenticado com token válido.
   - Fluxo principal:
     1. Usuário aciona logout na UI.
     2. Cliente remove token localmente e redireciona à tela de login.
   - Pós-condição: Sessão encerrada no cliente.

4) Nome: Criar Receita
   - Ator: Usuário autenticado
   - Pré-condição: Usuário autenticado; dados da receita válidos.
   - Fluxo principal:
     1. Usuário abre formulário `create-recipe`.
     2. Preenche campos (título, ingredientes, instruções, tempo).
     3. Envia para `POST /recipes` com token.
     4. Backend cria `Recipe` ligado ao usuário e retorna recurso criado.
   - Pós-condição: Receita persistida vinculada ao usuário.

5) Nome: Editar Receita
   - Ator: Proprietário da receita (usuário autenticado)
   - Pré-condição: Receita existe e pertence ao usuário; formulário de edição válido.
   - Fluxo principal:
     1. Usuário acessa `GET /recipes/{id}` para obter dados.
     2. Abre o formulário de edição (`create-recipe` pré-preenchido).
     3. Altera campos e envia para `PUT /recipes/{id}`.
     4. Backend valida posse e atualiza entidade.
     5. Retorna receita atualizada.
   - Pós-condição: Receita atualizada no banco.

6) Nome: Excluir Receita
   - Ator: Proprietário da receita
   - Pré-condição: Receita existe e pertence ao usuário.
   - Fluxo principal:
     1. Usuário solicita exclusão na UI.
     2. Cliente chama `DELETE /recipes/{id}` com token.
     3. Backend verifica posse e remove o registro.
     4. Retorna `204 No Content`.
   - Pós-condição: Receita removida.

7) Nome: Buscar Receitas Externas
   - Ator: Usuário (pode ser anônimo ou autenticado)
   - Pré-condição: Palavra-chave válida.
   - Fluxo principal:
     1. Usuário informa termo de busca na UI.
     2. Cliente chama `GET /recipes/search?name={termo}`.
     3. Backend consulta TheMealDB e mapeia resposta.
     4. Retorna lista de resultados para exibição.
   - Pós-condição: Lista de receitas externas exibida ao usuário.

8) Nome: Criar Plano de Refeição
   - Ator: Usuário autenticado
   - Pré-condição: Usuário autenticado; receitas referenciadas existem.
   - Fluxo principal:
     1. Usuário abre formulário de criação de plano (`meal-plan`).
     2. Preenche `plan_name`, `start_date` e lista de `items` (recipe_id, day_of_week, meal_type).
     3. Envia para `POST /meal-plans` com token.
     4. Backend valida posse das receitas e persiste `MealPlan` com `MealItem`s.
     5. Retorna plano criado.
   - Pós-condição: Plano salvo e visível no dashboard do usuário.

9) Nome: Editar Plano de Refeição
   - Ator: Proprietário do plano
   - Pré-condição: Plano existe e pertence ao usuário.
   - Fluxo principal:
     1. Usuário requisita `GET /meal-plans/{id}` para carregar dados.
     2. Altera nome, data inicial ou itens e envia `PUT /meal-plans/{id}`.
     3. Backend valida e substitui itens conforme payload.
     4. Retorna plano atualizado.
   - Pós-condição: Plano atualizado no banco.

10) Nome: Remover Plano de Refeição
    - Ator: Proprietário do plano
    - Pré-condição: Plano existe e pertence ao usuário.
    - Fluxo principal:
      1. Usuário solicita exclusão na UI.
      2. Cliente chama `DELETE /meal-plans/{id}` com token.
      3. Backend verifica posse e remove o plano.
      4. Retorna `204 No Content`.
    - Pós-condição: Plano removido.

11) Nome: Gerar Lista de Compras (Shopping List)
    - Ator: Usuário autenticado
    - Pré-condição: Plano existe com itens que referenciam receitas com ingredientes.
    - Fluxo principal:
      1. Usuário solicita lista de compras na tela do plano.
      2. Cliente chama `GET /meal-plans/{id}/shopping-list`.
      3. Backend agrega ingredientes das receitas do plano e retorna `ShoppingListResponse`.
      4. UI exibe lista de ingredientes agrupados.
    - Pós-condição: Lista de compras disponível para o usuário.

12) Nome: Avaliar Receita (Rating)
    - Ator: Usuário autenticado
    - Pré-condição: Receita existe; usuário autenticado.
    - Fluxo principal:
      1. Usuário fornece nota e comentário na UI.
      2. Cliente envia `POST /recipes/rating` com payload e token.
      3. Backend persiste `RecipeRating` associado ao usuário e receita.
      4. Retorna confirmação/objeto criado.
    - Pós-condição: Avaliação gravada e visível nas métricas da receita.

13) Nome: Remover/Ajustar Avaliação
    - Ator: Autor da avaliação
    - Pré-condição: Avaliação existe e pertence ao usuário.
    - Fluxo principal:
      1. Usuário seleciona avaliação para editar/remover.
      2. Cliente chama endpoint apropriado (PUT/DELETE conforme implementado).
      3. Backend verifica posse e atualiza/remove a avaliação.
      4. Retorna confirmação.
    - Pós-condição: Avaliação atualizada ou removida.

14) Nome: Submeter Feedback do Sistema
    - Ator: Usuário autenticado
    - Pré-condição: Usuário autenticado; texto de feedback disponível.
    - Fluxo principal:
      1. Usuário preenche formulário de feedback.
      2. Envia para `POST /system-reviews` com token.
      3. Backend persiste o `SystemReview` e retorna confirmação.
    - Pós-condição: Feedback salvo para análise.

15) Nome: Listar Feedbacks (Admin/Relatório)
    - Ator: Administrador (ou processo de análise)
    - Pré-condição: Usuário com permissão de leitura dos reviews.
    - Fluxo principal:
      1. Administrador acessa endpoint de listagem de reviews.
      2. Backend retorna listagem paginada/filtrada de `SystemReview`.
      3. UI ou processo exibe/analisa os feedbacks.
    - Pós-condição: Feedbacks disponíveis para análise.

---

Observações: cada caso de uso assume validações básicas no backend (campos obrigatórios, formatos de data, posse do recurso) e o uso de JWT para endpoints autenticados.
