# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 1366
EXPOSE 1367


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Directory.Packages.props", "."]
COPY ["Directory.Build.props", "."]
COPY ["src/Au5.BackEnd/Au5.BackEnd.csproj", "src/Au5.BackEnd/"]
COPY ["src/Au5.Application/Au5.Application.csproj", "src/Au5.Application/"]
COPY ["src/Au5.Domain/Au5.Domain.csproj", "src/Au5.Domain/"]
COPY ["src/Au5.ServiceDefaults/Au5.ServiceDefaults.csproj", "src/Au5.ServiceDefaults/"]
RUN dotnet restore "./src/Au5.BackEnd/Au5.BackEnd.csproj"
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
ENTRYPOINT ["dotnet", "Au5.BackEnd.dll", "--urls=http://0.0.0.0:1366"]
