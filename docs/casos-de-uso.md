# Casos de Uso

## UC01 - Registrar usuario
**Ator principal:** visitante
**Pre-condicoes:** nao estar autenticado.
**Fluxo principal:**
1. O visitante informa username, email e senha.
2. O sistema valida os dados.
3. O sistema cria a conta e devolve o JWT.
**Fluxos alternativos:**
- FA01: username/email duplicado -> retorna erro de cadastro.
- FA02: dados invalidos -> solicita correcao.
**Pos-condicoes:** usuario cadastrado e autenticado.

## UC02 - Fazer login
**Ator principal:** usuario cadastrado
**Pre-condicoes:** conta existente.
**Fluxo principal:**
1. O usuario informa credenciais.
2. O sistema valida login e senha.
3. O sistema retorna JWT.
**Fluxos alternativos:**
- FA01: senha invalida -> acesso negado.
**Pos-condicoes:** usuario autenticado.

## UC03 - Fazer logout
**Ator principal:** usuario autenticado
**Pre-condicoes:** usuario logado.
**Fluxo principal:**
1. O usuario aciona sair.
2. O cliente remove o token.
**Fluxos alternativos:**
- FA01: token ausente -> apenas encerra a sessao local.
**Pos-condicoes:** usuario desautenticado.

## UC04 - Buscar receita na TheMealDB
**Ator principal:** usuario autenticado
**Pre-condicoes:** tela de receitas aberta.
**Fluxo principal:**
1. O usuario informa o termo.
2. O sistema consulta a API TheMealDB.
3. O sistema exibe os resultados.
**Fluxos alternativos:**
- FA01: API fora do ar -> exibe mensagem de erro.
**Pos-condicoes:** resultados exibidos na tela.

## UC05 - Criar receita customizada
**Ator principal:** usuario autenticado
**Pre-condicoes:** usuario logado.
**Fluxo principal:**
1. O usuario preenche titulo, ingredientes e instrucoes.
2. O sistema valida e salva.
3. A receita aparece na lista.
**Fluxos alternativos:**
- FA01: campos obrigatorios vazios -> erro de validacao.
**Pos-condicoes:** receita persistida.

## UC06 - Visualizar lista de receitas
**Ator principal:** usuario autenticado
**Pre-condicoes:** existir receita do usuario.
**Fluxo principal:**
1. O usuario acessa a tela de receitas.
2. O sistema carrega as receitas do usuario.
3. A lista e apresentada.
**Fluxos alternativos:**
- FA01: sem receitas -> mensagem de lista vazia.
**Pos-condicoes:** usuario visualiza suas receitas.

## UC07 - Editar receita propria
**Ator principal:** usuario autenticado
**Pre-condicoes:** receita pertencente ao usuario.
**Fluxo principal:**
1. O usuario clica em editar.
2. O sistema carrega os dados no formulario.
3. O usuario salva alteracoes.
**Fluxos alternativos:**
- FA01: receita de outro usuario -> proibido.
**Pos-condicoes:** receita atualizada.

## UC08 - Excluir receita propria
**Ator principal:** usuario autenticado
**Pre-condicoes:** receita pertencente ao usuario.
**Fluxo principal:**
1. O usuario confirma a exclusao.
2. O sistema remove a receita.
3. A lista e atualizada.
**Fluxos alternativos:**
- FA01: cancelamento na confirmacao -> nenhuma acao.
**Pos-condicoes:** receita removida.

## UC09 - Criar plano de refeicao
**Ator principal:** usuario autenticado
**Pre-condicoes:** usuario logado e receitas disponiveis.
**Fluxo principal:**
1. O usuario informa nome, data inicial e itens.
2. O sistema valida e salva o plano.
3. O plano aparece na listagem.
**Fluxos alternativos:**
- FA01: sem itens validos -> erro.
**Pos-condicoes:** plano salvo.

## UC10 - Adicionar receita ao plano de refeicao
**Ator principal:** usuario autenticado
**Pre-condicoes:** plano existente.
**Fluxo principal:**
1. O usuario seleciona uma receita para um dia/refeicao.
2. O sistema vincula a receita ao item do plano.
**Fluxos alternativos:**
- FA01: receita invalida -> erro.
**Pos-condicoes:** item do plano atualizado.

## UC11 - Visualizar planos de refeicao
**Ator principal:** usuario autenticado
**Pre-condicoes:** existir plano do usuario.
**Fluxo principal:**
1. O usuario abre a tela de planos.
2. O sistema lista apenas os planos do usuario.
**Fluxos alternativos:**
- FA01: nenhum plano -> tela vazia.
**Pos-condicoes:** planos visiveis.

## UC12 - Editar plano de refeicao
**Ator principal:** usuario autenticado
**Pre-condicoes:** plano pertencente ao usuario.
**Fluxo principal:**
1. O usuario clica em editar.
2. O sistema carrega nome e semana.
3. O usuario salva a alteracao.
**Fluxos alternativos:**
- FA01: plano de outro usuario -> proibido.
**Pos-condicoes:** plano atualizado.

## UC13 - Excluir plano de refeicao
**Ator principal:** usuario autenticado
**Pre-condicoes:** plano pertencente ao usuario.
**Fluxo principal:**
1. O usuario confirma a exclusao.
2. O sistema remove o plano e seus itens.
**Fluxos alternativos:**
- FA01: cancelamento -> nenhuma acao.
**Pos-condicoes:** plano removido.

## UC14 - Submeter review do sistema
**Ator principal:** usuario autenticado
**Pre-condicoes:** usuario logado.
**Fluxo principal:**
1. O usuario informa nota e comentario.
2. O sistema salva o review.
3. O review aparece na lista.
**Fluxos alternativos:**
- FA01: dados invalidos -> erro.
**Pos-condicoes:** review persistido.

## UC15 - Editar/excluir review proprio
**Ator principal:** usuario autenticado
**Pre-condicoes:** review do proprio usuario.
**Fluxo principal:**
1. O usuario clica em editar ou excluir.
2. O sistema valida a autoria.
3. O sistema atualiza ou remove o review.
**Fluxos alternativos:**
- FA01: review de outro usuario -> proibido.
**Pos-condicoes:** review alterado ou removido.
