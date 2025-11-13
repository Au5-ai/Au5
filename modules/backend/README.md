```
{
  "ConnectionStrings": {
    "ApplicationDbContext": "Server=.;Initial Catalog=Au5;Persist Security Info=False;Encrypt=False;TrustServerCertificate=False;Connection Timeout=30;",
    "Redis": "localhost:6379"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3001",
      "https://localhost:8000",
      "https://localhost:8001"
    ]
  },
  "JwtSettings": {
    "SecretKey": "YOURSecretKey",
    "Issuer": "Au5",
    "Audience": "Au5-clients",
    "ExpiryMinutes": 1000,
	"RefreshTokenExpiryDays": 30
  }
}

```
