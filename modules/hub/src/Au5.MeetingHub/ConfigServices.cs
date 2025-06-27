using Au5.Application;
using Au5.Application.Interfaces;

namespace Au5.MeetingHub;

public static class ConfigServices
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddSingleton<IMeetingService, MeetingService>();
        return services;
    }
}