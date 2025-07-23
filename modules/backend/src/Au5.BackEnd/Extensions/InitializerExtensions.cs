using Au5.Infrastructure.Persistence.Context;

namespace Au5.BackEnd.Extensions;

public static class InitializerExtensions
{
    public static async Task InitializeDatabaseAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var initializer = scope.ServiceProvider.GetRequiredService<DBInitialzer>();
        await initializer.ExecuteAsync();
    }
}
