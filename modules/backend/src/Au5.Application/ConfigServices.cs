using System.Reflection;
using Au5.Application.Common.Piplines;
using Au5.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Application;

public static class ConfigureServices
{
	public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
	{
		services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
		services.AddScoped<IMeetingService, MeetingService>();
		services.AddScoped<IMeetingUrlService, MeetingUrlService>();
		services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
		services.AddMediator(options =>
		{
			options.ServiceLifetime = ServiceLifetime.Scoped;
		});

		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidatorBehavior<,>));
		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(UserContextBehavior<,>));

		return services;
	}
}
