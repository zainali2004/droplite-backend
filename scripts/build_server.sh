#!/bin/bash

# Navigate to the parent directory where the Dockerfile is
cd /home/ec2-user/app

# Build the Docker image named droplite-img
docker build -t droplite-img .
