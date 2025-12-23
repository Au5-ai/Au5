using Au5.Application.Common.Abstractions;
using Au5.BackEnd.Filters;
using Au5.BackEnd.Services;
using Au5.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Au5.BackEnd;

public static class ConfigServices
{
	public const string JWTSETTING = "JwtSettings";
	private const string HubUrl = "/meetinghub";

	public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
	{
		services.Configure<JwtSettings>(config.GetSection(JWTSETTING));

		services.AddHttpContextAccessor();
		services.AddScoped<ICurrentUserService, CurrentUserService>();

		var jwtSettings = config.GetSection(JWTSETTING).Get<JwtSettings>();

		if (jwtSettings is null ||
			string.IsNullOrWhiteSpace(jwtSettings.SecretKey) ||
			string.IsNullOrWhiteSpace(jwtSettings.EncryptionKey))
		{
			throw new InvalidOperationException("JWT settings are missing or invalid. Both SecretKey and EncryptionKey are required.");
		}

		var signingKeyBytes = Convert.FromBase64String(jwtSettings.SecretKey);
		var encryptionKeyBytes = Convert.FromBase64String(jwtSettings.EncryptionKey);

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
				ValidIssuer = jwtSettings.Issuer,
				ValidateAudience = true,
				ValidAudience = jwtSettings.Audience,
				ValidateLifetime = true,
				RequireExpirationTime = true,
				ClockSkew = TimeSpan.FromSeconds(5),
				ValidateIssuerSigningKey = true,
				IssuerSigningKey = new SymmetricSecurityKey(signingKeyBytes),
				TokenDecryptionKey = new SymmetricSecurityKey(encryptionKeyBytes),
				RequireSignedTokens = true,
				RequireAudience = true,
				ValidAlgorithms = new[]
				{
					SecurityAlgorithms.HmacSha256,
					SecurityAlgorithms.Aes256KW,
					SecurityAlgorithms.Aes128CbcHmacSha256
				}
			};

			options.Events = new JwtBearerEvents
			{
				OnMessageReceived = context =>
				{
					var accessToken = context.Request.Query["access_token"];
					var path = context.HttpContext.Request.Path;

					if (!string.IsNullOrEmpty(accessToken) &&
						path.StartsWithSegments(HubUrl))
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
