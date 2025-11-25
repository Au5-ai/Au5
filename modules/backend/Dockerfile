# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Configure DNS first
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 1.1.1.1" >> /etc/resolv.conf

# Set NuGet environment variables for better performance and retry
ENV NUGET_XMLDOC_MODE=skip
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
ENV NUGET_ENABLE_EXPERIMENTAL_HTTP_RETRY=true
ENV NUGET_HTTP_RETRY_TIMEOUT=300

# Copy project files first for better caching
COPY ["Directory.Packages.props", "."]
COPY ["Directory.Build.props", "."]
COPY ["src/Au5.BackEnd/Au5.BackEnd.csproj", "src/Au5.BackEnd/"]
COPY ["src/Au5.Application/Au5.Application.csproj", "src/Au5.Application/"]
COPY ["src/Au5.Infrastructure/Au5.Infrastructure.csproj", "src/Au5.Infrastructure/"]
COPY ["src/Au5.Shared/Au5.Shared.csproj", "src/Au5.Shared/"]
COPY ["src/Au5.Domain/Au5.Domain.csproj", "src/Au5.Domain/"]
COPY ["src/Au5.ServiceDefaults/Au5.ServiceDefaults.csproj", "src/Au5.ServiceDefaults/"]

# Restore with optimized settings
RUN dotnet restore "./src/Au5.BackEnd/Au5.BackEnd.csproj" \
    --verbosity detailed \
    --ignore-failed-sources

COPY . .
WORKDIR "/src/src/Au5.BackEnd"
RUN dotnet build "./Au5.BackEnd.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Au5.BackEnd.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Au5.BackEnd.dll"]
