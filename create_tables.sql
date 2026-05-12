-- TABELA DE USUÁRIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE RECEITAS (Próprias do usuário)
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    prep_time INTEGER, -- minutos
    is_external BOOLEAN DEFAULT FALSE,
    external_api_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_recipe FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TABELA DE PLANOS DE REFEIÇÃO
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_plan FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TABELA DE ITENS DO PLANO (Receita->dias da semana)
CREATE TABLE meal_items (
    id SERIAL PRIMARY KEY,
    meal_plan_id INTEGER NOT NULL,
    recipe_id INTEGER, -- Pode ser NULL se for apenas referência externa
    external_recipe_id VARCHAR(50), -- ID da API TheMealDB
    external_recipe_name VARCHAR(150),
    day_of_week VARCHAR(20) NOT NULL, -- Ex: 'MONDAY', 'TUESDAY'
    meal_type VARCHAR(50), -- Ex: 'LUNCH', 'DINNER'
    CONSTRAINT fk_plan_item FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_item FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
);

-- TABELA DE FAVORITOS (Receitas da API externa salvas)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    external_recipe_id VARCHAR(50) NOT NULL,
    recipe_name VARCHAR(150),
    image_url VARCHAR(255),
    CONSTRAINT fk_user_fav FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_fav UNIQUE (user_id, external_recipe_id)
);