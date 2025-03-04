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
pm2 start npm --name fc -- run prod
```

## Need the feature back (June 15, 2024)

(mobile) When you sign in with daishokomiyma+10@gmail.com, you're prompted to "Log in with Touch ID / Passkey" (as you're in the users' table), and you click it. But then you'll be prompted to "No passkeys available for this device". This is expected.
In the past, you created account with daishokomiyama+10@gmail.com and registered the passkey but with a different phone (pixel).
You want to register the passkey for this device (samsung). You click the button "Login with email", and you'll get the email to login. You click the link and you're now logged in.
But, the problem is there's no button for you to register a passkey for the current device. I should bring this back.

**the feature has been brought (June 15, 2024)**

After bringing back the button "Register biometric ID for next login" (actually, this should be passkey, not "biometric ID" as it can be a passcode of your device), you can register the passkey for the current device. I was able to register samsung device with the same user account (daishokomiyama+10@gmail.com). Great. Now, in the user table db, the devices column got updated with the new device information. But there still be the button after registering the passkey. It seems problematic, but it actually not, because the button is idempotent. You can click it as many times as you want, and it won't do anything. If your device has already been registered, it won't be registered again. So, it's safe to keep the button there.

But, ideally, I should check if the current device is in the 'devices' db list, and if it is, I should hide the button.

## Email handling in local development

During local development, our application is configured to use Postmark's sandbox email server. This means that all emails triggered from the localhost environment are routed to this sandbox server instead of being sent to actual email addresses. This setup helps in testing email functionalities without spamming real users. ~~Importantly, using the sandbox server for email testing does not subject us to the usual limit of 100 emails per month, and there are no associated fees for using the sandbox environment. This allows for extensive testing of email-related features without incurring additional costs.~~ Sandbox also costs us, so we'll use production server for the local development.


---
<!-- Production runs on the following combination:

- (server) from within /var/www/fem.daishodesign.com/server/: `pnpm exec ts-node index.ts` (no PM2)
- (client) from within /var/www/fem.daishodesign.com/client/: `pm2 start "ORIGIN=https://fem.daishodesign.com PORT=8895 node build" --name "fc_client"` -->