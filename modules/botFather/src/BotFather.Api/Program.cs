using BotFather.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.ConfigureServices(builder.Configuration);

var app = builder.Build();
MapEndpoints(app);
app.Run();

static void MapEndpoints(WebApplication app)
{
    app.MapLiaraEndpoints();
    app.MapDockerEndpoints();
    app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
}
