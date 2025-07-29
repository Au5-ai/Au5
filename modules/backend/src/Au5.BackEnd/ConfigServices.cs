using System.Text;
using Au5.BackEnd.Filters;
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
				},

				OnChallenge = async context =>
				{
					if (!context.Handled)
					{
						var problemDetailsService = context.HttpContext.RequestServices
							.GetRequiredService<IProblemDetailsService>();

						context.Response.StatusCode = StatusCodes.Status401Unauthorized;
						context.Response.ContentType = "application/problem+json";

						await problemDetailsService.WriteAsync(new ProblemDetailsContext
						{
							HttpContext = context.HttpContext,
							ProblemDetails = new ProblemDetails
							{
								Status = StatusCodes.Status401Unauthorized,
								Title = "Unauthorized",
								Detail = "Authentication token is missing or invalid.",
								Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
							}
						});

						context.HandleResponse();
					}
				}
			};
		});

		services.AddScoped<ResultHandlingActionFilter>();
		return services;
	}
}
