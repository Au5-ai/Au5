using Au5.MeetingHub.Mock;
using Au5.MeetingHub.Mock.Interfaces;

namespace Au5.MeetingHub;

public static class ConfigServices
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IMeetingService, MeetingService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITranscriptionService, TranscriptionService>();
        return services;
    }
}