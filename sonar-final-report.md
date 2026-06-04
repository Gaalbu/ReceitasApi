# Sonar Final Report

Projeto: `receitasapi`

Resumo:
- Frontend coverage: `70.09%` statements, `68.32%` branches, `74.54%` functions, `77.84%` lines.
- Backend coverage: JaCoCo gerado em `api/target/site/jacoco/index.html`.
- Reporte frontend: `receitasapi-ui/coverage/receitasapi-frontend/lcov.info`.
- SonarQube configurado via `sonar-project.properties` e `docker-compose.yml`.

Execução recomendada:
```bash
export SONAR_TOKEN=seu_token_aqui
docker compose --profile sonar up --build --abort-on-container-exit sonar
```

Resultado esperado:
- Testes backend e frontend executados no runner.
- `sonar-scanner` enviado ao SonarQube local.
- Painel disponível em `http://localhost:9000`.
