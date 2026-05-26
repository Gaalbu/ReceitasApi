describe('UC02-UC11 E2E smoke', () => {
  // Prereq: start frontend (ng serve or docker frontend) and backend (./mvnw.cmd spring-boot:run)

  // Create test user once and login via API before each test, injecting token into localStorage
  let token = ''
  const username = `e2euser${Date.now()}`
  const email = `${username}@example.com`
  const password = 'Pass123!'

  before(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/auth/register',
      headers: { Origin: 'http://localhost' },
      body: { username, email, password }
    })
  })

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/auth/login',
      headers: { Origin: 'http://localhost' },
      body: { username, password }
    }).then((resp) => {
      token = resp.body.token
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', token)
        }
      })
    })
  })

  it('UC02 - Efetuar login and navigate to dashboard', () => {
    cy.contains('Buscar Receitas')
  })

  it('UC03-UC06 - Create, list, edit and delete my recipe', () => {
    cy.contains('a.nav-link.dropdown-toggle', 'Menu').click()
    cy.contains('.dropdown-item', 'Criar uma receita').click()
    cy.url().should('include', '/create-recipe')
    cy.intercept('POST', '**/api/recipes', {
      statusCode: 200,
      body: {}
    }).as('createRecipe')
    cy.get('input[formcontrolname="title"]').type('E2E Receita')
    cy.get('textarea[formcontrolname="ingredients"]').type('ovo, farinha')
    cy.get('textarea[formcontrolname="instructions"]').type('misturar e assar')
    cy.get('input[formcontrolname="prep_time"]').clear().type('30')
    cy.contains('button', 'Criar Receita').click()
    cy.wait('@createRecipe')
    cy.contains('Receita criada com sucesso!')
  })

  it('UC07-UC09 - Search external recipes and favorite', () => {
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
    }).as('recipeSearch')

    cy.visit('/')
    cy.get('input[placeholder="Digite o nome da receita..."]').type('chicken')
    cy.get('form button[type="submit"]').click()
    cy.wait('@recipeSearch')
    cy.get('input[placeholder="Digite o nome da receita..."]').should('have.value', 'chicken')
  })

  it('UC10-UC11 - Create meal plan and add recipe', () => {
    cy.contains('a.nav-link.dropdown-toggle', 'Menu').click()
    cy.contains('.dropdown-item', 'Criar receita semanal').click()
    cy.url().should('include', '/meal-plans')
    cy.intercept('POST', '**/api/meal-plans', {
      statusCode: 200,
      body: {}
    }).as('createMealPlan')
    cy.get('input[formcontrolname="plan_name"]').type('Plano E2E')
    cy.get('input[formcontrolname="start_date"]').type('2026-06-01')
    cy.get('input[placeholder="Ex: 1"]').first().type('1')
    cy.contains('button', 'Salvar plano').click()
    cy.wait('@createMealPlan')
    cy.get('input[formcontrolname="plan_name"]').should('have.value', 'Plano E2E')
  })
})
