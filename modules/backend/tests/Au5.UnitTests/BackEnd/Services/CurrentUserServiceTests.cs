using Au5.BackEnd.Services;
using Au5.Shared;
using Microsoft.AspNetCore.Http;

namespace Au5.UnitTests.BackEnd.Services;

public class CurrentUserServiceTests
{
	private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
	private readonly CurrentUserService _currentUserService;

	public CurrentUserServiceTests()
	{
		_mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
		_currentUserService = new CurrentUserService(_mockHttpContextAccessor.Object);
	}

	[Fact]
	public void UserId_WithValidUserIdClaim_ReturnsCorrectGuid()
	{
		var expectedUserId = Guid.NewGuid();
		var claims = new List<Claim>
		{
			new(ClaimConstants.UserId, expectedUserId.ToString())
		};
		var identity = new ClaimsIdentity(claims, "TestAuthType");
		var claimsPrincipal = new ClaimsPrincipal(identity);
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.UserId;

		Assert.Equal(expectedUserId, result);
	}

	[Fact]
	public void UserId_WithInvalidUserIdClaim_ReturnsGuidEmpty()
	{
		var claims = new List<Claim>
		{
			new(ClaimConstants.UserId, "invalid-guid")
		};
		var identity = new ClaimsIdentity(claims, "TestAuthType");
		var claimsPrincipal = new ClaimsPrincipal(identity);
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.UserId;

		Assert.Equal(Guid.Empty, result);
	}

	[Fact]
	public void UserId_WithNoUserIdClaim_ReturnsGuidEmpty()
	{
		var claims = new List<Claim>
		{
			new(ClaimConstants.Name, "TestUser")
		};
		var identity = new ClaimsIdentity(claims, "TestAuthType");
		var claimsPrincipal = new ClaimsPrincipal(identity);
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.UserId;

		Assert.Equal(Guid.Empty, result);
	}

	[Fact]
	public void UserId_WithNullHttpContext_ReturnsGuidEmpty()
	{
		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext)null);

		var result = _currentUserService.UserId;

		Assert.Equal(Guid.Empty, result);
	}

	[Fact]
	public void UserId_WithNullUser_ReturnsGuidEmpty()
	{
		var httpContext = new DefaultHttpContext
		{
			User = null
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.UserId;

		Assert.Equal(Guid.Empty, result);
	}

	[Fact]
	public void IsAuthenticated_WithAuthenticatedUser_ReturnsTrue()
	{
		var claims = new List<Claim>
		{
			new(ClaimConstants.UserId, Guid.NewGuid().ToString())
		};
		var identity = new ClaimsIdentity(claims, "TestAuthType");
		var claimsPrincipal = new ClaimsPrincipal(identity);
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.IsAuthenticated;

		Assert.True(result);
	}

	[Fact]
	public void IsAuthenticated_WithUnauthenticatedUser_ReturnsFalse()
	{
		var identity = new ClaimsIdentity();
		var claimsPrincipal = new ClaimsPrincipal(identity);
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.IsAuthenticated;

		Assert.False(result);
	}

	[Fact]
	public void IsAuthenticated_WithNullHttpContext_ReturnsFalse()
	{
		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext)null);

		var result = _currentUserService.IsAuthenticated;

		Assert.False(result);
	}

	[Fact]
	public void IsAuthenticated_WithNullUser_ReturnsFalse()
	{
		var httpContext = new DefaultHttpContext
		{
			User = null
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.IsAuthenticated;

		Assert.False(result);
	}

	[Fact]
	public void IsAuthenticated_WithNullIdentity_ReturnsFalse()
	{
		var claimsPrincipal = new ClaimsPrincipal();
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.IsAuthenticated;

		Assert.False(result);
	}

	[Theory]
	[InlineData("")]
	[InlineData("   ")]
	[InlineData(null)]
	public void UserId_WithEmptyOrNullUserIdClaim_ReturnsGuidEmpty(string userIdValue)
	{
		var claims = new List<Claim>();
		if (userIdValue != null)
		{
			claims.Add(new Claim(ClaimConstants.UserId, userIdValue));
		}

		var identity = new ClaimsIdentity(claims, "TestAuthType");
		var claimsPrincipal = new ClaimsPrincipal(identity);
		var httpContext = new DefaultHttpContext
		{
			User = claimsPrincipal
		};

		_mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

		var result = _currentUserService.UserId;

		Assert.Equal(Guid.Empty, result);
	}
}
