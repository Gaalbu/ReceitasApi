# ReceitasApi

Aplicação web de gestão gastronômica com backend Spring Boot, frontend Angular SSR, autenticação JWT, cobertura automatizada e análise SonarQube.

## Entrega
- 15 casos de uso implementados.
- 5 áreas funcionais apresentadas na demo: autenticação, receitas, planos semanais, reviews/ratings e navegação.
- Testes unitários, integração e E2E funcionando.
- Cobertura atual acima da meta mínima do frontend (`70.09%` statements) e backend com JaCoCo gerado.
- Análise estática preparada via SonarQube no `docker-compose`.

## Como executar
```bash
docker compose up --build
```

Sem Docker:
```bash
cd api && .\mvnw.cmd spring-boot:run
cd receitasapi-ui && npm start
```

## Testes
```bash
cd api && .\mvnw.cmd test
cd api && .\mvnw.cmd verify -P integration-tests
cd receitasapi-ui && npm test -- --watch=false --code-coverage
npx playwright test
```

## Relatórios
- JaCoCo: `api/target/site/jacoco/index.html`
- LCOV: `receitasapi-ui/coverage/receitasapi-frontend/lcov.info`
- SonarQube: `http://localhost:9000`

## SonarQube
```bash
export SONAR_TOKEN=seu_token_aqui
docker compose --profile sonar up --build --abort-on-container-exit sonar
```

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
