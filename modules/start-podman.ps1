# Au5 Podman Deployment Script
# Run this script from the modules directory

# Create a pod for all services to communicate
Write-Host "Creating Au5 pod..."
podman pod create --name au5-pod `
  -p 1433:1433 `
  -p 6379:6379 `
  -p 1366:8080 `
  -p 1367:8080 `
  -p 1368:3000

# Create volumes
Write-Host "Creating volumes..."
podman volume create sqlserver_data
podman volume create redis_data

# Start SQL Server
Write-Host "Starting SQL Server..."
podman run -d `
  --name au5-sqlserver `
  --pod au5-pod `
  -e ACCEPT_EULA=Y `
  -e "SA_PASSWORD==FgBGa)>:Gc-U>#gL@~1" `
  -e MSSQL_PID=Express `
  -v sqlserver_data:/var/opt/mssql `
  --restart unless-stopped `
  mcr.microsoft.com/mssql/server:2022-latest

# Start Redis
Write-Host "Starting Redis..."
podman run -d `
  --name au5-redis `
  --pod au5-pod `
  -v redis_data:/data `
  --restart unless-stopped `
  redis:7-alpine redis-server --appendonly yes

# Wait a moment for databases to initialize
Write-Host "Waiting for databases to initialize..."
Start-Sleep -Seconds 10

# Build and start Backend
Write-Host "Building and starting Backend..."
podman build -t au5-backend ./backend
podman run -d `
  --name au5-backend `
  --pod au5-pod `
  -e ASPNETCORE_ENVIRONMENT=Production `
  -e "ConnectionStrings__DefaultConnection=Server=localhost,1433;Database=Au5Db;User Id=sa;Password==FgBGa)>:Gc-U>#gL@~1;TrustServerCertificate=true" `
  -e "ConnectionStrings__Redis=localhost:6379" `
  --restart unless-stopped `
  au5-backend

# Build and start Bot Father
Write-Host "Building and starting Bot Father..."
podman build -t au5-botfather ./botFather
podman run -d `
  --name au5-botfather `
  --pod au5-pod `
  -e DISPLAY=:99 `
  --restart unless-stopped `
  au5-botfather

# Build and start Panel
Write-Host "Building and starting Panel..."
podman build -t au5-panel ./panel
podman run -d `
  --name au5-panel `
  --pod au5-pod `
  -e NODE_ENV=production `
  -e NEXT_PUBLIC_API_URL=http://localhost:1366 `
  --restart unless-stopped `
  au5-panel

Write-Host "Au5 services are starting up!"
Write-Host "Services will be available at:"
Write-Host "- Backend API: http://localhost:1366"
Write-Host "- Bot Father: http://localhost:1367" 
Write-Host "- Panel: http://localhost:1368"
Write-Host "- SQL Server: localhost:1433"
Write-Host "- Redis: localhost:6379"

Write-Host ""
Write-Host "To stop all services, run: podman pod stop au5-pod"
Write-Host "To remove all services, run: podman pod rm -f au5-pod"
