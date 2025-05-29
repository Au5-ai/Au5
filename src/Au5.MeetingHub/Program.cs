using Au5.MeetingHub;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Services.AddSignalR();
    //.AddMessagePackProtocol(options =>
    //{
    //    options.SerializerOptions = MessagePackSerializerOptions.Standard
    //    .WithSecurity(MessagePackSecurity.UntrustedData);
    //});

    builder.Services.RegisterApplicationServices(builder.Configuration);
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowAnyOrigin()
        );
    });

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAllWithCredentials", policy =>
        {
            policy
                .SetIsOriginAllowed(origin => true)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.SetMinimumLevel(LogLevel.Information);
}
var app = builder.Build();
{
    app.UseCors("AllowAllWithCredentials");

    app.UseCors();
    app.MapHub<MeetingHub>("/meetinghub");
    app.Run();
}
