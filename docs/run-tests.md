# Como executar os testes (entrega final)

Este documento descreve, passo a passo, como executar os testes automatizados usados na entrega final: testes unitários, integração e E2E. Siga as etapas exatamente nesta ordem.

Pré-requisitos
- Java 17+, Maven (`./mvnw.cmd` disponível no repositório)
- Node.js + npm (versão compatível com `package.json`)
- Ports livres: `8080` (backend) e `4200` (frontend)

1) Rodar testes backend (unit + integração) e gerar cobertura JaCoCo

- Abra um terminal na raiz do projeto e execute:

```powershell
cd api
.\mvnw.cmd test
```

- Resultado esperado:
  - Relatórios Surefire: `api/target/surefire-reports/`
  - Relatório JaCoCo (HTML): `api/target/site/jacoco/index.html`

2) Rodar testes unitários frontend e gerar cobertura (Vitest / v8)

- No terminal, execute:

```bash
cd gourmethub-ui
npm install   # se ainda não instalou dependências
npm test -- --watch=false --coverage
```

- Resultado esperado:
  - Relatório de cobertura gerado pela ferramenta (v8) e resumo no console.

3) Preparar ambiente para E2E (Cypress)

- Pré-condições: backend e frontend rodando localmente nas portas abaixo.
  - Backend: `http://localhost:8080` (Spring Boot)
  - Frontend: `http://localhost:4200` (ng serve)

- Em terminais separados inicie:

```powershell
# terminal A: start backend
cd api
.\mvnw.cmd spring-boot:run

# terminal B: start frontend
cd gourmethub-ui
npm start
```

4) Rodar os testes E2E (headless)

- Com backend e frontend rodando, execute em outro terminal:

```bash
cd gourmethub-ui
npm run e2e:run
```

- Observações:
  - Os testes E2E assumem que a API de registro/login está disponível em `/auth` e endpoints de receitas/planos em `/recipes` e `/meal-plans`.
  - Caso o ambiente local possua dados de teste, os scripts tentam criar um usuário `e2euser`. Se já existir, a etapa de criação pode retornar 409; neste caso apague o usuário do banco de testes ou ajuste o payload no spec.

5) Artefatos e logs

- Reports de backend: `api/target/surefire-reports/` e `api/target/site/jacoco/`.
- Reports de frontend unitário: saída do `ng test`/Vitest (coverage no console). Para resultados detalhados, verifique a pasta de coverage gerada pelo builder (quando aplicável).
- Logs E2E: saída do `npm run e2e:run` no terminal; vídeos/screenshots (se configurados) aparecem em `gourmethub-ui/cypress/videos` e `gourmethub-ui/cypress/screenshots`.