# GourmetHub - Plataforma de Gestão Gastronômica

## 1. Descrição do Projeto
O GourmetHub é uma aplicação web completa que permite aos usuários gerenciar suas próprias receitas, criar planos de refeições semanais e explorar novas culinárias através da integração com a API externa *TheMealDB*.

## 2. Stack Tecnológica e Justificativa
- **Back-end:** Java 17 + Spring Boot 3. 
  - *Justificativa:* Robustez, ecossistema maduro para APIs REST e facilidade de integração com bancos relacionais.
- **Front-end:** Angular.
  - *Justificativa:* Framework estruturado que facilita a criação de SPAs (Single Page Applications) escaláveis e tipagem forte com TypeScript.
- **Banco de Dados:** PostgreSQL.
  - *Justificativa:* Confiabilidade e suporte a consultas complexas para os planos de refeição.
- **API Externa:** TheMealDB.
  - *Justificativa:* Oferece um vasto catálogo gratuito de receitas e ingredientes para enriquecer a experiência do usuário.
- **Testes:** JUnit 5 e Mockito (Back-end), Jasmine/Karma (Front-end) e Cypress (E2E).

## 3. Esqueleto Funcional (Estrutura de Pastas)
```text
/gourmethub
├── api
│   ├── src/main/java/com/gourmethub
│   │   ├── controller (Endpoints)
│   │   ├── service (Lógica e Integração API)
│   │   ├── repository (JPA)
│   │   ├── model (Entidades)
│   │   └── config (Security/CORS)
│   └── src/test/java (JUnit 5)
├── ui
│   ├── src/app
│   │   ├── components (Shared/UI)
│   │   ├── pages (Login, Dashboard, Recipes)
│   │   ├── services (API Consumer)
│   │   └── models (Interfaces)
├── docs
│   └── database_model.png
└── README.md
