# LitLabs Development Commands

.PHONY: help dev-up dev-down dev-restart dev-logs dev-clean volumes-list volumes-clean db-migrate db-reset

help: ## Show this help
	@echo "LitLabs Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev-up: ## Start minimal development containers (postgres + redis)
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development containers started!"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

dev-full: ## Start all development services
	docker-compose up -d
	@echo "✅ All services started!"
	@echo "Access points:"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"
	@echo "  MongoDB: localhost:27017"
	@echo "  Minio Console: http://localhost:9001"
	@echo "  Mailhog: http://localhost:8025"
	@echo "  Firebase Emulator: http://localhost:4000"

dev-down: ## Stop all development containers
	docker-compose -f docker-compose.dev.yml down
	docker-compose down
	@echo "✅ Containers stopped"

dev-restart: ## Restart development containers
	docker-compose -f docker-compose.dev.yml restart
	@echo "✅ Containers restarted"

dev-logs: ## Show container logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-clean: ## Stop and remove all containers, volumes, and networks
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	@echo "✅ Cleaned up all containers and volumes"

volumes-list: ## List all Docker volumes
	docker volume ls

volumes-clean: ## Remove unused Docker volumes
	docker volume prune -f
	@echo "✅ Cleaned up unused volumes"

db-shell: ## Connect to PostgreSQL shell
	docker exec -it labs_ai_studio_postgres_dev psql -U litlabs -d litlabs

redis-shell: ## Connect to Redis CLI
	docker exec -it labs_ai_studio_redis_dev redis-cli

mongo-shell: ## Connect to MongoDB shell
	docker exec -it labs_ai_studio_mongo mongosh -u litlabs -p litlabs_dev_2024

backup-db: ## Backup PostgreSQL database
	docker exec labs_ai_studio_postgres_dev pg_dump -U litlabs litlabs > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backed up"

restore-db: ## Restore PostgreSQL database (usage: make restore-db FILE=backup.sql)
	docker exec -i labs_ai_studio_postgres_dev psql -U litlabs litlabs < $(FILE)
	@echo "✅ Database restored"
