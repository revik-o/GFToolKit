#!/bin/bash

docker compose -f docker/localhost/docker-compose.yaml down
docker compose -f docker/localhost/docker-compose.yaml pull
docker compose -f docker/localhost/docker-compose.yaml up -d

read -p "Press any key to close the script... "

docker compose -f docker/localhost/docker-compose.yaml down
