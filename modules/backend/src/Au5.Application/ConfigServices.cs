using System.Reflection;
using Au5.Application.Common.Options;
using Au5.Application.Common.Piplines;
using Au5.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Application;

public static class ConfigureServices
{
	public static IServiceCollection RegisterApplicationServices(
		this IServiceCollection services,
		IConfiguration configuration)
	{
		services.Configure<OrganizationOptions>(configuration.GetSection(OrganizationOptions.SectionName));

		services.AddSingleton<IDataProvider, SystemDataProvider>();
		services.AddScoped<IMeetingService, MeetingService>();
		services.AddScoped<IUrlGenerator, UrlGenerator>();
		services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
		services.AddMediator(options =>
		{
			options.ServiceLifetime = ServiceLifetime.Scoped;
		});

		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
		services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidatorBehavior<,>));

		return services;
	}
}
