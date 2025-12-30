using BotFather.Api.ContainersHostManager.DockerHost;
using BotFather.Api.ContainersHostManager.Liara;

namespace BotFather.Api;

public static class ConfigServices
{

    public static IServiceCollection ConfigureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ContainerOptions>(configuration.GetSection("ContainerOptions"));
        services.AddHttpClient<LiaraContainerSerivce>();
        services.Configure<LiaraOptions>(options =>
        {
            var containerOptions = configuration.GetSection("ContainerOptions").Get<ContainerOptions>();
            if (containerOptions?.Liara is null) return;

            options.AuthToken = containerOptions.Liara.AuthToken;
            options.NetworkId = containerOptions.Liara.NetworkId;
            options.PlanId = containerOptions.Liara.PlanId;
            options.BundlePlanId = containerOptions.Liara.BundlePlanId;
            options.BotImage = containerOptions.BotImage;
            options.Location = containerOptions.Liara.Location;
        });

        services.AddKeyedScoped<IContainerService, LiaraContainerSerivce>(nameof(LiaraContainerSerivce));
        services.AddKeyedScoped<IContainerService, DockerContainerService>(nameof(DockerContainerService));
        return services;
    }
}
