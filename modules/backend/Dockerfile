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

# Environment variables for CORS
ENV Cors__AllowedOrigins__0="http://localhost:3001"
ENV Cors__AllowedOrigins__1="https://localhost:8000"
ENV Cors__AllowedOrigins__2="https://localhost:8001"

# Environment variables for JWT Settings
ENV JwtSettings__SecretKey="7K9mP2nQ5rS8tU1vW4xY6zA3bC0dE7fG9hI2jK5lM8nO1pQ4rS7tU0vW3xY6zA9b"
ENV JwtSettings__Issuer="Au5.BackEnd"
ENV JwtSettings__Audience="Au5.Client"
ENV JwtSettings__ExpiryMinutes="1000"

# Environment variables for Organization Configuration
ENV Organization__Direction="rtl"
ENV Organization__Language="fa-IR"
ENV Organization__HubUrl="http://localhost:1366/meetingHub"
ENV Organization__ServiceBaseUrl="http://localhost:1366"
ENV Organization__BotFatherUrl="http://localhost:8081"
ENV Organization__BotHubUrl="http://host.containers.internal:1366/meetingHub"
ENV Organization__PanelUrl="http://localhost:3001"
ENV Organization__OpenAIProxyUrl="https://api.openai.com/v1"
ENV Organization__OpenAIToken="YOUR_OPENAI_API_KEY"
ENV Organization__AutoLeaveWaitingEnter="30000"
ENV Organization__AutoLeaveNoParticipant="60000"
ENV Organization__AutoLeaveAllParticipantsLeft="120000"
ENV Organization__MeetingVideoRecording="false"
ENV Organization__MeetingAudioRecording="false"
ENV Organization__MeetingTranscription="true"
ENV Organization__MeetingTranscriptionModel="liveCaption"
ENV Organization__SmtpUseSSl="false"
ENV Organization__SmtpHost="https://mail.au5.ai"
ENV Organization__SmtpPort="25"
ENV Organization__SmtpUser="Admin@au5.ai"
ENV Organization__SmtpPassword="!QAZ2wsx"

# Environment variables for Cache Settings
ENV ServiceSettings__UseRedis="false"
ENV ServiceSettings__TokenCleanupIntervalMinutes="60"

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Au5.BackEnd.dll"]
