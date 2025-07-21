using System.Text;
using Au5.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Au5.BackEnd;

public static class ConfigServices
{
	public const string JWTSETTING = "JwtSettings";

	public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
	{
		services.Configure<JwtSettings>(config.GetSection(JWTSETTING));
		services.AddSingleton<IUserIdProvider, UserIdProvider>();

		var jwtSettings = config.GetSection(JWTSETTING).Get<JwtSettings>();

		if (jwtSettings is null || string.IsNullOrWhiteSpace(jwtSettings.SecretKey))
		{
			throw new InvalidOperationException("JWT settings are missing or invalid.");
		}

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

			options.Events = new JwtBearerEvents
			{
				OnMessageReceived = context =>
				{
					var accessToken = context.Request.Query["access_token"];
					var path = context.HttpContext.Request.Path;

					if (!string.IsNullOrEmpty(accessToken) &&
						path.StartsWithSegments("/meetinghub"))
					{
						context.Token = accessToken;
					}

					return Task.CompletedTask;
				}
			};
		});

		return services;
	}
}
