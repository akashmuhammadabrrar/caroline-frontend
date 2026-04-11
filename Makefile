g.PHONY: build

build:
	@docker compose --profile prod build --no-cache
push:
	@docker compose --profile prod push
