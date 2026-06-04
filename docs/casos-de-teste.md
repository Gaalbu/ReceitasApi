# Casos de Teste

| ID | UC relacionado | Objetivo | Pre-condicoes | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT01 | UC01 | Registrar usuario unico | Banco limpo | username/email novos | Enviar cadastro | 201/200 e token | A validar | Pendente |
| CT02 | UC01 | Registrar duplicado | Usuario existente | username/email repetidos | Enviar cadastro | 400/409 | A validar | Pendente |
| CT03 | UC02 | Login valido | Usuario cadastrado | credenciais corretas | Enviar login | token JWT | A validar | Pendente |
| CT04 | UC02 | Login invalido | Usuario cadastrado | senha errada | Enviar login | 401 Unauthorized | A validar | Pendente |
| CT05 | UC05 | Criar receita | Autenticado | campos obrigatorios | POST /recipes | 200/201 e persiste | A validar | Pendente |
| CT06 | UC05 | Criar receita sem titulo | Autenticado | titulo vazio | POST /recipes | 400 Bad Request | A validar | Pendente |
| CT07 | UC07 | Editar receita do dono | Autenticado e dono | dados novos | PUT /recipes/{id} | 200 atualizado | A validar | Pendente |
| CT08 | UC07 | Editar receita de outro usuario | Autenticado nao dono | dados novos | PUT /recipes/{id} | 403 Forbidden | A validar | Pendente |
| CT09 | UC08 | Excluir receita do dono | Autenticado e dono | id da receita | DELETE /recipes/{id} | 204 No Content | A validar | Pendente |
| CT10 | UC09 | Criar plano semanal | Autenticado | nome + data + itens | POST /meal-plans | 200/201 e persiste | A validar | Pendente |
| CT11 | UC09 | Criar plano sem itens | Autenticado | sem itens | POST /meal-plans | 400 Bad Request | A validar | Pendente |
| CT12 | UC11 | Listar planos do usuario | Autenticado | n/a | GET /meal-plans | lista apenas proprios | A validar | Pendente |
| CT13 | UC12 | Editar plano do dono | Autenticado e dono | nome/semana | PUT /meal-plans/{id} | 200 atualizado | A validar | Pendente |
| CT14 | UC12 | Editar plano de outro usuario | Autenticado nao dono | nome/semana | PUT /meal-plans/{id} | 403 Forbidden | A validar | Pendente |
| CT15 | UC13 | Excluir plano do dono | Autenticado e dono | id do plano | DELETE /meal-plans/{id} | 204 e remove itens | A validar | Pendente |
| CT16 | UC04 | Buscar TheMealDB | Autenticado | termo valido | GET /recipes/search | resultados exibidos | A validar | Pendente |
| CT17 | UC04 | API externa fora do ar | Autenticado | termo qualquer | GET /recipes/search | mensagem de erro | A validar | Pendente |
| CT18 | UC06 | Visualizar lista receitas | Autenticado | n/a | abrir tela | lista carregada | A validar | Pendente |
| CT19 | UC06 | Lista vazia receitas | Autenticado sem receitas | n/a | abrir tela | mensagem vazia | A validar | Pendente |
| CT20 | UC10 | Vincular receita ao plano | Autenticado | receita selecionada | salvar plano | item vinculado | A validar | Pendente |
| CT21 | UC10 | Receita invalida no plano | Autenticado | id invalido | salvar plano | erro | A validar | Pendente |
| CT22 | UC14 | Submeter review | Autenticado | nota e comentario | POST /system-reviews | review salvo | A validar | Pendente |
| CT23 | UC14 | Review invalido | Autenticado | dados vazios | POST /system-reviews | 400 Bad Request | A validar | Pendente |
| CT24 | UC15 | Editar review proprio | Autenticado e dono | nota/comentario | PUT /system-reviews/{id} | 200 atualizado | A validar | Pendente |
| CT25 | UC15 | Excluir review proprio | Autenticado e dono | id review | DELETE /system-reviews/{id} | 204 | A validar | Pendente |
| CT26 | UC15 | Editar review de outro usuario | Autenticado nao dono | dados novos | PUT /system-reviews/{id} | 403 Forbidden | A validar | Pendente |
| CT27 | UC03 | Logout | Autenticado | token atual | sair | token removido | A validar | Pendente |
| CT28 | UC11 | Listar planos ao entrar | Autenticado | n/a | abrir tela planos | planos aparecem | A validar | Pendente |
| CT29 | UC05 | Criar receita customizada e listar | Autenticado | titulo e ingredientes | salvar e listar | item na lista | A validar | Pendente |
| CT30 | UC13 | Excluir plano e sumir da lista | Autenticado e dono | id plano | excluir | some do dashboard | A validar | Pendente |
