# Casos de Teste

| ID | Caso de uso relacionado | Objetivo | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT01 | UC01 | Registrar usuário com sucesso | Nenhuma conta existente | username/email/senha válidos | Enviar cadastro | Usuário criado | Usuário criado | Aprovado |
| CT02 | UC01 | Rejeitar email duplicado | Email já cadastrado | email repetido | Enviar cadastro | Erro 400 | Erro 400 | Aprovado |
| CT03 | UC02 | Login válido | Usuário cadastrado | credenciais corretas | Enviar login | JWT retornado | JWT retornado | Aprovado |
| CT04 | UC02 | Login inválido | Usuário cadastrado | senha errada | Enviar login | Erro 401 | Erro 401 | Aprovado |
| CT05 | UC03 | Logout limpar sessão | Usuário logado | token presente | Acionar logout | Token removido | Token removido | Aprovado |
| CT06 | UC03 | Logout sem token | Sessão vazia | nenhum | Acionar logout | Sem erro | Sem erro | Aprovado |
| CT07 | UC04 | Buscar receita externa | API disponível | termo válido | Pesquisar termo | Lista exibida | Lista exibida | Aprovado |
| CT08 | UC04 | Buscar termo sem resultado | API disponível | termo inexistente | Pesquisar termo | Lista vazia | Lista vazia | Aprovado |
| CT09 | UC05 | Criar receita | Usuário autenticado | dados válidos | Enviar formulário | Receita criada | Receita criada | Aprovado |
| CT10 | UC05 | Criar receita inválida | Usuário autenticado | título vazio | Enviar formulário | Validação exibida | Validação exibida | Aprovado |
| CT11 | UC06 | Editar receita própria | Receita do usuário | novos campos | Abrir edição e salvar | Receita atualizada | Receita atualizada | Aprovado |
| CT12 | UC06 | Editar receita de outro usuário | Receita de terceiro | mesmos campos | Tentar editar | 403 Forbidden | 403 Forbidden | Aprovado |
| CT13 | UC07 | Excluir receita própria | Receita do usuário | id da receita | Confirmar exclusão | Receita removida | Receita removida | Aprovado |
| CT14 | UC07 | Excluir receita de outro usuário | Receita de terceiro | id da receita | Confirmar exclusão | 403 Forbidden | 403 Forbidden | Aprovado |
| CT15 | UC08 | Criar plano de refeição | Usuário autenticado | nome/data/itens | Salvar plano | Plano criado | Plano criado | Aprovado |
| CT16 | UC08 | Criar plano sem itens | Usuário autenticado | sem itens | Salvar plano | Erro de validação | Erro de validação | Aprovado |
| CT17 | UC09 | Adicionar receita ao plano | Plano e receita válidos | recipe_id válido | Salvar item | Item incluído | Item incluído | Aprovado |
| CT18 | UC09 | Adicionar receita inválida | Receita inexistente | recipe_id inválido | Salvar item | Erro 404 | Erro 404 | Aprovado |
| CT19 | UC10 | Editar plano próprio | Plano do usuário | nome/week_number | Salvar edição | Plano atualizado | Plano atualizado | Aprovado |
| CT20 | UC10 | Editar plano de terceiro | Plano de outro usuário | mesmos dados | Salvar edição | 403 Forbidden | 403 Forbidden | Aprovado |
| CT21 | UC11 | Excluir plano próprio | Plano do usuário | id do plano | Confirmar exclusão | Plano removido | Plano removido | Aprovado |
| CT22 | UC11 | Excluir plano de terceiro | Plano de outro usuário | id do plano | Confirmar exclusão | 403 Forbidden | 403 Forbidden | Aprovado |
| CT23 | UC12 | Submeter review | Usuário autenticado | rating/comment válidos | Enviar review | Review salvo | Review salvo | Aprovado |
| CT24 | UC12 | Submeter review inválido | Usuário autenticado | rating vazio | Enviar review | Validação | Validação | Aprovado |
| CT25 | UC13 | Editar review próprio | Review do usuário | nota/comentário novos | Salvar edição | Review atualizado | Review atualizado | Aprovado |
| CT26 | UC13 | Editar review de outro usuário | Review de terceiro | mesmos dados | Salvar edição | 403 Forbidden | 403 Forbidden | Aprovado |
| CT27 | UC14 | Excluir review próprio | Review do usuário | id do review | Confirmar exclusão | Review removido | Review removido | Aprovado |
| CT28 | UC14 | Excluir review como ADMIN | Review de terceiro | id do review | Confirmar exclusão | Review removido | Review removido | Aprovado |
| CT29 | UC15 | Avaliar receita com rating | Receita válida | nota/comment | Enviar avaliação | Avaliação salva | Avaliação salva | Aprovado |
| CT30 | UC15 | Avaliar receita inexistente | Receita inexistente | nota/comment | Enviar avaliação | Erro 404 | Erro 404 | Aprovado |
