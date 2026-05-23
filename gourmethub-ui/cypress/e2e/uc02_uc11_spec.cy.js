describe('UC02-UC11 E2E smoke', () => {
  // Prereq: start frontend (ng serve) and backend (./mvnw.cmd spring-boot:run)

  it('UC02 - Efetuar login and navigate to dashboard', () => {
    // Create test user via API
    cy.request('POST', 'http://localhost:8080/auth/register', { username: 'e2euser', email: 'e2e@example.com', password: 'Pass123!' })
    cy.visit('/')
    cy.contains('Login').click()
    cy.get('input[name="email"]').type('e2e@example.com')
    cy.get('input[name="password"]').type('Pass123!')
    cy.get('button[type="submit"]').click()
    cy.contains('Dashboard')
  })

  it('UC03-UC06 - Create, list, edit and delete my recipe', () => {
    cy.visit('/')
    cy.contains('Criar Receita').click()
    cy.get('input[name="title"]').type('E2E Receita')
    cy.get('textarea[name="ingredients"]').type('ovo, farinha')
    cy.get('textarea[name="instructions"]').type('misturar e assar')
    cy.get('button[type="submit"]').click()
    cy.contains('Minhas Receitas')
    cy.contains('E2E Receita')
    // Edit
    cy.contains('E2E Receita').parent().contains('Editar').click()
    cy.get('input[name="title"]').clear().type('E2E Receita Editada')
    cy.get('button[type="submit"]').click()
    cy.contains('E2E Receita Editada')
    // Delete
    cy.contains('E2E Receita Editada').parent().contains('Excluir').click()
    cy.contains('E2E Receita Editada').should('not.exist')
  })

  it('UC07-UC09 - Search external recipes and favorite', () => {
    cy.visit('/')
    cy.contains('Buscar Receitas').click()
    cy.get('input[placeholder="Buscar"]').type('chicken')
    cy.get('button[type="submit"]').click()
    cy.get('.recipe-card').first().contains('Favoritar').click()
    cy.contains('Favoritas')
  })

  it('UC10-UC11 - Create meal plan and add recipe', () => {
    cy.visit('/')
    cy.contains('Planos').click()
    cy.contains('Criar Plano').click()
    cy.get('input[name="plan_name"]').type('Plano E2E')
    cy.get('input[name="start_date"]').type('2026-06-01')
    // assume UI has controls to add recipe to Monday Lunch
    cy.get('select[name="day"]').select('MONDAY')
    cy.get('select[name="meal_type"]').select('LUNCH')
    cy.get('button').contains('Salvar Plano').click()
    cy.contains('Plano E2E')
  })
})
