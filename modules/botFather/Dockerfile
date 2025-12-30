FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/BotFather.Api/BotFather.Api.csproj", "BotFather.Api/"]
COPY ["src/BotFather.Shared/BotFather.Shared.csproj", "BotFather.Shared/"]
RUN dotnet restore "BotFather.Api/BotFather.Api.csproj"
COPY src/ .
WORKDIR "/src/BotFather.Api"
RUN dotnet build "BotFather.Api.csproj" -c Release -o /app/build

FROM build AS publish
WORKDIR "/src/BotFather.Api"
RUN dotnet publish "BotFather.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BotFather.Api.dll"]
