# Runbook SonarQube

Este runbook descreve como executar a análise local de SonarQube para o projeto ReceitasApi usando apenas Docker Compose.

Pré-requisitos
- Docker e Docker Compose instalados.
- Portas livres: `9000` para o SonarQube e `5432` para o banco do Sonar, se o ambiente já não estiver usando esses serviços.
- O repositório clonado com os artefatos de backend e frontend disponíveis.

Fluxo recomendado
1. Suba o runner do Sonar junto com o banco e o servidor SonarQube.

```bash
docker compose --profile sonar up --build --abort-on-container-exit sonar
```

2. Aguarde o container `sonar` terminar. Ele faz, nesta ordem:
- valida o SonarQube em `http://sonarqube:9000`
- executa `mvn test` no backend para gerar JaCoCo
- executa a cobertura do frontend via `npm run test:coverage --run`
- roda o `sonar-scanner` com `sonar-project.properties`

3. Abra o painel do SonarQube no navegador.

```text
http://localhost:9000
```

4. Entre com as credenciais padrão do ambiente local.
- Usuário: `admin`
- Senha: `admin`

5. Verifique o projeto `receitasapi` no painel e confirme se a análise concluiu sem erros bloqueantes.

Saídas esperadas
- Cobertura do backend em `api/target/site/jacoco/jacoco.xml`
- Cobertura do frontend em `receitasapi-ui/coverage/lcov.info`
- Resultado da análise visível no painel do SonarQube

Troubleshooting rápido
- Se o runner ficar preso em `Aguardando SonarQube...`, verifique se o container `receitasapi_sonarqube` está saudável.
- Se a análise falhar por falta de cobertura, confirme se os testes do backend e do frontend executam localmente.
- Se o painel não abrir, confirme que a porta `9000` não está ocupada por outro serviço.

Encerramento
- Para parar tudo, use `docker compose --profile sonar down`.