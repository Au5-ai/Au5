using Au5.Application.Common.Piplines;
using Au5.Application.Features.Implement;
using Au5.Application.Features.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Application;

public static class ConfigureServices
{
	public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
	{
		services.AddScoped<IMeetingService, MeetingService>(); // This is for test.
		services.AddScoped<IAuthenticationService, AuthenticationService>();

		services.AddMediator(options =>
		{
			options.ServiceLifetime = ServiceLifetime.Scoped;
		});

		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidatorBehavior<,>));

		return services;
	}
}
