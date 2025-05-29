using Au5.MeetingHub.Mock;

namespace Au5.MeetingHub;

public static class ConfigServices
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IMeetingService, MeetingService>();
        services.AddScoped<IUserService, UserService>();
        return services;
    }
}