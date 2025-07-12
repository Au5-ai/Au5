using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Au5.Application.Common.Interfaces;
using Au5.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Au5.Application;

public static class ConfigureServices
{
	public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
	{
		services.AddSingleton<IMeetingService, MeetingService>();

		return services;
	}
}
