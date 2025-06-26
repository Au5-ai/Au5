using Au5.MeetingHub.Mock;

namespace Au5.MeetingHub;

public static class ConfigServices
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddSingleton<IMeetingService, MeetingService>();
        return services;
    }
}