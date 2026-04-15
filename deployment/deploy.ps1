<#
.SYNOPSIS
  Deploys the Call Pat Prototype (API + Web Admin) on the server.
  Called by GitHub Actions via SSH after each successful pipeline run.

.PARAMETER Branch
  Git branch to pull and deploy.
  Use 'develop' for DEV, 'main' for PROD.

.PARAMETER AppDir
  Root directory of the cloned repository on this server.

.EXAMPLE
  # DEV (called automatically by GitHub Actions):
  powershell -ExecutionPolicy Bypass -File deploy.ps1 -Branch develop

  # PROD:
  powershell -ExecutionPolicy Bypass -File deploy.ps1 -Branch main
#>

param(
  [string]$Branch = "develop",
  [string]$AppDir = "D:\call-pat"
)

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"

Write-Host "=== Call Pat Deploy ===" -ForegroundColor Cyan
Write-Host "  Dir    : $AppDir"
Write-Host "  Branch : $Branch"
Write-Host "  Time   : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Set-Location $AppDir

Write-Host "`n[1/5] Pulling latest code from $Branch..." -ForegroundColor Yellow
git fetch origin
git checkout $Branch
git pull origin $Branch

Write-Host "`n[2/5] Installing dependencies..." -ForegroundColor Yellow
npm ci --prefer-offline

Write-Host "`n[3/5] Building all workspaces..." -ForegroundColor Yellow
npm run build

Write-Host "`n[4/5] Applying database migrations..." -ForegroundColor Yellow
# db:push is idempotent – safe to run on every deploy.
# DATABASE_URL is inherited from the Windows system environment variable.
#
# Current: SQLite  → file:D:/call-pat/packages/api/data/callpat.db
# Future:  MSSQL   → sqlserver://SERVER\INSTANCE;database=CallPat;...
# No code change is needed here when switching databases – only DATABASE_URL changes.
npm run db:push

Write-Host "`n[5/5] Reloading PM2 process..." -ForegroundColor Yellow
# Temporarily allow non-zero exit codes so we can fall back to pm2 start
$ErrorActionPreference = "Continue"
pm2 reload ecosystem.config.cjs --update-env --env production
if ($LASTEXITCODE -ne 0) {
  Write-Host "  PM2 reload failed - starting fresh..." -ForegroundColor Red
  pm2 start ecosystem.config.cjs --env production
}
$ErrorActionPreference = "Stop"

pm2 save

Write-Host "`n=== Deploy complete ===" -ForegroundColor Green
