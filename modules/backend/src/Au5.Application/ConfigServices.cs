using System.Reflection;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Piplines;
using Au5.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Application;

public static class ConfigureServices
{
	public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
	{
		services.AddScoped<IMeetingService, MeetingService>(); // This is for test.
		services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
		services.AddMediator(options =>
		{
			options.ServiceLifetime = ServiceLifetime.Scoped;
		});

		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidatorBehavior<,>));

		services.AddSingleton<IJwtBlacklistService, JwtBlacklistService>();

		return services;
	}
}
