# Au5 Podman Deployment Script
param(
    [string]$ContainerName = "au5-sqlserver",
    [string]$Password = "SAStrong!Pass123",
    [int]$MaxRetries = 30,
    [int]$RetryInterval = 5
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    Au5 Podman Deployment Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[1/10] Creating Au5 pod with network configuration..." -ForegroundColor Yellow
podman pod create --name au5-pod --network au5 `
  -p 15433:1433 `
  -p 6379:6379 `
  -p 1366:8080 `
  -p 1367:8081 `
  -p 8000:8000 `
  -p 6333:6333 `
  -p 6334:6334

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Pod created successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to create pod" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/10] Creating persistent volumes..." -ForegroundColor Yellow
podman volume create sqlserver_data | Out-Null
podman volume create redis_data | Out-Null
podman volume create qdrant_data | Out-Null
Write-Host "[OK] Volumes created (sqlserver_data, redis_data, qdrant_data)" -ForegroundColor Green

Write-Host "`n[3/10] Starting SQL Server container..." -ForegroundColor Yellow
podman run -d `
  --name au5-sqlserver `
  --pod au5-pod `
  -e ACCEPT_EULA=Y `
  -e SA_PASSWORD='SAStrong!Pass123' `
  -e MSSQL_PID=Express `
  --restart unless-stopped `
  -v sqlserver_data:/var/opt/mssql `
  mcr.microsoft.com/mssql/server:2022-latest | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] SQL Server container started" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start SQL Server" -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/10] Starting Redis container..." -ForegroundColor Yellow
podman run -d `
  --name au5-redis `
  --pod au5-pod `
  -v redis_data:/data `
  --restart unless-stopped `
  redis:7-alpine redis-server --appendonly yes | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Redis container started" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start Redis" -ForegroundColor Red
    exit 1
}

Write-Host "`n[5/10] Waiting for databases to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "[OK] Database initialization wait complete" -ForegroundColor Green

Write-Host "`n[6/10] Building and starting Backend..." -ForegroundColor Yellow
podman build -t au5-backend ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build Backend" -ForegroundColor Red
    exit 1
}

podman run -d `
  --name au5-backend `
  --pod au5-pod `
  -e ASPNETCORE_ENVIRONMENT=Production `
  -e "ConnectionStrings__ApplicationDbContext=Server=localhost,1433;Database=Au5;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" `
  -e "ConnectionStrings__Redis=localhost:6379" `
  -e "Cors__AllowedOrigins__0=http://localhost:3001" `
  -e "Cors__AllowedOrigins__1=https://localhost:8000" `
  -e "Cors__AllowedOrigins__2=https://localhost:8001" `
  -e "JwtSettings__SecretKey=CgOZGhxCXD4gpFfA8iPGBS5f0ZzGva1i2R9hLFiPICc=" `
  -e "JwtSettings__EncryptionKey=NekPtiUPYrlLr0dx3zJRtwga3pJNgccm1aO5+zWGMOc=" `
  -e "JwtSettings__Issuer=Au5.BackEnd" `
  -e "JwtSettings__Audience=Au5.Client" `
  -e "JwtSettings__ExpiryMinutes=1000" `
  -e "Organization__Direction=rtl" `
  -e "Organization__Language=fa-IR" `
  -e "Organization__HubUrl=http://localhost:1366/meetingHub" `
  -e "Organization__ServiceBaseUrl=http://localhost:1366" `
  -e "Organization__BotFatherUrl=http://localhost:8081" `
  -e "Organization__BotHubUrl=http://host.containers.internal:1366/meetingHub" `
  -e "Organization__PanelUrl=http://localhost:3001" `
  -e "Organization__OpenAIProxyUrl=https://api.openai.com/v1" `
  -e "Organization__OpenAIToken=YOUR_OPENAI_API_KEY" `
  -e "Organization__AutoLeaveWaitingEnter=30000" `
  -e "Organization__AutoLeaveNoParticipant=60000" `
  -e "Organization__AutoLeaveAllParticipantsLeft=120000" `
  -e "Organization__MeetingVideoRecording=false" `
  -e "Organization__MeetingAudioRecording=false" `
  -e "Organization__MeetingTranscription=true" `
  -e "Organization__MeetingTranscriptionModel=liveCaption" `
  -e "Organization__SmtpUseSSl=false" `
  -e "Organization__SmtpHost=https://mail.au5.ai" `
  -e "Organization__SmtpPort=25" `
  -e "Organization__SmtpUser=Admin@au5.ai" `
  -e "Organization__SmtpPassword=!QAZ2wsx" `
  -e "ServiceSettings__UseRedis=false" `
  -e "ServiceSettings__TokenCleanupIntervalMinutes=60"`
  --restart unless-stopped `
  au5-backend | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend container started" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start Backend" -ForegroundColor Red
    exit 1
}

Write-Host "`n[7/10] Building and starting Bot Father..." -ForegroundColor Yellow
podman build -t au5-botfather ./botFather
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build Bot Father" -ForegroundColor Red
    exit 1
}

podman run -d `
  --name au5-botfather `
  --pod au5-pod `
  -v /run/podman/podman.sock:/var/run/docker.sock `
  --restart unless-stopped `
  au5-botfather | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Bot Father container started" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start Bot Father" -ForegroundColor Red
    exit 1
}

Write-Host "`n[8/10] Starting Qdrant vector database..." -ForegroundColor Yellow
podman run -d `
  --name au5-qdrant `
  --pod au5-pod `
  -v qdrant_data:/qdrant/storage `
  --restart unless-stopped `
  qdrant/qdrant:latest | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Qdrant container started" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start Qdrant" -ForegroundColor Red
    exit 1
}

Write-Host "`n[9/10] Updating all containers..." -ForegroundColor Yellow
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    Service Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend API:    " -NoNewline; Write-Host "http://localhost:1366" -ForegroundColor White
Write-Host "Bot Father:     " -NoNewline; Write-Host "http://localhost:1367" -ForegroundColor White
Write-Host "Panel:          " -NoNewline; Write-Host "http://localhost:1368" -ForegroundColor White
Write-Host "SQL Server:     " -NoNewline; Write-Host "localhost:15433" -ForegroundColor White
Write-Host "Redis:          " -NoNewline; Write-Host "localhost:6379" -ForegroundColor White
Write-Host "Qdrant:         " -NoNewline; Write-Host "http://localhost:6333" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Management Commands:" -ForegroundColor Magenta
Write-Host "  Stop all:   " -NoNewline; Write-Host "podman pod stop au5-pod" -ForegroundColor White
Write-Host "  Remove all: " -NoNewline; Write-Host "podman pod rm -f au5-pod" -ForegroundColor White
Write-Host ""

Write-Host "[10/10] Initializing Au5 Database..." -ForegroundColor Yellow

Write-Host "  >> Waiting for SQL Server to be ready..." -ForegroundColor Cyan
$retryCount = 0
$isReady = $false

while ($retryCount -lt $MaxRetries -and -not $isReady) {
    try {
        $testResult = podman exec $ContainerName /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$Password" -Q "SELECT 1" 2>&1 
        if ($testResult -match "1") {
            $isReady = $true
            Write-Host "  [OK] SQL Server is ready" -ForegroundColor Green
        } else {
            throw "Not ready yet"
        }
    }
    catch {
        $retryCount++
        Write-Host "  [WAIT] Attempt $retryCount/$MaxRetries - Waiting $RetryInterval seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds $RetryInterval
    }
}

if (-not $isReady) {
    Write-Host "`n[ERROR] SQL Server failed to start after $MaxRetries attempts" -ForegroundColor Red
    Write-Host "  Check logs: podman logs $ContainerName" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n  >> Creating database and user..." -ForegroundColor Cyan

Write-Host "    - Creating database Au5..." -ForegroundColor Gray
$createDbOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d master `
    -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Au5') BEGIN CREATE DATABASE [Au5]; PRINT 'Database Au5 created successfully.'; END ELSE BEGIN PRINT 'Database Au5 already exists.'; END"

Write-Host "    - Creating login Au5User..." -ForegroundColor Gray
$createLoginOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d master `
    -Q "IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'Au5User') BEGIN CREATE LOGIN [Au5User] WITH PASSWORD = N'Au5UserStrong!Pass123', DEFAULT_DATABASE = [Au5], CHECK_EXPIRATION = OFF, CHECK_POLICY = OFF; PRINT 'Login Au5User created successfully.'; END ELSE BEGIN PRINT 'Login Au5User already exists.'; END"

Write-Host "    - Creating database user..." -ForegroundColor Gray
$createUserOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d Au5 `
    -Q "IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'Au5User') BEGIN CREATE USER [Au5User] FOR LOGIN [Au5User]; PRINT 'User Au5User created successfully.'; END ELSE BEGIN PRINT 'User Au5User already exists.'; END"

Write-Host "    * Granting permissions..." -ForegroundColor Gray
$grantPermissionsOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d Au5 `
    -Q "ALTER ROLE [db_owner] ADD MEMBER [Au5User]; PRINT 'Permissions granted to Au5User.';"

Write-Host "    * Granting CREATE DATABASE permission..." -ForegroundColor Gray
$grantCreateDbOutput = podman exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "$Password" -C `
    -d master `
    -Q "GRANT CREATE ANY DATABASE TO [Au5User]; PRINT 'CREATE DATABASE permission granted to Au5User.';"

# Validate all operations
$allSuccessful = $true
if ($createDbOutput -match "error|failed" -or $LASTEXITCODE -ne 0) { $allSuccessful = $false }
if ($createLoginOutput -match "error|failed") { $allSuccessful = $false }
if ($createUserOutput -match "error|failed") { $allSuccessful = $false }
if ($grantPermissionsOutput -match "error|failed") { $allSuccessful = $false }
if ($grantCreateDbOutput -match "error|failed") { $allSuccessful = $false }

if ($allSuccessful) {
    Write-Host "`n  [OK] Database initialized successfully" -ForegroundColor Green
    
    Write-Host "`n  =======================================================================" -ForegroundColor DarkGray
    Write-Host "  Database Configuration" -ForegroundColor White
    Write-Host "  =======================================================================" -ForegroundColor DarkGray
    Write-Host "  Database:  " -NoNewline -ForegroundColor DarkGray; Write-Host "Au5" -ForegroundColor Cyan
    Write-Host "  Username:  " -NoNewline -ForegroundColor DarkGray; Write-Host "Au5User" -ForegroundColor Cyan
    Write-Host "  Password:  " -NoNewline -ForegroundColor DarkGray; Write-Host "Au5UserStrong!Pass123" -ForegroundColor Cyan
    Write-Host "  Port:      " -NoNewline -ForegroundColor DarkGray; Write-Host "15433" -ForegroundColor Cyan
    Write-Host "  =======================================================================" -ForegroundColor DarkGray
    
    Write-Host "`n  Connection String:" -ForegroundColor DarkGray
    Write-Host "  Server=localhost,15433;Database=Au5;User Id=Au5User;Password=Au5UserStrong!Pass123;TrustServerCertificate=true" -ForegroundColor White
    
    Write-Host "`n  >> Verifying connection..." -ForegroundColor Cyan
    podman exec $ContainerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U Au5User -P "Au5UserStrong!Pass123" -C -d Au5 -Q "SELECT DB_NAME() as CurrentDatabase, USER_NAME() as CurrentUser, GETDATE() as CurrentTime" | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Connection verified" -ForegroundColor Green
    }

} else {
    Write-Host "`n[ERROR] Database initialization failed" -ForegroundColor Red
    Write-Host "  Check logs: podman logs $ContainerName" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    Au5 Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan