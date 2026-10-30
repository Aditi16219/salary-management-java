@echo off
rem Seed 10,000 employees into the database.
rem Safe to run repeatedly: truncates existing data before inserting.
cd /d "%~dp0..\backend"
call mvnw.cmd -q spring-boot:run -Dspring-boot.run.arguments=--seed
