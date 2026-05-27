type AuthUser = {
  username: string;
  email: string;
  password: string;
};

type ExternalMeal = {
  idMeal: string;
  strMeal: string;
  strInstructions: string;
  strMealThumb: string;
};

const apiBase = Cypress.env('apiUrl') as string;

function buildUser(tag: string): AuthUser {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return {
    username: `${tag}-${stamp}`,
    email: `${tag}-${stamp}@example.com`,
    password: 'Pass123!'
  };
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function registerAndLogin(user: AuthUser) {
  cy.request('POST', `${apiBase}/auth/register`, user);
  return cy.request('POST', `${apiBase}/auth/login`, {
    username: user.username,
    password: user.password
  }).its('body.token');
}

function visitWithToken(path: string, token: string, demoMode = false) {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('token', token);
      if (demoMode) {
        win.localStorage.setItem('receitasapi_demo_mode', '1');
      }
    }
  });
}

function stubExternalSearch(term: string, meal: ExternalMeal) {
  cy.intercept('GET', `**/api/recipes/search?name=${encodeURIComponent(term)}*`, {
    statusCode: 200,
    body: { meals: [meal] }
  }).as(`search_${term.replace(/[^a-z0-9]/gi, '_')}`);
}

describe('Entrega final - rastreabilidade', () => {
  it('cobre cadastro, login, CRUD de receitas, busca externa, favoritos e avaliacoes', () => {
    const user = buildUser('uc123');
    const recipeTitle = `Receita Cypress ${Date.now()}`;
    const updatedRecipeTitle = `${recipeTitle} Atualizada`;
    const externalMeal: ExternalMeal = {
      idMeal: '52772',
      strMeal: 'Teriyaki Chicken Casserole',
      strInstructions: 'Mix sauce, bake chicken and serve hot with rice.',
      strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg'
    };

    registerAndLogin(user).then((token) => {
      visitWithToken('/my-recipes', token);

      cy.contains('h1', 'Gestão completa de receitas').should('be.visible');
      cy.get('#recipe-title').type(recipeTitle);
      cy.get('#recipe-ingredients').type('Farinha, água, sal, azeite');
      cy.get('#recipe-instructions').type('Misturar tudo e assar');
      cy.get('#recipe-prep-time').clear().type('25');
      cy.get('#recipe-submit').click();

      cy.contains('td', recipeTitle).should('be.visible');
      cy.get('[data-recipe-id]').first().invoke('attr', 'data-recipe-id').then((recipeId) => {
        expect(recipeId).to.exist;
        const createdRecipeId = recipeId as string;

        cy.contains('button', 'Editar').first().click();
        cy.get('#recipe-title').should('have.value', recipeTitle);
        cy.get('#recipe-title').clear().type(updatedRecipeTitle);
        cy.get('#recipe-prep-time').clear().type('30');
        cy.get('#recipe-submit').click();
        cy.contains('td', updatedRecipeTitle).should('be.visible');

        cy.on('window:confirm', () => true);
        cy.contains('button', 'Remover').first().click();
        cy.get(`[data-recipe-id="${createdRecipeId}"]`).should('not.exist');

        visitWithToken('/', token);
        stubExternalSearch('chicken', externalMeal);

        cy.get('input[formControlName="q"]').clear().type('chicken');
        cy.contains('button', 'Buscar').click();
        cy.contains('.card-title', externalMeal.strMeal).should('be.visible');
        cy.contains('button', 'Avaliar esta receita').click();
        cy.contains('h4', `Avaliar receita #${externalMeal.idMeal}`).should('be.visible');

        cy.intercept('POST', `**/api/recipes/${externalMeal.idMeal}/ratings`, {
          statusCode: 200,
          body: { id: 999, recipeId: Number(externalMeal.idMeal), rating: 5, comment: 'ok' }
        }).as('externalRating');
        cy.get('input[formControlName="rating"]').clear().type('5');
        cy.get('textarea[formControlName="comment"]').type('ok');
        cy.contains('button', 'Enviar Avaliação').click();
        cy.wait('@externalRating');
        cy.contains('.alert-info', 'Avaliação enviada').should('be.visible');

        visitWithToken('/favorites', token, true);
        cy.contains('h2', 'Favoritos').should('be.visible');
        cy.contains('button', '+ Adicionar favorito').click();

        stubExternalSearch('chicken', externalMeal);
        cy.get('#favorite-search').clear().type('chicken');
        cy.contains('button', 'Buscar').click();
        cy.wait('@search_chicken');
        cy.get('#favorite-recipe-id').select(externalMeal.idMeal);
        cy.get('#favorite-title').should('have.value', externalMeal.strMeal);

        stubExternalSearch('salad', {
          idMeal: '60001',
          strMeal: 'Fresh Salad Bowl',
          strInstructions: 'Mix greens, tomatoes and dressing.',
          strMealThumb: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg'
        });
        cy.get('#favorite-search').clear().type('salad');
        cy.contains('button', 'Buscar').click();
        cy.wait('@search_salad');
        cy.get('#favorite-recipe-id').should('have.value', externalMeal.idMeal);

        cy.contains('button', 'Salvar').click();
        cy.contains('td', externalMeal.idMeal).should('be.visible');
        cy.contains('td', externalMeal.strMeal).should('be.visible');
        cy.contains('button', 'Editar').first().click();
        cy.get('#favorite-edit-title').clear().type(`${externalMeal.strMeal} editado`);
        cy.contains('button', 'Salvar').click();
        cy.contains('td', `${externalMeal.strMeal} editado`).should('be.visible');
        cy.contains('button', 'Remover').first().click();
        cy.contains('td', `${externalMeal.strMeal} editado`).should('not.exist');

        visitWithToken('/ratings', token, true);
        cy.contains('h2', 'Avaliações').should('be.visible');
        cy.get('#rating-recipe-id').select(createdRecipeId);
        cy.get('#rating-score').clear().type('4');

        stubExternalSearch('pasta', {
          idMeal: '60002',
          strMeal: 'Pasta Primavera',
          strInstructions: 'Cook pasta and mix with vegetables.',
          strMealThumb: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg'
        });
        cy.get('#rating-search').clear().type('pasta');
        cy.contains('button', 'Buscar').click();
        cy.wait('@search_pasta');
        cy.get('#rating-recipe-id').should('have.value', createdRecipeId);

        cy.contains('button', 'Adicionar').click();
        cy.contains('td', `Receita ${createdRecipeId}`).should('be.visible');
        cy.contains('td', '4').should('be.visible');
        cy.contains('button', 'Editar').first().click();
        cy.get('#rating-edit-score').clear().type('5');
        cy.contains('button', 'Salvar').click();
        cy.contains('td', '5').should('be.visible');
        cy.contains('button', 'Editar').first().click();
        cy.get('#rating-edit-score').clear().type('3');
        cy.contains('button', 'Salvar').click();
        cy.contains('td', '3').should('be.visible');
      });
    });
  });

  it('cobre plano semanal, lista de compras e remoção de item', () => {
    const user = buildUser('uc101113');
    const recipeTitle = `Plano Cypress ${Date.now()}`;

    registerAndLogin(user).then((token) => {
      visitWithToken('/my-recipes', token);

      cy.get('#recipe-title').type(recipeTitle);
      cy.get('#recipe-ingredients').type('Arroz, feijao, frango, tomate');
      cy.get('#recipe-instructions').type('Preparar e servir');
      cy.get('#recipe-prep-time').clear().type('20');
      cy.get('#recipe-submit').click();

      cy.get('[data-recipe-id]').first().invoke('attr', 'data-recipe-id').then((recipeId) => {
        expect(recipeId).to.exist;
        const createdRecipeId = recipeId as string;

        visitWithToken('/meal-plans', token);
        cy.contains('h3', 'Plano Semanal de Refeições').should('be.visible');

        stubExternalSearch('frango', {
          idMeal: '60003',
          strMeal: 'Frango Assado',
          strInstructions: 'Season and roast the chicken.',
          strMealThumb: 'https://www.themealdb.com/images/media/meals/ctpsxq1511434362.jpg'
        });
        cy.get('#meal-search').clear().type('frango');
        cy.contains('button', 'Atualizar opções').click();
        cy.wait('@search_frango');
        cy.get('input[formControlName="plan_name"]').type('Semana Cypress');
        cy.get('input[formControlName="start_date"]').type('2026-05-27');
        cy.get('select[formcontrolname="MONDAY_LUNCH"]').select(createdRecipeId);
        cy.get('select[formcontrolname="MONDAY_DINNER"]').select(createdRecipeId);

        stubExternalSearch('massa', {
          idMeal: '60004',
          strMeal: 'Massa ao Pesto',
          strInstructions: 'Cook pasta and mix with pesto.',
          strMealThumb: 'https://www.themealdb.com/images/media/meals/wxuvuv1511291685.jpg'
        });
        cy.get('#meal-search').clear().type('massa');
        cy.contains('button', 'Atualizar opções').click();
        cy.wait('@search_massa');
        cy.get('select[formcontrolname="MONDAY_LUNCH"]').should('have.value', createdRecipeId);
        cy.get('select[formcontrolname="MONDAY_DINNER"]').should('have.value', createdRecipeId);

        cy.intercept('POST', '**/api/meal-plans', (req) => {
          req.reply((res) => {
            res.send({
              statusCode: 200,
              body: {
                id: 1234,
                planName: 'Semana Cypress',
                items: [{ id: 9876 }]
              }
            });
          });
        }).as('createMealPlan');

        cy.contains('button', 'Salvar plano').click();
        cy.wait('@createMealPlan');
        cy.contains('.alert-info', 'Plano de refeicao criado com sucesso!').should('be.visible');

        cy.request({
          method: 'GET',
          url: `${apiBase}/meal-plans/1234/shopping-list`,
          headers: authHeaders(token)
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.mealPlanId).to.eq(1234);
          expect(response.body.mealPlanName).to.eq('Semana Cypress');
          expect(response.body.ingredients).to.be.an('array');
        });

        cy.request({
          method: 'DELETE',
          url: `${apiBase}/meal-plans/1234/items/9876`,
          headers: authHeaders(token)
        }).then((response) => {
          expect(response.status).to.eq(204);
        });
      });
    });
  });

  it('cobre atualização de perfil e exclusao de conta', () => {
    const user = buildUser('uc1415');
    const updatedName = `Atualizado ${Date.now()}`;
    const updatedEmail = `${updatedName.replace(/\s+/g, '').toLowerCase()}@example.com`;

    registerAndLogin(user).then((token) => {
      cy.request({
        method: 'PUT',
        url: `${apiBase}/users/me`,
        headers: {
          ...authHeaders(token),
          'Content-Type': 'application/json'
        },
        body: {
          username: updatedName,
          email: updatedEmail,
          password: user.password
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.token).to.exist;
        const updatedToken = response.body.token as string;

        visitWithToken('/users', updatedToken, true);
        cy.contains('h2', 'Usuários').should('be.visible');
        cy.get('#user-name').clear().type(updatedName);
        cy.get('#user-email').clear().type(updatedEmail);
        cy.contains('button', 'Criar').click();
        cy.contains('td', updatedName).should('be.visible');
        cy.contains('a', 'Editar').first().click();
        cy.get('#user-edit-name').clear().type(`${updatedName} editado`);
        cy.contains('button', 'Salvar').click();
        cy.contains('td', `${updatedName} editado`).should('be.visible');
        cy.contains('button', 'Remover').first().click();

        cy.request({
          method: 'DELETE',
          url: `${apiBase}/users/me`,
          headers: authHeaders(updatedToken)
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
        });

        cy.request({
          method: 'POST',
          url: `${apiBase}/auth/login`,
          failOnStatusCode: false,
          body: {
            username: updatedName,
            password: user.password
          }
        }).then((loginResponse) => {
          expect(loginResponse.status).to.not.eq(200);
        });
      });
    });
  });
});