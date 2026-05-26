# ReceitasApi - Plataforma de Gestão Gastronômica

## 1. Descrição do Projeto
ReceitasApi é uma aplicação web completa que permite aos usuários gerenciar suas próprias receitas, criar planos de refeições semanais e explorar novas culinárias através da integração com a API externa *TheMealDB*.

## 2. Stack Tecnológica
- **Back-end:** Java 21 LTS + Spring Boot 3.5.14 + PostgreSQL
- **Front-end:** Angular 21 + TypeScript com SSR (Server-Side Rendering)
- **Autenticação:** JWT (JSON Web Tokens) + Spring Security
- **API Externa:** TheMealDB (integração para busca de receitas)
- **Testes:** JUnit 5, Mockito, Jasmine/Karma
- **Containerização:** Docker + Docker Compose para subir o stack completo

## 3. Funcionalidades Implementadas ✅

### 3.1. Autenticação e Usuários
- ✅ **Registro de Usuários** → `POST /auth/register`
- ✅ **Login com JWT** → `POST /auth/login`
- ✅ **Armazenamento seguro de tokens** (localStorage)
- ✅ **Proteção de rotas com interceptor JWT**
- ✅ **Logout e limpeza de sessão**

### 3.2. Gerenciamento de Receitas
- ✅ **Busca de receitas na TheMealDB** → `GET /recipes/search?name={termo}`
- ✅ **Criação de receitas customizadas** → `POST /recipes`
- ✅ **Visualização de receitas externas**
- ✅ **Integração com API externa para enriquecimento de dados**

### 3.3. Planos de Refeição
- ✅ **Criação de planos de refeição** → `POST /meal-plans`
- ✅ **Associação de receitas aos planos**
- ✅ **Gerenciamento de itens de refeição**

### 3.4. Avaliações e Feedback
- ✅ **Sistema de ratings para receitas** → `POST /recipes/rating` (ou similar)
- ✅ **Submissão de reviews do sistema** → `POST /system-reviews`
- ✅ **Feedback dos usuários sobre a plataforma**

### 3.5. Interface de Usuário
- ✅ **Página de Login** com validação de formulários
- ✅ **Página de Registro** com criação de conta
- ✅ **Navbar responsivo** com navegação entre páginas
- ✅ **Página de Busca de Receitas** com integração em tempo real
- ✅ **Formulário de Criação de Receitas**
- ✅ **Dashboard de Planos de Refeição**
- ✅ **Página de Feedback/Reviews**
- ✅ **Renderização no lado do servidor (SSR)**

## 4. Checklist final priorizada

### P0 - Corrigir para sustentar a entrega
- [x] Alinhar a versão do Java no build com a documentação. O `pom.xml` agora usa Java 21, igual ao README.
- [ ] Ajustar a narrativa de "5 telas". Hoje o roteamento do front expõe 6 telas: login, register, recipe, create-recipe, meal-plans e feedback.
- [x] Garantir um relatório de cobertura consumível pelo SonarQube no backend. O projeto já tem JaCoCo, e o runner do Sonar agora gera a cobertura antes da análise.

### P1 - Fechar qualidade com pouco esforço de código
- [ ] Gerar cobertura do frontend e registrar o arquivo `lcov.info` para o SonarQube.
- [ ] Completar os fluxos E2E principais além do smoke test atual, cobrindo login, criação de receita e plano de refeição.
- [ ] Revisar endpoints/documentação para garantir que os 15 casos de uso estejam todos refletidos no código e nas rotas.

### P2 - Melhorar a leitura da entrega
- [ ] Padronizar a descrição dos testes para separar unitários, integração e E2E com os artefatos reais de cada camada.
- [x] Incluir o passo oficial de execução do SonarQube no README ou pipeline.

## 5. Estrutura do Projeto
```text
/receitasapi
├── api/
│   ├── src/main/java/com/receitasapi/api/
│   │   ├── controller/          (Endpoints REST)
│   │   │   ├── AuthController
│   │   │   ├── RecipeController
│   │   │   ├── MealPlanController
│   │   │   ├── SystemReviewController
│   │   │   └── RecipeRatingController
│   │   ├── service/             (Lógica de negócio)
│   │   │   ├── AuthService
│   │   │   ├── RecipeService
│   │   │   ├── MealPlanService
│   │   │   ├── SystemReviewService
│   │   │   └── RecipeRatingService
│   │   ├── repository/          (Acesso a dados JPA)
│   │   ├── model/               (Entidades)
│   │   ├── config/              (Security, CORS, RestTemplate)
│   │   └── security/            (JWT, CustomUserDetails)
│   └── src/test/java/com/receitasapi/api/           (Testes JUnit 5)
│
├── receitasapi-ui/
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── recipe/
│   │   │   ├── create-recipe/
│   │   │   ├── meal-plan/
│   │   │   ├── feedback/
│   │   │   └── navbar/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── recipe.service.ts
│   │   │   ├── mealplan.service.ts
│   │   │   └── feedback.service.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── app.module.server.ts (SSR)
│   │   └── app-routing-module.ts
│   └── angular.json
│
├── db/
│   ├── docker-compose.yml       (Banco PostgreSQL)
│   ├── init.sql                 (Schema inicial)
│   └── reset_db.sh              (Script para reset)
│
└── README.md
```

## 6. Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar novo usuário |
| POST | `/auth/login` | Fazer login e obter JWT |

### Receitas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/recipes/search?name={termo}` | Buscar receitas na TheMealDB |
| POST | `/recipes` | Criar receita customizada (autenticado) |

### Planos de Refeição
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/meal-plans` | Criar plano de refeição (autenticado) |

### Avaliações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/recipes/rating` | Avaliar receita (autenticado) |

### Reviews
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/system-reviews` | Submeter feedback do sistema (autenticado) |

## 7. Como Executar

### Pré-requisitos
- Java 21+
- Node.js 18+
- PostgreSQL 13+
- Docker e Docker Compose
- Maven Wrapper incluído no projeto (`mvnw`/`mvnw.cmd`)

### Execução com Docker Compose (stack completo)
```bash
docker compose up --build
```

Essa opção sobe automaticamente:
- PostgreSQL na porta `5432`
- API Spring Boot na porta `8080`
- Frontend Angular servido por Nginx na porta `80`

O frontend envia as requisições para `/api`, e o Nginx faz o proxy para a API.

Variáveis opcionais (com valores padrão):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `APP_JWT_SECRET`, `APP_JWT_EXPIRATION_MS`

Se aparecer erro de conexão recusada no navegador, confirme que os containers foram recriados com `docker compose up --build`.
Depois, abra o frontend em `http://localhost/` ou `http://localhost/login`.

### Backend (API) sem Docker
```bash
cd api
./mvnw clean install
./mvnw spring-boot:run
# No Windows, use mvnw.cmd
```

### Database (PostgreSQL) separadamente
```bash
cd db
docker compose up -d
# Execute o script de inicialização se necessário
# ./reset_db.sh
```

### Frontend (Angular) sem Docker
```bash
cd receitasapi-ui
npm install
ng serve --open
# UI rodando em http://localhost:4200
```

### Build para Produção (com SSR)
```bash
cd receitasapi-ui
npm run build
npm run serve:ssr:receitasapi-frontend
```

## 8. Testes

### Back-end
```bash
cd api
./mvnw test
# No Windows, use .\mvnw.cmd test
```

### Front-end
```bash
cd receitasapi-ui
ng test
```

## 9. SonarQube

O repositório já traz o fluxo automático de Sonar no Docker Compose. O passo a passo detalhado está em [docs/sonar-runbook.md](docs/sonar-runbook.md).

1. Subir o stack com o perfil do Sonar.
```bash
docker compose --profile sonar up --build --abort-on-container-exit sonar
```

2. Quando o runner terminar, abrir o painel do SonarQube no navegador.
```bash
http://localhost:9000
```

Observações rápidas:
- O service `sonar` fica em [docker-compose.yml](docker-compose.yml) e roda tudo dentro de container.
- O backend já entra com JaCoCo antes da análise.
- O frontend entra como código analisado; a cobertura dele ainda não está automatizada.

## 10. Modelos de Dados Principais

### User
- `id` (Long)
- `username` (String, unique)
- `email` (String, unique)
- `password` (String, encrypted)
- `role` (Role enum: USER, ADMIN)
- `createdAt` (Timestamp)

### Recipe
- `id` (Long)
- `title` (String)
- `description` (Text)
- `ingredients` (JSON/Text)
- `instructions` (Text)
- `userId` (FK → User)
- `createdAt` (Timestamp)

### MealPlan
- `id` (Long)
- `name` (String)
- `weekNumber` (Integer)
- `userId` (FK → User)
- `mealItems` (OneToMany → MealItem)
- `createdAt` (Timestamp)

### MealItem
- `id` (Long)
- `dayOfWeek` (Enum: MONDAY, TUESDAY, ...)
- `mealType` (Enum: BREAKFAST, LUNCH, DINNER)
- `recipeId` (FK → Recipe)
- `mealPlanId` (FK → MealPlan)

### SystemReview
- `id` (Long)
- `rating` (Integer)
- `comment` (Text)
- `userId` (FK → User)
- `createdAt` (Timestamp)

### RecipeRating
- `id` (Long)
- `rating` (Integer)
- `recipeId` (FK → Recipe)
- `userId` (FK → User)
- `createdAt` (Timestamp)
