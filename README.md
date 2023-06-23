## Server

### Run postgres container

```bash
docker compose up -d

```

_-d_ - (`detached`) runs the container in background

### Get in docker container (postgresql) and connect to my database

```bash
docker exec -u postgres -it fc_db psql -d frontend_community
```

### Create migration template

```bash
NAME=<migration_file_name> pnpm -F server create-migration
```

_-F_ - (`--filter`) filters workspace by name

### Database info

#### Database volumes

list all volumes

```bash
docker volume ls
```

Inspect volume

```bash
docker volume inspect <volume_name>
```
