# ReceitasApi

Aplicação web de gestão gastronômica com backend Spring Boot, frontend Angular SSR, autenticação JWT, cobertura automatizada e análise SonarQube.

## Entrega
- 15 casos de uso implementados.
- 5 telas principais apresentadas na demo: login, cadastro, receitas, planos semanais e reviews.
- Testes unitários, integração e E2E funcionando.
- Cobertura atual acima da meta mínima do frontend (`70.09%` statements) e backend com JaCoCo gerado.
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
- LCOV: `receitasapi-ui/coverage/receitasapi-frontend/lcov.info`
- SonarQube: `http://localhost:9000`

## SonarQube
Primeira execução no Windows/PowerShell:

```powershell
copy .env.example .env
notepad .env
npm run sonar:all
```

No `.env`, preencha `SONAR_TOKEN` com um token válido do SonarQube local. Se preferir usar usuário e senha, deixe `SONAR_TOKEN` vazio e preencha `SONAR_LOGIN` e `SONAR_PASSWORD`.

Depois que o `.env` estiver criado, nas próximas execuções basta rodar:

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
