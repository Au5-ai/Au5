param(
    [string]$ContainerName = "au5-sqlserver",
    [string]$Password = "SAStrong!Pass123",
    [int]$MaxRetries = 30,
    [int]$RetryInterval = 5
)

Write-Host "Initializing Au5 Database..." -ForegroundColor Green

# SQL Script content embedded in PowerShell
$sqlScript = @"
-- Initialize Au5 Database and User
USE master;

-- Create the Au5 database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Au5Db')
BEGIN
    CREATE DATABASE [Au5Db];
    PRINT 'Database Au5Db created successfully.';
END
ELSE
BEGIN
    PRINT 'Database Au5Db already exists.';
END

-- Use the Au5 database
USE [Au5Db];

-- Create a login for the Au5 user
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'Au5User')
BEGIN
    CREATE LOGIN [Au5User] WITH PASSWORD = N'Au5UserStrong!Pass123', 
        DEFAULT_DATABASE = [Au5Db],
        CHECK_EXPIRATION = OFF,
        CHECK_POLICY = OFF;
    PRINT 'Login Au5User created successfully.';
END
ELSE
BEGIN
    PRINT 'Login Au5User already exists.';
END

-- Create a database user for the login
USE [Au5Db];

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'Au5User')
BEGIN
    CREATE USER [Au5User] FOR LOGIN [Au5User];
    PRINT 'User Au5User created successfully.';
END
ELSE
BEGIN
    PRINT 'User Au5User already exists.';
END

-- Grant necessary permissions to the Au5User
ALTER ROLE [db_owner] ADD MEMBER [Au5User];
PRINT 'Permissions granted to Au5User.';

PRINT 'Database initialization completed successfully!';
"@

# Wait for SQL Server to be ready
Write-Host "Waiting for SQL Server to be ready..." -ForegroundColor Yellow
$retryCount = 0
$isReady = $false

while ($retryCount -lt $MaxRetries -and -not $isReady) {
    try {
        # Test SQL Server connection
       $testResult = podman exec $ContainerName /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$Password" -Q "SELECT 1" 2>&1 
        if ($testResult -match "1") {
            $isReady = $true
            Write-Host "SQL Server is ready!" -ForegroundColor Green
        } else {
            throw "Not ready yet"
        }
    }
    catch {
        $retryCount++
        Write-Host "Attempt $retryCount/$MaxRetries - SQL Server not ready yet. Waiting $RetryInterval seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds $RetryInterval
    }
}

if (-not $isReady) {
    Write-Error "SQL Server failed to start after $MaxRetries attempts. Please check the container logs."
    Write-Host "Check logs with: podman logs $ContainerName" -ForegroundColor Red
    exit 1
}

# Execute the database initialization commands
Write-Host "Executing database initialization script..." -ForegroundColor Yellow

# Execute each SQL command separately for better reliability
Write-Host "Creating database Au5Db..." -ForegroundColor Yellow
$createDbOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d master `
    -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Au5Db') BEGIN CREATE DATABASE [Au5Db]; PRINT 'Database Au5Db created successfully.'; END ELSE BEGIN PRINT 'Database Au5Db already exists.'; END"

Write-Host "Create database output: $createDbOutput" -ForegroundColor Gray

Write-Host "Creating login Au5User..." -ForegroundColor Yellow
$createLoginOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d master `
    -Q "IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'Au5User') BEGIN CREATE LOGIN [Au5User] WITH PASSWORD = N'Au5UserStrong!Pass123', DEFAULT_DATABASE = [Au5Db], CHECK_EXPIRATION = OFF, CHECK_POLICY = OFF; PRINT 'Login Au5User created successfully.'; END ELSE BEGIN PRINT 'Login Au5User already exists.'; END"

Write-Host "Create login output: $createLoginOutput" -ForegroundColor Gray

Write-Host "Creating database user..." -ForegroundColor Yellow
$createUserOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d Au5Db `
    -Q "IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'Au5User') BEGIN CREATE USER [Au5User] FOR LOGIN [Au5User]; PRINT 'User Au5User created successfully.'; END ELSE BEGIN PRINT 'User Au5User already exists.'; END"

Write-Host "Create user output: $createUserOutput" -ForegroundColor Gray

Write-Host "Granting permissions..." -ForegroundColor Yellow
$grantPermissionsOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d Au5Db `
    -Q "ALTER ROLE [db_owner] ADD MEMBER [Au5User]; PRINT 'Permissions granted to Au5User.';"

Write-Host "Grant permissions output: $grantPermissionsOutput" -ForegroundColor Gray

# Check if all operations were successful
$allSuccessful = $true
if ($createDbOutput -match "error|failed" -or $LASTEXITCODE -ne 0) { $allSuccessful = $false }
if ($createLoginOutput -match "error|failed") { $allSuccessful = $false }
if ($createUserOutput -match "error|failed") { $allSuccessful = $false }
if ($grantPermissionsOutput -match "error|failed") { $allSuccessful = $false }

if ($allSuccessful) {
    Write-Host "Database initialization completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database Details:" -ForegroundColor Cyan
    Write-Host "- Database Name: Au5Db" -ForegroundColor White
    Write-Host "- Username: Au5User" -ForegroundColor White  
    Write-Host "- Password: Au5UserStrong!Pass123" -ForegroundColor White
    Write-Host "- Connection String: Server=localhost,1433;Database=Au5Db;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" -ForegroundColor White
    Write-Host ""
    Write-Host "You can now connect to the database using these credentials." -ForegroundColor Green

    podman exec $ContainerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U Au5User -P "Au5UserStrong!Pass123" -C -d Au5Db -Q "SELECT DB_NAME() as CurrentDatabase, USER_NAME() as CurrentUser, GETDATE() as CurrentTime"

} else {
    Write-Error "Database initialization failed. Check the error messages above."
    Write-Host "You can check container logs with: podman logs $ContainerName" -ForegroundColor Red
    exit 1
}

Write-Host "Database initialization process completed!" -ForegroundColor Green
