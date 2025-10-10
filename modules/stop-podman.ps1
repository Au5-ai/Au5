# Au5 Podman Stop Script
# Run this script to stop all Au5 services

Write-Host "Stopping Au5 services..."

# Stop the pod (stops all containers in the pod)
podman pod stop au5-pod

Write-Host "Au5 services stopped."

# Optionally remove everything (uncomment if you want to clean up completely)
# Write-Host "Removing Au5 pod and containers..."
# podman pod rm -f au5-pod

# Write-Host "Removing volumes (this will delete all data!)..."
# podman volume rm sqlserver_data redis_data qdrant_data

Write-Host "To restart services, run: ./start-podman.ps1"
Write-Host "To completely remove everything, uncomment the cleanup lines in this script."
