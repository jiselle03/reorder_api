#!/usr/bin/env bash

echo "ENV=local
DB_URL=mongodb://localhost:27017
DB_NAME=reorder_api
CORS_DOMAIN=http://localhost:3000" > ./.env
