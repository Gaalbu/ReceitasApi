const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Em desenvolvimento (ng serve) use http://localhost:4200
    // Em Docker (docker compose up) use http://localhost
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:4200',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}'
  }
})