using System.IdentityModel.Tokens.Jwt;
using Au5.Shared;
using Microsoft.IdentityModel.Tokens;

namespace Au5.UnitTests.Infrastructure.Authentication;

public class TokenServiceTests
{
	private readonly JwtSettings _jwtSettings;
	private readonly Mock<ICacheProvider> _cacheProviderMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
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

		_cacheProviderMock = new Mock<ICacheProvider>();
		_dataProviderMock = new Mock<IDataProvider>();

		var optionsMock = new Mock<IOptions<JwtSettings>>();
		optionsMock.Setup(o => o.Value).Returns(_jwtSettings);
		_jwtOptions = optionsMock.Object;

		_tokenService = new TokenService(_jwtOptions, _cacheProviderMock.Object, _dataProviderMock.Object);
	}

	[Fact]
	public void GenerateTokenReturnsValidJwtWithExpectedClaims()
	{
		var participantId = Guid.NewGuid();
		var participantName = "Test User";
		var role = RoleTypes.Admin;
		var now = DateTime.Now;
		var jti = Guid.NewGuid();

		_dataProviderMock.Setup(x => x.NewGuid()).Returns(jti);
		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var tokenResponse = _tokenService.GenerateToken(participantId, participantName, role);

		Assert.False(string.IsNullOrWhiteSpace(tokenResponse.AccessToken));

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

		handler.ValidateToken(tokenResponse.AccessToken, validationParameters, out var validatedToken);
		var jwtToken = (JwtSecurityToken)validatedToken;

		Assert.Equal(_jwtSettings.Issuer, jwtToken.Issuer);
		Assert.Equal(_jwtSettings.Audience, jwtToken.Audiences.First());

		Assert.NotNull(jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier));
		Assert.NotNull(jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name));
		Assert.NotNull(jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role));
		Assert.NotNull(jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti));
	}

	[Fact]
	public async Task IsTokenBlacklistedAsync_ShouldReturnTrueIfKeyExists()
	{
		// Arrange
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var key = $"jwt_bl_{userId}_{jti}";

		_cacheProviderMock.Setup(c => c.ExistsAsync(key)).ReturnsAsync(true);

		// Act
		var result = await _tokenService.IsTokenBlacklistedAsync(userId, jti);

		// Assert
		Assert.True(result);
	}

	[Fact]
	public async Task IsTokenBlacklistedAsync_ShouldReturnFalseIfKeyMissing()
	{
		// Arrange
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var key = $"jwt_bl_{userId}_{jti}";

		_cacheProviderMock.Setup(c => c.ExistsAsync(key)).ReturnsAsync(false);

		// Act
		var result = await _tokenService.IsTokenBlacklistedAsync(userId, jti);

		// Assert
		Assert.False(result);
	}

	[Fact]
	public async Task BlacklistTokenAsync_ShouldDoNothingIfTokenAlreadyExpired()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.Now;
		var expired = now.AddSeconds(-10);

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		await _tokenService.BlacklistTokenAsync(userId, jti, expired);

		_cacheProviderMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<TimeSpan>()), Times.Never);
	}

	[Fact]
	public async Task BlacklistTokenAsync_ShouldCacheWithCorrectKeyAndTTL()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.Now;
		var expiry = now.AddMinutes(10);
		var expectedKey = $"jwt_bl_{userId}_{jti}";

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		await _tokenService.BlacklistTokenAsync(userId, jti, expiry);

		// Assert
		_cacheProviderMock.Verify(
			x =>
			x.SetAsync(expectedKey, true, It.Is<TimeSpan>(ttl => ttl.TotalMinutes <= 10 && ttl.TotalMinutes > 9)),
			Times.Once);
	}
}
