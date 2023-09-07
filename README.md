# Frontend Community Simple

This provides instructions for setting up and developing the application.

## Table of Contents

-   [Workspace](#workspace)
    -   [Creating and Consuming Packages](#creating-and-consuming-packages)
-   [Client](#client)
    -   [Development](#development)
    -   [Building](#building)
-   [Server](#server)
    -   [Running the PostgreSQL Container](#running-the-postgresql-container)
    -   [Connecting to the Database](#connecting-to-the-database)
    -   [Creating Migration Templates](#creating-migration-templates)
    -   [Database Information](#database-information)

## Workspace

### Creating and Consuming Packages

To add your own package for the `client` and `server`:

1. Create a new folder with a name in the `packages` directory (e.g., `packages/my-tsconfig`).
2. Add your code to that folder (e.g., `packages/my-tsconfig/tsconfig.base.json`).
3. Install the package for your app (e.g., `client`) using the following command:

    ```bash
    pnpm -F client add my-tsconfig --workspace
    ```

    The package will now be available, and you can import it just like any other npm package.

## Client

### Development

To start a development server for the client:

```bash
pnpm dev
```

### Building

To create a production version of your client app:

```bash
pnpm build
```

You can preview the production build using `npm run preview`.

> Note: For deployment, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Server

### Running the PostgreSQL Container

To run the PostgreSQL container:

```bash
docker compose up -d
```

The `-d` flag runs the container in the background (detached mode).

### Connecting to the Database

To connect to the PostgreSQL database inside the Docker container:

```bash
docker exec -u postgres -it fc_db psql -d frontend_community
```

### Creating Migration Templates

To create a migration template in the server workspace:

```bash
NAME=<migration_file_name> pnpm -F server create-migration
```

The `-F` flag filters the workspace by name.

### Database Information

#### Database Volumes

To list all volumes:

```bash
docker volume ls
```

To inspect a specific volume:

```bash
docker volume inspect <volume_name>
```

## Deployment

_Last updated: Sep 4, 2023_

We didn't set up a CI/CD pipeline yet, so you'll have to manually build the client and server apps.

1. Log in to the server using SSH
2. Run `git pull` to get the latest changes from the repository
3. Run `pnpm build` to build the client and server apps
4. Run `docker compose up -d` to run the database container if it's not already running

    _Run this command to see if the database is up and running. If it is you'll get in to the database shell._

```sh
docker exec -u postgres -it fc_db psql -d frontend_community
```

5. Run PM2 with the following command. This should take two ports: (8895: client, 3001: server)

```sh
pm2 start npm --name fc -- run prod --watch
```
