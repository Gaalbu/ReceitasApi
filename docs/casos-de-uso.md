# Casos de Uso

## UC01 - Registrar usuário
- ID: UC01
- Nome: Registrar usuário
- Ator principal: Visitante
- Pré-condições: Não possuir conta ativa.
- Fluxo principal:
  1. O visitante acessa a tela de cadastro.
  2. Informa username, email e senha.
  3. Envia os dados para o sistema.
  4. O sistema valida os campos.
  5. O sistema cria o usuário.
- Fluxos alternativos:
  - FA01: Se username ou email já existir, o sistema rejeita o cadastro.
- Pós-condições: Conta criada.

## UC02 - Fazer login
- ID: UC02
- Nome: Fazer login
- Ator principal: Usuário cadastrado
- Pré-condições: Possuir credenciais válidas.
- Fluxo principal:
  1. O usuário acessa a tela de login.
  2. Informa username e senha.
  3. Envia as credenciais.
  4. O sistema autentica o usuário.
  5. O sistema retorna o JWT.
- Fluxos alternativos:
  - FA01: Se as credenciais forem inválidas, o sistema retorna erro.
- Pós-condições: Sessão autenticada.

## UC03 - Fazer logout
- ID: UC03
- Nome: Fazer logout
- Ator principal: Usuário autenticado
- Pré-condições: Estar autenticado.
- Fluxo principal:
  1. O usuário aciona logout.
  2. O cliente remove o token local.
  3. O cliente redireciona para login.
- Fluxos alternativos:
  - FA01: Se não houver token, a ação apenas encerra a sessão local.
- Pós-condições: Sessão encerrada no cliente.

## UC04 - Buscar receita na TheMealDB
- ID: UC04
- Nome: Buscar receita na TheMealDB
- Ator principal: Usuário
- Pré-condições: Ter acesso à tela de busca.
- Fluxo principal:
  1. O usuário informa um termo de busca.
  2. O sistema consulta a API externa.
  3. O sistema exibe os resultados.
- Fluxos alternativos:
  - FA01: Se não houver resultado, o sistema exibe lista vazia.
- Pós-condições: Receitas externas exibidas.

## UC05 - Criar receita customizada
- ID: UC05
- Nome: Criar receita customizada
- Ator principal: Usuário autenticado
- Pré-condições: Estar autenticado.
- Fluxo principal:
  1. O usuário abre o formulário de receita.
  2. Informa título, ingredientes e instruções.
  3. Envia o formulário.
  4. O sistema salva a receita.
- Fluxos alternativos:
  - FA01: Se campos obrigatórios faltarem, o sistema rejeita o envio.
- Pós-condições: Receita criada.

## UC06 - Editar receita própria
- ID: UC06
- Nome: Editar receita própria
- Ator principal: Dono da receita
- Pré-condições: Receita existente e pertencente ao usuário.
- Fluxo principal:
  1. O usuário seleciona uma receita própria.
  2. O sistema abre o formulário preenchido.
  3. O usuário altera os dados.
  4. O sistema atualiza a receita.
- Fluxos alternativos:
  - FA01: Se a receita não pertencer ao usuário, o sistema bloqueia a ação.
- Pós-condições: Receita atualizada.

## UC07 - Excluir receita própria
- ID: UC07
- Nome: Excluir receita própria
- Ator principal: Dono da receita
- Pré-condições: Receita existente e pertencente ao usuário.
- Fluxo principal:
  1. O usuário solicita exclusão.
  2. O sistema exibe confirmação.
  3. O usuário confirma a ação.
  4. O sistema remove a receita.
- Fluxos alternativos:
  - FA01: Se o usuário não for o dono, o sistema retorna 403.
- Pós-condições: Receita removida.

## UC08 - Criar plano de refeição
- ID: UC08
- Nome: Criar plano de refeição
- Ator principal: Usuário autenticado
- Pré-condições: Estar autenticado.
- Fluxo principal:
  1. O usuário abre o formulário de plano.
  2. Informa nome, data inicial e itens do calendário.
  3. Envia o formulário.
  4. O sistema persiste o plano e os itens.
- Fluxos alternativos:
  - FA01: Se não houver itens válidos, o sistema rejeita o envio.
- Pós-condições: Plano criado.

## UC09 - Adicionar receita ao plano
- ID: UC09
- Nome: Adicionar receita ao plano
- Ator principal: Usuário autenticado
- Pré-condições: Plano existente e receita válida.
- Fluxo principal:
  1. O usuário seleciona um dia e refeição.
  2. Escolhe uma receita válida.
  3. O sistema associa a receita ao item do plano.
- Fluxos alternativos:
  - FA01: Se a receita não for válida, o sistema rejeita a associação.
- Pós-condições: Item incluído no plano.

## UC10 - Editar plano de refeição
- ID: UC10
- Nome: Editar plano de refeição
- Ator principal: Dono do plano
- Pré-condições: Plano existente e pertencente ao usuário.
- Fluxo principal:
  1. O usuário abre a listagem de planos.
  2. Seleciona editar.
  3. Informa nome e número da semana.
  4. O sistema atualiza o plano.
- Fluxos alternativos:
  - FA01: Se não for o dono, o sistema retorna 403.
- Pós-condições: Plano atualizado.

## UC11 - Excluir plano de refeição
- ID: UC11
- Nome: Excluir plano de refeição
- Ator principal: Dono do plano
- Pré-condições: Plano existente e pertencente ao usuário.
- Fluxo principal:
  1. O usuário solicita a exclusão.
  2. O sistema valida a posse.
  3. O sistema remove o plano e seus itens.
- Fluxos alternativos:
  - FA01: Se o usuário não for o dono, o sistema retorna 403.
- Pós-condições: Plano removido.

## UC12 - Submeter review do sistema
- ID: UC12
- Nome: Submeter review do sistema
- Ator principal: Usuário autenticado
- Pré-condições: Estar autenticado.
- Fluxo principal:
  1. O usuário acessa a área de reviews.
  2. Informa nota e comentário.
  3. Envia o formulário.
  4. O sistema salva o review.
- Fluxos alternativos:
  - FA01: Se dados obrigatórios faltarem, o sistema rejeita a solicitação.
- Pós-condições: Review gravado.

## UC13 - Editar review próprio
- ID: UC13
- Nome: Editar review próprio
- Ator principal: Dono do review
- Pré-condições: Review existente e pertencente ao usuário.
- Fluxo principal:
  1. O usuário seleciona o review próprio.
  2. O sistema preenche o formulário.
  3. O usuário altera nota e comentário.
  4. O sistema atualiza o review.
- Fluxos alternativos:
  - FA01: Se não for o dono, o sistema retorna 403.
- Pós-condições: Review atualizado.

## UC14 - Excluir review próprio
- ID: UC14
- Nome: Excluir review próprio
- Ator principal: Dono do review ou ADMIN
- Pré-condições: Review existente.
- Fluxo principal:
  1. O usuário solicita exclusão.
  2. O sistema valida se o usuário é dono ou ADMIN.
  3. O sistema remove o review.
- Fluxos alternativos:
  - FA01: Se não for dono nem ADMIN, o sistema retorna 403.
- Pós-condições: Review removido.

## UC15 - Avaliar receita com rating
- ID: UC15
- Nome: Avaliar receita com rating
- Ator principal: Usuário autenticado
- Pré-condições: Receita existente e usuário autenticado.
- Fluxo principal:
  1. O usuário seleciona uma receita.
  2. Informa nota e comentário.
  3. O sistema salva a avaliação.
- Fluxos alternativos:
  - FA01: Se a receita não existir, o sistema retorna erro.
- Pós-condições: Avaliação registrada.
