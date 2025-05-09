#!/bin/bash

# Stop and remove the existing container if it exists
docker stop droplite-container || true
docker rm droplite-container || true

# Run a new container from droplite-img on port 3000:3000
docker run -d --name droplite-container -p 3000:3000 droplite-img