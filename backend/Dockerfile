FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/BizFlow.Api/BizFlow.Api.csproj src/BizFlow.Api/
RUN dotnet restore src/BizFlow.Api/BizFlow.Api.csproj
COPY src/BizFlow.Api/ src/BizFlow.Api/
RUN dotnet publish src/BizFlow.Api/BizFlow.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "BizFlow.Api.dll"]
