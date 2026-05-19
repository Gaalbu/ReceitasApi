#!/bin/bash

# Variáveis de conexão com o banco de dados
DB_NAME="gourmethub"
DB_USER="gourmethub"
DB_HOST="localhost"
DB_PORT="5432"
export PGPASSWORD='gourmethub'

# Parar e remover o container do Docker se estiver rodando
if [ "$(docker ps -q -f name=gourmethub_db)" ]; then
    echo "Parando e removendo o container gourmethub_db..."
    docker-compose -f docker-compose.yml down
fi

# Subir o container novamente
echo "Iniciando o container do banco de dados..."
docker-compose -f docker-compose.yml up -d

# Aguardar o PostgreSQL iniciar
echo "Aguardando o PostgreSQL iniciar..."
sleep 10

echo "Banco de dados recriado com sucesso!"
