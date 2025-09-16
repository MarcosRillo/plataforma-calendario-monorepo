# Makefile para gestión de Docker en desarrollo

.PHONY: help up down restart logs shell composer artisan npm db-shell redis-cli clean build

# Variables
DC = docker-compose -f docker-compose.dev.yml --env-file .env.docker
BACKEND_CONTAINER = plataforma-calendario-backend
DB_CONTAINER = plataforma-calendario-db
REDIS_CONTAINER = plataforma-calendario-redis

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Inicia todos los servicios
	$(DC) up -d
	@echo "✅ Servicios iniciados"
	@echo "📦 Backend API: http://localhost:80"
	@echo "📧 MailHog: http://localhost:8025"
	@echo "🗄️ PHPMyAdmin: http://localhost:8080"
	@echo "💻 Frontend: Ejecuta 'npm run dev' en ./frontend"

down: ## Detiene todos los servicios
	$(DC) down
	@echo "🛑 Servicios detenidos"

restart: ## Reinicia todos los servicios
	$(DC) restart
	@echo "🔄 Servicios reiniciados"

logs: ## Muestra logs de todos los servicios
	$(DC) logs -f

logs-backend: ## Muestra logs del backend
	$(DC) logs -f backend

build: ## Reconstruye las imágenes
	$(DC) build --no-cache
	@echo "🔨 Imágenes reconstruidas"

shell: ## Accede al shell del backend
	$(DC) exec -u www backend bash

shell-root: ## Accede al shell del backend como root
	$(DC) exec -u root backend bash

composer: ## Ejecuta comandos de composer (ej: make composer cmd="install")
	$(DC) exec -u www backend composer $(cmd)

artisan: ## Ejecuta comandos de artisan (ej: make artisan cmd="migrate")
	$(DC) exec -u www backend php artisan $(cmd)

migrate: ## Ejecuta migraciones
	$(DC) exec -u www backend php artisan migrate

migrate-fresh: ## Resetea y ejecuta migraciones
	$(DC) exec -u www backend php artisan migrate:fresh --seed

tinker: ## Abre Laravel Tinker
	$(DC) exec -u www backend php artisan tinker

test: ## Ejecuta tests
	$(DC) exec -u www backend php artisan test

db-shell: ## Accede a MySQL CLI
	$(DC) exec $(DB_CONTAINER) mysql -u laravel_user -plaravel_password plataforma_calendario

redis-cli: ## Accede a Redis CLI
	$(DC) exec $(REDIS_CONTAINER) redis-cli

clean: ## Limpia volúmenes y contenedores
	$(DC) down -v
	@echo "🧹 Volúmenes y contenedores eliminados"

status: ## Muestra el estado de los servicios
	$(DC) ps

install: ## Instalación inicial del proyecto
	@echo "🚀 Instalando proyecto..."
	$(DC) up -d db
	@sleep 5
	$(DC) up -d backend nginx mailhog redis phpmyadmin
	$(DC) exec -u www backend composer install
	$(DC) exec -u www backend cp .env.example .env
	$(DC) exec -u www backend php artisan key:generate
	$(DC) exec -u www backend php artisan migrate --seed
	$(DC) exec -u www backend php artisan storage:link
	@echo "✅ Instalación completada"
	@echo "📦 Backend API: http://localhost:80"
	@echo "📧 MailHog: http://localhost:8025"
	@echo "🗄️ PHPMyAdmin: http://localhost:8080"
	@echo "💻 Ahora ejecuta 'npm install && npm run dev' en ./frontend"