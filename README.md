# GourmetHub - Plataforma de Gestão Gastronômica

## 1. Descrição do Projeto
O GourmetHub é uma aplicação web completa que permite aos usuários gerenciar suas próprias receitas, criar planos de refeições semanais e explorar novas culinárias através da integração com a API externa *TheMealDB*.

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

## 4. Estrutura do Projeto
```text
/gourmethub
├── api/
│   ├── src/main/java/com/gourmethub/api/
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
│   └── src/test/java/           (Testes JUnit 5)
│
├── gourmethub-ui/
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

## 5. Endpoints da API

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

## 6. Como Executar

### Pré-requisitos
- Java 21+
- Node.js 18+
- PostgreSQL 13+
- Docker e Docker Compose
- Maven Wrapper incluído no projeto (`mvnw`/`mvnw.cmd`)

### Execução com Docker Compose
```bash
cd db
docker compose up --build
```

Essa opção sobe automaticamente:
- PostgreSQL na porta `5432`
- API Spring Boot na porta `8080`
- Frontend Angular servido por Nginx na porta `4200`

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
cd gourmethub-ui
npm install
ng serve --open
# UI rodando em http://localhost:4200
```

### Build para Produção (com SSR)
```bash
cd gourmethub-ui
npm run build
npm run serve:ssr:gourmethub-frontend
```

## 7. Testes

### Back-end
```bash
cd api
./mvnw test
# No Windows, use mvnw.cmd test
```

### Front-end
```bash
cd gourmethub-ui
ng test
```

## 8. Modelos de Dados Principais

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
