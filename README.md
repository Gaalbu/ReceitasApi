# ReceitasApi

Aplicação web de gestão gastronômica com backend Spring Boot, frontend Angular SSR, autenticação JWT, cobertura automatizada e análise SonarQube.

## Entrega
- 15 casos de uso implementados.
- 5 telas principais apresentadas na demo: login, cadastro, receitas, planos semanais e reviews.
- Testes unitários, integração e E2E funcionando.
- Cobertura do frontend reproduzida em 2026-08-08: `70.15%` statements, `68.02%` branches, `74.42%` functions e `77.81%` lines. O backend gera relatório JaCoCo quando executado com Java 21.
- Análise estática preparada via SonarQube no `docker-compose`.

## Como executar
No Windows/PowerShell, rode na raiz do projeto:

```powershell
docker compose up --build
```

Sem Docker:
```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd api; .\mvnw.cmd spring-boot:run'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd receitasapi-ui; npm start'
```

## Testes
Backend:

```powershell
cd api
.\mvnw.cmd test
.\mvnw.cmd verify -P integration-tests
cd ..
```

Frontend com cobertura:

```powershell
cd receitasapi-ui
npm test -- --watch=false --code-coverage
cd ..
```

E2E:

```powershell
npm run test:playwright
```

E2E oficial: Playwright em `receitasapi-ui/tests`.

## Relatórios
- JaCoCo: `api/target/site/jacoco/index.html`
- LCOV: `receitasapi-ui/coverage/lcov.info`
- SonarQube: `http://localhost:9000`

## SonarQube
Fluxo recomendado para apresentação no Windows/PowerShell:

```powershell
npm run sonar:setup
npm run sonar:all
```

O comando `npm run sonar:setup` sobe o SonarQube, configura o login local, gera o token do scanner e grava o `.env` automaticamente. O comando `npm run sonar:all` acompanha os logs ate a analise terminar e abre o dashboard somente no final.

Login do SonarQube local:

```text
URL: http://localhost:9000
Login: admin
Senha: ReceitasApi@123
```

Se o login não funcionar porque o volume local já tinha outra senha, resetar e preparar de novo:

```powershell
npm run sonar:setup:reset
npm run sonar:all
```

O comando `npm run sonar:setup:reset` apaga os volumes do SonarQube local, recria o admin com a senha acima e gera um novo token.

O runner usa autenticação por token e falha antes do scanner se `SONAR_TOKEN` não estiver definido.

Se usar variável de ambiente em vez de `.env`, rode sempre no mesmo terminal:

```powershell
$env:SONAR_TOKEN='SEU_TOKEN_DO_SONAR'
npm run sonar:all
```

Depois que o `.env` estiver criado e preenchido, nas próximas execuções basta rodar:

```powershell
npm run sonar:all
```

O comando `npm run sonar:all` roda os testes, gera as coberturas, publica a análise e abre o SonarQube local em `http://localhost:9000`.

## Casos de uso
- UC01 registrar usuário
- UC02 login
- UC03 logout
- UC04 buscar receita externa
- UC05 criar receita
- UC06 editar receita
- UC07 excluir receita
- UC08 criar plano semanal
- UC09 adicionar receita ao plano
- UC10 editar plano
- UC11 excluir plano
- UC12 submeter review
- UC13 editar review
- UC14 excluir review
- UC15 avaliar receita
