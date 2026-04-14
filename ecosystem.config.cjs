/**
 * PM2 ecosystem config for the Call Pat Prototype (Hono API).
 *
 * Usage (on the server):
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload ecosystem.config.cjs --update-env --env production
 *   pm2 save   (persist across reboots)
 *
 * The Hono API runs on PORT 8788.
 * IIS (port 8090) reverse-proxies /api/* and /attachments/* to this process.
 *
 * DATABASE_URL is read from the Windows system environment variable set by
 * server-setup.ps1. PM2 inherits all system environment variables.
 *
 * Current value (SQLite):
 *   file:D:/call-pat/packages/api/data/callpat.db
 *
 * Future value (MS SQL Server – update after app code migration):
 *   sqlserver://MSSQL_SERVER\INSTANCE;database=CallPat;encrypt=true;trustServerCertificate=false
 *
 * To update without redeploying:
 *   1. Update DATABASE_URL system env var on the server:
 *        [System.Environment]::SetEnvironmentVariable("DATABASE_URL", "sqlserver://...", "Machine")
 *   2. pm2 reload ecosystem.config.cjs --update-env --env production
 *   3. Also update the DATABASE_URL GitHub Secret so future deploys use the new value.
 */

module.exports = {
  apps: [
    {
      name: "call-pat-api",
      script: "packages/api/dist/index.js",
      cwd: "D:/call-pat",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env_production: {
        NODE_ENV: "production",
        PORT: "8788",
        // DATABASE_URL intentionally omitted here – inherited from Windows system env.
        // This allows the DB backend to be changed (SQLite → MSSQL) by updating
        // the system env var without modifying this file.
      },
    },
  ],
};
