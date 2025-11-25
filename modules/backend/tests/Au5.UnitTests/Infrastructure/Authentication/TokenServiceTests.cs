using System.IdentityModel.Tokens.Jwt;
using Au5.Domain.Entities;
using Au5.Shared;
using Microsoft.IdentityModel.Tokens;
using MockQueryable.Moq;

namespace Au5.UnitTests.Infrastructure.Authentication;

public class TokenServiceTests
{
	private readonly JwtSettings _jwtSettings;
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly Mock<IDataProvider> _dataProviderMock;
	private readonly IOptions<JwtSettings> _jwtOptions;
	private readonly TokenService _tokenService;
	private readonly Mock<DbSet<BlacklistedToken>> _blacklistedTokensDbSetMock;

	public TokenServiceTests()
	{
		_jwtSettings = new JwtSettings
		{
			SecretKey = "Au5SecretKey*&^%$SDFGHMNBV8528452",
			EncryptionKey = "Au5EncryptKey*&^%$SDFGHMNBV852845",
			Issuer = "TestIssuer",
			Audience = "TestAudience",
			ExpiryMinutes = 60
		};

		_dbContextMock = new Mock<IApplicationDbContext>();
		_dataProviderMock = new Mock<IDataProvider>();
		_blacklistedTokensDbSetMock = new Mock<DbSet<BlacklistedToken>>();

		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(_blacklistedTokensDbSetMock.Object);

		var optionsMock = new Mock<IOptions<JwtSettings>>();
		optionsMock.Setup(o => o.Value).Returns(_jwtSettings);
		_jwtOptions = optionsMock.Object;

		_tokenService = new TokenService(_jwtOptions, _dataProviderMock.Object, _dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnTrue_When_TokenIsBlacklisted()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.UtcNow;

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var blacklistedTokens = new List<BlacklistedToken>
		{
			new()
			{
				Id = Guid.NewGuid(),
				UserId = userId,
				Jti = jti,
				ExpiresAt = now.AddMinutes(10),
				BlacklistedAt = now
			}
		}.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(blacklistedTokens.Object);

		var result = await _tokenService.IsTokenBlacklistedAsync(userId, jti);

		Assert.True(result);
	}

	[Fact]
	public async Task Should_ReturnFalse_When_TokenIsNotBlacklisted()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.UtcNow;

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var blacklistedTokens = new List<BlacklistedToken>().BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(blacklistedTokens.Object);

		var result = await _tokenService.IsTokenBlacklistedAsync(userId, jti);

		Assert.False(result);
	}

	[Fact]
	public async Task Should_ReturnFalse_When_TokenIsExpired()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.UtcNow;

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var blacklistedTokens = new List<BlacklistedToken>
		{
			new()
			{
				Id = Guid.NewGuid(),
				UserId = userId,
				Jti = jti,
				ExpiresAt = now.AddMinutes(-10),
				BlacklistedAt = now.AddMinutes(-20)
			}
		}.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(blacklistedTokens.Object);

		var result = await _tokenService.IsTokenBlacklistedAsync(userId, jti);

		Assert.False(result);
	}

	[Fact]
	public async Task Should_DoNothing_When_TokenAlreadyExpired()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.UtcNow;
		var expired = now.AddSeconds(-10);

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var blacklistedTokens = new List<BlacklistedToken>().BuildMockDbSet();
		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(blacklistedTokens.Object);

		await _tokenService.BlacklistTokenAsync(userId, jti, expired);

		_blacklistedTokensDbSetMock.Verify(x => x.Add(It.IsAny<BlacklistedToken>()), Times.Never);
	}

	[Fact]
	public async Task Should_AddTokenToBlacklist_When_ValidToken()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.UtcNow;
		var expiry = now.AddMinutes(10);
		var newGuid = Guid.NewGuid();

		_dataProviderMock.Setup(x => x.Now).Returns(now);
		_dataProviderMock.Setup(x => x.NewGuid()).Returns(newGuid);

		var blacklistedTokens = new List<BlacklistedToken>().BuildMockDbSet();
		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(blacklistedTokens.Object);
		_dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Result.Success());

		await _tokenService.BlacklistTokenAsync(userId, jti, expiry);

		blacklistedTokens.Verify(
			x => x.Add(It.Is<BlacklistedToken>(t =>
				t.Id == newGuid &&
				t.UserId == userId &&
				t.Jti == jti &&
				t.ExpiresAt == expiry &&
				t.BlacklistedAt == now)),
			Times.Once);

		_dbContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
	}

	[Fact]
	public async Task Should_NotAddDuplicate_When_TokenAlreadyBlacklisted()
	{
		var userId = Guid.NewGuid().ToString();
		var jti = Guid.NewGuid().ToString();
		var now = DateTime.UtcNow;
		var expiry = now.AddMinutes(10);

		_dataProviderMock.Setup(x => x.Now).Returns(now);

		var blacklistedTokens = new List<BlacklistedToken>
		{
			new()
			{
				Id = Guid.NewGuid(),
				UserId = userId,
				Jti = jti,
				ExpiresAt = expiry,
				BlacklistedAt = now
			}
		}.BuildMockDbSet();

		_dbContextMock.Setup(x => x.Set<BlacklistedToken>()).Returns(blacklistedTokens.Object);

		await _tokenService.BlacklistTokenAsync(userId, jti, expiry);

		_blacklistedTokensDbSetMock.Verify(x => x.Add(It.IsAny<BlacklistedToken>()), Times.Never);
	}
}
