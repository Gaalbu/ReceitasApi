describe('Fluxos principais logados', () => {
  const token = 'ui-token';

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
      }
    });
  });

  it('UC07-UC09 - busca receita externa e envia avaliacao', () => {
    cy.intercept('GET', '**/api/recipes/search?name=chicken', {
      body: {
        meals: [
          {
            idMeal: '123',
            strMeal: 'Mock Chicken Meal',
            strMealThumb: 'https://example.com/chicken.jpg',
            strInstructions: 'Mock instructions for a chicken meal.'
          }
        ]
      }
    }).as('searchRecipe');

    cy.intercept('POST', '**/api/recipes/123/ratings', {
      statusCode: 200,
      body: { message: 'ok' }
    }).as('rateRecipe');

    cy.get('input[formcontrolname="q"]').type('chicken');
    cy.contains('button', 'Buscar').click();

    cy.wait('@searchRecipe');
    cy.contains('Mock Chicken Meal').should('exist');

    cy.contains('button', 'Avaliar esta receita').click();
    cy.get('app-feedback').should('exist');
    cy.get('input[formcontrolname="rating"]').clear().type('5');
    cy.get('textarea[formcontrolname="comment"]').type('Excelente receita');
    cy.contains('button', 'Enviar Avaliação').click();

    cy.wait('@rateRecipe').its('request.body').should('include', {
      rating: 5,
      comment: 'Excelente receita'
    });
    cy.contains('Avaliação enviada').should('exist');
  });

  it('UC03 e UC10-UC11 - cria receita e monta plano semanal', () => {
    cy.intercept('POST', '**/api/recipes', {
      statusCode: 200,
      body: { id: 99 }
    }).as('createRecipe');

    cy.contains('a.nav-link.dropdown-toggle', 'Menu').click();
    cy.contains('.dropdown-item', 'Criar uma receita').click();
    cy.url().should('include', '/create-recipe');

    cy.get('input[formcontrolname="title"]').type('Receita E2E');
    cy.get('textarea[formcontrolname="ingredients"]').type('ovo, farinha');
    cy.get('textarea[formcontrolname="instructions"]').type('misturar e assar');
    cy.get('input[formcontrolname="prep_time"]').clear().type('30');
    cy.contains('button', 'Criar Receita').click();

    cy.wait('@createRecipe');
    cy.contains('Receita criada com sucesso!').should('exist');

    cy.intercept('POST', '**/api/meal-plans', {
      statusCode: 200,
      body: { id: 10 }
    }).as('createMealPlan');

    cy.contains('a.nav-link.dropdown-toggle', 'Menu').click();
    cy.contains('.dropdown-item', 'Criar receita semanal').click();
    cy.url().should('include', '/meal-plans');

    cy.get('input[formcontrolname="plan_name"]').type('Plano E2E');
    cy.get('input[formcontrolname="start_date"]').type('2026-06-01');
    cy.get('input[formcontrolname="MONDAY_LUNCH"]').type('1');
    cy.get('input[formcontrolname="MONDAY_DINNER"]').type('2');
    cy.contains('button', 'Salvar plano').click();

    cy.wait('@createMealPlan').its('request.body').should('include', {
      plan_name: 'Plano E2E',
      start_date: '2026-06-01'
    });
    cy.contains('Plano de refeicao criado com sucesso!').should('exist');
  });

  it('UC14 - mostra reviews locais salvas no navegador', () => {
    const reviews = [
      {
        id: 1,
        recipeId: 123,
        recipeName: 'Mock Chicken Meal',
        rating: 5,
        comment: 'Muito bom'
      }
    ];

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
        win.localStorage.setItem('receitasapi.recipe-reviews', JSON.stringify(reviews));
      }
    });

    cy.contains('a.nav-link.dropdown-toggle', 'Menu').click();
    cy.contains('.dropdown-item', 'Acessar os meus reviews').click();
    cy.url().should('include', '/feedback');
    cy.contains('Mock Chicken Meal').should('exist');
    cy.contains('Muito bom').should('exist');
  });
});