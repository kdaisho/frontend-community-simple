## Server

### Run postgres container

```bash
docker compose up

# append `-d` (detached) to run in background
```

### Get in docker container (postgresql)

```bash
docker exec -u postgres -it postgres psql
```

### Create migration template

```bash
NAME=<migration_file_name> npm run create-migration -w server
```
