using Au5.Application.Features.Implement;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Application;

public static class ConfigureServices
{
	public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
	{
		services.AddScoped<IMeetingService, MeetingService>();
		services.AddScoped<IReactionService, ReactionService>();
		services.AddScoped<IAuthenticationService, AuthenticationService>();

		return services;
	}
}
