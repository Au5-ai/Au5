using System.Text;
using Au5.Application;
using Au5.Application.Interfaces;
using Au5.Application.Models.Authentication;
using Au5.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Au5.BackEnd;

public static class ConfigServices
{
	public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
	{
		services.AddSingleton<IMeetingService, MeetingService>();
		return services;
	}

	public static IServiceCollection RegisterInfrastrustureServices(this IServiceCollection services)
	{
		services.AddScoped<ITokenService, TokenService>();
		return services;
	}

	public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
	{
		services.Configure<JwtSettings>(config.GetSection("JwtSettings"));

		var jwtSettings = config.GetSection("JwtSettings").Get<JwtSettings>();
		var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

		services.AddAuthentication(options =>
		{
			options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
			options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
		})
		.AddJwtBearer(options =>
		{
			options.TokenValidationParameters = new TokenValidationParameters
			{
				ValidateIssuer = true,
				ValidateAudience = true,
				ValidateLifetime = true,
				ValidateIssuerSigningKey = true,
				ValidIssuer = jwtSettings.Issuer,
				ValidAudience = jwtSettings.Audience,
				IssuerSigningKey = new SymmetricSecurityKey(key)
			};
		});

		return services;
	}
}
