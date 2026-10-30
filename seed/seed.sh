#!/usr/bin/env sh
# Seed 10,000 employees into the database.
# Safe to run repeatedly: truncates existing data before inserting.
cd "$(dirname "$0")/../backend" || exit 1
./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--seed
