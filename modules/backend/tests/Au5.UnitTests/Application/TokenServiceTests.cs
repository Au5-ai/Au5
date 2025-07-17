using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace Au5.UnitTests.Application;

public class TokenServiceTests
{
	private readonly JwtSettings _jwtSettings;
	private readonly IOptions<JwtSettings> _jwtOptions;
	private readonly TokenService _tokenService;

	public TokenServiceTests()
	{
		_jwtSettings = new JwtSettings
		{
			SecretKey = "Au5SecretKey*&^%$SDFGHMNBV8528452",
			Issuer = "TestIssuer",
			Audience = "TestAudience",
			ExpiryMinutes = 60
		};
		var optionsMock = new Mock<IOptions<JwtSettings>>();
		optionsMock.Setup(o => o.Value).Returns(_jwtSettings);
		_jwtOptions = optionsMock.Object;

		_tokenService = new TokenService(_jwtOptions);
	}

	[Fact]
	public void GenerateTokenReturnsValidJwtWithExpectedClaims()
	{
		var participant = new Participant
		{
			Id = Guid.NewGuid(),
			FullName = "Test User",
			PictureUrl = "http://example.com/pic.jpg",
			HasAccount = true
		};
		var role = "Admin";

		var token = _tokenService.GenerateToken(participant.Id, participant.FullName, role);

		Assert.False(string.IsNullOrWhiteSpace(token));

		var handler = new JwtSecurityTokenHandler();
		var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

		var validationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = _jwtSettings.Issuer,
			ValidateAudience = true,
			ValidAudience = _jwtSettings.Audience,
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(key),
			ValidateLifetime = true,
			ClockSkew = TimeSpan.Zero
		};

		handler.ValidateToken(token, validationParameters, out var validatedToken);

		var jwtToken = (JwtSecurityToken)validatedToken;
		Assert.Equal(_jwtSettings.Issuer, jwtToken.Issuer);
		Assert.Equal(_jwtSettings.Audience, jwtToken.Audiences.First());

		var nameIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
		var nameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
		var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);

		Assert.NotNull(nameIdClaim);
		Assert.Equal(participant.Id.ToString(), nameIdClaim.Value);

		Assert.NotNull(nameClaim);
		Assert.Equal(participant.FullName, nameClaim.Value);

		Assert.NotNull(roleClaim);
		Assert.Equal(role, roleClaim.Value);
	}
}
