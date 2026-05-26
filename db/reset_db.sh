#!/bin/bash

# Variáveis de conexão com o banco de dados
DB_NAME="receitasapi"
DB_USER="receitasapi"
DB_HOST="localhost"
DB_PORT="5432"
export PGPASSWORD='receitasapi'

# Parar e remover o container do Docker se estiver rodando
if [ "$(docker ps -q -f name=receitasapi_db)" ]; then
    echo "Parando e removendo o container receitasapi_db..."
    docker-compose -f docker-compose.yml down
fi

# Subir o container novamente
echo "Iniciando o container do banco de dados..."
docker-compose -f docker-compose.yml up -d

# Aguardar o PostgreSQL iniciar
echo "Aguardando o PostgreSQL iniciar..."
sleep 10

echo "Banco de dados recriado com sucesso!"
