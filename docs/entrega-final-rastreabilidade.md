## MATRIZ DE RASTREABILIDADE 1:1

| UC | Implementação no backend |
| --- | --- |
| UC01 | `POST /auth/register` em `AuthController` |
| UC02 | `POST /auth/login` em `AuthController` |
| UC03 | `POST /recipes` em `RecipeController` |
| UC04 | `GET /recipes/me` em `RecipeController` |
| UC05 | `PUT /recipes/{recipeId}` em `RecipeController` |
| UC06 | `DELETE /recipes/{recipeId}` em `RecipeController` |
| UC07 | `GET /recipes/search?name=` em `RecipeController` |
| UC08 | `GET /recipes/external/{externalId}` em `RecipeController` |
| UC09 | `POST /favorites` em `FavoriteController` |
| UC10 | `POST /meal-plans` em `MealPlanController` |
| UC11 | `POST /meal-plans` com `items[]` em `MealPlanController` |
| UC12 | `DELETE /meal-plans/{mealPlanId}/items/{itemId}` em `MealPlanController` |
| UC13 | `GET /meal-plans/{mealPlanId}/shopping-list` em `MealPlanController` |
| UC14 | `PUT /users/me` em `UserController` |
| UC15 | `DELETE /users/me` em `UserController` |

# ESTRATÉGIA DE TESTES PARA OS CASOS DE USO

1. Testes Unitários (JUnit 5): Validar os cálculos de lista de compras e regras de validação de campos.
2. Testes de Integração (Spring): Garantir que a integração com a API TheMealDB e as transações no PostgreSQL funcionem corretamente.
3. Testes End-to-End (Cypress): Simular o fluxo completo desde o login até a criação de um plano de refeição no navegador.

# RESULTADOS DE TESTES E COBERTURA

- Backend (Maven): 15 testes executados, 0 falhas, 0 erros. JaCoCo: instruções cobrindo 86.73%, branch coverage 68.18% (relatório em `api/target/site/jacoco/index.html`).
- Frontend (Angular): 25 testes unitários executados, 0 falhas. v8 coverage: statements 57.25%, branches 68.49%, functions 58.33%, lines 58.71% (relatório em `receitasapi-ui/coverage` gerado pelo `ng test`).

## AÇÕES ADICIONAIS EXECUTADAS

- Adicionados testes de integração backend para `RecipeService` e `MealPlanService` em `api/src/test/java/com/receitasapi/api/service/` — validados via `./mvnw.cmd test` e incluídos nos relatórios Surefire/JaCoCo.
- Scaffolded Cypress E2E no frontend: `cypress.config.js`, especificação `cypress/e2e/uc02_uc11_spec.cy.js` e scripts `e2e`/`e2e:run` no `receitasapi-ui/package.json`. Instalei `cypress` como devDependency. Esses testes são E2E smoke flows que assumem `ng serve` e backend em `localhost:8080`.
